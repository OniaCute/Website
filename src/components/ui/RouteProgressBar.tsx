'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/* ── 全局事件总线，让外部可以手动触发进度条 ── */
type Listener = () => void;
const startListeners = new Set<Listener>();
const doneListeners = new Set<Listener>();

export const routeProgress = {
  start: () => startListeners.forEach(fn => fn()),
  done:  () => doneListeners.forEach(fn => fn()),
  onStart: (listener: Listener) => {
    startListeners.add(listener);
    return () => startListeners.delete(listener);
  },
  onDone: (listener: Listener) => {
    doneListeners.add(listener);
    return () => doneListeners.delete(listener);
  },
};

/* ── 进度条本体 ── */
export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(8);
    setVisible(true);

    let p = 8;
    timerRef.current = setInterval(() => {
      // 指数减速：越接近 90 涨得越慢
      p += (90 - p) * 0.08;
      setProgress(Math.min(p, 90));
    }, 120);
  }, []);

  const done = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);
    doneTimerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 350);
  }, []);

  /* 监听全局事件（给 router.push 等非 Link 使用） */
  useEffect(() => {
    startListeners.add(start);
    doneListeners.add(done);
    return () => {
      startListeners.delete(start);
      doneListeners.delete(done);
    };
  }, [start, done]);

  /* 路由切换完成时自动 done */
  const prevPathRef = useRef(pathname + searchParams.toString());
  useEffect(() => {
    const next = pathname + searchParams.toString();
    if (next !== prevPathRef.current) {
      prevPathRef.current = next;
      done();
    }
  }, [pathname, searchParams, done]);

  /* 拦截页面内所有 <a> 点击，立即 start */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href') ?? '';
      // 只拦截站内非锚点跳转
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('http') ||
        a.target === '_blank'
      ) return;
      // 目标路径与当前路径相同（同页导航）时跳过，避免进度条卡死
      try {
        const target = new URL(href, window.location.href);
        if (target.pathname === window.location.pathname && !target.hash) return;
      } catch { /* 解析失败时继续 start */ }
      start();
    };

    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [start]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none"
      style={{ background: 'transparent' }}
    >
      <div
        className="h-full rounded-r-full"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          boxShadow: '0 0 8px var(--color-primary)',
          transition: progress === 100
            ? 'width 0.15s ease-out, opacity 0.35s ease'
            : 'width 0.12s ease-out',
        }}
      />
    </div>
  );
}
