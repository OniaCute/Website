'use client';

import React from 'react';
import { useLocaleStore } from '@/store/localeStore';
import type { Locale } from '@/types';

export function LangToggle() {
  const { locale, setLocale } = useLocaleStore();

  const toggle = () => {
    const next: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(next);
  };

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 hover:bg-[var(--color-surface-alt)]"
      style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
      title="Switch Language"
    >
      {locale === 'zh-CN' ? 'EN' : '中文'}
    </button>
  );
}
