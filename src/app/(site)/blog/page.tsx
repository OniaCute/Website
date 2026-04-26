'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Eye, Tag, FolderOpen, Pin, Search, BookOpen, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import type { BlogArticleMeta, BlogMeta } from '@/types';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

const PAGE_SIZE = 9;

function BlogPageInner() {
  const { locale } = useLocaleStore();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<BlogArticleMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<BlogMeta>({ categories: [], tags: [], reactionEmojis: [] });

  // 从 URL 参数初始化过滤状态
  const [activeCategory, setActiveCategory] = useState(() => searchParams.get('category') ?? '');
  const [activeTags, setActiveTags] = useState<string[]>(() => {
    const t = searchParams.get('tag');
    return t ? [t] : [];
  });

  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const loadedOnce = useRef(false);
  const [views, setViews] = useState<Record<string, number>>({});

  const getCategoryColor = (category?: BlogMeta['categories'][number]) =>
    category?.useCustomColor && category.color ? category.color : 'var(--color-primary)';

  const getTagColor = (tag?: BlogMeta['tags'][number]) =>
    tag?.useCustomColor && tag.color ? tag.color : 'var(--color-primary)';

  useEffect(() => {
    if (!loadedOnce.current) setLoading(true);

    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });
    if (activeCategory) params.set('category', activeCategory);
    if (activeTags.length > 0) params.set('tags', activeTags.join(','));
    if (search) params.set('search', search);

    let cancelled = false;

    Promise.all([
      fetch(`/api/blog/articles?${params}`).then(r => r.json()),
      fetch('/api/blog/meta').then(r => r.json()),
    ]).then(([articlesJson, metaJson]) => {
      if (cancelled) return;
      if (articlesJson.code === 200) {
        setArticles(articlesJson.data.articles);
        setTotal(articlesJson.data.total);
      }
      if (metaJson.code === 200) setMeta(metaJson.data);
      loadedOnce.current = true;
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [page, activeCategory, activeTags, search]);

  useEffect(() => {
    articles.forEach(async (article) => {
      const res = await fetch(`/api/views/${encodeURIComponent(`article:${article.slug}`)}`);
      const json = await res.json();
      if (json.code === 200) {
        setViews(prev => ({ ...prev, [article.slug]: json.data.count }));
      }
    });
  }, [articles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleCategory = (id: string) => {
    setActiveCategory(prev => prev === id ? '' : id);
    setActiveTags([]);
    setPage(1);
  };

  const toggleTag = (id: string) => {
    setActiveTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setActiveCategory('');
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm"
            style={{ background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)', color: 'var(--color-primary)' }}>
            <BookOpen className="w-4 h-4" />
            {locale === 'zh-CN' ? '博客' : 'Blog'}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading text-gradient mb-3">
            {locale === 'zh-CN' ? '文章' : 'Articles'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {locale === 'zh-CN' ? `共 ${total} 篇文章` : `${total} articles`}
          </p>
        </motion.div>

        {/* Search + Nav */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1">
            <div
              className="flex items-center rounded-xl overflow-hidden glass"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <Search className="w-4 h-4 ml-3 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={locale === 'zh-CN' ? '搜索文章...' : 'Search articles...'}
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                style={{ color: 'var(--color-text)' }}
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 flex-shrink-0 self-stretch"
                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
              >
                <Search className="w-3.5 h-3.5" />
                {locale === 'zh-CN' ? '搜索' : 'Search'}
              </button>
            </div>
          </form>
          <Link
            href="/blog/notes"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all hover:bg-[var(--color-surface-alt)] glass"
            style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <Pencil className="w-4 h-4" />
            {locale === 'zh-CN' ? '随笔' : 'Notes'}
          </Link>
        </div>

        {/* Filter chips: categories */}
        {meta.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1.5 text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>
              <FolderOpen className="w-3.5 h-3.5" />
            </span>
            {meta.categories.map(cat => {
              const color = getCategoryColor(cat);
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className="px-3 py-1.5 rounded-full text-sm transition-all"
                  style={{
                    background: active ? color : 'var(--color-surface-alt)',
                    color: active ? 'white' : color,
                    border: `1px solid ${active ? color : 'var(--color-border)'}`,
                  }}
                >
                  {cat.name[locale]}
                </button>
              );
            })}
          </div>
        )}

        {/* Filter chips: tags（多选） */}
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="flex items-center gap-1.5 text-xs self-center" style={{ color: 'var(--color-text-muted)' }}>
              <Tag className="w-3.5 h-3.5" />
            </span>
            {meta.tags.map(tag => {
              const color = getTagColor(tag);
              const active = activeTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="px-3 py-1.5 rounded-full text-xs transition-all"
                  style={{
                    background: active ? color : 'transparent',
                    color: active ? 'white' : color,
                    border: `1px solid ${active ? color : 'var(--color-border)'}`,
                  }}
                >
                  {tag.name[locale]}
                </button>
              );
            })}
          </div>
        )}

        {/* Article Grid */}
        {loading && !loadedOnce.current ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--color-border)' }}>
                <div className="h-48" style={{ background: 'var(--color-surface-alt)' }} />
                <div className="p-5 space-y-3">
                  <div className="h-4 rounded w-3/4" style={{ background: 'var(--color-surface-alt)' }} />
                  <div className="h-3 rounded w-full" style={{ background: 'var(--color-surface-alt)' }} />
                  <div className="h-3 rounded w-2/3" style={{ background: 'var(--color-surface-alt)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              {locale === 'zh-CN' ? '暂无文章' : 'No articles yet'}
            </p>
          </div>
        ) : (
          <motion.div
            key={`${activeCategory}|${activeTags.join(',')}|${search}|${page}`}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          >
            {articles.map(article => {
              const category = meta.categories.find(c => c.id === article.category);
              const articleTags = article.tags
                .map(tagId => meta.tags.find(t => t.id === tagId))
                .filter(Boolean);
              const categoryColor = getCategoryColor(category);

              return (
                <motion.article
                  key={article.slug}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="block rounded-2xl overflow-hidden glass transition-all duration-300 hover:shadow-float hover:-translate-y-0.5 h-full"
                    style={{ border: '1px solid var(--color-border)' }}
                  >
                    {article.cover ? (
                      <div className="relative h-48 overflow-hidden">
                        <img src={article.cover} alt={article.title[locale]}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                        {article.pinned && (
                          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs text-white"
                            style={{ background: 'var(--color-primary)' }}>
                            <Pin className="w-3 h-3" />
                            {locale === 'zh-CN' ? '置顶' : 'Pinned'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-28 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 8%, var(--color-surface)), var(--color-surface-alt))' }}>
                        <BookOpen className="w-10 h-10 opacity-20" style={{ color: 'var(--color-primary)' }} />
                      </div>
                    )}

                    <div className="p-5">
                      {category && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs mb-2"
                          style={{ background: `color-mix(in srgb, ${categoryColor} 12%, transparent)`, color: categoryColor }}>
                          {category.name[locale]}
                        </span>
                      )}
                      <h2 className="font-bold text-base leading-snug mb-2 line-clamp-2"
                        style={{ color: 'var(--color-text)' }}>
                        {article.title[locale] || article.title['zh-CN']}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm leading-relaxed line-clamp-2 mb-3"
                          style={{ color: 'var(--color-text-muted)' }}>
                          {article.excerpt[locale] || article.excerpt['zh-CN']}
                        </p>
                      )}

                      {articleTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {articleTags.slice(0, 3).map(tag => {
                            if (!tag) return null;
                            const tagColor = getTagColor(tag);
                            return (
                              <span key={tag.id} className="px-1.5 py-0.5 rounded text-xs"
                                style={{ background: `color-mix(in srgb, ${tagColor} 12%, transparent)`, color: tagColor }}>
                                {tag.name[locale]}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.createdAt, locale)}
                        </span>
                        {(views[article.slug] ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {views[article.slug]}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl transition-all disabled:opacity-40 hover:bg-[var(--color-surface-alt)]"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: page === n ? 'var(--color-primary)' : 'transparent',
                  color: page === n ? 'white' : 'var(--color-text-muted)',
                  border: `1px solid ${page === n ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl transition-all disabled:opacity-40 hover:bg-[var(--color-surface-alt)]"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// useSearchParams 需要 Suspense 包裹
export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogPageInner />
    </Suspense>
  );
}
