import path from 'path';
import fs from 'fs';
import { atomicWriteJson, readJson } from './fsAtomic';

const DATA_PATH = path.join(process.cwd(), 'data', 'asset-categories.json');
const UPLOAD_DIR = path.join(process.cwd(), 'data', 'uploads');

// 系统保留的 slug，不允许被用户分类占用
export const SYSTEM_SLUGS = new Set(['fonts', 'favicon', '_tmp']);

export interface AssetCategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface FilePermission {
  publicDownload: boolean;
}

export interface AssetCategoriesData {
  categories: AssetCategory[];
  /** key: "<slug>/<filename>" */
  filePermissions: Record<string, FilePermission>;
}

function ensureData(): AssetCategoriesData {
  const stored = readJson<AssetCategoriesData>(DATA_PATH);
  if (stored) return stored;
  const initial: AssetCategoriesData = { categories: [], filePermissions: {} };
  atomicWriteJson(DATA_PATH, initial);
  return initial;
}

export function getAssetCategories(): AssetCategoriesData {
  return ensureData();
}

export function saveAssetCategories(data: AssetCategoriesData): void {
  atomicWriteJson(DATA_PATH, data);
}

export function createCategory(name: string, slug: string): { success: boolean; error?: string; category?: AssetCategory } {
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { success: false, error: 'slug 只能包含小写字母、数字和连字符' };
  }
  if (SYSTEM_SLUGS.has(slug)) {
    return { success: false, error: `"${slug}" 是系统保留名称，请使用其他名称` };
  }

  const data = ensureData();
  if (data.categories.find(c => c.slug === slug)) {
    return { success: false, error: '该分类 slug 已存在' };
  }

  const dir = path.join(UPLOAD_DIR, slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const category: AssetCategory = {
    id: Date.now().toString(),
    name,
    slug,
    createdAt: new Date().toISOString(),
  };
  data.categories.push(category);
  saveAssetCategories(data);
  return { success: true, category };
}

export function deleteCategory(slug: string): { success: boolean; error?: string } {
  if (SYSTEM_SLUGS.has(slug)) {
    return { success: false, error: '系统分类不可删除' };
  }

  const data = ensureData();
  const idx = data.categories.findIndex(c => c.slug === slug);
  if (idx === -1) return { success: false, error: '分类不存在' };

  const dir = path.join(UPLOAD_DIR, slug);
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    if (files.length > 0) {
      return { success: false, error: '分类目录不为空，请先删除文件' };
    }
    fs.rmdirSync(dir);
  }

  data.categories.splice(idx, 1);
  // 清理该分类的文件权限
  for (const key of Object.keys(data.filePermissions)) {
    if (key.startsWith(`${slug}/`)) delete data.filePermissions[key];
  }
  saveAssetCategories(data);
  return { success: true };
}

export function setFilePermission(slug: string, filename: string, publicDownload: boolean): void {
  const data = ensureData();
  const key = `${slug}/${filename}`;
  data.filePermissions[key] = { publicDownload };
  saveAssetCategories(data);
}

export function getFilePermission(slug: string, filename: string): FilePermission {
  const data = ensureData();
  return data.filePermissions[`${slug}/${filename}`] ?? { publicDownload: false };
}
