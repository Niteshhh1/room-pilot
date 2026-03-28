import Tenant from '../models/Tenant.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';

// @desc    Get Yearly Earnings Summary
// @route   GET /api/earnings
// @access  Private
export const getYearlyEarnings = async (req, res) => {
  try {
    const { pgId, year } = req.query;
    
    if (!pgId) {
      return res.status(400).json({ message: 'PG ID is required' });
    }

    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Fetch all tenants that have ever been in this PG
    const tenants = await Tenant.find({ pg: pgId });

    // Fetch all payments for this PG in the specified year
    const payments = await Payment.find({ 
      pgId, 
      year: currentYear,
      paymentStatus: 'paid' 
    });

    // Fetch all expenses for this PG in the specified year
    // Note: Expense dates are Date objects. We need to filter by year.
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);
    
    const expenses = await Expense.find({
      pgId,
      date: { $gte: startOfYear, $lte: endOfYear }
    });

    const monthlyData = [];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let yearlyExpected = 0;
    let yearlyReceived = 0;
    let yearlyRemaining = 0;
    let yearlyExpense = 0;
    let yearlyProfit = 0;

    const actualCurrentYear = new Date().getFullYear();
    const actualCurrentMonth = new Date().getMonth() + 1;
    let maxMonth = 12;

    if (currentYear === actualCurrentYear) {
      maxMonth = actualCurrentMonth;
    } else if (currentYear > actualCurrentYear) {
      maxMonth = 0;
    }

    for (let month = 1; month <= maxMonth; month++) {
      // 1. Calculate Expected Rent for this specific month
      // A tenant is expected to pay if they moved in on or before the end of this month,
      // and they were active during this month. (If they are inactive, we assume they left, but we might not have a moveOutDate)
      // Since our simple system only tracks active/inactive, we'll assume Active tenants owe rent.
      // For historical accuracy in simpler DBs, anyone who moved in before end of the month owes rent unless they are inactive. 
      // If they are inactive, did they pay this month?
      
      const lastDayOfMonth = new Date(currentYear, month, 0, 23, 59, 59);
      
      let expectedRent = 0;
      tenants.forEach(t => {
        const moveIn = new Date(t.moveInDate);
        // If they moved in before this month ended
        if (moveIn <= lastDayOfMonth) {
           // We expect rent if they are active, OR if they are inactive but made a payment this year/month (simplification since we don't have moveOutDate)
           // For best results, let's sum their monthlyRent.
           if (t.status === 'Active') {
             expectedRent += t.monthlyRent;
           } else {
             // If inactive, check if they had a payment this month. If they did, it means they were expected to pay.
             const paidThisMonth = payments.some(p => p.tenantId.toString() === t._id.toString() && p.month === month);
             if (paidThisMonth) {
               expectedRent += t.monthlyRent;
             }
           }
        }
      });

      // 2. Calculate Received Rent
      const receivedRent = payments
        .filter(p => p.month === month)
        .reduce((sum, p) => sum + p.amount, 0);

      // 3. Calculate Expenses
      const monthExpenses = expenses
        .filter(e => new Date(e.date).getMonth() + 1 === month)
        .reduce((sum, e) => sum + e.amount, 0);

      // 4. Calculate Pending Rent (Can't be negative)
      const remainingRent = Math.max(0, expectedRent - receivedRent);

      // 5. Calculate Profit
      const profit = receivedRent - monthExpenses;

      yearlyExpected += expectedRent;
      yearlyReceived += receivedRent;
      yearlyRemaining += remainingRent;
      yearlyExpense += monthExpenses;
      yearlyProfit += profit;

      monthlyData.push({
        monthNumber: month,
        monthName: monthNames[month - 1],
        expectedRent,
        receivedRent,
        remainingRent,
        expense: monthExpenses,
        profit
      });
    }

    res.json({
      summary: {
        expectedRent: yearlyExpected,
        receivedRent: yearlyReceived,
        remainingRent: yearlyRemaining,
        expense: yearlyExpense,
        profit: yearlyProfit
      },
      months: monthlyData
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
