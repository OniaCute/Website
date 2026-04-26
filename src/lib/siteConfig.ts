import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import type { SiteConfig } from '@/types';
import { atomicWriteJson, readJson } from './fsAtomic';

const SITE_CONFIG_PATH = path.join(process.cwd(), 'data', 'site-config.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

export const defaultSiteConfig: SiteConfig = {
  version: 1,
  meta: {
    'zh-CN': { siteName: 'Onia', title: 'Onia - 个人网站', description: '欢迎来到我的个人网站' },
    'en-US': { siteName: 'Onia', title: 'Onia - Personal Site', description: 'Welcome to my personal website' },
    pageTitles: {
      home: { 'zh-CN': '首页 - Onia', 'en-US': 'Home - Onia' },
      projects: { 'zh-CN': '项目 - Onia', 'en-US': 'Projects - Onia' },
      projectDetail: { 'zh-CN': '项目详情 - Onia', 'en-US': 'Project Detail - Onia' },
      admin: { 'zh-CN': '控制面板 - Onia', 'en-US': 'Dashboard - Onia' },
      login: { 'zh-CN': '登录 - Onia', 'en-US': 'Login - Onia' },
      setup: { 'zh-CN': '初始化 - Onia', 'en-US': 'Setup - Onia' },
      blog: { 'zh-CN': '博客 - Onia', 'en-US': 'Blog - Onia' },
      blogArticle: { 'zh-CN': '文章 - Onia', 'en-US': 'Article - Onia' },
      blogNotes: { 'zh-CN': '随笔 - Onia', 'en-US': 'Notes - Onia' },
      gallery: { 'zh-CN': '相册 - Onia', 'en-US': 'Gallery - Onia' },
    },
    favicon: '/images/default-favicon.png',
    defaultLocale: 'zh-CN',
    availableLocales: ['zh-CN', 'en-US'],
  },
  theme: {
    defaultMode: 'night',
    allowUserSwitch: true,
    night: {
      colors: {
        primary: '#60a5fa',
        background: '#000000',
        surface: '#171717',
        surfaceAlt: '#262626',
        text: '#f8fafc',
        textMuted: '#94a3b8',
        accent: '#38bdf8',
        border: 'rgba(96,165,250,0.2)',
        error: '#f87171',
        success: '#34d399',
        glassColor: '#ffffff',
      },
      glass: { opacity: 0.08, blur: 16 },
      skills: {
        cardColor: '#60a5fa',
        cardOpacity: 0.16,
        progressColor: '#60a5fa',
      },
    },
    day: {
      colors: {
        primary: '#f472b6',
        background: '#ffffff',
        surface: '#ffffff',
        surfaceAlt: '#fdf2f8',
        text: '#18181b',
        textMuted: '#71717a',
        accent: '#fb7185',
        border: 'rgba(244,114,182,0.15)',
        error: '#ef4444',
        success: '#10b981',
        glassColor: '#ffffff',
      },
      glass: { opacity: 0.6, blur: 12 },
      skills: {
        cardColor: '#f472b6',
        cardOpacity: 0.12,
        progressColor: '#f472b6',
      },
    },
    fonts: {
      heading: { family: 'system-ui', secondaryFamily: '', source: 'system' },
      body: { family: 'system-ui', secondaryFamily: '', source: 'system' },
      mono: { family: 'ui-monospace', secondaryFamily: '', source: 'system' },
    },
  },
  layout: {
    header: {
      visible: true,
      sticky: true,
      brandTitle: { 'zh-CN': 'Onia', 'en-US': 'Onia' },
      items: [
        { id: 'about', label: { 'zh-CN': '关于', 'en-US': 'About' }, href: '#about' },
        { id: 'projects', label: { 'zh-CN': '项目', 'en-US': 'Projects' }, href: '#projects' },
        { id: 'skills', label: { 'zh-CN': '技能', 'en-US': 'Skills' }, href: '#skills' },
        { id: 'contact', label: { 'zh-CN': '联系', 'en-US': 'Contact' }, href: '#contact' },
        { id: 'blog', label: { 'zh-CN': '博客', 'en-US': 'Blog' }, href: '/blog' },
        { id: 'gallery', label: { 'zh-CN': '相册', 'en-US': 'Gallery' }, href: '/gallery' },
      ],
    },
    footer: {
      visible: true,
      copyright: { 'zh-CN': '© 2026 Onia. 保留所有权利。', 'en-US': '© 2026 Onia. All rights reserved.' },
      socialLinks: [],
    },
    sections: [
      { id: 'hero', enabled: true, order: 1 },
      { id: 'about', enabled: true, order: 2 },
      { id: 'projects', enabled: true, order: 3 },
      { id: 'skills', enabled: true, order: 4 },
      { id: 'contact', enabled: true, order: 5 },
      { id: 'friends', enabled: true, order: 6 },
    ],
  },
  features: {
    rightClick: { default: 'disabled', routes: { '/admin': 'allowed', '/login': 'allowed', '/setup': 'allowed' } },
    devtools: { enabled: false, default: 'allowed', routes: {} },
    textSelection: { default: 'allowed' },
    copyShortcut: { default: 'allowed' },
    animations: true,
    particles: false,
    smoothScroll: true,
  },
  loadingScreen: {
    enabled: true,
    title: { 'zh-CN': 'Onia', 'en-US': 'Onia' },
    subtitle: { 'zh-CN': '正在加载...', 'en-US': 'Loading...' },
    showFooter: true,
    minDuration: 800,
    debugLock: false,
  },
  content: {
    hero: {
      'zh-CN': { title: 'Hi, 我是 Onia', subtitle: '全栈开发者 & 设计爱好者', description: '热爱构建优雅的产品', cta: '查看我的作品', ctaHref: '#projects' },
      'en-US': { title: "Hi, I'm Onia", subtitle: 'Full-Stack Developer & Design Enthusiast', description: 'Passionate about building elegant products', cta: 'View my work', ctaHref: '#projects' },
      avatar: '',
      background: '',
    },
    about: {
      'zh-CN': '这里是关于我的介绍内容。',
      'en-US': 'This is my about section content.',
    },
    announcement: {
      'zh-CN': '',
      'en-US': '',
    },
    announcementStyle: {
      nightBg: 'rgba(23,23,23,0.92)',
      dayBg: 'rgba(255,255,255,0.96)',
    },
    skills: [],
    friends: [],
    contact: {
      email: '',
      github: '',
      twitter: '',
      linkedin: '',
      wechat: '',
      discord: '',
      telegram: '',
      steam: '',
      bilibili: '',
      qq: '',
      youtube: '',
      instagram: '',
    },
  },
};

const ColorSchema = z.string().regex(/^(#[0-9a-fA-F]{3,8}|rgba?\(.+\))$/);
const FontSourceSchema = z.enum(['google', 'local', 'system']);
const LocaleSchema = z.enum(['zh-CN', 'en-US']);

export const SiteConfigSchema = z.object({
  version: z.number(),
  meta: z.object({
    'zh-CN': z.object({ siteName: z.string().min(1), title: z.string().min(1), description: z.string() }),
    'en-US': z.object({ siteName: z.string().min(1), title: z.string().min(1), description: z.string() }),
    pageTitles: z.object({
      home: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      projects: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      projectDetail: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      admin: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      login: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      setup: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      blog: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(),
      blogArticle: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(),
      blogNotes: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(),
      gallery: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(),
    }).optional(),
    pageSeo: z.object({
      home:      z.object({ description: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(), ogImage: z.string().optional(), keywords: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional() }).optional(),
      blog:      z.object({ description: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(), ogImage: z.string().optional(), keywords: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional() }).optional(),
      blogNotes: z.object({ description: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(), ogImage: z.string().optional(), keywords: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional() }).optional(),
      gallery:   z.object({ description: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(), ogImage: z.string().optional(), keywords: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional() }).optional(),
    }).optional(),
    favicon: z.string(),
    defaultLocale: LocaleSchema,
    availableLocales: z.array(LocaleSchema).min(1),
  }),
  theme: z.object({
    defaultMode: z.enum(['night', 'day']),
    allowUserSwitch: z.boolean(),
    night: z.object({
      colors: z.object({
        primary: ColorSchema, background: ColorSchema, surface: ColorSchema, surfaceAlt: ColorSchema,
        text: ColorSchema, textMuted: z.string(), accent: ColorSchema, border: z.string(),
        error: ColorSchema, success: ColorSchema, glassColor: ColorSchema.optional(),
      }),
      glass: z.object({ opacity: z.number().min(0).max(1), blur: z.number().min(0).max(64) }),
      skills: z.object({
        cardColor: ColorSchema,
        cardOpacity: z.number().min(0).max(1),
        progressColor: ColorSchema,
      }),
    }),
    day: z.object({
      colors: z.object({
        primary: ColorSchema, background: ColorSchema, surface: ColorSchema, surfaceAlt: ColorSchema,
        text: ColorSchema, textMuted: z.string(), accent: ColorSchema, border: z.string(),
        error: ColorSchema, success: ColorSchema, glassColor: ColorSchema.optional(),
      }),
      glass: z.object({ opacity: z.number().min(0).max(1), blur: z.number().min(0).max(64) }),
      skills: z.object({
        cardColor: ColorSchema,
        cardOpacity: z.number().min(0).max(1),
        progressColor: ColorSchema,
      }),
    }),
    fonts: z.object({
      heading: z.object({ family: z.string(), secondaryFamily: z.string().optional(), source: FontSourceSchema, url: z.string().optional(), weights: z.array(z.number()).optional() }),
      body: z.object({ family: z.string(), secondaryFamily: z.string().optional(), source: FontSourceSchema, url: z.string().optional(), weights: z.array(z.number()).optional() }),
      mono: z.object({ family: z.string(), secondaryFamily: z.string().optional(), source: FontSourceSchema, url: z.string().optional(), weights: z.array(z.number()).optional() }),
    }),
  }),
  layout: z.object({
    header: z.object({
      visible: z.boolean(), sticky: z.boolean(),
      brandTitle: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }).optional(),
      items: z.array(z.object({ id: z.string(), label: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }), href: z.string(), external: z.boolean().optional(), visible: z.boolean().optional() })),
    }),
    footer: z.object({
      visible: z.boolean(),
      copyright: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
      socialLinks: z.array(z.object({ platform: z.string(), url: z.string(), icon: z.string() })),
    }),
    sections: z.array(z.object({ id: z.string(), enabled: z.boolean(), order: z.number() })),
  }),
  loadingScreen: z.object({
    enabled: z.boolean(),
    title: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
    subtitle: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
    showFooter: z.boolean(),
    minDuration: z.number().min(0).max(5000),
    debugLock: z.boolean(),
  }),
  features: z.object({
    rightClick: z.object({ default: z.enum(['disabled', 'allowed']), routes: z.record(z.string(), z.enum(['disabled', 'allowed'])) }),
    devtools: z.object({ enabled: z.boolean(), default: z.enum(['disabled', 'allowed']), routes: z.record(z.string(), z.enum(['disabled', 'allowed'])) }),
    textSelection: z.object({ default: z.enum(['disabled', 'allowed']) }),
    copyShortcut: z.object({ default: z.enum(['disabled', 'allowed']) }),
    animations: z.boolean(), particles: z.boolean(), smoothScroll: z.boolean(),
  }),
  content: z.object({
    hero: z.object({
      'zh-CN': z.object({ title: z.string(), subtitle: z.string(), description: z.string(), cta: z.string(), ctaHref: z.string() }),
      'en-US': z.object({ title: z.string(), subtitle: z.string(), description: z.string(), cta: z.string(), ctaHref: z.string() }),
      avatar: z.string(), background: z.string(),
    }),
    about: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
    announcement: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
    announcementStyle: z.object({ nightBg: z.string().optional(), dayBg: z.string().optional() }).optional(),
    skills: z.array(z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string(),
      level: z.number().min(0).max(100),
      category: z.string(),
    })),
    friends: z.array(z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      description: z.object({ 'zh-CN': z.string(), 'en-US': z.string() }),
    })).optional(),
    contact: z.object({
      email: z.string().optional(),
      github: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      wechat: z.string().optional(),
      discord: z.string().optional(),
      telegram: z.string().optional(),
      steam: z.string().optional(),
      bilibili: z.string().optional(),
      qq: z.string().optional(),
      youtube: z.string().optional(),
      instagram: z.string().optional(),
    }),
  }),
});

