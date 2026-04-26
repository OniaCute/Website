'use client';

import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  setAuth: (username: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  username: null,
  setAuth: (username) => set({ isAuthenticated: true, username }),
  clearAuth: () => set({ isAuthenticated: false, username: null }),
}));
