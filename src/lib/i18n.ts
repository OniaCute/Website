import type { Locale } from '@/types';
import zhCN from '../../data/i18n/zh-CN.json';
import enUS from '../../data/i18n/en-US.json';

type Messages = typeof zhCN;

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN,
  'en-US': enUS as Messages,
};

export function getTranslations(locale: Locale): Messages {
  return messages[locale] ?? messages['zh-CN'];
}

export function t(locale: Locale, key: string, fallback?: string): string {
  const msgs = getTranslations(locale);
  const parts = key.split('.');
  let current: unknown = msgs;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return fallback ?? key;
    }
  }

  return typeof current === 'string' ? current : fallback ?? key;
}

export const DEFAULT_LOCALE: Locale = 'zh-CN';
export const SUPPORTED_LOCALES: Locale[] = ['zh-CN', 'en-US'];

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/en')) return 'en-US';
  return 'zh-CN';
}

export function localizeHref(href: string, locale: Locale): string {
  if (locale === 'en-US') return `/en${href === '/' ? '' : href}`;
  return href;
}
