import path from 'path';
import { atomicWriteJson, readJson } from './fsAtomic';
import type { ViewsData } from '@/types';

const VIEWS_FILE = path.join(process.cwd(), 'data', 'views.json');

function readViews(): ViewsData {
  return readJson<ViewsData>(VIEWS_FILE) ?? {};
}

function writeViews(data: ViewsData): void {
  atomicWriteJson(VIEWS_FILE, data);
}

export function getViewCount(contentKey: string): number {
  const data = readViews();
  return data[contentKey]?.count ?? 0;
}

export function recordView(contentKey: string, sessionId: string): number {
  const data = readViews();

  if (!data[contentKey]) {
    data[contentKey] = { count: 0, sessions: [] };
  }

  const entry = data[contentKey];

  if (!entry.sessions.includes(sessionId)) {
    entry.sessions.push(sessionId);
    entry.count += 1;

    // 只保留最近 5000 个 session 防止文件无限增长
    if (entry.sessions.length > 5000) {
      entry.sessions = entry.sessions.slice(-5000);
    }

    writeViews(data);
  }

  return entry.count;
}
