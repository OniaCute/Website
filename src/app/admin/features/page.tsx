'use client';

import React, { useState, useEffect } from 'react';
import { ToggleLeft, Save, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Toggle } from '@/components/ui/Toggle';
import { useLocaleStore } from '@/store/localeStore';
import type { SiteConfig } from '@/types';

const i18n = {
  title:      { 'zh-CN': '功能开关',             'en-US': 'Features' },
  subtitle:   { 'zh-CN': '控制访客交互限制和特效功能', 'en-US': 'Control visitor interaction restrictions & effects' },
  save:       { 'zh-CN': '保存',    'en-US': 'Save' },
  saved:      { 'zh-CN': '已保存 ✓', 'en-US': 'Saved ✓' },
  loading:    { 'zh-CN': '加载中...', 'en-US': 'Loading...' },
  warning:    { 'zh-CN': '安全提示：', 'en-US': 'Security Note: ' },
  warningMsg: { 'zh-CN': '禁用右键和 DevTools 仅为体验层保护，无法阻止专业用户的技术操作，不应视为真正的内容保护手段。', 'en-US': 'Disabling right-click and DevTools only provides surface-level protection. It cannot prevent determined users and should not be treated as true content protection.' },
  rightClick:       { 'zh-CN': '右键菜单控制',    'en-US': 'Right-Click Control' },
  defaultRule:      { 'zh-CN': '默认规则：',      'en-US': 'Default Rule:' },
  disableAll:       { 'zh-CN': '🚫 全局禁用',     'en-US': '🚫 Disable Globally' },
  allowAll:         { 'zh-CN': '✅ 全局允许',     'en-US': '✅ Allow Globally' },
  routeRules:       { 'zh-CN': '路由级规则',      'en-US': 'Per-Route Rules' },
  routeRulesHint:   { 'zh-CN': '(优先级高于默认规则)', 'en-US': '(Override the default rule)' },
  ruleAllowed:      { 'zh-CN': '✅ 允许',         'en-US': '✅ Allowed' },
  ruleDisabled:     { 'zh-CN': '🚫 禁用',         'en-US': '🚫 Disabled' },
  ruleOptAllowed:   { 'zh-CN': '允许',            'en-US': 'Allowed' },
  ruleOptDisabled:  { 'zh-CN': '禁用',            'en-US': 'Disabled' },
  devtools:         { 'zh-CN': 'DevTools 限制',   'en-US': 'DevTools Guard' },
  devtoolsEnable:   { 'zh-CN': '启用 DevTools 限制', 'en-US': 'Enable DevTools Guard' },
  devtoolsEnableDesc: { 'zh-CN': '拦截 F12、Ctrl+Shift+I 等快捷键（仅软限制）', 'en-US': 'Block F12, Ctrl+Shift+I etc. (soft protection only)' },
  devtoolsBlock:    { 'zh-CN': '🚫 默认拦截',     'en-US': '🚫 Block by Default' },
  devtoolsAllow:    { 'zh-CN': '✅ 默认允许',     'en-US': '✅ Allow by Default' },
  others:           { 'zh-CN': '其他功能',         'en-US': 'Other Features' },
  animations:       { 'zh-CN': '启用动画效果',     'en-US': 'Enable Animations' },
  animationsDesc:   { 'zh-CN': '页面过渡和元素动画', 'en-US': 'Page transitions & element animations' },
  smoothScroll:     { 'zh-CN': '平滑滚动',         'en-US': 'Smooth Scroll' },
  smoothScrollDesc: { 'zh-CN': '页面锚点跳转使用平滑动画', 'en-US': 'Smooth animation for anchor navigation' },
  particles:        { 'zh-CN': '粒子特效',         'en-US': 'Particle Effects' },
  particlesDesc:    { 'zh-CN': '背景粒子动画（对性能有一定影响）', 'en-US': 'Background particle animation (may affect performance)' },
  textSelection:    { 'zh-CN': '禁用文字选择',     'en-US': 'Disable Text Selection' },
  textSelectionDesc: { 'zh-CN': '阻止访客选中页面文字', 'en-US': 'Prevent visitors from selecting page text' },
  copyShortcut:     { 'zh-CN': '禁用复制快捷键',   'en-US': 'Disable Copy Shortcut' },
  copyShortcutDesc: { 'zh-CN': '拦截 Ctrl/Cmd + C（输入框、文本域内仍可复制）', 'en-US': 'Block Ctrl/Cmd+C (inputs & textareas still work)' },
} as const;

type L = 'zh-CN' | 'en-US';

