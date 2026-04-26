'use client';

import React, { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConfigStore } from '@/store/configStore';
import { useThemeStore } from '@/store/themeStore';
import { useLocaleStore } from '@/store/localeStore';
import { SiteGuard } from './SiteGuard';
import { LoadingScreen } from './LoadingScreen';
import { RouteProgressBar } from '@/components/ui/RouteProgressBar';
import type { SiteConfig, ThemeMode } from '@/types';

interface RootProvidersProps {
  children: React.ReactNode;
  initialConfig: SiteConfig | null;
  defaultMode: ThemeMode;
}

export function RootProviders({ children, initialConfig, defaultMode }: RootProvidersProps) {
  const pathname = usePathname();
  const setConfig = useConfigStore((s) => s.setConfig);
  const config = useConfigStore((s) => s.config);
  const { mode, setMode } = useThemeStore();
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    if (initialConfig) setConfig(initialConfig);
  }, [initialConfig, setConfig]);

  useEffect(() => {
    const userSet = localStorage.getItem('onia-theme-user-set') === '1';
    const stored = localStorage.getItem('onia-theme');
    if (userSet && stored) {
      try {
        const parsed = JSON.parse(stored) as { state?: { mode?: ThemeMode } };
        if (parsed.state?.mode) {
          setMode(parsed.state.mode);
          document.documentElement.setAttribute('data-theme', parsed.state.mode);
          return;
        }
      } catch { /* ignore */ }
    }
    setMode(defaultMode);
    document.documentElement.setAttribute('data-theme', defaultMode);
  }, [defaultMode, setMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    if (!config?.meta.pageTitles) return;

    const map = config.meta.pageTitles;
    let title = map.home[locale];
    if (pathname.startsWith('/admin')) title = map.admin[locale];
    else if (pathname.startsWith('/login')) title = map.login[locale];
    else if (pathname.startsWith('/setup')) title = map.setup[locale];
    else if (pathname.startsWith('/projects/')) title = map.projectDetail[locale];
    else if (pathname.startsWith('/projects')) title = map.projects[locale];

    document.title = title;
  }, [config, locale, pathname]);

  return (
    <>
      <LoadingScreen initialConfig={initialConfig} />
      {/* Suspense 是 useSearchParams 的要求 */}
      <Suspense fallback={null}>
        <RouteProgressBar />
      </Suspense>
      <SiteGuard />
      {children}
    </>
  );
}
