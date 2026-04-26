'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Palette, Layout, FileText, ToggleLeft,
  Image, Shield, LogOut, Home, Sparkles, Menu, X, ChevronRight,
  Globe, BookOpen, Camera, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import { useLocaleStore } from '@/store/localeStore';
import { useConfigStore } from '@/store/configStore';
import { routeProgress } from '@/components/ui/RouteProgressBar';
import { adminDict } from '@/lib/adminI18n';
import type { Locale } from '@/types';

export const SIDEBAR_EXPANDED_W = 224;  // px  (w-56)
export const SIDEBAR_COLLAPSED_W = 64;  // px  (w-16)

interface AdminSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (v: boolean) => void;
}

export function AdminSidebar({ collapsed, onCollapsedChange }: AdminSidebarProps) {
  const pathname    = usePathname();
  const router      = useRouter();
  const { logout, username } = useAuth();
  const { locale, setLocale } = useLocaleStore();
  const config = useConfigStore((s) => s.config);
  const siteName = config?.meta[locale as 'zh-CN' | 'en-US']?.siteName ?? config?.meta['zh-CN']?.siteName ?? 'Admin';
  const [mobileOpen, setMobileOpen] = useState(false);

  const s = adminDict.sidebar;

  const navItems = [
    { href: '/admin',               label: s.dashboard[locale],  icon: LayoutDashboard, exact: true },
    { href: '/admin/theme',         label: s.theme[locale],      icon: Palette },
    { href: '/admin/layout-editor', label: s.layout[locale],     icon: Layout },
    { href: '/admin/content',       label: s.content[locale],    icon: FileText },
    { href: '/admin/features',      label: s.features[locale],   icon: ToggleLeft },
    { href: '/admin/assets',        label: s.assets[locale],     icon: Image },
    { href: '/admin/blog',          label: s.blog[locale],       icon: BookOpen },
    { href: '/admin/gallery',       label: s.gallery[locale],    icon: Camera },
    { href: '/admin/security',      label: s.security[locale],   icon: Shield },
  ];

  const handleLogout = async () => {
    routeProgress.start();
    await logout();
    router.push('/login');
  };

  const handleNav = (href: string) => {
    if (pathname === href) { setMobileOpen(false); return; }
    routeProgress.start();
    setMobileOpen(false);
    router.push(href);
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(next);
  };

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  // Desktop sidebar content
  const sidebarContent = (mobile = false) => (
    <div className="flex flex-col h-full">
      {/* Brand + Collapse toggle */}
      {/* 折叠态（collapsed && !mobile）：整行只显示展开按钮，居中 */}
      {collapsed && !mobile ? (
        <div
          className="flex items-center justify-center py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            onClick={() => onCollapsedChange(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-surface-alt)]"
            style={{ color: 'var(--color-text-muted)' }}
            title="Expand sidebar"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gradient truncate">{siteName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{username}</p>
          </div>
          {!mobile && (
            <button
              onClick={() => onCollapsedChange(true)}
              className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-surface-alt)]"
              style={{ color: 'var(--color-text-muted)' }}
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto" style={{ padding: '12px 8px' }}>
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <button
              key={href}
              onClick={() => handleNav(href)}
              title={collapsed && !mobile ? label : undefined}
              className={clsx(
                'w-full text-left flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150',
                collapsed && !mobile ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
                active ? 'text-white' : 'hover:bg-[var(--color-surface-alt)]',
              )}
              style={{
                background: active
                  ? 'linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, var(--color-accent)))'
                  : undefined,
                color: active ? 'white' : 'var(--color-text-muted)',
                boxShadow: active
                  ? '0 2px 8px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                  : undefined,
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {(!collapsed || mobile) && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  {active && <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="flex-shrink-0 border-t p-2 space-y-0.5" style={{ borderColor: 'var(--color-border)' }}>
        {/* Locale toggle */}
        <button
          onClick={toggleLocale}
          title={collapsed && !mobile ? 'Switch Language' : undefined}
          className={clsx(
            'w-full flex items-center gap-3 rounded-xl text-sm transition-all hover:bg-[var(--color-surface-alt)]',
            collapsed && !mobile ? 'justify-center px-0 py-2' : 'px-3 py-2',
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Globe className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && (
            <span className="text-xs font-medium">{locale === 'zh-CN' ? 'EN' : '中'}</span>
          )}
        </button>

        <Link
          href="/"
          target="_blank"
          title={collapsed && !mobile ? (locale === 'zh-CN' ? '查看网站' : 'View Site') : undefined}
          className={clsx(
            'flex items-center gap-3 rounded-xl text-sm transition-all hover:bg-[var(--color-surface-alt)]',
            collapsed && !mobile ? 'justify-center px-0 py-2' : 'px-3 py-2',
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Home className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>{s.viewSite[locale]}</span>}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed && !mobile ? (locale === 'zh-CN' ? '退出登录' : 'Logout') : undefined}
          className={clsx(
            'w-full flex items-center gap-3 rounded-xl text-sm transition-all hover:bg-red-500/10 text-left',
            collapsed && !mobile ? 'justify-center px-0 py-2' : 'px-3 py-2',
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!collapsed || mobile) && <span>{s.logout[locale]}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
        }}
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-float"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed inset-y-0 left-0 z-50 overflow-hidden"
              style={{
                width: SIDEBAR_EXPANDED_W,
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
              }}
            >
              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
