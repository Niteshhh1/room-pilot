import { create } from 'zustand';
import api from '../services/api';

export const usePGStore = create((set) => ({
  pgs: [],
  currentPG: null,
  isLoading: false,
  error: null,

  fetchPGs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/pgs');
      set({ pgs: data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch PGs', isLoading: false });
    }
  },

  fetchPGById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/pgs/${id}`);
      set({ currentPG: data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch PG details', isLoading: false });
    }
  },

  createPG: async (pgData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/pgs', pgData);
      set((state) => ({ pgs: [...state.pgs, data], isLoading: false }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create PG', isLoading: false });
      return false;
    }
  },

  updatePG: async (id, pgData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.put(`/pgs/${id}`, pgData);
      set((state) => ({
        pgs: state.pgs.map((pg) => (pg._id === id ? data : pg)),
        currentPG: data,
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update PG', isLoading: false });
      return false;
    }
  },
}));
