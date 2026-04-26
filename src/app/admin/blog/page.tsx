'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Pin, Tag, FolderOpen,
  Smile, GripVertical, Save, X, Search,
} from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { routeProgress } from '@/components/ui/RouteProgressBar';
import { ArticleEditor } from '@/components/admin/blog/ArticleEditor';
import { NoteEditor } from '@/components/admin/blog/NoteEditor';
import { v4 as uuidv4 } from 'uuid';
import type { BlogArticleMeta, BlogNote, BlogMeta, BlogCategory, BlogTag } from '@/types';

type TabId = 'articles' | 'notes' | 'categories' | 'tags' | 'settings';
type L = 'zh-CN' | 'en-US';

const i18n = {
  pageTitle:        { 'zh-CN': '博客管理',                   'en-US': 'Blog Management' },
  pageDesc:         { 'zh-CN': '管理文章、随笔、分类和标签', 'en-US': 'Manage articles, notes, categories and tags' },
  tabs: {
    articles:   { 'zh-CN': '文章',    'en-US': 'Articles' },
    notes:      { 'zh-CN': '随笔',    'en-US': 'Notes' },
    categories: { 'zh-CN': '分类',    'en-US': 'Categories' },
    tags:       { 'zh-CN': '标签',    'en-US': 'Tags' },
    settings:   { 'zh-CN': 'Reaction','en-US': 'Reaction' },
  },
  // Articles
  searchArticles:   { 'zh-CN': '搜索文章标题或摘要...', 'en-US': 'Search by title or excerpt...' },
  newArticle:       { 'zh-CN': '新建文章',   'en-US': 'New Article' },
  totalArticles:    { 'zh-CN': (n: number) => `共 ${n} 篇文章`, 'en-US': (n: number) => `${n} article${n !== 1 ? 's' : ''}` },
  noArticles:       { 'zh-CN': '暂无文章，点击「新建文章」开始创作', 'en-US': 'No articles yet. Click "New Article" to start.' },
  published:        { 'zh-CN': '已发布', 'en-US': 'Published' },
  draft:            { 'zh-CN': '草稿',   'en-US': 'Draft' },
  unpublish:        { 'zh-CN': '取消发布', 'en-US': 'Unpublish' },
  publish:          { 'zh-CN': '发布',    'en-US': 'Publish' },
  edit:             { 'zh-CN': '编辑',    'en-US': 'Edit' },
  delete:           { 'zh-CN': '删除',    'en-US': 'Delete' },
  confirmDeleteArticle: { 'zh-CN': '确认删除这篇文章？此操作不可撤销。', 'en-US': 'Delete this article? This cannot be undone.' },
  // Notes
  searchNotes:      { 'zh-CN': '搜索随笔内容...', 'en-US': 'Search note content...' },
  newNote:          { 'zh-CN': '新建随笔', 'en-US': 'New Note' },
  totalNotes:       { 'zh-CN': (n: number) => `共 ${n} 条随笔`, 'en-US': (n: number) => `${n} note${n !== 1 ? 's' : ''}` },
  noNotes:          { 'zh-CN': '暂无随笔，点击「新建随笔」开始记录', 'en-US': 'No notes yet. Click "New Note" to start.' },
  noContent:        { 'zh-CN': '（无内容）', 'en-US': '(no content)' },
  confirmDeleteNote:{ 'zh-CN': '确认删除这条随笔？', 'en-US': 'Delete this note?' },
  // Categories
  addCategory:      { 'zh-CN': '添加分类',    'en-US': 'Add Category' },
  nameZh:           { 'zh-CN': '名称（中文）*','en-US': 'Name (Chinese) *' },
  nameEn:           { 'zh-CN': '名称（英文）', 'en-US': 'Name (English)' },
  slugLabel:        { 'zh-CN': 'Slug *',       'en-US': 'Slug *' },
  descZh:           { 'zh-CN': '描述（中文）', 'en-US': 'Description (Chinese)' },
  descEn:           { 'zh-CN': '描述（英文）', 'en-US': 'Description (English)' },
  optionalDesc:     { 'zh-CN': '可选描述',     'en-US': 'Optional description' },
  enableCustomColor:{ 'zh-CN': '启用自定义颜色','en-US': 'Enable custom color' },
  customColor:      { 'zh-CN': '自定义颜色',   'en-US': 'Custom color' },
  noCategories:     { 'zh-CN': '暂无分类',     'en-US': 'No categories yet' },
  saveCategories:   { 'zh-CN': '保存分类',     'en-US': 'Save Categories' },
  // Tags
  addTag:           { 'zh-CN': '添加标签',     'en-US': 'Add Tag' },
  colorLabel:       { 'zh-CN': '颜色',         'en-US': 'Color' },
  noTags:           { 'zh-CN': '暂无标签',     'en-US': 'No tags yet' },
  saveTags:         { 'zh-CN': '保存标签',     'en-US': 'Save Tags' },
  // Settings
  reactionTitle:    { 'zh-CN': 'Reaction Emoji 设置', 'en-US': 'Reaction Emoji Settings' },
  reactionDesc:     { 'zh-CN': '配置文章和随笔页面可用的 Emoji 表情，读者可以使用这些表情对内容进行 Reaction', 'en-US': 'Configure Emoji reactions available on articles and notes.' },
  emojiPlaceholder: { 'zh-CN': '粘贴或输入 Emoji', 'en-US': 'Paste or type Emoji' },
  emojiHint:        { 'zh-CN': '支持所有 Emoji，包括 ZWJ 组合表情（如 😶‍🌫️👨‍👩‍👧‍👦）。输入后框内右侧会预览实际存储的 Emoji。', 'en-US': 'Supports all Emoji including ZWJ sequences (e.g. 😶‍🌫️👨‍👩‍👧‍👦). A preview appears on the right as you type.' },
  add:              { 'zh-CN': '添加',   'en-US': 'Add' },
  saving:           { 'zh-CN': '保存中...', 'en-US': 'Saving...' },
  saveSettings:     { 'zh-CN': '保存设置', 'en-US': 'Save Settings' },
  noTagsHint:       { 'zh-CN': '暂无标签，请先在标签管理中创建', 'en-US': 'No tags yet. Create some in the Tags tab.' },
} as const;

