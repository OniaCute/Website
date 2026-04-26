'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/store/configStore';
import type { SiteConfig } from '@/types';

export function useLiveConfig(): void {
  const setConfig = useConfigStore((s) => s.setConfig);

  useEffect(() => {
    const es = new EventSource('/api/events');

    es.addEventListener('config:updated', (e) => {
      try {
        const parsed = JSON.parse((e as MessageEvent).data) as { type: string; payload: SiteConfig };
        if (parsed.payload) setConfig(parsed.payload);
      } catch { /* ignore */ }
    });

    es.onerror = () => {
      setTimeout(() => {
        es.close();
      }, 5000);
    };

    return () => { es.close(); };
  }, [setConfig]);
}
