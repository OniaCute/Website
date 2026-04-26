'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { useConfigStore } from '@/store/configStore';
import type { ThemeColors, FontConfig } from '@/types';

function applyColors(colors: ThemeColors): void {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    const varName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(varName, value);
  });
}

function applyFont(font: FontConfig, role: 'heading' | 'body' | 'mono'): void {
  const root = document.documentElement;
  const fallback = role === 'mono' ? 'ui-monospace, monospace' : 'system-ui, sans-serif';
  const secondary = font.secondaryFamily ? `, "${font.secondaryFamily}"` : '';
  root.style.setProperty(`--font-${role}`, `"${font.family}"${secondary}, ${fallback}`);

  if (font.source === 'google' && font.url) {
    const existing = document.getElementById(`font-${role}-link`);
    if (!existing) {
      const link = document.createElement('link');
      link.id = `font-${role}-link`;
      link.rel = 'stylesheet';
      link.href = font.url;
      document.head.appendChild(link);
    }
  } else if (font.source === 'local' && font.url) {
    const existing = document.getElementById(`font-${role}-face`);
    if (!existing) {
      const style = document.createElement('style');
      style.id = `font-${role}-face`;
      style.textContent = `@font-face { font-family: "${font.family}"; src: url("${font.url}") format("woff2"); }`;
      document.head.appendChild(style);
    }
  }
}

export function useThemeApply(): void {
  const mode = useThemeStore((s) => s.mode);
  const config = useConfigStore((s) => s.config);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    if (!config) return;
    const themeData = config.theme[mode];
    applyColors(themeData.colors);
    document.documentElement.style.setProperty('--glass-opacity', String(themeData.glass.opacity));
    document.documentElement.style.setProperty('--glass-blur', `${themeData.glass.blur}px`);

    applyFont(config.theme.fonts.heading, 'heading');
    applyFont(config.theme.fonts.body, 'body');
    applyFont(config.theme.fonts.mono, 'mono');
  }, [mode, config]);
}
