import type { Locale } from '@/types';

const dict = {
  // Sidebar
  sidebar: {
    dashboard:     { 'zh-CN': '仪表盘',   'en-US': 'Dashboard' },
    theme:         { 'zh-CN': '主题编辑', 'en-US': 'Theme Editor' },
    layout:        { 'zh-CN': '布局管理', 'en-US': 'Layout' },
    content:       { 'zh-CN': '内容管理', 'en-US': 'Content' },
    features:      { 'zh-CN': '功能开关', 'en-US': 'Features' },
    assets:        { 'zh-CN': '资源管理', 'en-US': 'Assets' },
    blog:          { 'zh-CN': '博客管理', 'en-US': 'Blog' },
    gallery:       { 'zh-CN': '相册管理', 'en-US': 'Gallery' },
    security:      { 'zh-CN': '安全设置', 'en-US': 'Security' },
    viewSite:      { 'zh-CN': '查看网站', 'en-US': 'View Site' },
    logout:        { 'zh-CN': '退出登录', 'en-US': 'Logout' },
  },
  // Dashboard page
  dashboard: {
    title:           { 'zh-CN': '仪表盘',       'en-US': 'Dashboard' },
    subtitle:        { 'zh-CN': '管理后台',      'en-US': 'Admin Panel' },
    stats: {
      projects:      { 'zh-CN': '项目总数',     'en-US': 'Projects' },
      skills:        { 'zh-CN': '技能数量',     'en-US': 'Skills' },
      visitors:      { 'zh-CN': '在线访客',     'en-US': 'Online Visitors' },
      sse:           { 'zh-CN': 'SSE 广播',     'en-US': 'SSE Broadcast' },
      sseLive:       { 'zh-CN': '实时',         'en-US': 'Live' },
    },
    quickLinks:      { 'zh-CN': '快速入口',     'en-US': 'Quick Links' },
    overview:        { 'zh-CN': '当前配置概览', 'en-US': 'Config Overview' },
    configKeys: {
      defaultLocale:   { 'zh-CN': '默认语言',       'en-US': 'Default Locale' },
      defaultTheme:    { 'zh-CN': '默认主题',       'en-US': 'Default Theme' },
      night:           { 'zh-CN': '🌙 夜间模式',   'en-US': '🌙 Night Mode' },
      day:             { 'zh-CN': '☀️ 日间模式',   'en-US': '☀️ Day Mode' },
      allowSwitch:     { 'zh-CN': '允许切换主题',   'en-US': 'Allow Theme Switch' },
      rightClick:      { 'zh-CN': '右键限制',       'en-US': 'Right-Click' },
      rightClickOff:   { 'zh-CN': '🚫 默认禁用',   'en-US': '🚫 Disabled' },
      rightClickOn:    { 'zh-CN': '✅ 默认允许',   'en-US': '✅ Allowed' },
      devtools:        { 'zh-CN': 'DevTools 限制', 'en-US': 'DevTools Guard' },
      devtoolsOn:      { 'zh-CN': '🚫 已启用',     'en-US': '🚫 Enabled' },
      devtoolsOff:     { 'zh-CN': '✅ 已关闭',     'en-US': '✅ Disabled' },
      sse:             { 'zh-CN': 'SSE 实时同步',  'en-US': 'SSE Realtime' },
      sseRunning:      { 'zh-CN': '✅ 运行中',     'en-US': '✅ Running' },
      yes:             { 'zh-CN': '✅ 是',         'en-US': '✅ Yes' },
      no:              { 'zh-CN': '❌ 否',         'en-US': '❌ No' },
    },
    quickLinkDescs: {
      '/admin/theme':         { 'zh-CN': '修改颜色、字体和视觉风格', 'en-US': 'Colors, fonts & visual style' },
      '/admin/layout-editor': { 'zh-CN': '排序和控制页面区块',       'en-US': 'Reorder & toggle sections' },
      '/admin/content':       { 'zh-CN': '编辑项目和页面内容',       'en-US': 'Edit projects & page content' },
      '/admin/features':      { 'zh-CN': '右键禁用、DevTools 等',    'en-US': 'Right-click, DevTools & more' },
      '/admin/assets':        { 'zh-CN': '管理图片和字体文件',       'en-US': 'Manage images & fonts' },
      '/admin/blog':          { 'zh-CN': '文章、随笔和分类管理',     'en-US': 'Articles, notes & categories' },
      '/admin/gallery':       { 'zh-CN': '管理相册照片和标签',       'en-US': 'Manage gallery photos & tags' },
      '/admin/security':      { 'zh-CN': '修改密码和查看日志',       'en-US': 'Change password & audit logs' },
    },
  },
  // ClipboardToast
  clipboard: {
    copied: { 'zh-CN': '已复制到剪贴板', 'en-US': 'Copied to clipboard' },
  },
} as const;

export type AdminI18nDict = typeof dict;

export function t(
  section: keyof AdminI18nDict,
  key: string,
  locale: Locale,
): string {
  const sec = dict[section] as Record<string, Record<Locale, string>>;
  return sec[key]?.[locale] ?? sec[key]?.['zh-CN'] ?? key;
}

export function useAdminT(locale: Locale) {
  return (section: keyof AdminI18nDict, key: string) => t(section, key, locale);
}

export { dict as adminDict };
