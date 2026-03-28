import { create } from 'zustand';
import api from '../services/api';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (month, year, pgId) => {
    set({ isLoading: true, error: null });
    try {
      let params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (pgId) params.append('pgId', pgId);

      const { data } = await api.get(`/expenses?${params.toString()}`);
      set({ expenses: data, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch expenses',
        isLoading: false 
      });
      return false;
    }
  },

  createExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/expenses', expenseData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create expense',
        isLoading: false 
      });
      return false;
    }
  },

  updateExpense: async (id, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      await api.put(`/expenses/${id}`, expenseData);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update expense',
        isLoading: false 
      });
      return false;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/expenses/${id}`);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete expense',
        isLoading: false 
      });
      return false;
    }
  }
}));
