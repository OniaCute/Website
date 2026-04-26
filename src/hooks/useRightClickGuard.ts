'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type { SiteConfig } from '@/types';

export function useRightClickGuard(features: SiteConfig['features'] | null): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!features) return;

    const { rightClick } = features;
    const routeRule = Object.entries(rightClick.routes).find(([route]) => pathname.startsWith(route));
    const rule = routeRule ? routeRule[1] : rightClick.default;

    if (rule !== 'disabled') return;

    const handler = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, [pathname, features]);
}

export function useDevToolsGuard(features: SiteConfig['features'] | null): void {
  const pathname = usePathname();

  useEffect(() => {
    if (!features) return;

    const { devtools } = features;
    if (!devtools.enabled) return;

    const routeRule = Object.entries(devtools.routes).find(([route]) => pathname.startsWith(route));
    const rule = routeRule ? routeRule[1] : devtools.default;

    if (rule !== 'disabled') return;

    const blockKeys = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); return false; }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) { e.preventDefault(); return false; }
      if (e.ctrlKey && e.key === 'U') { e.preventDefault(); return false; }
    };

    document.addEventListener('keydown', blockKeys);
    return () => document.removeEventListener('keydown', blockKeys);
  }, [pathname, features]);
}

export function useTextSelectionGuard(features: SiteConfig['features'] | null): void {
  useEffect(() => {
    if (!features) return;

    const disabled = features.textSelection.default === 'disabled';
    if (!disabled) {
      document.body.classList.remove('no-text-selection');
      return;
    }

    document.body.classList.add('no-text-selection');

    const shouldAllow = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]')
      );
    };

    const preventSelection = (e: Event) => {
      if (shouldAllow(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventSelection);

    return () => {
      document.body.classList.remove('no-text-selection');
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventSelection);
    };
  }, [features]);
}

export function useCopyShortcutGuard(features: SiteConfig['features'] | null): void {
  useEffect(() => {
    if (!features) return;
    if (features.copyShortcut.default !== 'disabled') return;

    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return Boolean(
        target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]')
      );
    };

    const blockCopyShortcut = (e: KeyboardEvent) => {
      const hitCopy = (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C');
      if (!hitCopy) return;
      if (isEditableTarget(e.target)) return;
      e.preventDefault();
    };

    document.addEventListener('keydown', blockCopyShortcut);
    return () => document.removeEventListener('keydown', blockCopyShortcut);
  }, [features]);
}
