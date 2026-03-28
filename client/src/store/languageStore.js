import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en',
      isChanging: false,
      setLanguage: (lang) => {
        set({ isChanging: true });
        setTimeout(() => {
          set({ language: lang, isChanging: false });
        }, 800);
      },
    }),
    { name: 'roompilot-language' }
  )
);
