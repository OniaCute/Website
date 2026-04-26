'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Layout, Save, GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Toggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { useLocaleStore } from '@/store/localeStore';
import type { SiteConfig, NavItem, SectionConfig, Locale } from '@/types';

const i18n = {
  title:       { 'zh-CN': '布局管理',                       'en-US': 'Layout Manager' },
  subtitle:    { 'zh-CN': '拖拽排序导航菜单和首页区块，管理页脚', 'en-US': 'Drag to reorder nav items & sections, manage footer' },
  save:        { 'zh-CN': '保存',    'en-US': 'Save' },
  saved:       { 'zh-CN': '已保存 ✓', 'en-US': 'Saved ✓' },
  loading:     { 'zh-CN': '加载中...', 'en-US': 'Loading...' },
  header:      { 'zh-CN': '导航栏设置', 'en-US': 'Header Settings' },
  showHeader:  { 'zh-CN': '显示导航栏', 'en-US': 'Show Header' },
  stickyHeader: { 'zh-CN': '固定在顶部', 'en-US': 'Sticky Header' },
  brandZh:     { 'zh-CN': 'TopNav 标题 (中文)', 'en-US': 'TopNav Title (Chinese)' },
  brandEn:     { 'zh-CN': 'TopNav Title (EN)', 'en-US': 'TopNav Title (English)' },
  navItems:    { 'zh-CN': '导航菜单项', 'en-US': 'Nav Items' },
  navItemsDesc: { 'zh-CN': '拖拽调整顺序，切换开关控制显示', 'en-US': 'Drag to reorder, toggle to show/hide' },
  addNav:      { 'zh-CN': '添加',     'en-US': 'Add' },
  pageTitles:  { 'zh-CN': '页面标题（浏览器 Tab Title）', 'en-US': 'Page Titles (Browser Tab)' },
  sections:    { 'zh-CN': '首页区块排序', 'en-US': 'Section Order' },
  sectionsDesc: { 'zh-CN': '拖拽调整区块显示顺序，右侧开关控制可见性', 'en-US': 'Drag to reorder, toggle to show/hide' },
  footer:      { 'zh-CN': '页脚设置', 'en-US': 'Footer Settings' },
  showFooter:  { 'zh-CN': '显示页脚', 'en-US': 'Show Footer' },
  copyrightZh: { 'zh-CN': '版权信息 (中文)', 'en-US': 'Copyright (Chinese)' },
  copyrightEn: { 'zh-CN': 'Copyright (EN)', 'en-US': 'Copyright (English)' },
  modalAdd:    { 'zh-CN': '添加导航链接', 'en-US': 'Add Nav Link' },
  navLabelZh:  { 'zh-CN': '菜单名称 (中文)', 'en-US': 'Label (Chinese)' },
  navLabelEn:  { 'zh-CN': 'Menu Label (EN)', 'en-US': 'Label (English)' },
  navHref:     { 'zh-CN': '链接地址', 'en-US': 'Link URL' },
  cancel:      { 'zh-CN': '取消', 'en-US': 'Cancel' },
  confirm:     { 'zh-CN': '添加', 'en-US': 'Add' },
  pageTitleRows: {
    home:          { 'zh-CN': '首页',   'en-US': 'Home' },
    projects:      { 'zh-CN': '项目列表', 'en-US': 'Projects' },
    projectDetail: { 'zh-CN': '项目详情', 'en-US': 'Project Detail' },
    admin:         { 'zh-CN': '控制面板', 'en-US': 'Admin' },
    login:         { 'zh-CN': '登录页',  'en-US': 'Login' },
    setup:         { 'zh-CN': '初始化页', 'en-US': 'Setup' },
  },
  sectionLabels: {
    hero:     { 'zh-CN': '🌟 Hero 横幅',  'en-US': '🌟 Hero Banner' },
    about:    { 'zh-CN': '👤 关于我',     'en-US': '👤 About Me' },
    projects: { 'zh-CN': '🚀 项目展示',   'en-US': '🚀 Projects' },
    skills:   { 'zh-CN': '⚡ 技能栈',     'en-US': '⚡ Skills' },
    friends:  { 'zh-CN': '🤝 友情链接',   'en-US': '🤝 Friend Links' },
    contact:  { 'zh-CN': '📫 联系方式',   'en-US': '📫 Contact' },
  },
  titleSuffix: { zh: { 'zh-CN': '标题 (中文)', 'en-US': 'Title (Chinese)' }, en: { 'zh-CN': 'Title (EN)', 'en-US': 'Title (English)' } },
} as const;

type L = 'zh-CN' | 'en-US';

function SortableSection({ section, onToggle, label }: { section: SectionConfig; onToggle: (id: string, v: boolean) => void; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 glass rounded-xl">
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:opacity-70 transition-opacity">
        <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
      </button>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <Toggle checked={section.enabled} onChange={v => onToggle(section.id, v)} />
    </div>
  );
}

