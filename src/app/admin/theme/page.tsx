'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Palette, Save, RotateCcw, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Toggle } from '@/components/ui/Toggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLocaleStore } from '@/store/localeStore';
import type { SiteConfig, ThemeMode } from '@/types';
import { clsx } from 'clsx';

const i18n = {
  title:     { 'zh-CN': '主题编辑器',                          'en-US': 'Theme Editor' },
  subtitle:  { 'zh-CN': '自定义 Night/Day 模式的颜色、字体和玻璃效果', 'en-US': 'Customize colors, fonts & glassmorphism for Night/Day modes' },
  save:      { 'zh-CN': '保存',    'en-US': 'Save' },
  saved:     { 'zh-CN': '已保存 ✓', 'en-US': 'Saved ✓' },
  loading:   { 'zh-CN': '加载中...', 'en-US': 'Loading...' },
  general:   { 'zh-CN': '通用设置', 'en-US': 'General' },
  allowSwitch: { 'zh-CN': '允许访客切换主题', 'en-US': 'Allow visitors to toggle theme' },
  allowSwitchDesc: { 'zh-CN': '访客可以自行在 Night/Day 模式之间切换', 'en-US': 'Visitors can switch between Night/Day modes' },
  nightMode: { 'zh-CN': '夜间模式', 'en-US': 'Night Mode' },
  dayMode:   { 'zh-CN': '日间模式', 'en-US': 'Day Mode' },
  colors:    { 'zh-CN': '色彩配置 — ', 'en-US': 'Colors — ' },
  night:     { 'zh-CN': '🌙 夜间',   'en-US': '🌙 Night' },
  day:       { 'zh-CN': '☀️ 日间',   'en-US': '☀️ Day' },
  glass:     { 'zh-CN': '玻璃拟态效果 — ', 'en-US': 'Glassmorphism — ' },
  opacity:   { 'zh-CN': '透明度',   'en-US': 'Opacity' },
  blur:      { 'zh-CN': '模糊强度', 'en-US': 'Blur Strength' },
  skills:    { 'zh-CN': 'Skills 卡片样式 — ', 'en-US': 'Skills Card Style — ' },
  cardColor: { 'zh-CN': '卡片强调色', 'en-US': 'Card Accent Color' },
  progressColor: { 'zh-CN': '进度条主色', 'en-US': 'Progress Bar Color' },
  cardOpacity:   { 'zh-CN': '卡片色透明度', 'en-US': 'Card Color Opacity' },
  fonts:     { 'zh-CN': '字体配置', 'en-US': 'Font Settings' },
  fontRoles: { heading: { 'zh-CN': '标题字体', 'en-US': 'Heading Font' }, body: { 'zh-CN': '正文字体', 'en-US': 'Body Font' }, mono: { 'zh-CN': '代码字体', 'en-US': 'Mono Font' } },
  fontSource: { 'zh-CN': '字体来源', 'en-US': 'Font Source' },
  fontSources: { system: { 'zh-CN': '系统字体', 'en-US': 'System Font' }, google: { 'zh-CN': 'Google Fonts', 'en-US': 'Google Fonts' }, local: { 'zh-CN': '本地上传', 'en-US': 'Local Upload' } },
  fontName:    { 'zh-CN': '字体名称',       'en-US': 'Font Family' },
  fontAlt:     { 'zh-CN': '第二字体（可选）', 'en-US': 'Fallback Font (optional)' },
  fontUrl:     { 'zh-CN': '字体 URL',       'en-US': 'Font URL' },
  fontPreview: { 'zh-CN': '预览：', 'en-US': 'Preview: ' },
    colorLabels: {
      primary:    { 'zh-CN': '主色调',   'en-US': 'Primary' },
      background: { 'zh-CN': '背景色',   'en-US': 'Background' },
      surface:    { 'zh-CN': '卡片背景', 'en-US': 'Surface' },
      surfaceAlt: { 'zh-CN': '次级背景', 'en-US': 'Surface Alt' },
      text:       { 'zh-CN': '文字颜色', 'en-US': 'Text' },
      textMuted:  { 'zh-CN': '次级文字', 'en-US': 'Muted Text' },
      accent:     { 'zh-CN': '强调色',   'en-US': 'Accent' },
      border:     { 'zh-CN': '边框色',   'en-US': 'Border' },
      error:      { 'zh-CN': '错误色',   'en-US': 'Error' },
      success:    { 'zh-CN': '成功色',   'en-US': 'Success' },
      glassColor: { 'zh-CN': '磨砂背景色', 'en-US': 'Glass Base Color' },
    },
} as const;

type L = 'zh-CN' | 'en-US';

