import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Project, ProjectMeta, Locale } from '@/types';

const PROJECTS_DIR = path.join(process.cwd(), 'data', 'content', 'projects');
const PAGES_DIR = path.join(process.cwd(), 'data', 'content', 'pages');

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getAllProjects(locale: Locale = 'zh-CN'): ProjectMeta[] {
  ensureDir(PROJECTS_DIR);
  const suffix = `.${locale}.md`;
  const files = fs.readdirSync(PROJECTS_DIR).filter(f => f.endsWith(suffix));

  return files
    .map(file => {
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), 'utf-8');
      const { data } = matter(raw);
      return {
        ...data,
        slug: file.replace(suffix, ''),
        locale,
      } as ProjectMeta;
    })
    .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getProject(slug: string, locale: Locale = 'zh-CN'): Project | null {
  ensureDir(PROJECTS_DIR);
  const filePath = path.join(PROJECTS_DIR, `${slug}.${locale}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { ...data, slug, locale, content } as Project;
}

export function saveProject(slug: string, locale: Locale, meta: Partial<ProjectMeta>, content: string): void {
  ensureDir(PROJECTS_DIR);
  const filePath = path.join(PROJECTS_DIR, `${slug}.${locale}.md`);
  const frontmatter = { ...meta, slug, locale };
  const raw = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, raw, 'utf-8');
}

export function deleteProject(slug: string): void {
  ensureDir(PROJECTS_DIR);
  const locales: Locale[] = ['zh-CN', 'en-US'];
  locales.forEach(locale => {
    const filePath = path.join(PROJECTS_DIR, `${slug}.${locale}.md`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  });
}

export function getPage(slug: string, locale: Locale = 'zh-CN'): { content: string; meta: Record<string, unknown> } | null {
  ensureDir(PAGES_DIR);
  const filePath = path.join(PAGES_DIR, `${slug}.${locale}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  return { content, meta: data };
}

export function savePage(slug: string, locale: Locale, content: string, meta: Record<string, unknown> = {}): void {
  ensureDir(PAGES_DIR);
  const filePath = path.join(PAGES_DIR, `${slug}.${locale}.md`);
  const raw = matter.stringify(content, meta);
  fs.writeFileSync(filePath, raw, 'utf-8');
}
