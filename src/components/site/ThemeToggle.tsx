'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useConfigStore } from '@/store/configStore';
import { clsx } from 'clsx';

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeStore();
  const config = useConfigStore((s) => s.config);

  const handleToggle = () => {
    toggleMode();
    localStorage.setItem('onia-theme-user-set', '1');
  };

  if (config && !config.theme.allowUserSwitch) return null;

  return (
    <button
      onClick={handleToggle}
      className={clsx(
        'relative w-14 h-7 rounded-full transition-all duration-300 flex items-center',
        mode === 'night' ? 'bg-[var(--color-surface-alt)]' : 'bg-amber-100'
      )}
      style={{ border: '1px solid var(--color-border)' }}
      aria-label="Toggle theme"
      title={mode === 'night' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
    >
      <span
        className={clsx(
          'absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm',
          mode === 'night'
            ? 'translate-x-1 bg-primary'
            : 'translate-x-8 bg-amber-400'
        )}
      >
        {mode === 'night'
          ? <Moon className="w-3 h-3 text-white" />
          : <Sun className="w-3 h-3 text-white" />
        }
      </span>
    </button>
  );
}
