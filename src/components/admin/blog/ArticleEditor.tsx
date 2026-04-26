'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { X, Image as ImageIcon, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useLocaleStore } from '@/store/localeStore';
import { ImagePicker } from './ImagePicker';
import type { BlogArticle, BlogCategory, BlogTag } from '@/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type L = 'zh-CN' | 'en-US';

const i18n = {
  newArticle:     { 'zh-CN': '新建文章',    'en-US': 'New Article' },
  editArticle:    { 'zh-CN': '编辑文章',    'en-US': 'Edit Article' },
  pinned:         { 'zh-CN': '置顶',        'en-US': 'Pinned' },
  publish:        { 'zh-CN': '发布',        'en-US': 'Publish' },
  saving:         { 'zh-CN': '保存中...',   'en-US': 'Saving...' },
  save:           { 'zh-CN': '保存',        'en-US': 'Save' },
  articleProps:   { 'zh-CN': '文章属性',    'en-US': 'Properties' },
  seoSettings:    { 'zh-CN': 'SEO 设置',    'en-US': 'SEO Settings' },
  slug:           { 'zh-CN': 'URL Slug',    'en-US': 'URL Slug' },
  category:       { 'zh-CN': '分类',        'en-US': 'Category' },
  selectCategory: { 'zh-CN': '— 选择分类 —', 'en-US': '— Select category —' },
  tags:           { 'zh-CN': '标签',        'en-US': 'Tags' },
  noTagsHint:     { 'zh-CN': '暂无标签，请先在标签管理中创建', 'en-US': 'No tags. Create some in Tags tab.' },
  cover:          { 'zh-CN': '封面图',      'en-US': 'Cover Image' },
  changeCover:    { 'zh-CN': '更换封面',    'en-US': 'Change Cover' },
  deleteCover:    { 'zh-CN': '删除',        'en-US': 'Remove' },
  selectCover:    { 'zh-CN': '选择封面',    'en-US': 'Select Cover' },
  excerptZh:      { 'zh-CN': '摘要（中文）', 'en-US': 'Excerpt (Chinese)' },
  excerptEn:      { 'zh-CN': '摘要（英文）', 'en-US': 'Excerpt (English)' },
  excerptZhPh:    { 'zh-CN': '文章简短描述...', 'en-US': 'Short description (ZH)...' },
  excerptEnPh:    { 'zh-CN': 'Article short description...', 'en-US': 'Article short description...' },
  // SEO
  metaTitleZh:    { 'zh-CN': 'Meta 标题（中文）', 'en-US': 'Meta Title (Chinese)' },
  metaTitleEn:    { 'zh-CN': 'Meta 标题（英文）', 'en-US': 'Meta Title (English)' },
  metaDescZh:     { 'zh-CN': 'Meta 描述（中文）', 'en-US': 'Meta Description (Chinese)' },
  metaDescEn:     { 'zh-CN': 'Meta 描述（英文）', 'en-US': 'Meta Description (English)' },
  metaTitlePh:    { 'zh-CN': '留空则使用文章标题', 'en-US': 'Leave blank to use article title' },
  metaDescPh:     { 'zh-CN': '留空则使用文章摘要', 'en-US': 'Leave blank to use excerpt' },
  ogImage:        { 'zh-CN': 'OG 分享图片',  'en-US': 'OG Image' },
  ogImagePh:      { 'zh-CN': '留空则使用封面图', 'en-US': 'Leave blank to use cover image' },
  noIndex:        { 'zh-CN': '禁止搜索引擎索引', 'en-US': 'No Index (noindex)' },
  titlePh:        { 'zh-CN': '文章标题...', 'en-US': 'Article title...' },
} as const;

interface ArticleEditorProps {
  article?: BlogArticle;
  categories: BlogCategory[];
  tags: BlogTag[];
  onSave: (data: Partial<BlogArticle>) => Promise<void>;
  onClose: () => void;
}

