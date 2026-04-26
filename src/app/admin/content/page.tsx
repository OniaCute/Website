'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Save, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Input';
import { GlassCard } from '@/components/ui/GlassCard';
import { Modal } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useLocaleStore } from '@/store/localeStore';
import type { SiteConfig, ProjectMeta, Locale, FriendLink } from '@/types';
import { clsx } from 'clsx';

type TabId = 'hero' | 'about' | 'announcement' | 'skills' | 'friends' | 'contact' | 'projects' | 'loading' | 'seo';

// ── i18n ──────────────────────────────────────────────────────────────────────
const i18n = {
  title:   { 'zh-CN': '内容管理', 'en-US': 'Content' },
  subtitle: { 'zh-CN': '编辑网站所有文本和内容', 'en-US': 'Edit all site text and content' },
  save:    { 'zh-CN': '保存', 'en-US': 'Save' },
  saved:   { 'zh-CN': '已保存 ✓', 'en-US': 'Saved ✓' },
  loading: { 'zh-CN': '加载中...', 'en-US': 'Loading...' },
  tabs: {
    hero:         { 'zh-CN': 'Hero',     'en-US': 'Hero' },
    about:        { 'zh-CN': '关于我',   'en-US': 'About' },
    announcement: { 'zh-CN': '公告',     'en-US': 'Notice' },
    skills:       { 'zh-CN': '技能',     'en-US': 'Skills' },
    friends:      { 'zh-CN': '友情链接', 'en-US': 'Friends' },
    contact:      { 'zh-CN': '联系方式', 'en-US': 'Contact' },
    projects:     { 'zh-CN': '项目',     'en-US': 'Projects' },
    loading:      { 'zh-CN': '加载页',   'en-US': 'Loading' },
  },
  hero: {
    heading:     { 'zh-CN': 'Hero 区块 — ', 'en-US': 'Hero Section — ' },
    title:       { 'zh-CN': '主标题',    'en-US': 'Title' },
    subtitle:    { 'zh-CN': '副标题',    'en-US': 'Subtitle' },
    desc:        { 'zh-CN': '简短描述',  'en-US': 'Description' },
    cta:         { 'zh-CN': 'CTA 按钮',  'en-US': 'CTA Button' },
    ctaHref:     { 'zh-CN': 'CTA 链接',  'en-US': 'CTA Link' },
    avatar:      { 'zh-CN': '头像图片路径', 'en-US': 'Avatar Path' },
  },
  about: {
    heading: { 'zh-CN': '关于我内容 — ', 'en-US': 'About Me — ' },
    mdNote:  { 'zh-CN': '(支持 Markdown)', 'en-US': '(Markdown supported)' },
    label:   { 'zh-CN': '关于我正文', 'en-US': 'About Content' },
    placeholder: { 'zh-CN': '# 关于我\n\n...', 'en-US': '# About Me\n\n...' },
  },
  announcement: {
    heading:  { 'zh-CN': '公告内容 — ', 'en-US': 'Announcement — ' },
    mdNote:   { 'zh-CN': '(支持 Markdown)', 'en-US': '(Markdown supported)' },
    label:    { 'zh-CN': '公告正文', 'en-US': 'Content' },
    nightBg:  { 'zh-CN': '公告卡片背景（夜间）', 'en-US': 'Card Background (Night)' },
    dayBg:    { 'zh-CN': '公告卡片背景（日间）', 'en-US': 'Card Background (Day)' },
    placeholder: { 'zh-CN': '## 新公告\n\n...留空则不显示', 'en-US': '## Announcement\n\n...leave empty to hide' },
  },
  friends: {
    heading:    { 'zh-CN': '友情链接管理',   'en-US': 'Friend Links' },
    add:        { 'zh-CN': '添加链接',       'en-US': 'Add Link' },
    namePh:     { 'zh-CN': '站点名称',       'en-US': 'Site name' },
    urlPh:      { 'zh-CN': 'https://example.com', 'en-US': 'https://example.com' },
    descZhPh:   { 'zh-CN': '简介（中文）',   'en-US': 'Description (Chinese)' },
    descEnPh:   { 'zh-CN': '简介（英文）',   'en-US': 'Description (English)' },
    newName:    { 'zh-CN': '新站点',         'en-US': 'New Site' },
    emptyHint:  { 'zh-CN': '暂无友情链接，点击「添加链接」', 'en-US': 'No links yet. Click "Add Link".' },
  },
  skills: {
    heading:  { 'zh-CN': '技能管理',   'en-US': 'Skills' },
    add:      { 'zh-CN': '添加技能',   'en-US': 'Add Skill' },
    iconPh:   { 'zh-CN': '⚡',        'en-US': '⚡' },
    namePh:   { 'zh-CN': '技能名称',   'en-US': 'Skill name' },
    catPh:    { 'zh-CN': '分类',       'en-US': 'Category' },
    colorHint: { 'zh-CN': '提示：Skills 卡片颜色已移到「主题编辑器」', 'en-US': 'Tip: Card colors can be configured in Theme Editor' },
    newName:  { 'zh-CN': '新技能',     'en-US': 'New Skill' },
    newCat:   { 'zh-CN': '开发',       'en-US': 'Dev' },
  },
  contact: {
    heading: { 'zh-CN': '联系方式', 'en-US': 'Contact Info' },
    fields: {
      email:     { label: 'Email',     ph: { 'zh-CN': 'hello@example.com', 'en-US': 'hello@example.com' } },
      github:    { label: 'GitHub',    ph: { 'zh-CN': 'https://github.com/username', 'en-US': 'https://github.com/username' } },
      twitter:   { label: 'Twitter',   ph: { 'zh-CN': 'https://x.com/username', 'en-US': 'https://x.com/username' } },
      linkedin:  { label: 'LinkedIn',  ph: { 'zh-CN': 'https://linkedin.com/in/username', 'en-US': 'https://linkedin.com/in/username' } },
      discord:   { label: 'Discord',   ph: { 'zh-CN': 'https://discord.gg/... 或 user#0000', 'en-US': 'https://discord.gg/... or user#0000' } },
      telegram:  { label: 'Telegram',  ph: { 'zh-CN': 'https://t.me/username', 'en-US': 'https://t.me/username' } },
      steam:     { label: 'Steam',     ph: { 'zh-CN': 'https://steamcommunity.com/id/...', 'en-US': 'https://steamcommunity.com/id/...' } },
      bilibili:  { label: 'Bilibili',  ph: { 'zh-CN': 'https://space.bilibili.com/uid', 'en-US': 'https://space.bilibili.com/uid' } },
      qq:        { label: 'QQ',        ph: { 'zh-CN': 'QQ 号或群号', 'en-US': 'QQ number / group ID' } },
      wechat:    { label: 'WeChat',    ph: { 'zh-CN': '微信号', 'en-US': 'WeChat ID' } },
      youtube:   { label: 'YouTube',   ph: { 'zh-CN': 'https://youtube.com/@channel', 'en-US': 'https://youtube.com/@channel' } },
      instagram: { label: 'Instagram', ph: { 'zh-CN': 'https://instagram.com/username', 'en-US': 'https://instagram.com/username' } },
    },
  },
  projects: {
    new:       { 'zh-CN': '新建项目',   'en-US': 'New Project' },
    empty:     { 'zh-CN': '暂无项目，点击「新建项目」添加', 'en-US': 'No projects yet. Click "New Project" to add one.' },
    confirmDel: { 'zh-CN': '确认删除该项目？', 'en-US': 'Delete this project?' },
    modalNew:  { 'zh-CN': '新建项目',   'en-US': 'New Project' },
    modalEdit: { 'zh-CN': '编辑项目',   'en-US': 'Edit Project' },
    name:      { 'zh-CN': '项目名称',   'en-US': 'Project Name' },
    slug:      { 'zh-CN': 'Slug (URL)', 'en-US': 'Slug (URL)' },
    desc:      { 'zh-CN': '简短描述',   'en-US': 'Description' },
    tags:      { 'zh-CN': '标签 (逗号分隔)', 'en-US': 'Tags (comma-separated)' },
    repo:      { 'zh-CN': '代码仓库 URL', 'en-US': 'Repository URL' },
    demo:      { 'zh-CN': '演示地址 URL', 'en-US': 'Demo URL' },
    content:   { 'zh-CN': '详细描述 (Markdown)', 'en-US': 'Description (Markdown)' },
    create:    { 'zh-CN': '创建', 'en-US': 'Create' },
    saveEdit:  { 'zh-CN': '保存修改', 'en-US': 'Save Changes' },
    cancel:    { 'zh-CN': '取消', 'en-US': 'Cancel' },
  },
  seo: {
    tab:           { 'zh-CN': 'SEO',         'en-US': 'SEO' },
    heading:       { 'zh-CN': 'SEO 设置',    'en-US': 'SEO Settings' },
    desc:          { 'zh-CN': '配置各页面的搜索引擎优化元数据', 'en-US': 'Configure search engine metadata for each page' },
    siteTitle:     { 'zh-CN': '网站标题',    'en-US': 'Site Title' },
    siteDesc:      { 'zh-CN': '网站描述',    'en-US': 'Site Description' },
    pageGroupHome: { 'zh-CN': '主页 SEO',    'en-US': 'Home SEO' },
    pageGroupBlog: { 'zh-CN': '博客页 SEO',  'en-US': 'Blog Page SEO' },
    pageGroupNotes:{ 'zh-CN': '随笔页 SEO',  'en-US': 'Notes Page SEO' },
    pageGroupGallery: { 'zh-CN': '相册页 SEO', 'en-US': 'Gallery Page SEO' },
    pageTitle:     { 'zh-CN': '页面标题',    'en-US': 'Page Title' },
    pageDescZh:    { 'zh-CN': '页面描述（中文）', 'en-US': 'Page Description (Chinese)' },
    pageDescEn:    { 'zh-CN': '页面描述（英文）', 'en-US': 'Page Description (English)' },
    keywords:      { 'zh-CN': '关键词',      'en-US': 'Keywords' },
    keywordsZh:    { 'zh-CN': '关键词（中文，逗号分隔）', 'en-US': 'Keywords (Chinese, comma-separated)' },
    keywordsEn:    { 'zh-CN': '关键词（英文，逗号分隔）', 'en-US': 'Keywords (English, comma-separated)' },
    ogImage:       { 'zh-CN': 'OG 分享图片 URL', 'en-US': 'OG Image URL' },
    pageTitlePh:   { 'zh-CN': '留空则使用默认标题', 'en-US': 'Leave blank to use default title' },
    pageTitleZh:   { 'zh-CN': '页面标题（中文）', 'en-US': 'Page Title (Chinese)' },
    pageTitleEn:   { 'zh-CN': '页面标题（英文）', 'en-US': 'Page Title (English)' },
  },
  loadingPage: {
    heading:      { 'zh-CN': '加载页配置',   'en-US': 'Loading Screen' },
    enable:       { 'zh-CN': '启用加载页',   'en-US': 'Enable Loading Screen' },
    enableDesc:   { 'zh-CN': '首次访问时显示加载过渡画面', 'en-US': 'Show a loading screen on first visit' },
    titleLabel:   { 'zh-CN': '标题',         'en-US': 'Title' },
    subtitleLabel: { 'zh-CN': '副标题',      'en-US': 'Subtitle' },
    footer:       { 'zh-CN': '显示 Footer',  'en-US': 'Show Footer' },
    footerDesc:   { 'zh-CN': '在加载页底部展示版权信息和社交链接', 'en-US': 'Show copyright & social links at the bottom' },
    debug:        { 'zh-CN': 'Debug：30 秒预览模式', 'en-US': 'Debug: 30s Preview Mode' },
    debugDesc:    { 'zh-CN': '开启后加载页持续显示 30 秒（仅用于调试）', 'en-US': 'Keep loading screen visible for 30s (debug only)' },
    duration:     { 'zh-CN': '最短显示时长：', 'en-US': 'Min Duration: ' },
    instant:      { 'zh-CN': '0ms（即时）', 'en-US': '0ms (instant)' },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────

export default function ContentManagerPage() {
  const { locale } = useLocaleStore();
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('hero');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', slug: '', description: '', tags: '', repoUrl: '', demoUrl: '', content: '' });
  const [showNewProject, setShowNewProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editProject, setEditProject] = useState({ slug: '', title: '', description: '', tags: '', repoUrl: '', demoUrl: '', content: '' });

  const fetchProjects = useCallback(() => {
    fetch(`/api/content/projects?locale=${locale}`).then(r => r.json()).then(res => {
      if (res.code === 200) setProjects(res.data as ProjectMeta[]);
    });
  }, [locale]);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(res => { if (res.code === 200) setConfig(res.data as SiteConfig); });
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (!config) return <div className="text-center py-24" style={{ color: 'var(--color-text-muted)' }}>{i18n.loading['zh-CN']}</div>;

  const tx = (obj: Record<Locale, string>) => obj[locale];

  const saveConfig = async () => {
    setSaving(true);
    const res = await fetch('/api/config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    setSaving(false);
    if ((await res.json()).code === 200) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const addSkill = () => {
    const ns = { id: Date.now().toString(), name: tx(i18n.skills.newName), icon: '⚡', level: 80, category: tx(i18n.skills.newCat) };
    setConfig(p => p ? { ...p, content: { ...p.content, skills: [...p.content.skills, ns] } } : p);
  };

  const removeSkill = (id: string) => {
    setConfig(p => p ? { ...p, content: { ...p.content, skills: p.content.skills.filter(s => s.id !== id) } } : p);
  };

  const updateSkill = (id: string, key: string, value: string | number) => {
    setConfig(p => p ? { ...p, content: { ...p.content, skills: p.content.skills.map(s => s.id === id ? { ...s, [key]: value } : s) } } : p);
  };

  const saveProject = async () => {
    if (!newProject.slug || !newProject.title) return;
    await fetch('/api/content/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: newProject.slug, locale, content: newProject.content, meta: { title: newProject.title, description: newProject.description, tags: newProject.tags.split(',').map(t => t.trim()).filter(Boolean), repoUrl: newProject.repoUrl, demoUrl: newProject.demoUrl, cover: '', featured: false, order: projects.length + 1, createdAt: new Date().toISOString().split('T')[0] } }),
    });
    fetchProjects();
    setShowNewProject(false);
    setNewProject({ title: '', slug: '', description: '', tags: '', repoUrl: '', demoUrl: '', content: '' });
  };

  const deleteProject = async (slug: string) => {
    if (!confirm(tx(i18n.projects.confirmDel))) return;
    await fetch(`/api/content/projects/${slug}`, { method: 'DELETE' });
    fetchProjects();
  };

  const openEditProject = async (slug: string) => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/content/projects/${slug}?locale=${locale}`);
      const data = await res.json() as { code: number; data?: { slug: string; title: string; description?: string; tags?: string[]; repoUrl?: string; demoUrl?: string; content: string } };
      if (data.code !== 200 || !data.data) return;
      setEditProject({ slug: data.data.slug, title: data.data.title ?? '', description: data.data.description ?? '', tags: (data.data.tags ?? []).join(', '), repoUrl: data.data.repoUrl ?? '', demoUrl: data.data.demoUrl ?? '', content: data.data.content ?? '' });
      setShowEditProject(true);
    } finally { setEditLoading(false); }
  };

  const saveEditedProject = async () => {
    if (!editProject.slug || !editProject.title) return;
    setEditSaving(true);
    await fetch(`/api/content/projects/${editProject.slug}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale, content: editProject.content, meta: { title: editProject.title, description: editProject.description, tags: editProject.tags.split(',').map(t => t.trim()).filter(Boolean), repoUrl: editProject.repoUrl, demoUrl: editProject.demoUrl } }),
    });
    setEditSaving(false);
    setShowEditProject(false);
    fetchProjects();
  };

  const addFriend = () => {
    const nf: FriendLink = {
      id: Date.now().toString(),
      name: tx(i18n.friends.newName),
      url: 'https://',
      description: { 'zh-CN': '', 'en-US': '' },
    };
    setConfig(p => p ? { ...p, content: { ...p.content, friends: [...(p.content.friends ?? []), nf] } } : p);
  };

  const removeFriend = (id: string) => {
    setConfig(p => p ? { ...p, content: { ...p.content, friends: (p.content.friends ?? []).filter(f => f.id !== id) } } : p);
  };

  const updateFriend = (id: string, key: keyof FriendLink, value: string | { 'zh-CN': string; 'en-US': string }) => {
    setConfig(p => p ? {
      ...p,
      content: {
        ...p.content,
        friends: (p.content.friends ?? []).map(f => f.id === id ? { ...f, [key]: value } : f),
      },
    } : p);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'hero',         label: tx(i18n.tabs.hero) },
    { id: 'about',        label: tx(i18n.tabs.about) },
    { id: 'announcement', label: tx(i18n.tabs.announcement) },
    { id: 'skills',       label: tx(i18n.tabs.skills) },
    { id: 'friends',      label: tx(i18n.tabs.friends) },
    { id: 'contact',      label: tx(i18n.tabs.contact) },
    { id: 'projects',     label: tx(i18n.tabs.projects) },
    { id: 'loading',      label: tx(i18n.tabs.loading) },
    { id: 'seo',          label: tx(i18n.seo.tab) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {activeTab !== 'projects' && (
            <Button size="sm" loading={saving} onClick={saveConfig}>
              <Save className="w-4 h-4" />
              {saved ? tx(i18n.saved) : tx(i18n.save)}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--color-surface-alt)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={clsx('flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200', activeTab === tab.id ? 'text-white shadow-md' : '')}
            style={{ background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.99 }} transition={{ duration: 0.2 }}>

          {/* Hero */}
          {activeTab === 'hero' && (
            <GlassCard>
              <h3 className="font-semibold mb-5">{tx(i18n.hero.heading)}{locale}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label={tx(i18n.hero.title)}    value={config.content.hero[locale].title}       onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, [locale]: { ...p.content.hero[locale], title: e.target.value } } } } : p)} />
                <Input label={tx(i18n.hero.subtitle)} value={config.content.hero[locale].subtitle}    onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, [locale]: { ...p.content.hero[locale], subtitle: e.target.value } } } } : p)} />
                <Input label={tx(i18n.hero.desc)}     value={config.content.hero[locale].description} onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, [locale]: { ...p.content.hero[locale], description: e.target.value } } } } : p)} />
                <Input label={tx(i18n.hero.cta)}      value={config.content.hero[locale].cta}         onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, [locale]: { ...p.content.hero[locale], cta: e.target.value } } } } : p)} />
                <Input label={tx(i18n.hero.ctaHref)}  value={config.content.hero[locale].ctaHref}     onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, [locale]: { ...p.content.hero[locale], ctaHref: e.target.value } } } } : p)} />
                <Input label={tx(i18n.hero.avatar)}   value={config.content.hero.avatar}              onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, hero: { ...p.content.hero, avatar: e.target.value } } } : p)} placeholder="/api/static/avatar.png" />
              </div>
            </GlassCard>
          )}

          {/* About */}
          {activeTab === 'about' && (
            <GlassCard>
              <h3 className="font-semibold mb-5">{tx(i18n.about.heading)}{locale} {tx(i18n.about.mdNote)}</h3>
              <Textarea label={tx(i18n.about.label)} value={config.content.about[locale]} onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, about: { ...p.content.about, [locale]: e.target.value } } } : p)} className="min-h-[300px] font-mono text-sm" placeholder={tx(i18n.about.placeholder)} />
            </GlassCard>
          )}

          {/* Announcement */}
          {activeTab === 'announcement' && (
            <GlassCard>
              <h3 className="font-semibold mb-5">{tx(i18n.announcement.heading)}{locale} {tx(i18n.announcement.mdNote)}</h3>
              <div className="space-y-4">
                <Textarea label={tx(i18n.announcement.label)} value={config.content.announcement[locale]} onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, announcement: { ...p.content.announcement, [locale]: e.target.value } } } : p)} className="min-h-[220px] font-mono text-sm" placeholder={tx(i18n.announcement.placeholder)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <ColorPicker label={tx(i18n.announcement.nightBg)} value={config.content.announcementStyle?.nightBg ?? 'rgba(23,23,23,0.92)'} onChange={v => setConfig(p => p ? { ...p, content: { ...p.content, announcementStyle: { ...(p.content.announcementStyle ?? {}), nightBg: v } } } : p)} />
                  <ColorPicker label={tx(i18n.announcement.dayBg)}   value={config.content.announcementStyle?.dayBg  ?? 'rgba(255,255,255,0.96)'} onChange={v => setConfig(p => p ? { ...p, content: { ...p.content, announcementStyle: { ...(p.content.announcementStyle ?? {}), dayBg: v } } } : p)} />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Skills */}
          {activeTab === 'skills' && (
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">{tx(i18n.skills.heading)}</h3>
                <Button variant="ghost" size="sm" onClick={addSkill}><Plus className="w-4 h-4" /> {tx(i18n.skills.add)}</Button>
              </div>
              <div className="space-y-3">
                {config.content.skills.map(skill => (
                  <div key={skill.id} className="space-y-3 p-3 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <input value={skill.icon}     onChange={e => updateSkill(skill.id, 'icon', e.target.value)}                   className="input text-center col-span-2 sm:col-span-1" placeholder={tx(i18n.skills.iconPh)} />
                      <input value={skill.name}     onChange={e => updateSkill(skill.id, 'name', e.target.value)}                   className="input col-span-5 sm:col-span-4" placeholder={tx(i18n.skills.namePh)} />
                      <input value={skill.category} onChange={e => updateSkill(skill.id, 'category', e.target.value)}               className="input col-span-5 sm:col-span-2" placeholder={tx(i18n.skills.catPh)} />
                      <div className="flex items-center gap-2 col-span-10 sm:col-span-4">
                        <input type="range" min={0} max={100} value={skill.level} onChange={e => updateSkill(skill.id, 'level', parseInt(e.target.value))} className="range-light flex-1" />
                        <span className="text-xs w-8 text-right font-mono" style={{ color: 'var(--color-primary)' }}>{skill.level}</span>
                      </div>
                      <button onClick={() => removeSkill(skill.id)} className="flex items-center justify-center hover:text-error transition-colors col-span-2 sm:col-span-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.skills.colorHint)}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Friends */}
          {activeTab === 'friends' && (
            <GlassCard>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold">{tx(i18n.friends.heading)}</h3>
                <Button variant="ghost" size="sm" onClick={addFriend}><Plus className="w-4 h-4" /> {tx(i18n.friends.add)}</Button>
              </div>
              {(config.content.friends ?? []).length === 0 ? (
                <p className="text-center py-6 text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.friends.emptyHint)}</p>
              ) : (
                <div className="space-y-4">
                  {(config.content.friends ?? []).map(friend => (
                    <div key={friend.id} className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-alt)' }}>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                          label={locale === 'zh-CN' ? '站点名称' : 'Site Name'}
                          value={friend.name}
                          onChange={e => updateFriend(friend.id, 'name', e.target.value)}
                          placeholder={tx(i18n.friends.namePh)}
                        />
                        <Input
                          label="URL"
                          value={friend.url}
                          onChange={e => updateFriend(friend.id, 'url', e.target.value)}
                          placeholder={tx(i18n.friends.urlPh)}
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <Input
                          label={locale === 'zh-CN' ? '简介（中文）' : 'Description (Chinese)'}
                          value={friend.description?.['zh-CN'] ?? ''}
                          onChange={e => updateFriend(friend.id, 'description', { ...friend.description, 'zh-CN': e.target.value })}
                          placeholder={tx(i18n.friends.descZhPh)}
                        />
                        <Input
                          label={locale === 'zh-CN' ? '简介（英文）' : 'Description (English)'}
                          value={friend.description?.['en-US'] ?? ''}
                          onChange={e => updateFriend(friend.id, 'description', { ...friend.description, 'en-US': e.target.value })}
                          placeholder={tx(i18n.friends.descEnPh)}
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => removeFriend(friend.id)}
                          className="flex items-center gap-1.5 text-xs hover:text-error transition-colors px-3 py-1.5 rounded-lg hover:bg-error/10"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {locale === 'zh-CN' ? '删除' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <GlassCard>
              <h3 className="font-semibold mb-5">{tx(i18n.contact.heading)}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {(Object.entries(i18n.contact.fields) as [string, { label: string; ph: Record<Locale, string> }][]).map(([field, { label, ph }]) => (
                  <Input key={field} label={label}
                    value={(config.content.contact as unknown as Record<string, string>)[field] ?? ''}
                    onChange={e => setConfig(p => p ? { ...p, content: { ...p.content, contact: { ...p.content.contact, [field]: e.target.value } } } : p)}
                    placeholder={ph[locale]} />
                ))}
              </div>
            </GlassCard>
          )}

          {/* Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowNewProject(true)}><Plus className="w-4 h-4" /> {tx(i18n.projects.new)}</Button>
              </div>
              {projects.length === 0 ? (
                <GlassCard><p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.projects.empty)}</p></GlassCard>
              ) : (
                <div className="space-y-3">
                  {projects.map(p => (
                    <GlassCard key={p.slug} padding="sm">
                      <div className="flex items-center gap-4 p-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{p.title}</p>
                          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>{p.description}</p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {p.tags.map(t => <span key={t} className="badge text-xs">{t}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" loading={editLoading} onClick={() => openEditProject(p.slug)}><Edit3 className="w-4 h-4" /></Button>
                          <Button variant="danger" size="icon" onClick={() => deleteProject(p.slug)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Loading Screen */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Site-level meta */}
              <GlassCard>
                <h3 className="font-semibold mb-1">{tx(i18n.seo.heading)}</h3>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.seo.desc)}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={`${tx(i18n.seo.siteTitle)} (${locale})`} value={config.meta[locale]?.title ?? ''} onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, [locale]: { ...p.meta[locale], title: e.target.value } } } : p)} />
                  <Input label={`${tx(i18n.seo.siteDesc)} (${locale})`} value={config.meta[locale]?.description ?? ''} onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, [locale]: { ...p.meta[locale], description: e.target.value } } } : p)} />
                </div>
              </GlassCard>

              {/* Page-level SEO */}
              {([
                { key: 'home',      label: tx(i18n.seo.pageGroupHome) },
                { key: 'blog',      label: tx(i18n.seo.pageGroupBlog) },
                { key: 'blogNotes', label: tx(i18n.seo.pageGroupNotes) },
                { key: 'gallery',   label: tx(i18n.seo.pageGroupGallery) },
              ] as { key: 'home' | 'blog' | 'blogNotes' | 'gallery'; label: string }[]).map(({ key, label }) => {
                const pageSeo = config.meta.pageSeo?.[key] ?? {};
                const pageTitleKey = key === 'home' ? 'home' : key === 'blog' ? 'blog' : key === 'blogNotes' ? 'blogNotes' : 'gallery';
                const pageTitle = config.meta.pageTitles?.[pageTitleKey] ?? { 'zh-CN': '', 'en-US': '' };
                return (
                  <GlassCard key={key}>
                    <h3 className="font-semibold mb-5">{label}</h3>
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label={tx(i18n.seo.pageTitleZh)} value={pageTitle['zh-CN']} placeholder={tx(i18n.seo.pageTitlePh)}
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageTitles: { ...p.meta.pageTitles!, [pageTitleKey]: { ...pageTitle, 'zh-CN': e.target.value } } } } : p)} />
                        <Input label={tx(i18n.seo.pageTitleEn)} value={pageTitle['en-US']} placeholder={tx(i18n.seo.pageTitlePh)}
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageTitles: { ...p.meta.pageTitles!, [pageTitleKey]: { ...pageTitle, 'en-US': e.target.value } } } } : p)} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label={tx(i18n.seo.pageDescZh)} value={pageSeo.description?.['zh-CN'] ?? ''} placeholder="..."
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageSeo: { ...p.meta.pageSeo, [key]: { ...pageSeo, description: { 'zh-CN': e.target.value, 'en-US': pageSeo.description?.['en-US'] ?? '' } } } } } : p)} />
                        <Input label={tx(i18n.seo.pageDescEn)} value={pageSeo.description?.['en-US'] ?? ''} placeholder="..."
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageSeo: { ...p.meta.pageSeo, [key]: { ...pageSeo, description: { 'zh-CN': pageSeo.description?.['zh-CN'] ?? '', 'en-US': e.target.value } } } } } : p)} />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label={tx(i18n.seo.keywordsZh)} value={pageSeo.keywords?.['zh-CN'] ?? ''} placeholder="关键词1, 关键词2"
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageSeo: { ...p.meta.pageSeo, [key]: { ...pageSeo, keywords: { 'zh-CN': e.target.value, 'en-US': pageSeo.keywords?.['en-US'] ?? '' } } } } } : p)} />
                        <Input label={tx(i18n.seo.keywordsEn)} value={pageSeo.keywords?.['en-US'] ?? ''} placeholder="keyword1, keyword2"
                          onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageSeo: { ...p.meta.pageSeo, [key]: { ...pageSeo, keywords: { 'zh-CN': pageSeo.keywords?.['zh-CN'] ?? '', 'en-US': e.target.value } } } } } : p)} />
                      </div>
                      <Input label={tx(i18n.seo.ogImage)} value={pageSeo.ogImage ?? ''} placeholder="https://..."
                        onChange={e => setConfig(p => p ? { ...p, meta: { ...p.meta, pageSeo: { ...p.meta.pageSeo, [key]: { ...pageSeo, ogImage: e.target.value } } } } : p)} />
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}

          {activeTab === 'loading' && config.loadingScreen && (
            <GlassCard>
              <h3 className="font-semibold mb-5">{tx(i18n.loadingPage.heading)}</h3>
              <div className="space-y-5">
                <Toggle label={tx(i18n.loadingPage.enable)} description={tx(i18n.loadingPage.enableDesc)} checked={config.loadingScreen.enabled} onChange={v => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, enabled: v } } : p)} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={`${tx(i18n.loadingPage.titleLabel)} (${locale})`}    value={config.loadingScreen.title[locale]}    onChange={e => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, title:    { ...p.loadingScreen.title,    [locale]: e.target.value } } } : p)} placeholder="Onia" />
                  <Input label={`${tx(i18n.loadingPage.subtitleLabel)} (${locale})`} value={config.loadingScreen.subtitle[locale]} onChange={e => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, subtitle: { ...p.loadingScreen.subtitle, [locale]: e.target.value } } } : p)} placeholder={locale === 'zh-CN' ? '正在加载...' : 'Loading...'} />
                </div>
                <Toggle label={tx(i18n.loadingPage.footer)} description={tx(i18n.loadingPage.footerDesc)} checked={config.loadingScreen.showFooter} onChange={v => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, showFooter: v } } : p)} />
                <Toggle label={tx(i18n.loadingPage.debug)} description={tx(i18n.loadingPage.debugDesc)} checked={config.loadingScreen.debugLock} onChange={v => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, debugLock: v } } : p)} />
                <div>
                  <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--color-text)' }}>
                    {tx(i18n.loadingPage.duration)}{config.loadingScreen.minDuration}ms
                  </label>
                  <input type="range" min={0} max={5000} step={100} value={config.loadingScreen.minDuration} onChange={e => setConfig(p => p ? { ...p, loadingScreen: { ...p.loadingScreen, minDuration: parseInt(e.target.value) } } : p)} className="range-light w-full" />
                  <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    <span>{tx(i18n.loadingPage.instant)}</span><span>5000ms</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

        </motion.div>
      </AnimatePresence>

      {/* New project modal */}
      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title={tx(i18n.projects.modalNew)} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowNewProject(false)}>{tx(i18n.projects.cancel)}</Button><Button onClick={saveProject}>{tx(i18n.projects.create)}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={tx(i18n.projects.name)} value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))} />
            <Input label={tx(i18n.projects.slug)} value={newProject.slug} onChange={e => setNewProject(p => ({ ...p, slug: e.target.value }))} />
          </div>
          <Input label={tx(i18n.projects.desc)} value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} />
          <Input label={tx(i18n.projects.tags)} value={newProject.tags} onChange={e => setNewProject(p => ({ ...p, tags: e.target.value }))} placeholder="React, TypeScript, Node.js" />
          <div className="grid grid-cols-2 gap-4">
            <Input label={tx(i18n.projects.repo)} value={newProject.repoUrl} onChange={e => setNewProject(p => ({ ...p, repoUrl: e.target.value }))} />
            <Input label={tx(i18n.projects.demo)} value={newProject.demoUrl} onChange={e => setNewProject(p => ({ ...p, demoUrl: e.target.value }))} />
          </div>
          <Textarea label={tx(i18n.projects.content)} value={newProject.content} onChange={e => setNewProject(p => ({ ...p, content: e.target.value }))} className="min-h-[160px] font-mono text-sm" placeholder="# ..." />
        </div>
      </Modal>

      {/* Edit project modal */}
      <Modal open={showEditProject} onClose={() => setShowEditProject(false)} title={`${tx(i18n.projects.modalEdit)} (${locale})`} size="lg"
        footer={<><Button variant="ghost" onClick={() => setShowEditProject(false)}>{tx(i18n.projects.cancel)}</Button><Button loading={editSaving} onClick={saveEditedProject}>{tx(i18n.projects.saveEdit)}</Button></>}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={tx(i18n.projects.name)} value={editProject.title} onChange={e => setEditProject(p => ({ ...p, title: e.target.value }))} />
            <Input label={tx(i18n.projects.slug)} value={editProject.slug} disabled />
          </div>
          <Input label={tx(i18n.projects.desc)} value={editProject.description} onChange={e => setEditProject(p => ({ ...p, description: e.target.value }))} />
          <Input label={tx(i18n.projects.tags)} value={editProject.tags} onChange={e => setEditProject(p => ({ ...p, tags: e.target.value }))} placeholder="React, TypeScript, Node.js" />
          <div className="grid grid-cols-2 gap-4">
            <Input label={tx(i18n.projects.repo)} value={editProject.repoUrl} onChange={e => setEditProject(p => ({ ...p, repoUrl: e.target.value }))} />
            <Input label={tx(i18n.projects.demo)} value={editProject.demoUrl} onChange={e => setEditProject(p => ({ ...p, demoUrl: e.target.value }))} />
          </div>
          <Textarea label={tx(i18n.projects.content)} value={editProject.content} onChange={e => setEditProject(p => ({ ...p, content: e.target.value }))} className="min-h-[200px] font-mono text-sm" placeholder="# ..." />
        </div>
      </Modal>
    </div>
  );
}
