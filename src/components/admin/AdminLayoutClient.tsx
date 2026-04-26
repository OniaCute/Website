'use client';

import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';

const COLLAPSED_KEY = 'onia_admin_sidebar_collapsed';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_KEY);
    if (stored === 'true') setCollapsed(true);
    setMounted(true);
  }, []);

  const handleCollapsedChange = (v: boolean) => {
    setCollapsed(v);
    localStorage.setItem(COLLAPSED_KEY, String(v));
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
        {/* Skeleton placeholder prevents layout flash */}
        <div className="hidden md:block flex-shrink-0" style={{ width: 224 }} />
        <div className="flex-1 min-w-0">
          <main className="flex-1 p-5 md:p-7 overflow-auto">
            <div className="w-full max-w-[1600px]">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-background)' }}>
      <AdminSidebar collapsed={collapsed} onCollapsedChange={handleCollapsedChange} />
      <div className="flex-1 min-w-0 flex flex-col transition-[margin] duration-200">
        <main className="flex-1 p-5 md:p-7 overflow-auto">
          <div className="w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
