import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { defaultSiteConfig } from '@/lib/siteConfig';
import { atomicWriteJson } from '@/lib/fsAtomic';
import { broadcastSse } from '@/lib/sse';
import { markSetupIncomplete } from '@/lib/config';

const DATA_DIR = path.join(process.cwd(), 'data');

export async function POST() {
  if (!isAuthenticated()) {
    return NextResponse.json({ code: 401, message: 'Unauthorized', data: null }, { status: 401 });
  }

  try {
    // 重置站点配置（直接覆盖，不触发备份）
    atomicWriteJson(path.join(DATA_DIR, 'site-config.json'), defaultSiteConfig);

    // 清空所有内容目录
    resetDirectory(path.join(DATA_DIR, 'content', 'projects'));
    resetDirectory(path.join(DATA_DIR, 'content', 'pages'));
    resetDirectory(path.join(DATA_DIR, 'content', 'blog'));

    // 清空 uploads（含所有分类子目录及其中的图片/资源文件）
    purgeDirectory(path.join(DATA_DIR, 'uploads'));

    // 清空 favicon 目录
    purgeDirectory(path.join(DATA_DIR, 'favicon'));

    // 重置所有 JSON 数据文件
    atomicWriteJson(path.join(DATA_DIR, 'blog-meta.json'), { categories: [], tags: [], reactionEmojis: ['❤️', '🎮', '😭', '✅', '🌸', '😊', '🔥', '👍'] });
    atomicWriteJson(path.join(DATA_DIR, 'gallery.json'), { photos: [], regions: [], tags: [] });
    atomicWriteJson(path.join(DATA_DIR, 'asset-categories.json'), { categories: [], filePermissions: {} });
    atomicWriteJson(path.join(DATA_DIR, 'reactions.json'), {});
    atomicWriteJson(path.join(DATA_DIR, 'views.json'), {});
    atomicWriteJson(path.join(DATA_DIR, 'login-attempts.json'), {});

    // 删除所有备份
    resetDirectory(path.join(DATA_DIR, 'backups'));

    // 重置为"未初始化"状态，需要重新进入 /setup
    markSetupIncomplete(true);

    broadcastSse({ type: 'config:updated', payload: defaultSiteConfig });
    broadcastSse({ type: 'content:updated', payload: { reset: true } });

    return NextResponse.json({ code: 200, message: 'Site reset and setup required', data: null });
  } catch {
    return NextResponse.json({ code: 500, message: 'Reset failed', data: null }, { status: 500 });
  }
}

/** 清空目录内所有内容（含子目录），保留 .gitkeep，目录本身保留 */
function resetDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of fs.readdirSync(dir)) {
    if (entry === '.gitkeep') continue;
    const p = path.join(dir, entry);
    fs.rmSync(p, { recursive: true, force: true });
  }
}

/** 完整清除目录内所有文件和子目录（不保留 .gitkeep），目录本身保留 */
function purgeDirectory(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}
