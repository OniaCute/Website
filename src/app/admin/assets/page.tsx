'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon, Upload, Trash2, Copy, Check, Save,
  Plus, FolderPlus, Globe, Link2, FolderOpen, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toggle } from '@/components/ui/Toggle';
import { useLocaleStore } from '@/store/localeStore';

type L = 'zh-CN' | 'en-US';

const i18n = {
  title:       { 'zh-CN': '资源管理',                    'en-US': 'Assets' },
  subtitle:    { 'zh-CN': '管理图片、字体、图标和自定义分类资源', 'en-US': 'Manage images, fonts, favicon & custom categories' },
  upload:      { 'zh-CN': '上传文件',                    'en-US': 'Upload' },
  tabImages:   { 'zh-CN': '🖼️ 图片',                   'en-US': '🖼️ Images' },
  tabFonts:    { 'zh-CN': '🔤 字体',                    'en-US': '🔤 Fonts' },
  tabFavicon:  { 'zh-CN': '🌐 网站图标',                'en-US': '🌐 Favicon' },
  tabNewCat:   { 'zh-CN': '+ 新建分类',                 'en-US': '+ New Category' },
  empty:       { 'zh-CN': '暂无文件，点击「上传文件」添加', 'en-US': 'No files yet. Click "Upload" to add one.' },
  copyPath:    { 'zh-CN': '复制路径',  'en-US': 'Copy URL' },
  copyDownload:{ 'zh-CN': '复制下载链接', 'en-US': 'Copy Download Link' },
  copied:      { 'zh-CN': '已复制',    'en-US': 'Copied' },
  confirmDel:  { 'zh-CN': '确认删除？', 'en-US': 'Delete this file?' },
  confirmDelCat: { 'zh-CN': '确认删除该分类？目录需为空。', 'en-US': 'Delete this category? Directory must be empty.' },
  publicDownload: { 'zh-CN': '开放外链下载', 'en-US': 'Public Download' },
  // New category modal
  newCatTitle: { 'zh-CN': '新建自定义分类', 'en-US': 'New Category' },
  newCatName:  { 'zh-CN': '分类名称',      'en-US': 'Category Name' },
  newCatSlug:  { 'zh-CN': 'Slug（URL路径，小写字母/数字/连字符）', 'en-US': 'Slug (lowercase letters, numbers, hyphens)' },
  newCatSlugPh:{ 'zh-CN': '例：my-docs', 'en-US': 'e.g. my-docs' },
  cancel:      { 'zh-CN': '取消', 'en-US': 'Cancel' },
  create:      { 'zh-CN': '创建', 'en-US': 'Create' },
  delCat:      { 'zh-CN': '删除分类', 'en-US': 'Delete Category' },
  // Favicon
  faviconTitle:   { 'zh-CN': '网站图标设置',     'en-US': 'Favicon Settings' },
  faviconPreview: { 'zh-CN': '预览效果',         'en-US': 'Preview' },
  faviconCurrent: { 'zh-CN': '当前图标',         'en-US': 'Current' },
  faviconUpload:  { 'zh-CN': '上传图片',         'en-US': 'Upload Image' },
  faviconHint:    { 'zh-CN': '点击选择图片（推荐 1:1 正方形）', 'en-US': 'Click to select image (1:1 square recommended)' },
  faviconRadius:  { 'zh-CN': '圆角度数',         'en-US': 'Corner Radius' },
  faviconSharp:   { 'zh-CN': '直角',             'en-US': 'Sharp' },
  faviconRound:   { 'zh-CN': '圆角',             'en-US': 'Round' },
  faviconCircle:  { 'zh-CN': '正圆',             'en-US': 'Circle' },
  faviconSave:    { 'zh-CN': '保存图标', 'en-US': 'Save Favicon' },
  faviconSaved:   { 'zh-CN': '已保存 ✓', 'en-US': 'Saved ✓' },
  faviconNote:    { 'zh-CN': '图标将以上传文件的原始格式（PNG / WEBP / JPG）保存，建议使用至少 256×256 px 的正方形图片。保存后刷新页面即可看到新图标。', 'en-US': 'The favicon is saved in the original format of the uploaded file (PNG / WEBP / JPG). Recommended: at least 256×256px square image. Refresh after saving to see the new icon.' },
} as const;

