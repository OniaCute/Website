'use client';

import { create } from 'zustand';
import type { SiteConfig } from '@/types';

interface ConfigState {
  config: SiteConfig | null;
  setConfig: (config: SiteConfig) => void;
  patchConfig: (patch: Partial<SiteConfig>) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  patchConfig: (patch) => set((state) => ({
    config: state.config ? { ...state.config, ...patch } : null,
  })),
}));
