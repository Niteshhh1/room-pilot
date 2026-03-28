import React, { useState, useEffect } from 'react';
import { useExpenseStore } from '../../store/expenseStore';
import { usePGStore } from '../../store/pgStore';
import PGFilter from '../../components/PGFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, Calendar, FileText, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';
import dayjs from 'dayjs';

const costTypes = [
  'Maintenance', 
  'Grocery', 
  'Cleaning', 
  'Electricity', 
  'Water',
  'Internet',
  'Salary',
  'Others'
];

const months = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, 
  { value: '3', label: 'March' }, { value: '4', label: 'April' },
  { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' },
  { value: '9', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i));

const Expenses = () => {
  const { t } = useT();
  const { expenses, fetchExpenses, createExpense, updateExpense, deleteExpense, isLoading } = useExpenseStore();
  const { pgs, fetchPGs } = usePGStore();
  
  const [selectedPg, setSelectedPg] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    pgId: '',
    costType: 'Maintenance',
    description: '',
    amount: '',
    date: dayjs().format('YYYY-MM-DD'),
    comment: ''
  });

  useEffect(() => {
    fetchPGs();
  }, [fetchPGs]);

  useEffect(() => {
    fetchExpenses(selectedMonth, selectedYear, selectedPg || '');
  }, [selectedPg, selectedMonth, selectedYear, fetchExpenses]);

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        pgId: expense.pgId?._id || expense.pgId,
        costType: expense.costType,
        description: expense.description,
        amount: expense.amount,
        date: expense.date ? expense.date.split('T')[0] : '',
        comment: expense.comment || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        pgId: selectedPg ? selectedPg : (pgs.length > 0 ? pgs[0]._id : ''),
        costType: 'Maintenance',
        description: '',
        amount: '',
        date: dayjs().format('YYYY-MM-DD'),
        comment: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (editingExpense) {
      success = await updateExpense(editingExpense._id, formData);
    } else {
      success = await createExpense(formData);
    }

    if (success) {
      Swal.fire({
        title: editingExpense ? t('updated') : t('success'),
        text: 'Expense saved successfully',
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
      closeModal();
      fetchExpenses(selectedMonth, selectedYear, selectedPg || '');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const success = await deleteExpense(id);
      if (success) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Expense has been deleted.',
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
        fetchExpenses(selectedMonth, selectedYear, selectedPg || '');
      }
    }
  };

  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-400" /> 
            PG Running Costs
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your property expenses</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
        <div className="w-full md:w-1/3 z-10">
          <PGFilter selectedPg={selectedPg} onSelectPg={setSelectedPg} />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-400 mb-1">Month</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white appearance-none"
              >
                <option value="">All Months</option>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full md:w-32">
            <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white appearance-none"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-700/50 bg-gradient-to-br from-indigo-500/10 to-transparent">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-white">₹{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden rounded-xl border border-slate-700/50 mt-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No Expenses Found</h3>
            <p className="text-slate-400">There are no recorded expenses for this period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 text-sm font-medium text-slate-300">Date</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Property</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Type</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Description</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Amount</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-slate-300">{dayjs(expense.date).format('DD MMM YYYY')}</td>
                    <td className="p-4 text-white font-medium">{expense.pgId?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className="bg-slate-700 text-indigo-300 py-1 px-2.5 rounded-full text-xs font-medium">
                        {expense.costType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      <div>{expense.description}</div>
                      {expense.comment && <div className="text-xs text-slate-500 mt-0.5 max-w-[200px] truncate">{expense.comment}</div>}
                    </td>
                    <td className="p-4 font-semibold text-rose-400">₹{expense.amount?.toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => openModal(expense)} className="p-1.5 hover:bg-slate-700 rounded-lg text-indigo-400 transition-colors tooltip-trigger" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(expense._id)} className="p-1.5 hover:bg-slate-700 rounded-lg text-rose-400 transition-colors tooltip-trigger" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card border border-slate-700/50 rounded-2xl w-full max-w-md relative z-10 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button onClick={closeModal} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 max-h-[80vh] overflow-y-auto">
                <form id="expenseForm" onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Property (PG) *</label>
                    <select name="pgId" value={formData.pgId} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white appearance-none">
                      <option value="" disabled>Select PG</option>
                      {pgs.map(pg => <option key={pg._id} value={pg._id}>{pg.name}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Cost Type *</label>
                      <select name="costType" value={formData.costType} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white appearance-none">
                        {costTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                      <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white [color-scheme:dark]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
                    <input type="text" name="description" value={formData.description} onChange={handleChange} required placeholder="e.g. Plumber for Room 101" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Amount (₹) *</label>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} required placeholder="Amount" className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Comments <span className="text-slate-500 font-normal">(Optional)</span></label>
                    <textarea name="comment" value={formData.comment} onChange={handleChange} rows={2} placeholder="Any extra details..." className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"></textarea>
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" form="expenseForm" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Expenses;
