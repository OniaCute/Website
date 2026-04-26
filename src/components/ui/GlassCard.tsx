'use client';

import React from 'react';
import { clsx } from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  glow?: boolean;
}

const paddingMap = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  none: '',
};

export function GlassCard({ children, className, hover = false, padding = 'md', glow = false }: GlassCardProps) {
  return (
    <div
      className={clsx(
        'glass',
        paddingMap[padding],
        hover && 'glass-card cursor-pointer',
        glow && 'animate-pulse-glow',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  color?: string;
}

export function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <GlassCard className="flex items-center gap-4">
      {icon && (
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ background: `${color ?? 'var(--color-primary)'}22`, color: color ?? 'var(--color-primary)' }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
      </div>
      {trend !== undefined && (
        <span className={clsx('text-xs font-medium', trend >= 0 ? 'text-success' : 'text-error')}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </GlassCard>
  );
}
