'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, User, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { routeProgress } from '@/components/ui/RouteProgressBar';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const config = useConfigStore((s) => s.config);
  const { locale } = useLocaleStore();
  const siteName = config?.meta[locale as 'zh-CN' | 'en-US']?.siteName ?? config?.meta['zh-CN']?.siteName ?? '';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(username, password);
    setIsLoading(false);

    if (result.success) {
      routeProgress.start();
      router.push('/admin');
    } else {
      setError(
        result.message.includes('locked')
          ? '账户已锁定，请 15 分钟后再试'
          : '用户名或密码错误'
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-background)' }}
    >
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--color-accent)' }} />

      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {siteName && <span className="text-xl font-heading font-bold text-gradient">{siteName}</span>}
            </div>
            <h1 className="text-2xl font-bold">管理员登录</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              请使用管理员凭证登录
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-2xl p-8 shadow-float" style={{ background: 'var(--color-surface)' }}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input pl-10"
                  placeholder="用户名"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="密码"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-error text-center py-2 px-3 rounded-lg"
                  style={{ background: 'rgba(248,113,113,0.1)' }}
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="flex items-center justify-center gap-1 text-sm transition-colors hover:text-primary"
              style={{ color: 'var(--color-text-muted)' }}>
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
