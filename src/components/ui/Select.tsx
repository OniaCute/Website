'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function Select({ label, value, options, onChange, placeholder, className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (v: string) => { onChange(v); setOpen(false); };

  return (
    <div className={clsx('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-sm font-medium select-label">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={clsx(
            'input flex items-center justify-between gap-2 cursor-pointer text-left w-full select-trigger',
            open && 'select-trigger--open',
            !selected && 'select-trigger--placeholder',
          )}
        >
          <span className="flex-1 truncate">{selected?.label ?? placeholder ?? '—'}</span>
          <ChevronDown
            className={clsx(
              'w-4 h-4 flex-shrink-0 select-arrow',
              open && 'select-arrow--open',
            )}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="select-dropdown absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl overflow-hidden py-1"
            >
              {options.map(opt => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(opt.value)}
                    className={clsx(
                      'select-option flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer select-none',
                      isSelected ? 'select-option--selected' : 'select-option--default',
                    )}
                  >
                    {opt.label}
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
