import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { atomicWriteJson, readJson, ensureDir } from './fsAtomic';
import type { BlogArticle, BlogArticleMeta, BlogNote, BlogMeta, Locale } from '@/types';

const BLOG_DIR = path.join(process.cwd(), 'data', 'content', 'blog');
const NOTES_FILE = path.join(BLOG_DIR, 'notes.json');
const META_FILE = path.join(process.cwd(), 'data', 'blog-meta.json');

const DEFAULT_META: BlogMeta = {
  categories: [],
  tags: [],
  reactionEmojis: ['❤️', '🎮', '😭', '✅', '🌸', '😊', '🔥', '👍'],
};

function ensureBlogDir(): void {
  ensureDir(BLOG_DIR);
}

// ─── Blog Meta ────────────────────────────────────────────────────────────────

export function getBlogMeta(): BlogMeta {
  const stored = readJson<BlogMeta>(META_FILE);
  if (!stored) return DEFAULT_META;
  return {
    ...DEFAULT_META,
    ...stored,
    categories: stored.categories ?? [],
    tags: stored.tags ?? [],
    reactionEmojis: stored.reactionEmojis ?? DEFAULT_META.reactionEmojis,
  };
}

export function saveBlogMeta(meta: BlogMeta): void {
  atomicWriteJson(META_FILE, meta);
}

// ─── Articles ─────────────────────────────────────────────────────────────────

function articleFilePath(slug: string): string {
  return path.join(BLOG_DIR, `${slug}.json`);
}

export function getAllArticles(opts: {
  publishedOnly?: boolean;
  category?: string;
  tag?: string;
  tags?: string[];
  search?: string;
  locale?: Locale;
  page?: number;
  limit?: number;
} = {}): { articles: BlogArticleMeta[]; total: number } {
  ensureBlogDir();

  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json') && f !== 'notes.json')
    : [];

  let articles: BlogArticleMeta[] = files
    .map(file => {
      const raw = readJson<BlogArticle>(path.join(BLOG_DIR, file));
      if (!raw) return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { content: _c, ...meta } = raw;
      return meta as BlogArticleMeta;
    })
    .filter((a): a is BlogArticleMeta => a !== null);

  if (opts.publishedOnly) {
    articles = articles.filter(a => a.published);
  }
  if (opts.category) {
    articles = articles.filter(a => a.category === opts.category);
  }
  // 支持单 tag（兼容旧调用）和多 tags 同时过滤（文章需包含其中任意一个）
  const tagFilter = opts.tags && opts.tags.length > 0
    ? opts.tags
    : opts.tag ? [opts.tag] : [];
  if (tagFilter.length > 0) {
    articles = articles.filter(a => tagFilter.some(t => a.tags.includes(t)));
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    articles = articles.filter(a => {
      const titleZh = a.title['zh-CN'].toLowerCase();
      const titleEn = a.title['en-US'].toLowerCase();
      const excerptZh = (a.excerpt?.['zh-CN'] ?? '').toLowerCase();
      const excerptEn = (a.excerpt?.['en-US'] ?? '').toLowerCase();
      return titleZh.includes(q) || titleEn.includes(q) || excerptZh.includes(q) || excerptEn.includes(q);
    });
  }

  articles.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = articles.length;

  if (opts.page !== undefined && opts.limit !== undefined) {
    const start = (opts.page - 1) * opts.limit;
    articles = articles.slice(start, start + opts.limit);
  }

  return { articles, total };
}

export function getArticle(slug: string): BlogArticle | null {
  ensureBlogDir();
  const filePath = articleFilePath(slug);
  return readJson<BlogArticle>(filePath);
}

export function saveArticle(article: BlogArticle): void {
  ensureBlogDir();
  const now = new Date().toISOString();
  const data: BlogArticle = {
    ...article,
    updatedAt: now,
  };
  atomicWriteJson(articleFilePath(article.slug), data);
}

export function createArticle(data: Omit<BlogArticle, 'createdAt' | 'updatedAt'>): BlogArticle {
  const now = new Date().toISOString();
  const article: BlogArticle = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  saveArticle(article);
  return article;
}

export function deleteArticle(slug: string): void {
  ensureBlogDir();
  const filePath = articleFilePath(slug);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

// ─── Notes ────────────────────────────────────────────────────────────────────

function readNotesFile(): BlogNote[] {
  ensureBlogDir();
  return readJson<BlogNote[]>(NOTES_FILE) ?? [];
}

export function getAllNotes(opts: {
  publishedOnly?: boolean;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}): { notes: BlogNote[]; total: number } {
  let notes = readNotesFile();

  if (opts.publishedOnly) {
    notes = notes.filter(n => n.published);
  }
  if (opts.tag) {
    notes = notes.filter(n => n.tags?.includes(opts.tag!));
  }
  if (opts.search) {
    const q = opts.search.toLowerCase();
    notes = notes.filter(n =>
      n.content['zh-CN'].toLowerCase().includes(q) ||
      n.content['en-US'].toLowerCase().includes(q)
    );
  }

  notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = notes.length;

  if (opts.page !== undefined && opts.limit !== undefined) {
    const start = (opts.page - 1) * opts.limit;
    notes = notes.slice(start, start + opts.limit);
  }

  return { notes, total };
}

export function getNote(id: string): BlogNote | null {
  const notes = readNotesFile();
  return notes.find(n => n.id === id) ?? null;
}

export function createNote(data: Omit<BlogNote, 'id' | 'createdAt' | 'updatedAt'>): BlogNote {
  const notes = readNotesFile();
  const now = new Date().toISOString();
  const note: BlogNote = {
    ...data,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  notes.unshift(note);
  atomicWriteJson(NOTES_FILE, notes);
  return note;
}

export function updateNote(id: string, data: Partial<Omit<BlogNote, 'id' | 'createdAt'>>): BlogNote | null {
  const notes = readNotesFile();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) return null;
  const updated: BlogNote = { ...notes[idx], ...data, updatedAt: new Date().toISOString() };
  notes[idx] = updated;
  atomicWriteJson(NOTES_FILE, notes);
  return updated;
}

export function deleteNote(id: string): boolean {
  const notes = readNotesFile();
  const filtered = notes.filter(n => n.id !== id);
  if (filtered.length === notes.length) return false;
  atomicWriteJson(NOTES_FILE, filtered);
  return true;
}

export function getArticleCount(): number {
  ensureBlogDir();
  if (!fs.existsSync(BLOG_DIR)) return 0;
  return fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.json') && f !== 'notes.json').length;
}

export function getNoteCount(): number {
  return readNotesFile().length;
}
