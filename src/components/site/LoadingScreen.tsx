'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import type { SiteConfig } from '@/types';
import { Mail, ExternalLink } from 'lucide-react';
import {
  GithubIcon, TwitterIcon, LinkedinIcon,
  DiscordIcon, TelegramIcon, SteamIcon,
  BilibiliIcon, QQIcon, WeChatIcon,
  YoutubeIcon, InstagramIcon,
} from '@/components/ui/SocialIcons';
import { routeProgress } from '@/components/ui/RouteProgressBar';
import Link from 'next/link';

const ICONS: Record<string, React.ReactNode> = {
  github:    <GithubIcon className="w-4 h-4" />,
  twitter:   <TwitterIcon className="w-4 h-4" />,
  linkedin:  <LinkedinIcon className="w-4 h-4" />,
  discord:   <DiscordIcon className="w-4 h-4" />,
  telegram:  <TelegramIcon className="w-4 h-4" />,
  steam:     <SteamIcon className="w-4 h-4" />,
  bilibili:  <BilibiliIcon className="w-4 h-4" />,
  qq:        <QQIcon className="w-4 h-4" />,
  wechat:    <WeChatIcon className="w-4 h-4" />,
  youtube:   <YoutubeIcon className="w-4 h-4" />,
  instagram: <InstagramIcon className="w-4 h-4" />,
  email:     <Mail className="w-4 h-4" />,
  default:   <ExternalLink className="w-4 h-4" />,
};

interface LoadingScreenProps {
  initialConfig: SiteConfig | null;
}

export function LoadingScreen({ initialConfig }: LoadingScreenProps) {
  const storeConfig = useConfigStore((s) => s.config);
  const locale      = useLocaleStore((s) => s.locale);
  const pathname    = usePathname();

  // 管理面板内部导航只用顶部进度条，不触发全屏 Loading
  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/login') || pathname?.startsWith('/setup');

  const config = storeConfig ?? initialConfig;
  const ls = config?.loadingScreen ?? {
    enabled:     true,
    title:       { 'zh-CN': 'Onia', 'en-US': 'Onia' },
    subtitle:    { 'zh-CN': '正在加载...', 'en-US': 'Loading...' },
    showFooter:  true,
    minDuration: 800,
    debugLock:   false,
  };

  const [bootVisible, setBootVisible] = useState(true);
  const [routeVisible, setRouteVisible] = useState(false);
  const routeStartRef = useRef(0);

  // 首屏显示：debugLock 时固定 30s 预览，否则 minDuration
  useEffect(() => {
    if (!ls.enabled) {
      setBootVisible(false);
      return;
    }
    const dur = ls.debugLock ? 30000 : ls.minDuration;
    const t = window.setTimeout(() => setBootVisible(false), dur);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ls.enabled, ls.minDuration, ls.debugLock]);

  // 路由切换：start 立即出现，done 后满足 minDuration 再隐藏
  // 管理后台路由不触发全屏 loading
  useEffect(() => {
    if (!ls.enabled || ls.debugLock) return;

    const offStart = routeProgress.onStart(() => {
      if (isAdminRoute) return;
      routeStartRef.current = Date.now();
      setRouteVisible(true);
    });
    const offDone = routeProgress.onDone(() => {
      const elapsed = Date.now() - routeStartRef.current;
      const remain = Math.max(0, ls.minDuration - elapsed);
      window.setTimeout(() => setRouteVisible(false), remain);
    });
    return () => { offStart(); offDone(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ls.enabled, ls.minDuration, ls.debugLock, isAdminRoute]);

  const visible = ls.enabled && (bootVisible || routeVisible);
  if (!visible) return null;

  const title           = ls.title[locale] ?? '';
  const subtitle        = ls.subtitle[locale] ?? '';
  const footerCopyright = config?.layout.footer.copyright[locale] ?? '';
  const footerLinks     = config?.layout.footer.socialLinks ?? [];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 1, y: '0%' }}
          exit={{ opacity: 0, y: '-100%', borderBottomLeftRadius: '30%', borderBottomRightRadius: '30%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden shadow-2xl"
          style={{ background: 'var(--color-background)' }}
        >
          {/* 背景光晕 */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-float"
            style={{ background: 'var(--color-primary)' }} />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none animate-float"
            style={{ background: 'var(--color-accent)', animationDelay: '-3s' }} />
          <div className="absolute inset-0 bg-mesh pointer-events-none" />

          {/* 主内容 */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          >
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {title}
              </motion.h1>
            )}

            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-base sm:text-lg"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* 流动进度条 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="w-48 h-0.5 rounded-full overflow-hidden"
              style={{ background: 'var(--color-surface-alt)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))' }}
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', repeatType: 'loop' }}
              />
            </motion.div>
          </motion.div>

          {/* Footer */}
          {ls.showFooter && config?.layout.footer.visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3 px-4"
            >
              {footerLinks.length > 0 && (
                <div className="flex items-center gap-3">
                  {footerLinks.map((link) => (
                    <Link key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                      style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                      title={link.platform}
                    >
                      {ICONS[link.icon] ?? ICONS.default}
                    </Link>
                  ))}
                </div>
              )}
              {footerCopyright && (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {footerCopyright}
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
