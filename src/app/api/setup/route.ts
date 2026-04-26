import { NextRequest, NextResponse } from 'next/server';
import { isSetupComplete, markSetupComplete, getConfigPath } from '@/lib/config';
import { initSiteConfig, defaultSiteConfig } from '@/lib/siteConfig';
import { hashPassword } from '@/lib/auth';
import { atomicWriteJson } from '@/lib/fsAtomic';
import { randomBytes } from 'crypto';
import type { AppConfig, ThemeMode } from '@/types';

export async function POST(request: NextRequest) {
  if (isSetupComplete()) {
    return NextResponse.json({ code: 403, message: 'Setup already complete', data: null }, { status: 403 });
  }

  try {
    const body = await request.json() as {
      siteName: string;
      siteDesc: string;
      siteNameEn: string;
      siteDescEn: string;
      adminUsername: string;
      adminPassword: string;
      defaultTheme: ThemeMode;
    };

    const { siteName, siteDesc, siteNameEn, siteDescEn, adminUsername, adminPassword, defaultTheme } = body;

    if (!adminUsername || adminUsername.length < 3) {
      return NextResponse.json({ code: 400, message: 'Username must be at least 3 characters', data: null }, { status: 400 });
    }
    if (!adminPassword || adminPassword.length < 8) {
      return NextResponse.json({ code: 400, message: 'Password must be at least 8 characters', data: null }, { status: 400 });
    }

    const passwordHash = await hashPassword(adminPassword);
    const jwtSecret = randomBytes(48).toString('hex');
    const sessionSecret = randomBytes(48).toString('hex');

    const config: AppConfig = {
      server: { port: 3000, host: '0.0.0.0' },
      admin: { username: adminUsername, passwordHash, sessionSecret },
      security: { jwtSecret, tokenExpiry: '7d', maxLoginAttempts: 5, lockoutDuration: 900 },
      paths: { dataDir: './data', uploadDir: './data/uploads' },
    };

    atomicWriteJson(getConfigPath(), config);

    const nameZh = siteName || 'Onia';
    const nameEn = siteNameEn || 'Onia';

    const siteConfig = {
      ...defaultSiteConfig,
      meta: {
        ...defaultSiteConfig.meta,
        'zh-CN': {
          siteName: nameZh,
          title: `${nameZh} - 个人网站`,
          description: siteDesc || defaultSiteConfig.meta['zh-CN'].description,
        },
        'en-US': {
          siteName: nameEn,
          title: `${nameEn} - Personal Site`,
          description: siteDescEn || defaultSiteConfig.meta['en-US'].description,
        },
        pageTitles: {
          home:          { 'zh-CN': `首页 - ${nameZh}`,    'en-US': `Home - ${nameEn}` },
          projects:      { 'zh-CN': `项目 - ${nameZh}`,    'en-US': `Projects - ${nameEn}` },
          projectDetail: { 'zh-CN': `项目详情 - ${nameZh}`, 'en-US': `Project Detail - ${nameEn}` },
          admin:         { 'zh-CN': `控制面板 - ${nameZh}`, 'en-US': `Dashboard - ${nameEn}` },
          login:         { 'zh-CN': `登录 - ${nameZh}`,    'en-US': `Login - ${nameEn}` },
          setup:         { 'zh-CN': `初始化 - ${nameZh}`,  'en-US': `Setup - ${nameEn}` },
          blog:          { 'zh-CN': `博客 - ${nameZh}`,    'en-US': `Blog - ${nameEn}` },
          blogArticle:   { 'zh-CN': `文章 - ${nameZh}`,    'en-US': `Article - ${nameEn}` },
          blogNotes:     { 'zh-CN': `随笔 - ${nameZh}`,    'en-US': `Notes - ${nameEn}` },
          gallery:       { 'zh-CN': `相册 - ${nameZh}`,    'en-US': `Gallery - ${nameEn}` },
        },
      },
      theme: {
        ...defaultSiteConfig.theme,
        defaultMode: defaultTheme || 'night',
      },
      layout: {
        ...defaultSiteConfig.layout,
        header: {
          ...defaultSiteConfig.layout.header,
          brandTitle: { 'zh-CN': nameZh, 'en-US': nameEn },
        },
        footer: {
          ...defaultSiteConfig.layout.footer,
          copyright: {
            'zh-CN': `© ${new Date().getFullYear()} ${nameZh}. 保留所有权利。`,
            'en-US': `© ${new Date().getFullYear()} ${nameEn}. All rights reserved.`,
          },
        },
      },
      loadingScreen: {
        ...defaultSiteConfig.loadingScreen,
        title: { 'zh-CN': nameZh, 'en-US': nameEn },
      },
      content: {
        ...defaultSiteConfig.content,
        hero: {
          ...defaultSiteConfig.content.hero,
          'zh-CN': { ...defaultSiteConfig.content.hero['zh-CN'], title: `Hi, 我是 ${nameZh}` },
          'en-US': { ...defaultSiteConfig.content.hero['en-US'], title: `Hi, I'm ${nameEn}` },
        },
      },
    };

    initSiteConfig();
    atomicWriteJson('./data/site-config.json', siteConfig);
    markSetupComplete();

    return NextResponse.json({ code: 200, message: 'Setup complete', data: null });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ code: 500, message: msg, data: null }, { status: 500 });
  }
}