function formatDate(iso: string, locale: L) {
  return new Date(iso).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export default function AdminBlogPage() {
  const { locale } = useLocaleStore();
  const l = locale as L;
  const tx = <T extends string>(o: Record<L, T>) => o[l];

  const [tab, setTab] = useState<TabId>('articles');

  const [articles, setArticles] = useState<BlogArticleMeta[]>([]);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articleSearch, setArticleSearch] = useState('');
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [creatingArticle, setCreatingArticle] = useState(false);

  const [notes, setNotes] = useState<BlogNote[]>([]);
  const [notesTotal, setNotesTotal] = useState(0);
  const [noteSearch, setNoteSearch] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [creatingNote, setCreatingNote] = useState(false);

  const [meta, setMeta] = useState<BlogMeta>({ categories: [], tags: [], reactionEmojis: [] });
  const [savingMeta, setSavingMeta] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const [newCatNameZh, setNewCatNameZh] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDescZh, setNewCatDescZh] = useState('');
  const [newCatDescEn, setNewCatDescEn] = useState('');
  const [newCatColor, setNewCatColor] = useState('#60a5fa');
  const [newCatUseCustomColor, setNewCatUseCustomColor] = useState(false);

  const [newTagNameZh, setNewTagNameZh] = useState('');
  const [newTagNameEn, setNewTagNameEn] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');
  const [newTagColor, setNewTagColor] = useState('#60a5fa');
  const [newTagUseCustomColor, setNewTagUseCustomColor] = useState(false);

  const [emojiInput, setEmojiInput] = useState('');

  const getCategoryColor = (category?: BlogCategory) =>
    category?.useCustomColor && category.color ? category.color : 'var(--color-primary)';

  const getTagColor = (tag?: BlogTag) =>
    tag?.useCustomColor && tag.color ? tag.color : 'var(--color-primary)';

  const fetchArticles = useCallback(async () => {
    const q = articleSearch ? `&search=${encodeURIComponent(articleSearch)}` : '';
    const res = await fetch(`/api/blog/articles?published=false&limit=50${q}`);
    const json = await res.json();
    if (json.code === 200) { setArticles(json.data.articles); setArticlesTotal(json.data.total); }
  }, [articleSearch]);

  const fetchNotes = useCallback(async () => {
    const q = noteSearch ? `&search=${encodeURIComponent(noteSearch)}` : '';
    const res = await fetch(`/api/blog/notes?published=false&limit=50${q}`);
    const json = await res.json();
    if (json.code === 200) { setNotes(json.data.notes); setNotesTotal(json.data.total); }
  }, [noteSearch]);

  const fetchMeta = useCallback(async () => {
    const res = await fetch('/api/blog/meta');
    const json = await res.json();
    if (json.code === 200) setMeta(json.data);
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => { fetchMeta(); }, [fetchMeta]);

  const getArticleForEdit = useCallback(async (slug: string) => {
    const res = await fetch(`/api/blog/articles/${slug}`);
    const json = await res.json();
    return json.code === 200 ? json.data : null;
  }, []);

  const handleArticleSave = async (data: Record<string, unknown>) => {
    const isNew = creatingArticle;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/blog/articles' : `/api/blog/articles/${editingArticle}`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setCreatingArticle(false);
    setEditingArticle(null);
    await fetchArticles();
  };

  const handleArticleDelete = async (slug: string) => {
    if (!confirm(tx(i18n.confirmDeleteArticle))) return;
    await fetch(`/api/blog/articles/${slug}`, { method: 'DELETE' });
    await fetchArticles();
  };

  const handleArticleTogglePublish = async (article: BlogArticleMeta) => {
    await fetch(`/api/blog/articles/${article.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !article.published }),
    });
    await fetchArticles();
  };

  const getNoteForEdit = useCallback(async (id: string) => {
    const res = await fetch(`/api/blog/notes/${id}`);
    const json = await res.json();
    return json.code === 200 ? json.data : null;
  }, []);

  const handleNoteSave = async (data: Record<string, unknown>) => {
    const isNew = creatingNote;
    const method = isNew ? 'POST' : 'PUT';
    const url = isNew ? '/api/blog/notes' : `/api/blog/notes/${editingNote}`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setCreatingNote(false);
    setEditingNote(null);
    await fetchNotes();
  };

  const handleNoteDelete = async (id: string) => {
    if (!confirm(tx(i18n.confirmDeleteNote))) return;
    await fetch(`/api/blog/notes/${id}`, { method: 'DELETE' });
    await fetchNotes();
  };

  const handleNoteTogglePublish = async (note: BlogNote) => {
    await fetch(`/api/blog/notes/${note.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !note.published }),
    });
    await fetchNotes();
  };

  const handleAddCategory = () => {
    if (!newCatNameZh.trim() || !newCatSlug.trim()) return;
    const newCat: BlogCategory = {
      id: uuidv4(),
      name: { 'zh-CN': newCatNameZh, 'en-US': newCatNameEn || newCatNameZh },
      slug: newCatSlug,
      description: (newCatDescZh || newCatDescEn) ? { 'zh-CN': newCatDescZh, 'en-US': newCatDescEn } : undefined,
      order: meta.categories.length,
      color: newCatColor,
      useCustomColor: newCatUseCustomColor,
    };
    setMeta(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
    setNewCatNameZh(''); setNewCatNameEn(''); setNewCatSlug(''); setNewCatDescZh(''); setNewCatDescEn(''); setNewCatColor('#60a5fa'); setNewCatUseCustomColor(false);
  };

  const handleDeleteCategory = (id: string) => {
    setMeta(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }));
  };

  const handleAddTag = () => {
    if (!newTagNameZh.trim() || !newTagSlug.trim()) return;
    const newTag: BlogTag = {
      id: uuidv4(),
      name: { 'zh-CN': newTagNameZh, 'en-US': newTagNameEn || newTagNameZh },
      slug: newTagSlug,
      color: newTagColor,
      useCustomColor: newTagUseCustomColor,
    };
    setMeta(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
    setNewTagNameZh(''); setNewTagNameEn(''); setNewTagSlug(''); setNewTagColor('#60a5fa'); setNewTagUseCustomColor(false);
  };

  const handleDeleteTag = (id: string) => {
    setMeta(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== id) }));
  };

  function extractFirstEmoji(input: string): string {
    const trimmed = input.trim();
    if (!trimmed) return '';
    const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });
    const first = Array.from(segmenter.segment(trimmed))[0];
    return first?.segment ?? '';
  }

  const handleAddEmoji = () => {
    const emoji = extractFirstEmoji(emojiInput);
    if (!emoji || meta.reactionEmojis.includes(emoji)) return;
    setMeta(prev => ({ ...prev, reactionEmojis: [...prev.reactionEmojis, emoji] }));
    setEmojiInput('');
  };

  const handleRemoveEmoji = (emoji: string) => {
    setMeta(prev => ({ ...prev, reactionEmojis: prev.reactionEmojis.filter(e => e !== emoji) }));
  };

  const handleSaveMeta = async () => {
    setSavingMeta(true);
    setSaveNotice(null);
    try {
      const res = await fetch('/api/blog/meta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta),
      });
      const json = await res.json() as { code: number; data?: { pruned?: { removedKeys: number; removedEmojis: number } } };
      if (json.code === 200 && json.data?.pruned) {
        const { removedKeys, removedEmojis } = json.data.pruned;
        const parts: string[] = [];
        if (removedKeys > 0) parts.push(l === 'zh-CN' ? `${removedKeys} 条已删除内容的 Reaction 记录` : `${removedKeys} orphaned content reaction${removedKeys > 1 ? 's' : ''}`);
        if (removedEmojis > 0) parts.push(l === 'zh-CN' ? `${removedEmojis} 条已移除表情的 Reaction 记录` : `${removedEmojis} reaction${removedEmojis > 1 ? 's' : ''} from removed emoji${removedEmojis > 1 ? 's' : ''}`);
        if (parts.length > 0) {
          setSaveNotice(l === 'zh-CN' ? `已自动清理：${parts.join('、')}` : `Cleaned up: ${parts.join(', ')}`);
        }
      }
    } finally {
      setSavingMeta(false);
    }
  };

  const [articleEditorData, setArticleEditorData] = useState<import('@/types').BlogArticle | null>(null);
  const [noteEditorData, setNoteEditorData] = useState<BlogNote | null>(null);

  const openArticleEdit = async (slug: string) => {
    routeProgress.start();
    const data = await getArticleForEdit(slug);
    setArticleEditorData(data);
    setEditingArticle(slug);
    routeProgress.start();
  };

  const openNoteEdit = async (id: string) => {
    routeProgress.start();
    const data = await getNoteForEdit(id);
    setNoteEditorData(data);
    setEditingNote(id);
    routeProgress.start();
  };

  const inputCls = "w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors";
  const inputStyle = {
    background: 'var(--color-surface-alt)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };

  const tabItems: { id: TabId; icon: React.ElementType }[] = [
    { id: 'articles',   icon: FolderOpen },
    { id: 'notes',      icon: Pencil },
    { id: 'categories', icon: FolderOpen },
    { id: 'tags',       icon: Tag },
    { id: 'settings',   icon: Smile },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{tx(i18n.pageTitle)}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.pageDesc)}</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
            {tabItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all relative"
                style={{ color: tab === id ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
              >
                <Icon className="w-4 h-4" />
                {tx(i18n.tabs[id])}
                {tab === id && (
                  <motion.div
                    layoutId="blog-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── Articles Tab ── */}
            {tab === 'articles' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder={tx(i18n.searchArticles)}
                      value={articleSearch}
                      onChange={e => setArticleSearch(e.target.value)}
                      className={inputCls + ' pl-9'}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={() => { setCreatingArticle(true); setArticleEditorData(null); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.newArticle)}
                  </button>
                </div>

                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {i18n.totalArticles[l](articlesTotal)}
                </div>

                <div className="space-y-2">
                  {articles.length === 0 ? (
                    <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {tx(i18n.noArticles)}
                    </div>
                  ) : (
                    articles.map(article => (
                      <div
                        key={article.slug}
                        className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-[var(--color-surface-alt)]"
                        style={{ border: '1px solid var(--color-border)' }}
                      >
                        {article.cover && (
                          <img src={article.cover} alt="" className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {article.pinned && <Pin className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />}
                            <span className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>
                              {article.title[l] || article.title['zh-CN']}
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-full text-xs flex-shrink-0"
                              style={{
                                background: article.published ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                                color: article.published ? 'var(--color-success)' : 'var(--color-text-muted)',
                              }}
                            >
                              {article.published ? tx(i18n.published) : tx(i18n.draft)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            <span>{formatDate(article.createdAt, l)}</span>
                            {article.category && (() => {
                              const category = meta.categories.find(c => c.id === article.category);
                              return (
                                <span style={{ color: getCategoryColor(category) }}>
                                  {category?.name[l] ?? article.category}
                                </span>
                              );
                            })()}
                            {article.tags.map(tagId => {
                              const tag = meta.tags.find(t => t.id === tagId);
                              const tagColor = getTagColor(tag);
                              return tag ? (
                                <span key={tagId} className="px-1.5 py-0.5 rounded-full"
                                  style={{ background: `color-mix(in srgb, ${tagColor} 12%, transparent)`, color: tagColor }}>
                                  {tag.name[l]}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleArticleTogglePublish(article)}
                            className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                            title={article.published ? tx(i18n.unpublish) : tx(i18n.publish)}
                          >
                            {article.published
                              ? <Eye className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                              : <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                          </button>
                          <button
                            onClick={() => openArticleEdit(article.slug)}
                            className="p-2 rounded-lg hover:bg-[var(--color-surface-alt)] transition-colors"
                            title={tx(i18n.edit)}
                          >
                            <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                          </button>
                          <button
                            onClick={() => handleArticleDelete(article.slug)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title={tx(i18n.delete)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Notes Tab ── */}
            {tab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                    <input
                      type="text"
                      placeholder={tx(i18n.searchNotes)}
                      value={noteSearch}
                      onChange={e => setNoteSearch(e.target.value)}
                      className={inputCls + ' pl-9'}
                      style={inputStyle}
                    />
                  </div>
                  <button
                    onClick={() => { setCreatingNote(true); setNoteEditorData(null); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.newNote)}
                  </button>
                </div>

                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {i18n.totalNotes[l](notesTotal)}
                </div>

                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-12 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {tx(i18n.noNotes)}
                    </div>
                  ) : (
                    notes.map(note => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl transition-colors"
                        style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-alt)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-3" style={{ color: 'var(--color-text)' }}>
                              {note.content[l] || note.content['zh-CN'] || tx(i18n.noContent)}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              <span>{formatDate(note.createdAt, l)}</span>
                              <span
                                className="px-2 py-0.5 rounded-full"
                                style={{
                                  background: note.published ? 'color-mix(in srgb, var(--color-success) 15%, transparent)' : 'color-mix(in srgb, var(--color-text-muted) 15%, transparent)',
                                  color: note.published ? 'var(--color-success)' : 'var(--color-text-muted)',
                                }}
                              >
                                {note.published ? tx(i18n.published) : tx(i18n.draft)}
                              </span>
                              {note.tags?.map(tagId => {
                                const tag = meta.tags.find(t => t.id === tagId);
                                const tagColor = getTagColor(tag);
                                return tag ? (
                                  <span key={tagId} className="px-1.5 py-0.5 rounded-full"
                                    style={{ background: `color-mix(in srgb, ${tagColor} 12%, transparent)`, color: tagColor }}>
                                    {tag.name[l]}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button onClick={() => handleNoteTogglePublish(note)} className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                              {note.published
                                ? <Eye className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                                : <EyeOff className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />}
                            </button>
                            <button onClick={() => openNoteEdit(note.id)} className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors">
                              <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                            </button>
                            <button onClick={() => handleNoteDelete(note.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Categories Tab ── */}
            {tab === 'categories' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{tx(i18n.addCategory)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameZh)}</label>
                      <input type="text" value={newCatNameZh} onChange={e => setNewCatNameZh(e.target.value)} className={inputCls} style={inputStyle} placeholder={l === 'zh-CN' ? '分类名称' : 'Category name (ZH)'} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameEn)}</label>
                      <input type="text" value={newCatNameEn} onChange={e => setNewCatNameEn(e.target.value)} className={inputCls} style={inputStyle} placeholder="Category name" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.slugLabel)}</label>
                      <input type="text" value={newCatSlug} onChange={e => setNewCatSlug(e.target.value.replace(/\s/g, '-'))} className={inputCls} style={inputStyle} placeholder="category-slug" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.descZh)}</label>
                      <input type="text" value={newCatDescZh} onChange={e => setNewCatDescZh(e.target.value)} className={inputCls} style={inputStyle} placeholder={tx(i18n.optionalDesc)} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.descEn)}</label>
                      <input type="text" value={newCatDescEn} onChange={e => setNewCatDescEn(e.target.value)} className={inputCls} style={inputStyle} placeholder="Optional description" />
                    </div>
                    <div className="col-span-2 flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        <input type="checkbox" checked={newCatUseCustomColor} onChange={e => setNewCatUseCustomColor(e.target.checked)} />
                        {tx(i18n.enableCustomColor)}
                      </label>
                      {newCatUseCustomColor && (
                        <div className="flex items-center gap-2">
                          <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)}
                            className="w-10 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                            style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }} />
                          <input type="text" value={newCatColor} onChange={e => setNewCatColor(e.target.value)}
                            className={inputCls + ' flex-1'} style={inputStyle} placeholder="#60a5fa" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCatNameZh.trim() || !newCatSlug.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.addCategory)}
                  </button>
                </div>

                <div className="space-y-2">
                  {meta.categories.length === 0 ? (
                    <div className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noCategories)}</div>
                  ) : (
                    meta.categories.map(cat => {
                      const categoryColor = getCategoryColor(cat);
                      return (
                        <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ border: '1px solid var(--color-border)' }}>
                          <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: categoryColor }}>
                                {cat.name['zh-CN']}
                                {cat.name['en-US'] && cat.name['en-US'] !== cat.name['zh-CN'] && (
                                  <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>/ {cat.name['en-US']}</span>
                                )}
                              </span>
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                                {cat.slug}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                                <input
                                  type="checkbox"
                                  checked={cat.useCustomColor ?? false}
                                  onChange={e => setMeta(prev => ({
                                    ...prev,
                                    categories: prev.categories.map(c =>
                                      c.id === cat.id ? { ...c, useCustomColor: e.target.checked } : c
                                    ),
                                  }))}
                                />
                                {tx(i18n.customColor)}
                              </label>
                              {cat.useCustomColor && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="color"
                                    value={cat.color ?? '#60a5fa'}
                                    onChange={e => setMeta(prev => ({
                                      ...prev,
                                      categories: prev.categories.map(c =>
                                        c.id === cat.id ? { ...c, color: e.target.value } : c
                                      ),
                                    }))}
                                    className="w-7 h-7 rounded cursor-pointer border-0 p-0.5"
                                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                                  />
                                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{cat.color ?? '#60a5fa'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                >
                  <Save className="w-4 h-4" />
                  {savingMeta ? tx(i18n.saving) : tx(i18n.saveCategories)}
                </button>
              </div>
            )}

            {/* ── Tags Tab ── */}
            {tab === 'tags' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                  <h3 className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{tx(i18n.addTag)}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameZh)}</label>
                      <input type="text" value={newTagNameZh} onChange={e => setNewTagNameZh(e.target.value)} className={inputCls} style={inputStyle} placeholder={l === 'zh-CN' ? '标签名称' : 'Tag name (ZH)'} />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.nameEn)}</label>
                      <input type="text" value={newTagNameEn} onChange={e => setNewTagNameEn(e.target.value)} className={inputCls} style={inputStyle} placeholder="Tag name" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.slugLabel)}</label>
                      <input type="text" value={newTagSlug} onChange={e => setNewTagSlug(e.target.value.replace(/\s/g, '-'))} className={inputCls} style={inputStyle} placeholder="tag-slug" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.colorLabel)}</label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          <input type="checkbox" checked={newTagUseCustomColor} onChange={e => setNewTagUseCustomColor(e.target.checked)} />
                          {tx(i18n.enableCustomColor)}
                        </label>
                        {newTagUseCustomColor && (
                          <div className="flex items-center gap-2">
                            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                              className="w-10 h-9 rounded-lg cursor-pointer border-0 p-0.5"
                              style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }} />
                            <input type="text" value={newTagColor} onChange={e => setNewTagColor(e.target.value)}
                              className={inputCls + ' flex-1'} style={inputStyle} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddTag}
                    disabled={!newTagNameZh.trim() || !newTagSlug.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.addTag)}
                  </button>
                </div>

                <div className="space-y-2">
                  {meta.tags.length === 0 ? (
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.noTags)}</div>
                  ) : (
                    meta.tags.map(tag => {
                      const tagColor = getTagColor(tag);
                      return (
                        <div key={tag.id} className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ border: '1px solid var(--color-border)' }}>
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: tagColor }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium" style={{ color: tagColor }}>
                                {tag.name['zh-CN']}
                                {tag.name['en-US'] !== tag.name['zh-CN'] && (
                                  <span className="ml-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>/ {tag.name['en-US']}</span>
                                )}
                              </span>
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
                                {tag.slug}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                                <input
                                  type="checkbox"
                                  checked={tag.useCustomColor ?? false}
                                  onChange={e => setMeta(prev => ({
                                    ...prev,
                                    tags: prev.tags.map(t =>
                                      t.id === tag.id ? { ...t, useCustomColor: e.target.checked } : t
                                    ),
                                  }))}
                                />
                                {tx(i18n.customColor)}
                              </label>
                              {tag.useCustomColor && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="color"
                                    value={tag.color ?? '#60a5fa'}
                                    onChange={e => setMeta(prev => ({
                                      ...prev,
                                      tags: prev.tags.map(t =>
                                        t.id === tag.id ? { ...t, color: e.target.value } : t
                                      ),
                                    }))}
                                    className="w-7 h-7 rounded cursor-pointer border-0 p-0.5"
                                    style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
                                  />
                                  <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{tag.color ?? '#60a5fa'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteTag(tag.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0">
                            <X className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                <button
                  onClick={handleSaveMeta}
                  disabled={savingMeta}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                >
                  <Save className="w-4 h-4" />
                  {savingMeta ? tx(i18n.saving) : tx(i18n.saveTags)}
                </button>
              </div>
            )}

            {/* ── Settings Tab (Emoji) ── */}
            {tab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>{tx(i18n.reactionTitle)}</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{tx(i18n.reactionDesc)}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {meta.reactionEmojis.map(emoji => (
                    <div key={emoji} className="flex items-center gap-1.5 px-3 py-2 rounded-xl group"
                      style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}>
                      <span className="text-xl">{emoji}</span>
                      <button onClick={() => handleRemoveEmoji(emoji)}
                        className="p-0.5 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input
                      type="text"
                      value={emojiInput}
                      onChange={e => setEmojiInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddEmoji(); } }}
                      className={inputCls + ' w-36 pr-10'}
                      style={inputStyle}
                      placeholder={tx(i18n.emojiPlaceholder)}
                    />
                    {emojiInput.trim() && (
                      <span
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base leading-none pointer-events-none"
                        style={{ fontFamily: 'initial' }}
                      >
                        {extractFirstEmoji(emojiInput)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleAddEmoji}
                    disabled={!extractFirstEmoji(emojiInput)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Plus className="w-4 h-4" />
                    {tx(i18n.add)}
                  </button>
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {tx(i18n.emojiHint)}
                </p>

                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={handleSaveMeta}
                    disabled={savingMeta}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                  >
                    <Save className="w-4 h-4" />
                    {savingMeta ? tx(i18n.saving) : tx(i18n.saveSettings)}
                  </button>
                  {saveNotice && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{saveNotice}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {(creatingArticle || editingArticle) && (
        <ArticleEditor
          article={articleEditorData ?? undefined}
          categories={meta.categories}
          tags={meta.tags}
          onSave={handleArticleSave as never}
          onClose={() => { setCreatingArticle(false); setEditingArticle(null); setArticleEditorData(null); }}
        />
      )}

      {(creatingNote || editingNote) && (
        <NoteEditor
          note={noteEditorData ?? undefined}
          tags={meta.tags}
          onSave={handleNoteSave as never}
          onClose={() => { setCreatingNote(false); setEditingNote(null); setNoteEditorData(null); }}
        />
      )}
    </>
  );
}
