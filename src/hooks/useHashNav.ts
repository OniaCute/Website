'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { routeProgress } from '@/components/ui/RouteProgressBar';

const PENDING_HASH_KEY = 'onia_pending_hash';

// 平滑滚动到页面内某个 id，带 header offset
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerH = (document.querySelector('header')?.offsetHeight ?? 64) + 8;
  const top = el.getBoundingClientRect().top + window.scrollY - headerH;
  window.scrollTo({ top, behavior: 'smooth' });
}

// 在首页挂载时调用，检查 sessionStorage 里有没有待滚动的 hash，有就消费掉
export function consumePendingHash() {
  const hash = sessionStorage.getItem(PENDING_HASH_KEY);
  if (!hash) return;
  sessionStorage.removeItem(PENDING_HASH_KEY);

  // 等待首页 DOM 渲染完毕再滚动（requestAnimationFrame × 2 保证 hydration 完成）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToId(hash);
    });
  });
}

// 返回一个 onClick handler，处理 hash 链接
export function useHashNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback((href: string, closeMenu?: () => void) => {
    closeMenu?.();

    // 非 hash 链接，正常跳转
    if (!href.startsWith('#')) {
      router.push(href);
      return;
    }

    const id = href.slice(1); // 去掉 '#'

    if (pathname === '/') {
      // 已在首页：直接平滑滚动，不改 URL（避免 Next.js 重新渲染触发卡顿）
      scrollToId(id);
    } else {
      // 非首页：存下 pending hash，触发导航动画，然后跳转到首页
      sessionStorage.setItem(PENDING_HASH_KEY, id);
      routeProgress.start();
      router.push('/');
    }
  }, [pathname, router]);

  return navigate;
}
