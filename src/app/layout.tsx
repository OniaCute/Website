import type { Metadata } from 'next';
import '@/styles/globals.css';
import { getSiteConfig } from '@/lib/siteConfig';
import { RootProviders } from '@/components/site/RootProviders';
import type { SiteConfig } from '@/types';

function getIconMime(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
  if (lower.includes('.svg')) return 'image/svg+xml';
  return 'image/x-icon';
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const full = h.length === 3
    ? h.split('').map(c => c + c).join('')
    : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (isNaN(n)) return '255,255,255';
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

function buildThemeVars(config: SiteConfig): string {
  const toVars = (colors: Record<string, string>) =>
    Object.entries(colors)
      .map(([k, v]) => `--color-${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
      .join('\n        ');

  const nightGlassRgb = hexToRgb(config.theme.night.colors.glassColor ?? '#ffffff');
  const dayGlassRgb   = hexToRgb(config.theme.day.colors.glassColor ?? '#ffffff');

  return [
    ':root {',
    `  ${toVars(config.theme.night.colors as unknown as Record<string, string>)}`,
    `  --glass-opacity: ${config.theme.night.glass.opacity};`,
    `  --glass-blur: ${config.theme.night.glass.blur}px;`,
    `  --glass-color-rgb: ${nightGlassRgb};`,
    '}',
    '[data-theme="day"] {',
    `  ${toVars(config.theme.day.colors as unknown as Record<string, string>)}`,
    `  --glass-opacity: ${config.theme.day.glass.opacity};`,
    `  --glass-blur: ${config.theme.day.glass.blur}px;`,
    `  --glass-color-rgb: ${dayGlassRgb};`,
    '}',
  ].join('\n');
}

// 在第一次绘制前修正 data-theme，阻塞式脚本
const themeScript = `(function(){try{var u=localStorage.getItem('onia-theme-user-set')==='1';var s=localStorage.getItem('onia-theme');if(u&&s){var p=JSON.parse(s);if(p.state&&p.state.mode){document.documentElement.setAttribute('data-theme',p.state.mode);}}}catch(e){}})();`;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = getSiteConfig();
    const meta = config.meta['zh-CN'];
    const faviconUrl = config.meta.favicon || '/images/default-favicon.png';
    return {
      title: meta.title,
      description: meta.description,
      icons: {
        icon: [{ url: faviconUrl, type: getIconMime(faviconUrl), sizes: '256x256' }],
        shortcut: faviconUrl,
        apple: [{ url: faviconUrl, sizes: '256x256' }],
      },
    };
  } catch {
    return { title: 'Personal Site', description: 'Personal website' };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let initialConfig: SiteConfig | null = null;
  try {
    initialConfig = getSiteConfig();
  } catch { /* setup not yet done */ }

  const defaultMode = initialConfig?.theme.defaultMode ?? 'night';
  const themeVars = initialConfig ? buildThemeVars(initialConfig) : '';

  return (
    <html lang="zh-CN" data-theme={defaultMode} suppressHydrationWarning>
      <head>
        {/* 在首帧绘制前同步正确的主题，彻底消除闪烁 */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* 服务端直接注入用户自定义颜色变量，无需等 JS hydrate */}
        {themeVars && <style dangerouslySetInnerHTML={{ __html: themeVars }} />}
      </head>
      <body className="grain antialiased">
        <RootProviders initialConfig={initialConfig} defaultMode={defaultMode}>
          {children}
        </RootProviders>
      </body>
    </html>
  );
}
