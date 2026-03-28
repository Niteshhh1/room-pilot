import { create } from 'zustand';
import api from '../services/api';

export const useRentStore = create((set, get) => ({
  pendingTenants: [],
  isLoading: false,
  error: null,

  fetchPendingRent: async (pgId = '', month = '', year = '') => {
    set({ isLoading: true, error: null });
    try {
      let url = `/rent/pending?pgId=${pgId}`;
      if (month && year) {
        url += `&month=${month}&year=${year}`;
      }
      const { data } = await api.get(url);
      set({ pendingTenants: data, isLoading: false });
      return data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch pending rent',
        isLoading: false 
      });
      return false;
    }
  },

  payPendingRent: async (tenantId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/rent/pay/${tenantId}`);
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to process payment',
        isLoading: false 
      });
      return false;
    }
  }
}));
