'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'night',
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === 'night' ? 'day' : 'night' }),
    }),
    { name: 'onia-theme' }
  )
);
