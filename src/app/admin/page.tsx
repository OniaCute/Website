'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { adminDict } from '@/lib/adminI18n';
import {
  Palette, Layout, FileText, ToggleLeft, Image, Shield,
  FolderOpen, Users, Zap, ArrowRight, Activity, BookOpen, Camera, StickyNote,
} from 'lucide-react';
import { routeProgress } from '@/components/ui/RouteProgressBar';
import { useRouter } from 'next/navigation';

interface DashboardData {
  projectCount: number;
  skillCount: number;
  liveClients: number;
  articleCount?: number;
  noteCount?: number;
  photoCount?: number;
}

const QUICK_LINK_ICONS: Record<string, React.ReactNode> = {
  '/admin/theme':         <Palette className="w-5 h-5" />,
  '/admin/layout-editor': <Layout className="w-5 h-5" />,
  '/admin/content':       <FileText className="w-5 h-5" />,
  '/admin/features':      <ToggleLeft className="w-5 h-5" />,
  '/admin/assets':        <Image className="w-5 h-5" />,
  '/admin/blog':          <BookOpen className="w-5 h-5" />,
  '/admin/gallery':       <Camera className="w-5 h-5" />,
  '/admin/security':      <Shield className="w-5 h-5" />,
};

const QUICK_LINK_COLORS: Record<string, string> = {
  '/admin/theme':         '#818cf8',
  '/admin/layout-editor': '#f472b6',
  '/admin/content':       '#38bdf8',
  '/admin/features':      '#34d399',
  '/admin/assets':        '#fbbf24',
  '/admin/blog':          '#60a5fa',
  '/admin/gallery':       '#fb923c',
  '/admin/security':      '#f87171',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function AdminDashboard() {
  const config = useConfigStore((s) => s.config);
  const { locale } = useLocaleStore();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const d = adminDict.dashboard;
  const c = d.configKeys;

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(r => r.json())
      .then((res: { data: DashboardData }) => setData(res.data))
      .catch(() => setData({ projectCount: 0, skillCount: 0, liveClients: 0 }));
  }, []);

  if (!config) return null;

  const nav = (href: string) => { routeProgress.start(); router.push(href); };

  const stats = [
    { label: d.stats.projects[locale], value: data?.projectCount  ?? '—', icon: <FolderOpen className="w-4 h-4" />, color: '#818cf8' },
    { label: d.stats.skills[locale],   value: data?.skillCount    ?? '—', icon: <Zap className="w-4 h-4" />,        color: '#f472b6' },
    { label: locale === 'zh-CN' ? '文章' : 'Articles',  value: data?.articleCount ?? '—', icon: <BookOpen className="w-4 h-4" />,    color: '#60a5fa' },
    { label: locale === 'zh-CN' ? '随笔' : 'Notes',     value: data?.noteCount    ?? '—', icon: <StickyNote className="w-4 h-4" />,  color: '#34d399' },
    { label: locale === 'zh-CN' ? '照片' : 'Photos',    value: data?.photoCount   ?? '—', icon: <Camera className="w-4 h-4" />,      color: '#fb923c' },
    { label: d.stats.visitors[locale], value: data?.liveClients   ?? '—', icon: <Users className="w-4 h-4" />,      color: '#38bdf8' },
    { label: d.stats.sse[locale],      value: d.stats.sseLive[locale],    icon: <Activity className="w-4 h-4" />,   color: '#a78bfa' },
  ];

  // href 路径 → sidebar 字典 key 的映射（路径与 key 不一致时需显式指定）
  const HREF_TO_SIDEBAR_KEY: Record<string, keyof typeof adminDict.sidebar> = {
    '/admin/theme':         'theme',
    '/admin/layout-editor': 'layout',
    '/admin/content':       'content',
    '/admin/features':      'features',
    '/admin/assets':        'assets',
    '/admin/blog':          'blog',
    '/admin/gallery':       'gallery',
    '/admin/security':      'security',
  };

  const quickLinks = [
    '/admin/theme', '/admin/layout-editor', '/admin/content',
    '/admin/features', '/admin/assets', '/admin/blog', '/admin/gallery', '/admin/security',
  ].map(href => ({
    href,
    label: adminDict.sidebar[HREF_TO_SIDEBAR_KEY[href]]?.[locale] ?? href,
    desc:  d.quickLinkDescs[href as keyof typeof d.quickLinkDescs][locale],
    color: QUICK_LINK_COLORS[href],
    icon:  QUICK_LINK_ICONS[href],
  }));

  const configRows: [string, string][] = [
    [c.defaultLocale[locale],  config.meta.defaultLocale],
    [c.defaultTheme[locale],   config.theme.defaultMode === 'night' ? c.night[locale] : c.day[locale]],
    [c.allowSwitch[locale],    config.theme.allowUserSwitch ? c.yes[locale] : c.no[locale]],
    [c.rightClick[locale],     config.features.rightClick.default === 'disabled' ? c.rightClickOff[locale] : c.rightClickOn[locale]],
    [c.devtools[locale],       config.features.devtools.enabled ? c.devtoolsOn[locale] : c.devtoolsOff[locale]],
    [c.sse[locale],            c.sseRunning[locale]],
  ];

  const siteName = config.meta[locale]?.siteName ?? config.meta['zh-CN'].siteName;

  return (
    <div className="space-y-8 pb-8">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-medium mb-1 tracking-widest uppercase"
            style={{ color: 'var(--color-primary)' }}>{siteName}</p>
          <h1 className="text-3xl font-bold tracking-tight">{d.title[locale]}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
          style={{ background: 'color-mix(in srgb, var(--color-success) 12%, transparent)', color: 'var(--color-success)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {locale === 'zh-CN' ? '系统运行中' : 'System Online'}
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {stats.map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}1a`, color }}>{icon}</span>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: 'var(--color-text)' }}>
              {value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Quick links + config overview side-by-side on large screens */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Quick links — 3/5 */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}>{d.quickLinks[locale]}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {quickLinks.map(({ href, label, desc, color, icon }) => (
              <button
                key={href}
                onClick={() => nav(href)}
                className="group text-left rounded-2xl p-4 flex items-start gap-3 transition-all duration-200"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              >
                <span className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ background: `${color}1a`, color }}>
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm">{label}</p>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-150 flex-shrink-0"
                      style={{ color }} />
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Config overview — 2/5 */}
        <motion.div {...fadeUp(0.15)} className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: 'var(--color-text-muted)' }}>{d.overview[locale]}</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            {configRows.map(([label, value], i) => (
              <div
                key={label}
                className="flex items-center justify-between px-4 py-3 text-sm"
                style={{
                  borderBottom: i < configRows.length - 1 ? '1px solid var(--color-border)' : undefined,
                  background: i % 2 === 0 ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-surface-alt) 50%, transparent)',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }} className="text-xs">{label}</span>
                <span className="text-xs font-medium ml-2 text-right">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
