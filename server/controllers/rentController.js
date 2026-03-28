import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';

// @desc    Get all tenants with pending rent
// @route   GET /api/rent/pending
// @access  Private
export const getPendingRent = async (req, res) => {
  try {
    const { pgId, month, year } = req.query;
    let query = { status: 'Active' };
    if (pgId) query.pg = pgId;

    const tenants = await Tenant.find(query)
      .populate('room', 'roomNumber floorNumber')
      .populate('pg', 'name address');

    const pendingTenants = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const isSpecificMonth = month && year;
    const targetMonth = isSpecificMonth ? parseInt(month) : currentMonth;
    const targetYear = isSpecificMonth ? parseInt(year) : currentYear;

    for (let tenant of tenants) {
      const moveInDate = new Date(tenant.moveInDate);
      
      if (isSpecificMonth) {
        // Historical query: Did they move in before this specific month ended?
        const lastDayOfTargetMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);
        if (moveInDate > lastDayOfTargetMonth) {
          continue; // Wasn't a tenant yet
        }

        const paidThisMonth = await Payment.findOne({ 
          tenantId: tenant._id, 
          month: targetMonth, 
          year: targetYear, 
          paymentStatus: 'paid' 
        });

        if (!paidThisMonth) {
          pendingTenants.push({
            ...tenant.toObject(),
            unpaidMonths: 1,
            pendingAmount: tenant.monthlyRent,
            targetMonth,
            targetYear
          });
        }
      } else {
        // Standard global lifetime query
        if (moveInDate > currentDate) {
          continue;
        }

        const moveInMonth = moveInDate.getMonth() + 1;
        const moveInYear = moveInDate.getFullYear();

        let monthsDue = (currentYear - moveInYear) * 12 + (currentMonth - moveInMonth) + 1;

        const paidCount = await Payment.countDocuments({ 
          tenantId: tenant._id, 
          paymentStatus: 'paid' 
        });

        const unpaidMonths = monthsDue - paidCount;

        if (unpaidMonths > 0) {
          pendingTenants.push({
            ...tenant.toObject(),
            unpaidMonths,
            pendingAmount: unpaidMonths * tenant.monthlyRent
          });
        }
      }
    }

    res.json(pendingTenants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Pay oldest pending rent for a tenant
// @route   POST /api/rent/pay/:tenantId
// @access  Private
export const payPendingRent = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const moveInDate = new Date(tenant.moveInDate);
    
    let targetMonth = moveInDate.getMonth() + 1;
    let targetYear = moveInDate.getFullYear();

    let unpaidMonthFound = null;

    // Find the oldest unpaid month
    while (targetYear < currentYear || (targetYear === currentYear && targetMonth <= currentMonth)) {
      const hasPaid = await Payment.findOne({
        tenantId: tenant._id,
        month: targetMonth,
        year: targetYear,
        paymentStatus: 'paid'
      });

      if (!hasPaid) {
        unpaidMonthFound = { month: targetMonth, year: targetYear };
        break;
      }

      targetMonth++;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear++;
      }
    }

    if (!unpaidMonthFound) {
      return res.status(400).json({ message: 'No pending rent found for this tenant.' });
    }

    const { amount } = req.body;
    const paymentAmount = amount || tenant.monthlyRent;

    const newPayment = new Payment({
      tenantId: tenant._id,
      roomId: tenant.room,
      pgId: tenant.pg,
      month: unpaidMonthFound.month,
      year: unpaidMonthFound.year,
      amount: paymentAmount,
      paymentStatus: 'paid',
      paymentDate: new Date()
    });

    await newPayment.save();

    res.status(201).json({ message: 'Payment recorded successfully', payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