export default function FeaturesPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newRoute, setNewRoute] = useState({ path: '', rightClick: 'allowed' as 'allowed' | 'disabled' });

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(res => { if (res.code === 200) setConfig(res.data); });
  }, []);

  if (!config) return <div className="text-center py-24" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.loading)}</div>;

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false);
    if ((await res.json()).code === 200) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const updateFeature = (key: keyof SiteConfig['features'], value: unknown) => setConfig(p => p ? { ...p, features: { ...p.features, [key]: value } } : p);

  const addRouteRule = () => {
    if (!newRoute.path) return;
    setConfig(p => p ? { ...p, features: { ...p.features, rightClick: { ...p.features.rightClick, routes: { ...p.features.rightClick.routes, [newRoute.path]: newRoute.rightClick } } } } : p);
    setNewRoute({ path: '', rightClick: 'allowed' });
  };

  const removeRouteRule = (path: string) => {
    setConfig(p => {
      if (!p) return p;
      const routes = { ...p.features.rightClick.routes };
      delete routes[path];
      return { ...p, features: { ...p.features, rightClick: { ...p.features.rightClick, routes } } };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ToggleLeft className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
          </div>
        </div>
        <Button size="sm" loading={saving} onClick={save}><Save className="w-4 h-4" /> {saved ? tx(i18n.saved) : tx(i18n.save)}</Button>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-error" />
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <strong className="text-error">{tx(i18n.warning)}</strong>{tx(i18n.warningMsg)}
        </p>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-5">{tx(i18n.rightClick)}</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.defaultRule)}</span>
            <select value={config.features.rightClick.default} onChange={e => updateFeature('rightClick', { ...config.features.rightClick, default: e.target.value as 'allowed' | 'disabled' })} className="input text-sm py-2 flex-1 max-w-xs">
              <option value="disabled">{tx(i18n.disableAll)}</option>
              <option value="allowed">{tx(i18n.allowAll)}</option>
            </select>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">{tx(i18n.routeRules)} <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.routeRulesHint)}</span></p>
            <div className="space-y-2">
              {Object.entries(config.features.rightClick.routes).map(([path, rule]) => (
                <div key={path} className="flex items-center gap-3 p-3 rounded-xl text-sm" style={{ background: 'var(--color-surface-alt)' }}>
                  <code className="flex-1 font-mono text-xs" style={{ color: 'var(--color-primary)' }}>{path}</code>
                  <span className={rule === 'allowed' ? 'text-success' : 'text-error'}>{rule === 'allowed' ? tx(i18n.ruleAllowed) : tx(i18n.ruleDisabled)}</span>
                  <button onClick={() => removeRouteRule(path)} className="hover:text-error transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input value={newRoute.path} onChange={e => setNewRoute(p => ({ ...p, path: e.target.value }))} placeholder="/admin or /blog" />
              <select value={newRoute.rightClick} onChange={e => setNewRoute(p => ({ ...p, rightClick: e.target.value as 'allowed' | 'disabled' }))} className="input text-sm py-2 w-32 flex-shrink-0">
                <option value="allowed">{tx(i18n.ruleOptAllowed)}</option>
                <option value="disabled">{tx(i18n.ruleOptDisabled)}</option>
              </select>
              <Button variant="ghost" onClick={addRouteRule}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-5">{tx(i18n.devtools)}</h3>
        <div className="space-y-4">
          <Toggle checked={config.features.devtools.enabled} onChange={v => updateFeature('devtools', { ...config.features.devtools, enabled: v })} label={tx(i18n.devtoolsEnable)} description={tx(i18n.devtoolsEnableDesc)} />
          {config.features.devtools.enabled && (
            <div className="flex items-center gap-4">
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.defaultRule)}</span>
              <select value={config.features.devtools.default} onChange={e => updateFeature('devtools', { ...config.features.devtools, default: e.target.value as 'allowed' | 'disabled' })} className="input text-sm py-2 flex-1 max-w-xs">
                <option value="disabled">{tx(i18n.devtoolsBlock)}</option>
                <option value="allowed">{tx(i18n.devtoolsAllow)}</option>
              </select>
            </div>
          )}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-5">{tx(i18n.others)}</h3>
        <div className="space-y-4">
          <Toggle checked={config.features.animations}   onChange={v => updateFeature('animations', v)}   label={tx(i18n.animations)}   description={tx(i18n.animationsDesc)} />
          <Toggle checked={config.features.smoothScroll} onChange={v => updateFeature('smoothScroll', v)} label={tx(i18n.smoothScroll)} description={tx(i18n.smoothScrollDesc)} />
          <Toggle checked={config.features.particles}    onChange={v => updateFeature('particles', v)}    label={tx(i18n.particles)}    description={tx(i18n.particlesDesc)} />
          <Toggle checked={config.features.textSelection.default === 'disabled'} onChange={v => updateFeature('textSelection', { default: v ? 'disabled' : 'allowed' })} label={tx(i18n.textSelection)} description={tx(i18n.textSelectionDesc)} />
          <Toggle checked={config.features.copyShortcut.default === 'disabled'}  onChange={v => updateFeature('copyShortcut',  { default: v ? 'disabled' : 'allowed' })} label={tx(i18n.copyShortcut)}  description={tx(i18n.copyShortcutDesc)} />
        </div>
      </GlassCard>
    </div>
  );
}
