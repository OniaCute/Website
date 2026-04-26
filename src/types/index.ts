export type Locale = 'zh-CN' | 'en-US';
export type ThemeMode = 'night' | 'day';

export interface LocalizedString {
  'zh-CN': string;
  'en-US': string;
}

export interface AppConfig {
  server: { port: number; host: string };
  admin: { username: string; passwordHash: string; sessionSecret: string };
  security: {
    jwtSecret: string;
    tokenExpiry: string;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  paths: { dataDir: string; uploadDir: string };
}

export interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  error: string;
  success: string;
  glassColor: string;
}

export interface GlassConfig {
  opacity: number;
  blur: number;
}

export interface SkillStyleConfig {
  cardColor: string;
  cardOpacity: number;
  progressColor: string;
}

export interface FontConfig {
  family: string;
  secondaryFamily?: string;
  source: 'google' | 'local' | 'system';
  url?: string;
  weights?: number[];
}

export interface ThemeConfig {
  defaultMode: ThemeMode;
  allowUserSwitch: boolean;
  night: { colors: ThemeColors; glass: GlassConfig; skills: SkillStyleConfig };
  day: { colors: ThemeColors; glass: GlassConfig; skills: SkillStyleConfig };
  fonts: { heading: FontConfig; body: FontConfig; mono: FontConfig };
}

export interface NavItem {
  id: string;
  label: LocalizedString;
  href: string;
  external?: boolean;
  visible?: boolean;
}

export interface FriendLink {
  id: string;
  name: string;
  url: string;
  description: LocalizedString;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface SectionConfig {
  id: string;
  enabled: boolean;
  order: number;
}

export interface RightClickConfig {
  default: 'disabled' | 'allowed';
  routes: Record<string, 'disabled' | 'allowed'>;
}

export interface DevToolsConfig {
  enabled: boolean;
  default: 'disabled' | 'allowed';
  routes: Record<string, 'disabled' | 'allowed'>;
}

export interface HeroContent {
  'zh-CN': { title: string; subtitle: string; description: string; cta: string; ctaHref: string };
  'en-US': { title: string; subtitle: string; description: string; cta: string; ctaHref: string };
  avatar: string;
  background: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  level: number;
  category: string;
}

export interface ContactConfig {
  email?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  wechat?: string;
  discord?: string;
  telegram?: string;
  steam?: string;
  bilibili?: string;
  qq?: string;
  youtube?: string;
  instagram?: string;
}

export interface LoadingScreenConfig {
  enabled: boolean;
  title: LocalizedString;
  subtitle: LocalizedString;
  showFooter: boolean;
  minDuration: number;
  debugLock: boolean;
}

export interface SiteConfig {
  version: number;
  meta: {
    'zh-CN': { siteName: string; title: string; description: string };
    'en-US': { siteName: string; title: string; description: string };
    pageTitles?: {
      home: LocalizedString;
      projects: LocalizedString;
      projectDetail: LocalizedString;
      admin: LocalizedString;
      login: LocalizedString;
      setup: LocalizedString;
      blog?: LocalizedString;
      blogArticle?: LocalizedString;
      blogNotes?: LocalizedString;
      gallery?: LocalizedString;
    };
    /** 各页面独立 SEO 配置 */
    pageSeo?: {
      home?: { description?: LocalizedString; ogImage?: string; keywords?: LocalizedString };
      blog?: { description?: LocalizedString; ogImage?: string; keywords?: LocalizedString };
      blogNotes?: { description?: LocalizedString; ogImage?: string; keywords?: LocalizedString };
      gallery?: { description?: LocalizedString; ogImage?: string; keywords?: LocalizedString };
    };
    favicon: string;
    defaultLocale: Locale;
    availableLocales: Locale[];
  };
  theme: ThemeConfig;
  layout: {
    header: { visible: boolean; sticky: boolean; brandTitle?: LocalizedString; items: NavItem[] };
    footer: { visible: boolean; copyright: LocalizedString; socialLinks: SocialLink[] };
    sections: SectionConfig[];
  };
  features: {
    rightClick: RightClickConfig;
    devtools: DevToolsConfig;
    textSelection: { default: 'disabled' | 'allowed' };
    copyShortcut: { default: 'disabled' | 'allowed' };
    animations: boolean;
    particles: boolean;
    smoothScroll: boolean;
  };
  loadingScreen: LoadingScreenConfig;
  content: {
    hero: HeroContent;
    about: { 'zh-CN': string; 'en-US': string };
    announcement: { 'zh-CN': string; 'en-US': string };
    announcementStyle?: {
      nightBg?: string;
      dayBg?: string;
    };
    skills: Skill[];
    friends?: FriendLink[];
    contact: ContactConfig;
  };
}

export interface ProjectMeta {
  title: string;
  slug: string;
  cover: string;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: string;
  description: string;
  locale: Locale;
  demoUrl?: string;
  repoUrl?: string;
}

export interface Project extends ProjectMeta {
  content: string;
}

// ─── Blog Types ───────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: string;
  name: LocalizedString;
  slug: string;
  description?: LocalizedString;
  order: number;
  color?: string;
  useCustomColor?: boolean;
}

export interface BlogTag {
  id: string;
  name: LocalizedString;
  slug: string;
  color?: string;
  useCustomColor?: boolean;
}

export interface BlogMeta {
  categories: BlogCategory[];
  tags: BlogTag[];
  reactionEmojis: string[];
}

export interface BlogSeoFields {
  metaTitle?: LocalizedString;
  metaDescription?: LocalizedString;
  ogImage?: string;
  noIndex?: boolean;
}

export interface BlogArticleMeta {
  title: LocalizedString;
  slug: string;
  category: string;
  tags: string[];
  cover?: string;
  excerpt?: LocalizedString;
  locale?: Locale;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  seo?: BlogSeoFields;
}

export interface BlogArticle extends BlogArticleMeta {
  content: LocalizedString;
}

export interface BlogNote {
  id: string;
  content: LocalizedString;
  tags?: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Gallery Types ─────────────────────────────────────────────────────────────

export interface GalleryRegion {
  id: string;
  name: LocalizedString;
}

export interface GalleryTag {
  id: string;
  name: LocalizedString;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  name: LocalizedString;
  description?: LocalizedString;
  takenAt?: string;
  location?: LocalizedString;
  region?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface GalleryData {
  photos: GalleryPhoto[];
  regions: GalleryRegion[];
  tags: GalleryTag[];
}

// ─── Reaction & Views Types ────────────────────────────────────────────────────

export interface ReactionsData {
  [contentKey: string]: {
    [emoji: string]: string[];
  };
}

export interface ViewsData {
  [contentKey: string]: {
    count: number;
    sessions: string[];
  };
}

export interface JwtPayload {
  username: string;
  iat?: number;
  exp?: number;
}

export interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export type SseEventType = 'config:updated' | 'content:updated' | 'blog:updated' | 'gallery:updated' | 'ping';

export interface SseEvent {
  type: SseEventType;
  payload?: unknown;
}
