'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { X } from 'lucide-react';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';

export function AnnouncementToast() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);
  const mode   = useThemeStore((s) => s.mode);
  const [closed, setClosed] = useState(false);

  const content = config?.content.announcement?.[locale]?.trim() ?? '';

  if (!content) return null;

  const announcementStyle = config?.content.announcementStyle;
  const cardBg = mode === 'day'
    ? (announcementStyle?.dayBg  ?? 'rgba(255,255,255,0.96)')
    : (announcementStyle?.nightBg ?? 'rgba(23,23,23,0.92)');

  return (
    <AnimatePresence>
      {!closed && (
        <motion.div
          key="announcement"
          initial={{ opacity: 0, x: 48, scale: 0.94 }}
          animate={{ opacity: 1, x: 0,  scale: 1,    transition: { type: 'spring', stiffness: 340, damping: 26, delay: 0.3 } }}
          exit={{   opacity: 0, x: 48,  scale: 0.94, transition: { duration: 0.22, ease: 'easeIn' } }}
          className="fixed top-20 right-4 z-50 w-[min(92vw,360px)] glass-card p-4"
          style={{ background: cardBg }}
        >
          <button
            onClick={() => setClosed(true)}
            className="absolute top-2 right-2 p-1 rounded-md hover:bg-[var(--color-surface-alt)]"
            aria-label="关闭公告"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="pr-6 text-sm prose prose-sm prose-themed max-w-none" style={{ color: 'var(--color-text)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