interface FileItem { name: string; url: string; size: number; createdAt: string }
interface AssetCategory { id: string; name: string; slug: string; createdAt: string }
interface FilePermissions { [key: string]: { publicDownload: boolean } }

// ─────────────────────────────────────────────────────────────────────────────
// FaviconEditor
// ─────────────────────────────────────────────────────────────────────────────
function FaviconEditor() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];

  const [radius, setRadius] = useState(0);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch('/api/admin/favicon').then(r => r.json()).then(res => {
      if (res.code === 200) setCurrentUrl(res.data.url);
    });
  }, []);

  const renderPreview = useCallback((file: File, r: number) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const size = 128;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, size, size);
        const cr = Math.round((r / 100) * (size / 2));
        ctx.beginPath();
        ctx.moveTo(cr, 0); ctx.lineTo(size - cr, 0); ctx.quadraticCurveTo(size, 0, size, cr);
        ctx.lineTo(size, size - cr); ctx.quadraticCurveTo(size, size, size - cr, size);
        ctx.lineTo(cr, size); ctx.quadraticCurveTo(0, size, 0, size - cr);
        ctx.lineTo(0, cr); ctx.quadraticCurveTo(0, 0, cr, 0);
        ctx.closePath(); ctx.clip();
        ctx.drawImage(img, 0, 0, size, size);
        setPreviewSrc(canvas.toDataURL('image/png'));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRawFile(file); renderPreview(file, radius); e.target.value = '';
  };

  const save = async () => {
    if (!rawFile) return;
    setSaving(true);
    const form = new FormData();
    form.append('file', rawFile);
    form.append('radius', String(radius));
    const res = await fetch('/api/admin/favicon', { method: 'POST', body: form });
    const data = await res.json() as { code: number; data?: { url: string } };
    setSaving(false);
    if (data.code === 200) {
      setSaved(true);
      setCurrentUrl(`${data.data?.url}?t=${Date.now()}`);
      setPreviewSrc(null);
      setRawFile(null);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <GlassCard>
      <h3 className="font-semibold mb-5">{tx(i18n.faviconTitle)}</h3>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col items-center gap-4 flex-shrink-0">
          <div className="w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
            {previewSrc
            ? <img src={previewSrc} alt="preview" className="w-full h-full object-cover" />
            : currentUrl
            ? <img src={currentUrl} alt="favicon" className="w-full h-full object-contain p-2" />
            : <ImageIcon className="w-10 h-10 opacity-30" />}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-xs text-center" style={{ color: 'var(--color-text-muted)' }}>{previewSrc ? tx(i18n.faviconPreview) : tx(i18n.faviconCurrent)}</p>
          {previewSrc && (
            <div className="flex items-end gap-3">
              {([64, 32, 16] as const).map(s => (
                <div key={s} className="flex flex-col items-center gap-1">
                  <img src={previewSrc} alt="" style={{ width: s, height: s, objectFit: 'cover' }} />
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{s}px</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-5">
          <div>
            <p className="text-sm font-medium mb-2">{tx(i18n.faviconUpload)}</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all hover:border-primary" style={{ border: '2px dashed var(--color-border)', color: 'var(--color-text-muted)' }}>
              <Upload className="w-4 h-4" />
              {rawFile ? rawFile.name : tx(i18n.faviconHint)}
            </button>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={onFileChange} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{tx(i18n.faviconRadius)}</p>
              <span className="text-sm font-mono" style={{ color: 'var(--color-primary)' }}>{radius}%</span>
            </div>
            <input type="range" min={0} max={50} value={radius} onChange={e => { const r = Number(e.target.value); setRadius(r); if (rawFile) renderPreview(rawFile, r); }} className="range-light w-full" />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              <span>{tx(i18n.faviconSharp)}</span><span>{tx(i18n.faviconRound)}</span><span>{tx(i18n.faviconCircle)}</span>
            </div>
          </div>
          <Button onClick={save} loading={saving} disabled={!rawFile} className="w-full">
            <Save className="w-4 h-4" /> {saved ? tx(i18n.faviconSaved) : tx(i18n.faviconSave)}
          </Button>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.faviconNote)}</p>
        </div>
      </div>
    </GlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 自定义分类内容区
// ─────────────────────────────────────────────────────────────────────────────
interface CategoryTabContentProps {
  category: AssetCategory;
  locale: L;
  onDeleted: () => void;
}

function CategoryTabContent({ category, locale, onDeleted }: CategoryTabContentProps) {
  const tx = (o: Record<L, string>) => o[locale];
  const [files, setFiles] = useState<FileItem[]>([]);
  const [permissions, setPermissions] = useState<FilePermissions>({});
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(() => {
    fetch(`/api/upload?dir=${category.slug}`)
      .then(r => r.json())
      .then(res => { if (res.code === 200) setFiles(res.data as FileItem[]); });
  }, [category.slug]);

  // 加载文件+权限
  useEffect(() => {
    fetchFiles();
    // 从后端加载权限快照（通过一个简单的 GET 扩展）
    fetch(`/api/admin/asset-categories/file-permission?slug=${category.slug}`)
      .then(r => { if (r.ok) return r.json(); })
      .then(res => { if (res?.code === 200) setPermissions(res.data as FilePermissions); })
      .catch(() => {});
  }, [category.slug, fetchFiles]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('dir', category.slug);
    const data = await fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json()) as { code: number };
    setUploading(false);
    e.target.value = '';
    if (data.code === 200) fetchFiles();
  };

  const deleteFile = async (filename: string) => {
    if (!confirm(tx(i18n.confirmDel))) return;
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dir: category.slug }),
    });
    fetchFiles();
  };

  const deleteCategory = async () => {
    if (!confirm(tx(i18n.confirmDelCat))) return;
    const res = await fetch(`/api/admin/asset-categories?slug=${category.slug}`, { method: 'DELETE' });
    const data = await res.json() as { code: number; message: string };
    if (data.code === 200) {
      onDeleted();
    } else {
      alert(data.message);
    }
  };

  const togglePublicDownload = async (filename: string, current: boolean) => {
    const newVal = !current;
    // 乐观更新
    setPermissions(prev => ({ ...prev, [`${category.slug}/${filename}`]: { publicDownload: newVal } }));
    await fetch('/api/admin/asset-categories/file-permission', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: category.slug, filename, publicDownload: newVal }),
    });
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <span className="text-sm font-medium">{category.name}</span>
          <code className="text-xs px-2 py-0.5 rounded-md font-mono" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
            /{category.slug}
          </code>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => fileInputRef.current?.click()} loading={uploading}>
            <Upload className="w-4 h-4" /> {tx(i18n.upload)}
          </Button>
          <Button size="sm" variant="danger" onClick={deleteCategory}>
            <Trash2 className="w-4 h-4" /> {tx(i18n.delCat)}
          </Button>
        </div>
        <input ref={fileInputRef} type="file" className="sr-only" onChange={upload} />
      </div>

      {/* 外链下载说明 */}
      <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)' }}>
        <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
        <span style={{ color: 'var(--color-text-muted)' }}>
          {locale === 'zh-CN'
            ? '开启「开放外链下载」后，任何人可通过下载链接直接获取文件（无需登录）。默认关闭，请谨慎开启。'
            : 'When "Public Download" is enabled, anyone can download the file via the link without login. Disabled by default — enable with caution.'}
        </span>
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <GlassCard>
          <div className="text-center py-12 flex flex-col items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
            <Upload className="w-10 h-10 opacity-40" />
            <p>{tx(i18n.empty)}</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {files.map(file => {
            const permKey = `${category.slug}/${file.name}`;
            const isPublic = permissions[permKey]?.publicDownload ?? false;
            const downloadUrl = `${origin}/api/download/${category.slug}/${file.name}`;
            const staticUrl = file.url;

            return (
              <GlassCard key={file.name} padding="sm">
                <div className="p-3 flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatSize(file.size)}</p>
                  </div>

                  {/* Public download toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Globe className="w-3.5 h-3.5" style={{ color: isPublic ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                    <Toggle
                      checked={isPublic}
                      onChange={() => togglePublicDownload(file.name, isPublic)}
                      label=""
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-shrink-0">
                    {/* Copy static path */}
                    <button
                      onClick={() => copy(staticUrl)}
                      title={tx(i18n.copyPath)}
                      className="p-1.5 rounded-lg hover:bg-primary/10 transition-all"
                      style={{ border: '1px solid var(--color-border)', color: copied === staticUrl ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                    >
                      {copied === staticUrl ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                    </button>

                    {/* Copy download link (only when public) */}
                    {isPublic && (
                      <button
                        onClick={() => copy(downloadUrl)}
                        title={tx(i18n.copyDownload)}
                        className="p-1.5 rounded-lg hover:bg-success/10 transition-all"
                        style={{ border: '1px solid var(--color-border)', color: copied === downloadUrl ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                      >
                        {copied === downloadUrl ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => deleteFile(file.name)}
                      title={locale === 'zh-CN' ? '删除' : 'Delete'}
                      className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-all"
                      style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AssetsPage
// ─────────────────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = (o: Record<L, string>) => o[l];

  const [files, setFiles] = useState<FileItem[]>([]);
  const [fonts, setFonts] = useState<FileItem[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('images');
  const [newCatOpen, setNewCatOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(() => {
    fetch('/api/upload').then(r => r.json()).then(res => { if (res.code === 200) setFiles(res.data as FileItem[]); });
    fetch('/api/upload?dir=fonts').then(r => r.json()).then(res => { if (res.code === 200) setFonts(res.data as FileItem[]); });
  }, []);

  const fetchCategories = useCallback(() => {
    fetch('/api/admin/asset-categories').then(r => r.json()).then(res => {
      if (res.code === 200) setCategories(res.data as AssetCategory[]);
    });
  }, []);

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, [fetchFiles, fetchCategories]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    if (activeTab === 'fonts') form.append('dir', 'fonts');
    const data = await fetch('/api/upload', { method: 'POST', body: form }).then(r => r.json()) as { code: number };
    setUploading(false);
    e.target.value = '';
    if (data.code === 200) fetchFiles();
  };

  const deleteFile = async (filename: string, dir?: string) => {
    if (!confirm(tx(i18n.confirmDel))) return;
    await fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dir }),
    });
    fetchFiles();
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const formatSize = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

  const createCategory = async () => {
    if (!newCat.name || !newCat.slug) return;
    setCreating(true);
    setCreateError('');
    const res = await fetch('/api/admin/asset-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.name, slug: newCat.slug }),
    });
    const data = await res.json() as { code: number; message: string };
    setCreating(false);
    if (data.code === 200) {
      setNewCat({ name: '', slug: '' });
      setNewCatOpen(false);
      fetchCategories();
    } else {
      setCreateError(data.message);
    }
  };

  const handleCategoryDeleted = (slug: string) => {
    setCategories(prev => prev.filter(c => c.slug !== slug));
    if (activeTab === slug) setActiveTab('images');
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    setNewCat({ name, slug });
  };

  const systemTabs = [
    { id: 'images', label: tx(i18n.tabImages) },
    { id: 'fonts',  label: tx(i18n.tabFonts) },
    { id: 'favicon', label: tx(i18n.tabFavicon) },
  ];

  const currentFiles = activeTab === 'images' ? files : fonts;
  const isSystemTab = ['images', 'fonts', 'favicon'].includes(activeTab);
  const activeCat = categories.find(c => c.slug === activeTab);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{tx(i18n.title)}</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.subtitle)}</p>
          </div>
        </div>
        {activeTab !== 'favicon' && isSystemTab && (
          <>
            <Button onClick={() => fileInputRef.current?.click()} loading={uploading}>
              <Upload className="w-4 h-4" /> {tx(i18n.upload)}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept={activeTab === 'images' ? 'image/*,.ico' : '.woff2,.woff,.ttf'}
              onChange={upload}
            />
          </>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface-alt)' }}>
        {/* System tabs */}
        {systemTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={{
              background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}

        {/* Custom category tabs */}
        {categories.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setActiveTab(cat.slug)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5"
            style={{
              background: activeTab === cat.slug ? 'var(--color-primary)' : 'transparent',
              color: activeTab === cat.slug ? 'white' : 'var(--color-text-muted)',
            }}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            {cat.name}
          </button>
        ))}

        {/* New category button */}
        <button
          onClick={() => setNewCatOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5"
          style={{
            border: '1px dashed var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          {tx(i18n.tabNewCat)}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'favicon' && <FaviconEditor />}

      {/* Custom category content */}
      {!isSystemTab && activeCat && (
        <CategoryTabContent
          category={activeCat}
          locale={l}
          onDeleted={() => handleCategoryDeleted(activeCat.slug)}
        />
      )}

      {/* System images / fonts content */}
      {isSystemTab && activeTab !== 'favicon' && (
        currentFiles.length === 0 ? (
          <GlassCard>
            <div className="text-center py-12 flex flex-col items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
              <Upload className="w-10 h-10 opacity-40" />
              <p>{tx(i18n.empty)}</p>
            </div>
          </GlassCard>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentFiles.map(file => (
              <GlassCard key={file.name} padding="sm">
                <div className="p-4">
                  {activeTab === 'images' ? (
                    <div className="relative h-32 rounded-lg overflow-hidden mb-3" style={{ background: 'var(--color-surface-alt)' }}>
                      <Image src={file.url} alt={file.name} fill className="object-contain p-2" unoptimized />
                    </div>
                  ) : (
                    <div className="h-32 rounded-lg flex items-center justify-center mb-3 text-2xl" style={{ background: 'var(--color-surface-alt)' }}>
                      🔤 <span className="text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>{file.name.split('.').pop()?.toUpperCase()}</span>
                    </div>
                  )}
                  <p className="text-xs font-medium truncate mb-1">{file.name}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{formatSize(file.size)}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copy(file.url)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs rounded-lg transition-all hover:bg-primary/10"
                      style={{ border: '1px solid var(--color-border)', color: copied === file.url ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                    >
                      {copied === file.url ? <><Check className="w-3 h-3" /> {tx(i18n.copied)}</> : <><Copy className="w-3 h-3" /> {tx(i18n.copyPath)}</>}
                    </button>
                    <button
                      onClick={() => deleteFile(file.name, activeTab === 'fonts' ? 'fonts' : undefined)}
                      className="p-1.5 rounded-lg hover:bg-error/10 hover:text-error transition-all"
                      style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )
      )}

      {/* New category modal */}
      <Modal
        open={newCatOpen}
        onClose={() => { setNewCatOpen(false); setNewCat({ name: '', slug: '' }); setCreateError(''); }}
        title={tx(i18n.newCatTitle)}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setNewCatOpen(false); setNewCat({ name: '', slug: '' }); setCreateError(''); }}>
              {tx(i18n.cancel)}
            </Button>
            <Button loading={creating} onClick={createCategory} disabled={!newCat.name || !newCat.slug}>
              {tx(i18n.create)}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={tx(i18n.newCatName)}
            value={newCat.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder={locale === 'zh-CN' ? '例：我的文档' : 'e.g. My Docs'}
          />
          <Input
            label={tx(i18n.newCatSlug)}
            value={newCat.slug}
            onChange={e => setNewCat(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
            placeholder={tx(i18n.newCatSlugPh)}
          />
          {createError && (
            <p className="text-sm" style={{ color: 'var(--color-error)' }}>{createError}</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
