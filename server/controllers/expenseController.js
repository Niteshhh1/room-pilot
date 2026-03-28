import Expense from '../models/Expense.js';
import PG from '../models/PG.js';

// @desc    Get expenses (filter by month, year, pgId)
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    const { month, year, pgId } = req.query;
    let query = {};
    if (pgId) query.pgId = pgId;

    if (month && year) {
      // Month is 1-indexed from frontend
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query)
      .populate('pgId', 'name')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('pgId', 'name');
    if (expense) {
      res.json(expense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const { pgId, costType, description, amount, date, comment } = req.body;

    const expense = new Expense({
      pgId,
      costType,
      description,
      amount: Number(amount),
      date,
      comment
    });

    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      expense.pgId = req.body.pgId || expense.pgId;
      expense.costType = req.body.costType || expense.costType;
      expense.description = req.body.description || expense.description;
      expense.amount = req.body.amount !== undefined ? Number(req.body.amount) : expense.amount;
      expense.date = req.body.date || expense.date;
      expense.comment = req.body.comment !== undefined ? req.body.comment : expense.comment;

      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (expense) {
      await expense.deleteOne();
      res.json({ message: 'Expense removed' });
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
