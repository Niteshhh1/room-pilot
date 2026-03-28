import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          set({
            admin: data,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          return false;
        }
      },

      register: async (adminData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', adminData);
          set({
            admin: data,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({ admin: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.put('/auth/profile', profileData);
          set((state) => ({
            admin: { ...state.admin, ...data },
            isLoading: false,
          }));
          return true;
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Update failed',
            isLoading: false,
          });
          return false;
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
    }
  )
);
