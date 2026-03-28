import Payment from '../models/Payment.js';
import Tenant from '../models/Tenant.js';

// @desc    Create rent payment record (Pay Rent)
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { tenantId, roomId, pgId, month, year, amount, paymentDate } = req.body;

    const existingPayment = await Payment.findOne({ tenantId, month, year, paymentStatus: 'paid' });
    if (existingPayment) {
      return res.status(400).json({ message: `Rent for this month (${month}/${year}) has already been paid for this tenant.` });
    }

    const payment = new Payment({
      tenantId,
      roomId,
      pgId,
      month,
      year,
      amount,
      paymentStatus: 'paid',
      paymentDate: paymentDate || Date.now(),
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment history for a tenant
// @route   GET /api/payments/tenant/:tenantId
// @access  Private
export const getTenantPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ tenantId: req.params.tenantId }).sort({ year: -1, month: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics (rent expected vs received)
// @route   GET /api/payments/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();

    // Lazy-load models to avoid circular deps
    const { default: PG } = await import('../models/PG.js');
    const { default: Room } = await import('../models/Room.js');
    const { default: Expense } = await import('../models/Expense.js');

    // 1. Calculate Expected Rent (sum of active tenants' monthly rent)
    const activeTenants = await Tenant.find({ status: 'Active' });
    const expectedRent = activeTenants.reduce((acc, tenant) => acc + tenant.monthlyRent, 0);

    // 2. Calculate Received Rent for current month
    const currentMonthPayments = await Payment.find({
      month: currentMonth,
      year: currentYear,
      paymentStatus: 'paid'
    });
    const receivedRent = currentMonthPayments.reduce((acc, payment) => acc + payment.amount, 0);
    const remainingRent = expectedRent - receivedRent;

    // Calculate Expenses and Profit for current month
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    
    const currentMonthExpenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    });
    
    const monthlyExpenses = currentMonthExpenses.reduce((acc, exp) => acc + exp.amount, 0);
    const profit = receivedRent - monthlyExpenses;

    // 3. Simple counts
    const totalTenants = activeTenants.length;
    const pastTenantsCount = await Tenant.countDocuments({ status: 'Inactive' });
    const totalPGs = await PG.countDocuments({});
    const totalRooms = await Room.countDocuments({});

    // 4. Occupancy Data per PG
    const pgs = await PG.find({});
    const occupancyData = await Promise.all(pgs.map(async (pg) => {
      const rooms = await Room.find({ pgId: pg._id });
      const totalCapacity = rooms.reduce((acc, r) => acc + r.capacity, 0);
      const occupiedCount = await Tenant.countDocuments({ pg: pg._id, status: 'Active' });
      return {
        name: pg.name,
        occupied: occupiedCount,
        available: Math.max(0, totalCapacity - occupiedCount)
      };
    }));

    const totalAvailableBeds = occupancyData.reduce((acc, curr) => acc + curr.available, 0);

    // 5. Revenue history for the last 6 months (real data)
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const revenueHistory = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Received for that month
      const monthPayments = await Payment.find({ month, year, paymentStatus: 'paid' });
      const received = monthPayments.reduce((acc, p) => acc + p.amount, 0);

      // For past months use actual data; for current use live expectedRent
      const expected = expectedRent; // same expected each month (active tenants' rent sum)

      revenueHistory.push({
        name: MONTH_NAMES[month - 1],
        received,
        expected,
      });
    }

    res.json({
      expectedRent,
      receivedRent,
      remainingRent,
      monthlyExpenses,
      profit,
      totalTenants,
      pastMembers: pastTenantsCount,
      totalPGs,
      totalRooms,
      occupancyData,
      totalAvailableBeds,
      revenueHistory,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
