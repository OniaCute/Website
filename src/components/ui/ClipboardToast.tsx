'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

export interface ToastItem {
  id: string;
  label: string;
  value: string;
  locale?: string;
}

interface SingleToastProps {
  item: ToastItem;
  onRemove: (id: string) => void;
  duration: number;
}

function SingleToast({ item, onRemove, duration }: SingleToastProps) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = (ms: number) => {
      startedAtRef.current = Date.now();
      timer = setTimeout(() => onRemove(item.id), ms);
    };

    schedule(remainingRef.current);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMouseEnter = useCallback(() => {
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    setPaused(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPaused(false);
    startedAtRef.current = Date.now();
    const timer = setTimeout(() => onRemove(item.id), remainingRef.current);
    return () => clearTimeout(timer);
  }, [item.id, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden flex items-center gap-3 pl-4 pr-3 pt-3 pb-4 rounded-2xl shadow-lg w-[min(88vw,320px)]"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* 主题色进度条 */}
      <motion.div
        className="absolute bottom-0 left-0 h-[3px] rounded-b-2xl origin-left"
        style={{ background: 'var(--color-primary)' }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: paused ? undefined : 0 }}
        transition={paused ? { duration: 0 } : { duration: duration / 1000, ease: 'linear' }}
      />

      {/* 图标 */}
      <span
        className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full"
        style={{ background: 'color-mix(in srgb, var(--color-success) 14%, transparent)' }}
      >
        <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
      </span>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {item.locale === 'en-US'
            ? `${item.label} copied to clipboard`
            : `${item.label} 已复制到剪贴板`}
        </p>
        <p className="text-sm font-semibold truncate mt-0.5" style={{ color: 'var(--color-text)' }}>
          {item.value}
        </p>
      </div>

      {/* 关闭按钮 */}
      <button
        onClick={() => onRemove(item.id)}
        className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[var(--color-surface-alt)]"
        style={{ color: 'var(--color-text-muted)' }}
        aria-label="关闭"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

interface ClipboardToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
  duration?: number;
}

export function ClipboardToastContainer({ toasts, onRemove, duration = 3000 }: ClipboardToastContainerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-20 right-4 z-50 flex flex-col gap-2 items-end"
      aria-live="polite"
    >
      <AnimatePresence mode="sync">
        {toasts.map((item) => (
          <SingleToast key={item.id} item={item} onRemove={onRemove} duration={duration} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