export function getSiteConfig(): SiteConfig {
  const stored = readJson<SiteConfig>(SITE_CONFIG_PATH);
  if (!stored) return defaultSiteConfig;
  const defaultPageTitles = defaultSiteConfig.meta.pageTitles ?? {
    home: { 'zh-CN': '', 'en-US': '' },
    projects: { 'zh-CN': '', 'en-US': '' },
    projectDetail: { 'zh-CN': '', 'en-US': '' },
    admin: { 'zh-CN': '', 'en-US': '' },
    login: { 'zh-CN': '', 'en-US': '' },
    setup: { 'zh-CN': '', 'en-US': '' },
    blog: { 'zh-CN': '', 'en-US': '' },
    blogArticle: { 'zh-CN': '', 'en-US': '' },
    blogNotes: { 'zh-CN': '', 'en-US': '' },
    gallery: { 'zh-CN': '', 'en-US': '' },
  };
  const defaultBrandTitle = defaultSiteConfig.layout.header.brandTitle ?? {
    'zh-CN': defaultSiteConfig.meta['zh-CN'].siteName,
    'en-US': defaultSiteConfig.meta['en-US'].siteName,
  };
  return {
    ...defaultSiteConfig,
    ...stored,
    loadingScreen: {
      ...defaultSiteConfig.loadingScreen,
      ...stored.loadingScreen,
      title: { ...defaultSiteConfig.loadingScreen.title, ...stored.loadingScreen?.title },
      subtitle: { ...defaultSiteConfig.loadingScreen.subtitle, ...stored.loadingScreen?.subtitle },
    },
    meta: {
      ...defaultSiteConfig.meta,
      ...stored.meta,
      'zh-CN': { ...defaultSiteConfig.meta['zh-CN'], ...stored.meta?.['zh-CN'] },
      'en-US': { ...defaultSiteConfig.meta['en-US'], ...stored.meta?.['en-US'] },
      pageTitles: {
        ...defaultPageTitles,
        ...stored.meta?.pageTitles,
        home: { ...defaultPageTitles.home, ...stored.meta?.pageTitles?.home },
        projects: { ...defaultPageTitles.projects, ...stored.meta?.pageTitles?.projects },
        projectDetail: { ...defaultPageTitles.projectDetail, ...stored.meta?.pageTitles?.projectDetail },
        admin: { ...defaultPageTitles.admin, ...stored.meta?.pageTitles?.admin },
        login: { ...defaultPageTitles.login, ...stored.meta?.pageTitles?.login },
        setup: { ...defaultPageTitles.setup, ...stored.meta?.pageTitles?.setup },
        blog: { ...(defaultPageTitles.blog ?? { 'zh-CN': '', 'en-US': '' }), ...stored.meta?.pageTitles?.blog },
        blogArticle: { ...(defaultPageTitles.blogArticle ?? { 'zh-CN': '', 'en-US': '' }), ...stored.meta?.pageTitles?.blogArticle },
        blogNotes: { ...(defaultPageTitles.blogNotes ?? { 'zh-CN': '', 'en-US': '' }), ...stored.meta?.pageTitles?.blogNotes },
        gallery: { ...(defaultPageTitles.gallery ?? { 'zh-CN': '', 'en-US': '' }), ...stored.meta?.pageTitles?.gallery },
      },
      pageSeo: {
        ...stored.meta?.pageSeo,
      },
    },
    theme: {
      ...defaultSiteConfig.theme,
      ...stored.theme,
      night: {
        ...defaultSiteConfig.theme.night,
        ...stored.theme?.night,
        colors: {
          ...defaultSiteConfig.theme.night.colors,
          ...stored.theme?.night?.colors,
        },
        skills: {
          ...defaultSiteConfig.theme.night.skills,
          ...stored.theme?.night?.skills,
        },
      },
      day: {
        ...defaultSiteConfig.theme.day,
        ...stored.theme?.day,
        colors: {
          ...defaultSiteConfig.theme.day.colors,
          ...stored.theme?.day?.colors,
        },
        skills: {
          ...defaultSiteConfig.theme.day.skills,
          ...stored.theme?.day?.skills,
        },
      },
      fonts: {
        heading: { ...defaultSiteConfig.theme.fonts.heading, ...stored.theme?.fonts?.heading },
        body: { ...defaultSiteConfig.theme.fonts.body, ...stored.theme?.fonts?.body },
        mono: { ...defaultSiteConfig.theme.fonts.mono, ...stored.theme?.fonts?.mono },
      },
    },
    layout: {
      ...defaultSiteConfig.layout,
      ...stored.layout,
      header: {
        ...defaultSiteConfig.layout.header,
        ...stored.layout?.header,
        brandTitle: {
          ...defaultBrandTitle,
          ...stored.layout?.header?.brandTitle,
        },
      },
      footer: {
        ...defaultSiteConfig.layout.footer,
        ...stored.layout?.footer,
      },
      sections: (() => {
        const storedSections = stored.layout?.sections ?? [];
        const defaultSections = defaultSiteConfig.layout.sections;
        if (storedSections.length === 0) return defaultSections;
        // 补全缺失的 section（向后兼容，新增 section 不丢失）
        const existingIds = new Set(storedSections.map(s => s.id));
        const missing = defaultSections.filter(s => !existingIds.has(s.id)).map((s, i) => ({
          ...s,
          order: storedSections.length + i + 1,
        }));
        return [...storedSections, ...missing];
      })(),
    },
    features: {
      ...defaultSiteConfig.features,
      ...stored.features,
      rightClick: {
        ...defaultSiteConfig.features.rightClick,
        ...stored.features?.rightClick,
        routes: {
          ...defaultSiteConfig.features.rightClick.routes,
          ...stored.features?.rightClick?.routes,
        },
      },
      devtools: {
        ...defaultSiteConfig.features.devtools,
        ...stored.features?.devtools,
        routes: {
          ...defaultSiteConfig.features.devtools.routes,
          ...stored.features?.devtools?.routes,
        },
      },
      textSelection: {
        ...defaultSiteConfig.features.textSelection,
        ...stored.features?.textSelection,
      },
    },
    content: {
      ...defaultSiteConfig.content,
      ...stored.content,
      hero: {
        ...defaultSiteConfig.content.hero,
        ...stored.content?.hero,
        'zh-CN': { ...defaultSiteConfig.content.hero['zh-CN'], ...stored.content?.hero?.['zh-CN'] },
        'en-US': { ...defaultSiteConfig.content.hero['en-US'], ...stored.content?.hero?.['en-US'] },
      },
      about: {
        ...defaultSiteConfig.content.about,
        ...stored.content?.about,
      },
      announcement: {
        ...defaultSiteConfig.content.announcement,
        ...stored.content?.announcement,
      },
      announcementStyle: {
        ...defaultSiteConfig.content.announcementStyle,
        ...stored.content?.announcementStyle,
      },
      skills: stored.content?.skills ?? defaultSiteConfig.content.skills,
      friends: stored.content?.friends ?? defaultSiteConfig.content.friends ?? [],
      contact: {
        ...defaultSiteConfig.content.contact,
        ...stored.content?.contact,
      },
    },
  };
}

export function saveSiteConfig(config: SiteConfig): void {
  backupSiteConfig();
  atomicWriteJson(SITE_CONFIG_PATH, config);
}

export function validateSiteConfig(data: unknown): { success: true; data: SiteConfig } | { success: false; error: string } {
  const result = SiteConfigSchema.safeParse(data);
  if (result.success) return { success: true, data: result.data as SiteConfig };
  const err = result.error;
  const msg = typeof err === 'object' && err !== null && 'message' in err
    ? String((err as { message: string }).message)
    : JSON.stringify(err);
  return { success: false, error: msg };
}

function backupSiteConfig(): void {
  if (!fs.existsSync(SITE_CONFIG_PATH)) return;
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(BACKUP_DIR, `site-config-${timestamp}.json`);
  fs.copyFileSync(SITE_CONFIG_PATH, dest);
  pruneBackups();
}

function pruneBackups(keep = 10): void {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('site-config-'))
    .sort()
    .reverse();
  files.slice(keep).forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
}

export function initSiteConfig(): void {
  if (!fs.existsSync(SITE_CONFIG_PATH)) {
    atomicWriteJson(SITE_CONFIG_PATH, defaultSiteConfig);
  }
}
