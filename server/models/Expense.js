import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  costType: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  comment: { type: String }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
