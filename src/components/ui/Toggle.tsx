'use client';

import React from 'react';
import { clsx } from 'clsx';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <label className={clsx('flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 pointer-events-none')}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={clsx(
            'w-11 h-6 rounded-full transition-all duration-200',
            checked ? 'bg-primary' : 'bg-[var(--color-surface-alt)]'
          )}
          style={{ border: '1px solid var(--color-border)' }}
        />
        <div
          className={clsx(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200',
            checked && 'translate-x-5'
          )}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium">{label}</p>}
          {description && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
        </div>
      )}
    </label>
  );
}