interface NavItemRowProps {
  item: NavItem;
  onToggleVisible: (id: string, v: boolean) => void;
  onRemove: (id: string) => void;
}

function SortableNavItem({ item, onToggleVisible, onRemove }: NavItemRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0.5 : item.visible === false ? 0.45 : 1, background: 'var(--color-surface-alt)' }}
      className="flex items-center gap-3 p-3 rounded-xl text-sm"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:opacity-70 transition-opacity flex-shrink-0">
        <GripVertical className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
      </button>
      <Toggle
        checked={item.visible !== false}
        onChange={v => onToggleVisible(item.id, v)}
      />
      <span className="flex-1 min-w-0 truncate font-medium">
        {item.label['zh-CN']}{item.label['en-US'] && item.label['en-US'] !== item.label['zh-CN'] ? ` / ${item.label['en-US']}` : ''}
      </span>
      <span className="text-xs flex-shrink-0 font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}>
        {item.href}
      </span>
      <button onClick={() => onRemove(item.id)} className="hover:text-error transition-colors p-1 flex-shrink-0">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function LayoutEditorPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addNavOpen, setAddNavOpen] = useState(false);
  const [newNav, setNewNav] = useState({ labelZh: '', labelEn: '', href: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(res => { if (res.code === 200) setConfig(res.data); });
  }, []);

  if (!config) return <div className="text-center py-24" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.loading)}</div>;

  const pageTitles = {
    home:          config.meta.pageTitles?.home          ?? { 'zh-CN': '', 'en-US': '' },
    projects:      config.meta.pageTitles?.projects      ?? { 'zh-CN': '', 'en-US': '' },
    projectDetail: config.meta.pageTitles?.projectDetail ?? { 'zh-CN': '', 'en-US': '' },
    admin:         config.meta.pageTitles?.admin         ?? { 'zh-CN': '', 'en-US': '' },
    login:         config.meta.pageTitles?.login         ?? { 'zh-CN': '', 'en-US': '' },
    setup:         config.meta.pageTitles?.setup         ?? { 'zh-CN': '', 'en-US': '' },
  };

  const updatePageTitle = (key: keyof typeof pageTitles, loc: Locale, value: string) => {
    setConfig(prev => {
      if (!prev) return prev;
      const safe = { home: prev.meta.pageTitles?.home ?? { 'zh-CN': '', 'en-US': '' }, projects: prev.meta.pageTitles?.projects ?? { 'zh-CN': '', 'en-US': '' }, projectDetail: prev.meta.pageTitles?.projectDetail ?? { 'zh-CN': '', 'en-US': '' }, admin: prev.meta.pageTitles?.admin ?? { 'zh-CN': '', 'en-US': '' }, login: prev.meta.pageTitles?.login ?? { 'zh-CN': '', 'en-US': '' }, setup: prev.meta.pageTitles?.setup ?? { 'zh-CN': '', 'en-US': '' } };
      return { ...prev, meta: { ...prev.meta, pageTitles: { ...safe, [key]: { ...safe[key], [loc]: value } } } };
    });
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const sections = [...config.layout.sections];
    const reordered = arrayMove(sections, sections.findIndex(s => s.id === active.id), sections.findIndex(s => s.id === over.id)).map((s, i) => ({ ...s, order: i + 1 }));
    setConfig(p => p ? { ...p, layout: { ...p.layout, sections: reordered } } : p);
  };

  const handleNavDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = [...config.layout.header.items];
    const reordered = arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id));
    setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, items: reordered } } } : p);
  };

  const toggleSection = (id: string, enabled: boolean) => setConfig(p => p ? { ...p, layout: { ...p.layout, sections: p.layout.sections.map(s => s.id === id ? { ...s, enabled } : s) } } : p);
  const toggleNavVisible = (id: string, v: boolean) => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, items: p.layout.header.items.map(i => i.id === id ? { ...i, visible: v } : i) } } } : p);
  const removeNavItem = (id: string) => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, items: p.layout.header.items.filter(i => i.id !== id) } } } : p);

  const addNavItem = () => {
    if (!newNav.labelZh || !newNav.href) return;
    const item: NavItem = { id: Date.now().toString(), label: { 'zh-CN': newNav.labelZh, 'en-US': newNav.labelEn || newNav.labelZh }, href: newNav.href };
    setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, items: [...p.layout.header.items, item] } } } : p);
    setNewNav({ labelZh: '', labelEn: '', href: '' });
    setAddNavOpen(false);
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false);
    if ((await res.json()).code === 200) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layout className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
          </div>
        </div>
        <Button size="sm" loading={saving} onClick={save}><Save className="w-4 h-4" /> {saved ? tx(i18n.saved) : tx(i18n.save)}</Button>
      </div>

      <GlassCard>
        <h3 className="font-semibold mb-4">{tx(i18n.header)}</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Toggle checked={config.layout.header.visible} onChange={v => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, visible: v } } } : p)} label={tx(i18n.showHeader)} />
            <Toggle checked={config.layout.header.sticky} onChange={v => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, sticky: v } } } : p)} label={tx(i18n.stickyHeader)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label={tx(i18n.brandZh)} value={config.layout.header.brandTitle?.['zh-CN'] ?? ''} onChange={e => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, brandTitle: { 'zh-CN': e.target.value, 'en-US': p.layout.header.brandTitle?.['en-US'] ?? '' } } } } : p)} placeholder="Onia" />
            <Input label={tx(i18n.brandEn)} value={config.layout.header.brandTitle?.['en-US'] ?? ''} onChange={e => setConfig(p => p ? { ...p, layout: { ...p.layout, header: { ...p.layout.header, brandTitle: { 'zh-CN': p.layout.header.brandTitle?.['zh-CN'] ?? '', 'en-US': e.target.value } } } } : p)} placeholder="Onia" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{tx(i18n.navItems)}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.navItemsDesc)}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setAddNavOpen(true)}><Plus className="w-4 h-4" /> {tx(i18n.addNav)}</Button>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleNavDragEnd}>
              <SortableContext items={config.layout.header.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {config.layout.header.items.map(item => (
                    <SortableNavItem
                      key={item.id}
                      item={item}
                      onToggleVisible={toggleNavVisible}
                      onRemove={removeNavItem}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-4">{tx(i18n.pageTitles)}</h3>
        <div className="space-y-4">
          {(Object.keys(i18n.pageTitleRows) as (keyof typeof i18n.pageTitleRows)[]).map(key => (
            <div key={key} className="grid sm:grid-cols-2 gap-4">
              <Input label={`${tx(i18n.pageTitleRows[key])} ${tx(i18n.titleSuffix.zh)}`} value={pageTitles[key]['zh-CN']} onChange={e => updatePageTitle(key, 'zh-CN', e.target.value)} />
              <Input label={`${tx(i18n.pageTitleRows[key])} ${tx(i18n.titleSuffix.en)}`} value={pageTitles[key]['en-US']} onChange={e => updatePageTitle(key, 'en-US', e.target.value)} />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-2">{tx(i18n.sections)}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.sectionsDesc)}</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={config.layout.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {[...config.layout.sections].sort((a, b) => a.order - b.order).map(section => (
                <SortableSection
                  key={section.id} section={section} onToggle={toggleSection}
                  label={tx(i18n.sectionLabels[section.id as keyof typeof i18n.sectionLabels] ?? { 'zh-CN': section.id, 'en-US': section.id })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-4">{tx(i18n.footer)}</h3>
        <Toggle checked={config.layout.footer.visible} onChange={v => setConfig(p => p ? { ...p, layout: { ...p.layout, footer: { ...p.layout.footer, visible: v } } } : p)} label={tx(i18n.showFooter)} />
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Input label={tx(i18n.copyrightZh)} value={config.layout.footer.copyright['zh-CN']} onChange={e => setConfig(p => p ? { ...p, layout: { ...p.layout, footer: { ...p.layout.footer, copyright: { ...p.layout.footer.copyright, 'zh-CN': e.target.value } } } } : p)} />
          <Input label={tx(i18n.copyrightEn)} value={config.layout.footer.copyright['en-US']} onChange={e => setConfig(p => p ? { ...p, layout: { ...p.layout, footer: { ...p.layout.footer, copyright: { ...p.layout.footer.copyright, 'en-US': e.target.value } } } } : p)} />
        </div>
      </GlassCard>

      <Modal open={addNavOpen} onClose={() => setAddNavOpen(false)} title={tx(i18n.modalAdd)}
        footer={<><Button variant="ghost" onClick={() => setAddNavOpen(false)}>{tx(i18n.cancel)}</Button><Button onClick={addNavItem}>{tx(i18n.confirm)}</Button></>}>
        <div className="space-y-4">
          <Input label={tx(i18n.navLabelZh)} value={newNav.labelZh} onChange={e => setNewNav(p => ({ ...p, labelZh: e.target.value }))} placeholder="关于" />
          <Input label={tx(i18n.navLabelEn)} value={newNav.labelEn} onChange={e => setNewNav(p => ({ ...p, labelEn: e.target.value }))} placeholder="About" />
          <Input label={tx(i18n.navHref)} value={newNav.href} onChange={e => setNewNav(p => ({ ...p, href: e.target.value }))} placeholder="#about or /blog" />
        </div>
      </Modal>
    </div>
  );
}
