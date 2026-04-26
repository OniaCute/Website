'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, X } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(markdown: string): TocItem[] {
  const lines = markdown.split('\n');
  const items: TocItem[] = [];
  const counters: Record<number, number> = {};

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/\*\*|__|\*|_|`/g, '').trim();

    counters[level] = (counters[level] ?? 0) + 1;
    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;

    items.push({ id, text, level });
  }

  return items;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const { locale } = useLocaleStore();
  const tocLabel = locale === 'zh-CN' ? '目录' : 'Contents';

  const [items, setItems] = useState<TocItem[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setItems(extractHeadings(content));
  }, [content]);



  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setMobileOpen(false);
  };

  if (items.length === 0) return null;

  const tocContent = (
    <ul className="space-y-0.5">
      {items.map(item => (
        <li key={item.id}>
          <button
            onClick={() => scrollTo(item.id)}
            className="w-full text-left py-1.5 rounded-lg text-xs transition-all leading-snug hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)]"
            style={{
              paddingLeft: `${(item.level - 1) * 12 + 12}px`,
              paddingRight: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            {item.text}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop floating TOC */}
      <aside className="toc-float hidden xl:block w-56 flex-shrink-0">
        <div
          className="sticky top-24 rounded-2xl p-4 glass"
          style={{ border: '1px solid var(--color-border)', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
        >
          <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <List className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              {tocLabel}
            </span>
          </div>
          {tocContent}
        </div>
      </aside>

      {/* Mobile TOC toggle button */}
      <div className="xl:hidden fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-float transition-all"
          style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
        >
          {mobileOpen ? <X className="w-4 h-4 text-white" /> : <List className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Mobile TOC drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="xl:hidden fixed inset-0 bg-black/40 z-30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="xl:hidden fixed top-0 left-0 bottom-0 z-40 w-64 glass p-4 overflow-y-auto"
              style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{tocLabel}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-alt)]">
                  <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              </div>
              {tocContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