export function ArticleEditor({ article, categories, tags, onSave, onClose }: ArticleEditorProps) {
  const mode = useThemeStore(s => s.mode);
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = <T extends string>(o: Record<L, T>) => o[l];

  const [titleZh, setTitleZh] = useState(article?.title?.['zh-CN'] ?? '');
  const [titleEn, setTitleEn] = useState(article?.title?.['en-US'] ?? '');
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [category, setCategory] = useState(article?.category ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(article?.tags ?? []);
  const [cover, setCover] = useState(article?.cover ?? '');
  const [excerptZh, setExcerptZh] = useState(article?.excerpt?.['zh-CN'] ?? '');
  const [excerptEn, setExcerptEn] = useState(article?.excerpt?.['en-US'] ?? '');
  const [contentZh, setContentZh] = useState(article?.content?.['zh-CN'] ?? '');
  const [contentEn, setContentEn] = useState(article?.content?.['en-US'] ?? '');
  const [published, setPublished] = useState(article?.published ?? false);
  const [pinned, setPinned] = useState(article?.pinned ?? false);

  // SEO fields
  const [seoTitleZh, setSeoTitleZh] = useState(article?.seo?.metaTitle?.['zh-CN'] ?? '');
  const [seoTitleEn, setSeoTitleEn] = useState(article?.seo?.metaTitle?.['en-US'] ?? '');
  const [seoDescZh, setSeoDescZh] = useState(article?.seo?.metaDescription?.['zh-CN'] ?? '');
  const [seoDescEn, setSeoDescEn] = useState(article?.seo?.metaDescription?.['en-US'] ?? '');
  const [seoOgImage, setSeoOgImage] = useState(article?.seo?.ogImage ?? '');
  const [seoNoIndex, setSeoNoIndex] = useState(article?.seo?.noIndex ?? false);

  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showSeoImagePicker, setShowSeoImagePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<L>('zh-CN');
  const [showMeta, setShowMeta] = useState(true);
  const [showSeo, setShowSeo] = useState(false);

  useEffect(() => {
    if (!article && titleZh && !slug) {
      setSlug(titleZh
        .toLowerCase()
        .replace(/[^\w\s-\u4e00-\u9fa5]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60));
    }
  }, [titleZh, article, slug]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!titleZh.trim() || !slug.trim() || !category) return;
    setSaving(true);
    try {
      const hasSeo = seoTitleZh || seoTitleEn || seoDescZh || seoDescEn || seoOgImage || seoNoIndex;
      await onSave({
        title: { 'zh-CN': titleZh, 'en-US': titleEn },
        slug: slug.trim(),
        category,
        tags: selectedTags,
        cover: cover || '',
        excerpt: (excerptZh || excerptEn) ? { 'zh-CN': excerptZh, 'en-US': excerptEn } : undefined,
        content: { 'zh-CN': contentZh, 'en-US': contentEn },
        published,
        pinned,
        seo: hasSeo ? {
          metaTitle: (seoTitleZh || seoTitleEn) ? { 'zh-CN': seoTitleZh, 'en-US': seoTitleEn } : undefined,
          metaDescription: (seoDescZh || seoDescEn) ? { 'zh-CN': seoDescZh, 'en-US': seoDescEn } : undefined,
          ogImage: seoOgImage || undefined,
          noIndex: seoNoIndex || undefined,
        } : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors";
  const inputStyle = {
    background: 'var(--color-surface-alt)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: value ? 'var(--color-primary)' : 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
    >
      <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
        style={{ left: value ? '22px' : '2px' }} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
          {article ? tx(i18n.editArticle) : tx(i18n.newArticle)}
        </h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>{tx(i18n.pinned)}</span>
            <Toggle value={pinned} onChange={setPinned} />
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>{tx(i18n.publish)}</span>
            <Toggle value={published} onChange={setPublished} />
          </label>
          <button
            onClick={handleSave}
            disabled={saving || !titleZh.trim() || !slug.trim() || !category}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            {saving ? tx(i18n.saving) : tx(i18n.save)}
          </button>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Meta + SEO Panel */}
        <div className="w-72 flex-shrink-0 border-r overflow-y-auto"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>

          {/* Properties section */}
          <button
            onClick={() => setShowMeta(!showMeta)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-[var(--color-surface-alt)] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {tx(i18n.articleProps)}
            {showMeta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMeta && (
            <div className="px-4 pb-4 space-y-4">
              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.slug)} <span className="text-red-400">*</span>
                </label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value.replace(/\s/g, '-'))}
                  className={inputCls} style={inputStyle} placeholder="article-url-slug" />
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.category)} <span className="text-red-400">*</span>
                </label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls} style={inputStyle}>
                  <option value="">{tx(i18n.selectCategory)}</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name['zh-CN']}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.tags)}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => {
                    const tagColor = tag.useCustomColor && tag.color ? tag.color : 'var(--color-primary)';
                    const active = selectedTags.includes(tag.id);
                    return (
                      <button key={tag.id} onClick={() => toggleTag(tag.id)}
                        className="px-2 py-0.5 rounded-full text-xs transition-all"
                        style={{
                          background: active ? tagColor : 'var(--color-surface-alt)',
                          color: active ? 'white' : tagColor,
                          border: `1px solid ${active ? tagColor : 'var(--color-border)'}`,
                        }}>
                        {tag.name['zh-CN']}
                      </button>
                    );
                  })}
                  {tags.length === 0 && (
                    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noTagsHint)}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.cover)}
                </label>
                {cover ? (
                  <>
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-2">
                      <img src={cover} alt="封面" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowImagePicker(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs border transition-colors hover:bg-[var(--color-surface-alt)]"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <ImageIcon className="w-3.5 h-3.5" />
                        {tx(i18n.changeCover)}
                      </button>
                      <button onClick={() => setCover('')}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs border transition-colors hover:bg-red-500/10"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-error, #ef4444)' }}>
                        <X className="w-3.5 h-3.5" />
                        {tx(i18n.deleteCover)}
                      </button>
                    </div>
                  </>
                ) : (
                  <button onClick={() => setShowImagePicker(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm border transition-colors hover:bg-[var(--color-surface-alt)]"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                    <ImageIcon className="w-4 h-4" />
                    {tx(i18n.selectCover)}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.excerptZh)}
                </label>
                <textarea value={excerptZh} onChange={e => setExcerptZh(e.target.value)} rows={3}
                  className={inputCls + ' resize-none'} style={inputStyle} placeholder={tx(i18n.excerptZhPh)} />
              </div>

              <div>
                <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.excerptEn)}
                </label>
                <textarea value={excerptEn} onChange={e => setExcerptEn(e.target.value)} rows={3}
                  className={inputCls + ' resize-none'} style={inputStyle} placeholder={tx(i18n.excerptEnPh)} />
              </div>
            </div>
          )}

          {/* SEO section */}
          <div className="border-t" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-wide hover:bg-[var(--color-surface-alt)] transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <span className="flex items-center gap-1.5">
                <Search className="w-3 h-3" />
                {tx(i18n.seoSettings)}
              </span>
              {showSeo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSeo && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.metaTitleZh)}
                  </label>
                  <input type="text" value={seoTitleZh} onChange={e => setSeoTitleZh(e.target.value)}
                    className={inputCls} style={inputStyle} placeholder={tx(i18n.metaTitlePh)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.metaTitleEn)}
                  </label>
                  <input type="text" value={seoTitleEn} onChange={e => setSeoTitleEn(e.target.value)}
                    className={inputCls} style={inputStyle} placeholder={tx(i18n.metaTitlePh)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.metaDescZh)}
                  </label>
                  <textarea value={seoDescZh} onChange={e => setSeoDescZh(e.target.value)} rows={2}
                    className={inputCls + ' resize-none'} style={inputStyle} placeholder={tx(i18n.metaDescPh)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.metaDescEn)}
                  </label>
                  <textarea value={seoDescEn} onChange={e => setSeoDescEn(e.target.value)} rows={2}
                    className={inputCls + ' resize-none'} style={inputStyle} placeholder={tx(i18n.metaDescPh)} />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {tx(i18n.ogImage)}
                  </label>
                  <div className="flex gap-2">
                    <input type="text" value={seoOgImage} onChange={e => setSeoOgImage(e.target.value)}
                      className={inputCls + ' flex-1'} style={inputStyle} placeholder={tx(i18n.ogImagePh)} />
                    <button onClick={() => setShowSeoImagePicker(true)}
                      className="flex-shrink-0 p-2 rounded-xl border transition-colors hover:bg-[var(--color-surface-alt)]"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <input type="checkbox" checked={seoNoIndex} onChange={e => setSeoNoIndex(e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-xs">{tx(i18n.noIndex)}</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 pb-3 space-y-3 flex-shrink-0 border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex gap-2">
              {(['zh-CN', 'en-US'] as const).map(lang => (
                <button key={lang} onClick={() => setActiveTab(lang)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: activeTab === lang ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                    color: activeTab === lang ? 'white' : 'var(--color-text-muted)',
                  }}>
                  {lang === 'zh-CN' ? '中文' : 'English'}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={activeTab === 'zh-CN' ? titleZh : titleEn}
              onChange={e => activeTab === 'zh-CN' ? setTitleZh(e.target.value) : setTitleEn(e.target.value)}
              className="w-full text-xl font-bold bg-transparent outline-none border-b pb-2 transition-colors"
              style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
              placeholder={tx(i18n.titlePh)}
            />
          </div>

          <div className="flex-1 overflow-hidden" data-color-mode={mode === 'night' ? 'dark' : 'light'}>
            <MDEditor
              value={activeTab === 'zh-CN' ? contentZh : contentEn}
              onChange={val => activeTab === 'zh-CN' ? setContentZh(val ?? '') : setContentEn(val ?? '')}
              height="100%"
              preview="live"
              style={{ height: '100%', borderRadius: 0, border: 'none' }}
            />
          </div>
        </div>
      </div>

      {showImagePicker && (
        <ImagePicker value={cover} onChange={setCover} onClose={() => setShowImagePicker(false)} />
      )}
      {showSeoImagePicker && (
        <ImagePicker value={seoOgImage} onChange={setSeoOgImage} onClose={() => setShowSeoImagePicker(false)} />
      )}
    </div>
  );
}
