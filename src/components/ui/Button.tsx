'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_4px_15px_var(--btn-shadow-color)] hover:shadow-[0_6px_25px_var(--btn-shadow-color-hover)] hover:-translate-y-px',
        ghost: 'bg-transparent text-[var(--color-text-muted)] border border-[var(--color-border)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] hover:border-primary',
        glass: 'glass text-[var(--color-text)] hover:border-primary',
        danger: 'bg-error/10 text-error border border-error/25 hover:bg-error/20',
        success: 'bg-success/10 text-success border border-success/25 hover:bg-success/20',
        link: 'bg-transparent text-primary underline-offset-4 hover:underline p-0',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5',
        lg: 'px-7 py-3.5 text-base',
        icon: 'p-2.5 aspect-square',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({ variant, size, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