export default function ThemeEditorPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [activeTab, setActiveTab] = useState<ThemeMode>('night');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(res => {
      if (res.code === 200) setConfig(res.data);
    });
  }, []);

  if (!config) return <div className="flex items-center justify-center py-24" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.loading)}</div>;

  const updateColor    = (mode: ThemeMode, key: string, value: string)  => setConfig(p => p ? { ...p, theme: { ...p.theme, [mode]: { ...p.theme[mode], colors: { ...p.theme[mode].colors, [key]: value } } } } : p);
  const updateGlass    = (mode: ThemeMode, key: string, value: number)  => setConfig(p => p ? { ...p, theme: { ...p.theme, [mode]: { ...p.theme[mode], glass:  { ...p.theme[mode].glass,  [key]: value } } } } : p);
  const updateSkillStyle = (mode: ThemeMode, key: 'cardColor' | 'cardOpacity' | 'progressColor', value: string | number) => setConfig(p => p ? { ...p, theme: { ...p.theme, [mode]: { ...p.theme[mode], skills: { ...p.theme[mode].skills, [key]: value } } } } : p);
  const updateFont     = (role: 'heading' | 'body' | 'mono', key: string, value: string) => setConfig(p => p ? { ...p, theme: { ...p.theme, fonts: { ...p.theme.fonts, [role]: { ...p.theme.fonts[role], [key]: value } } } } : p);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false);
    if ((await res.json()).code === 200) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const colorKeys = Object.keys(config.theme.night.colors) as (keyof typeof config.theme.night.colors)[];
  const modeLabel = (m: ThemeMode) => m === 'night' ? tx(i18n.night) : tx(i18n.day);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}><RotateCcw className="w-4 h-4" /></Button>
          <Button size="sm" loading={saving} onClick={save}><Save className="w-4 h-4" /> {saved ? tx(i18n.saved) : tx(i18n.save)}</Button>
        </div>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4">{tx(i18n.general)}</h3>
        <Toggle
          checked={config.theme.allowUserSwitch}
          onChange={v => setConfig(p => p ? { ...p, theme: { ...p.theme, allowUserSwitch: v } } : p)}
          label={tx(i18n.allowSwitch)}
          description={tx(i18n.allowSwitchDesc)}
        />
      </GlassCard>

      <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
        {(['night', 'day'] as ThemeMode[]).map(mode => (
          <button key={mode} onClick={() => setActiveTab(mode)}
            className={clsx('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200', activeTab === mode ? 'text-white shadow-md' : '')}
            style={{ background: activeTab === mode ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' : 'transparent', color: activeTab === mode ? 'white' : 'var(--color-text-muted)' }}
          >
            {mode === 'night' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {mode === 'night' ? tx(i18n.nightMode) : tx(i18n.dayMode)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.985 }} transition={{ duration: 0.22 }} className="space-y-6">

          <GlassCard>
            <h3 className="font-semibold mb-5">{tx(i18n.colors)}{modeLabel(activeTab)}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {colorKeys.map(key => (
                <ColorPicker key={key} label={tx(i18n.colorLabels[key as keyof typeof i18n.colorLabels] ?? { 'zh-CN': key, 'en-US': key })} value={config.theme[activeTab].colors[key] as string} onChange={v => updateColor(activeTab, key, v)} />
              ))}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-5">{tx(i18n.glass)}{modeLabel(activeTab)}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.opacity)} ({Math.round(config.theme[activeTab].glass.opacity * 100)}%)</label>
                <input type="range" min={0} max={1} step={0.01} value={config.theme[activeTab].glass.opacity} onChange={e => updateGlass(activeTab, 'opacity', parseFloat(e.target.value))} className="range-light w-full" />
              </div>
              <div>
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.blur)} ({config.theme[activeTab].glass.blur}px)</label>
                <input type="range" min={0} max={40} step={1} value={config.theme[activeTab].glass.blur} onChange={e => updateGlass(activeTab, 'blur', parseInt(e.target.value))} className="range-light w-full" />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="font-semibold mb-5">{tx(i18n.skills)}{modeLabel(activeTab)}</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <ColorPicker label={tx(i18n.cardColor)} value={config.theme[activeTab].skills.cardColor} onChange={v => updateSkillStyle(activeTab, 'cardColor', v)} />
              <ColorPicker label={tx(i18n.progressColor)} value={config.theme[activeTab].skills.progressColor} onChange={v => updateSkillStyle(activeTab, 'progressColor', v)} />
              <div className="sm:col-span-2">
                <label className="text-xs font-medium block mb-2" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.cardOpacity)} ({Math.round(config.theme[activeTab].skills.cardOpacity * 100)}%)</label>
                <input type="range" min={0} max={1} step={0.01} value={config.theme[activeTab].skills.cardOpacity} onChange={e => updateSkillStyle(activeTab, 'cardOpacity', parseFloat(e.target.value))} className="range-light w-full" />
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <GlassCard>
        <h3 className="font-semibold mb-5">{tx(i18n.fonts)}</h3>
        <div className="space-y-6">
          {(['heading', 'body', 'mono'] as const).map(role => {
            const font = config.theme.fonts[role];
            return (
              <div key={role} className="glass rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium">{tx(i18n.fontRoles[role])}</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.fontSource)}</label>
                    <select value={font.source} onChange={e => updateFont(role, 'source', e.target.value)} className="input text-sm py-2">
                      <option value="system">{tx(i18n.fontSources.system)}</option>
                      <option value="google">{tx(i18n.fontSources.google)}</option>
                      <option value="local">{tx(i18n.fontSources.local)}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.fontName)}</label>
                    <input value={font.family} onChange={e => updateFont(role, 'family', e.target.value)} placeholder="system-ui" className="input text-sm py-2" />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.fontAlt)}</label>
                    <input value={font.secondaryFamily ?? ''} onChange={e => updateFont(role, 'secondaryFamily', e.target.value)} placeholder="PingFang SC" className="input text-sm py-2" />
                  </div>
                  {font.source !== 'system' && (
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.fontUrl)}</label>
                      <input value={font.url ?? ''} onChange={e => updateFont(role, 'url', e.target.value)} placeholder="https://fonts.googleapis.com/..." className="input text-sm py-2" />
                    </div>
                  )}
                </div>
                {font.family && (
                  <p className="text-sm py-2 px-3 rounded-lg" style={{ fontFamily: font.secondaryFamily ? `${font.family}, ${font.secondaryFamily}` : font.family, background: 'var(--color-surface-alt)' }}>
                    {tx(i18n.fontPreview)}The quick brown fox jumps — 快速的棕狐跳过懒狗
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
