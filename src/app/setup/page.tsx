'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, Palette, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { routeProgress } from '@/components/ui/RouteProgressBar';

type Step = 'site' | 'admin' | 'theme' | 'done';

interface FormData {
  siteName: string;
  siteDesc: string;
  siteNameEn: string;
  siteDescEn: string;
  adminUsername: string;
  adminPassword: string;
  confirmPassword: string;
  defaultTheme: 'night' | 'day';
}

const steps: Step[] = ['site', 'admin', 'theme'];

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('site');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    siteName: '', siteDesc: '', siteNameEn: '', siteDescEn: '',
    adminUsername: 'admin', adminPassword: '', confirmPassword: '', defaultTheme: 'night',
  });

  const update = (key: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const next = () => {
    setError('');
    if (currentStep === 'site') { setCurrentStep('admin'); return; }
    if (currentStep === 'admin') {
      if (!form.adminUsername || form.adminUsername.length < 3) { setError('用户名至少 3 个字符'); return; }
      if (!form.adminPassword || form.adminPassword.length < 8) { setError('密码至少 8 个字符'); return; }
      if (form.adminPassword !== form.confirmPassword) { setError('两次密码不一致'); return; }
      setCurrentStep('theme');
    }
  };

  const back = () => {
    if (currentStep === 'admin') setCurrentStep('site');
    if (currentStep === 'theme') setCurrentStep('admin');
  };

  const finish = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { code: number; message: string };
      if (data.code === 200) {
        setCurrentStep('done');
        setTimeout(() => {
          routeProgress.start();
          router.push('/login');
        }, 2500);
      } else {
        setError(data.message);
      }
    } catch {
      setError('初始化失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const stepIndex = steps.indexOf(currentStep as Step);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Decorative background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'var(--color-primary)' }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="text-2xl font-heading font-bold text-gradient">初始化向导</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)' }}>首次使用，请完成以下配置</p>
        </motion.div>

        {/* Steps indicator */}
        {currentStep !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    background: i <= stepIndex ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    color: i <= stepIndex ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className="w-12 h-px transition-all duration-300"
                    style={{ background: i < stepIndex ? 'var(--color-primary)' : 'var(--color-border)' }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main card */}
        <div className="glass rounded-2xl p-8" style={{ background: 'var(--color-surface)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Site Info */}
            {currentStep === 'site' && (
              <motion.div key="site" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">站点基本信息</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>设置你的网站名称和描述</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="网站名称 (中文)" value={form.siteName} onChange={e => update('siteName', e.target.value)} placeholder="我的网站" />
                  <Input label="Site Name (EN)" value={form.siteNameEn} onChange={e => update('siteNameEn', e.target.value)} placeholder="My Site" />
                </div>
                <Input label="网站描述 (中文)" value={form.siteDesc} onChange={e => update('siteDesc', e.target.value)} placeholder="我的个人网站" />
                <Input label="Description (EN)" value={form.siteDescEn} onChange={e => update('siteDescEn', e.target.value)} placeholder="My personal website" />
                <Button className="w-full mt-4" onClick={next}>
                  下一步 <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Admin Account */}
            {currentStep === 'admin' && (
              <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">管理员账户</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>设置登录凭证（之后可在后台修改密码）</p>
                  </div>
                </div>
                <Input label="管理员用户名" value={form.adminUsername} onChange={e => update('adminUsername', e.target.value)}
                  placeholder="admin" hint="至少 3 个字符" />
                <Input label="密码" type="password" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)}
                  placeholder="••••••••" hint="至少 8 个字符" error={error.includes('密码') ? error : undefined} />
                <Input label="确认密码" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  placeholder="••••••••" error={error.includes('不一致') ? error : undefined} />
                {error && !error.includes('密码') && <p className="text-xs text-error">{error}</p>}
                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" className="flex-1" onClick={back}>
                    <ArrowLeft className="w-4 h-4" /> 上一步
                  </Button>
                  <Button className="flex-1" onClick={next}>
                    下一步 <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Theme */}
            {currentStep === 'theme' && (
              <motion.div key="theme" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)' }}>
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">主题偏好</h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>选择默认显示的主题风格</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(['night', 'day'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => update('defaultTheme', mode)}
                      className="relative p-4 rounded-xl border-2 transition-all duration-200 text-left"
                      style={{
                        background: mode === 'night' ? '#000000' : '#ffffff',
                        borderColor: form.defaultTheme === mode ? 'var(--color-primary)' : 'var(--color-border)',
                        boxShadow: form.defaultTheme === mode ? '0 0 0 3px rgba(96,165,250,0.2)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ color: mode === 'night' ? '#f0f0f5' : '#1a1a2e' }} className="text-sm font-semibold">
                          {mode === 'night' ? '🌙 夜间模式' : '☀️ 日间模式'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {(mode === 'night' ? ['#60a5fa', '#38bdf8', '#262626'] : ['#f472b6', '#fb7185', '#fdf2f8']).map(c => (
                          <div key={c} className="w-4 h-4 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                      {form.defaultTheme === mode && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="ghost" className="flex-1" onClick={back}>
                    <ArrowLeft className="w-4 h-4" /> 上一步
                  </Button>
                  <Button className="flex-1" loading={isLoading} onClick={finish}>
                    {isLoading ? '初始化中...' : '完成初始化 ✓'}
                  </Button>
                </div>
                {error && <p className="text-xs text-error text-center">{error}</p>}
              </motion.div>
            )}

            {/* Done */}
            {currentStep === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="flex justify-center"
                >
                  <CheckCircle className="w-16 h-16 text-success" />
                </motion.div>
                <h2 className="text-xl font-bold">初始化完成！</h2>
                <p style={{ color: 'var(--color-text-muted)' }}>正在跳转到登录页面...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Developer credit */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Powered by{' '}
          <a
            href="https://oniacute.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            oniacute.cc
          </a>
        </p>
      </div>
    </div>
  );
}
