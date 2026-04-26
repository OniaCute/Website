'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Calendar, Clock, Eye, Tag, FolderOpen, ArrowLeft, Pin } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { TableOfContents } from '@/components/site/blog/TableOfContents';
import { ReactionBar } from '@/components/site/blog/ReactionBar';
import type { BlogArticle, BlogMeta } from '@/types';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { locale } = useLocaleStore();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [meta, setMeta] = useState<BlogMeta>({ categories: [], tags: [], reactionEmojis: [] });
  const [viewCount, setViewCount] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewRecorded = useRef(false);

  const getCategoryColor = (category?: BlogMeta['categories'][number]) =>
    category?.useCustomColor && category.color ? category.color : 'var(--color-primary)';

  const getTagColor = (tag?: BlogMeta['tags'][number]) =>
    tag?.useCustomColor && tag.color ? tag.color : 'var(--color-primary)';

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      fetch(`/api/blog/articles/${slug}`).then(r => r.json()),
      fetch('/api/blog/meta').then(r => r.json()),
    ]).then(([articleJson, metaJson]) => {
      if (articleJson.code === 200) {
        setArticle(articleJson.data);
      } else {
        setNotFound(true);
      }
      if (metaJson.code === 200) setMeta(metaJson.data);
      setLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    if (!article || viewRecorded.current) return;
    viewRecorded.current = true;
    const contentKey = `article:${slug}`;
    fetch(`/api/views/${encodeURIComponent(contentKey)}`, { method: 'POST' })
      .then(r => r.json())
      .then(json => { if (json.code === 200) setViewCount(json.data.count); });
  }, [article, slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center justify-center gap-4">
        <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
          {locale === 'zh-CN' ? '文章不存在' : 'Article not found'}
        </p>
        <Link href="/blog" className="flex items-center gap-2 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}>
          <ArrowLeft className="w-4 h-4" />
          {locale === 'zh-CN' ? '返回博客' : 'Back to Blog'}
        </Link>
      </div>
    );
  }

  const category = meta.categories.find(c => c.id === article.category);
  const articleTags = article.tags.map(tagId => meta.tags.find(t => t.id === tagId)).filter(Boolean);
  const content = article.content[locale] || article.content['zh-CN'];
  const title = article.title[locale] || article.title['zh-CN'];
  const contentKey = `article:${slug}`;
  const categoryColor = getCategoryColor(category);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm transition-all hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}>
            <ArrowLeft className="w-4 h-4" />
            {locale === 'zh-CN' ? '博客' : 'Blog'}
          </Link>
        </motion.div>

        <div className="flex gap-8">
          {/* Main Article */}
          <motion.article
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Cover */}
            {article.cover && (
              <div className="rounded-2xl overflow-hidden mb-8 aspect-video">
                <img src={article.cover} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {article.pinned && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    <Pin className="w-3 h-3" />
                    {locale === 'zh-CN' ? '置顶' : 'Pinned'}
                  </span>
                )}
                {category && (
                  <Link href={`/blog?category=${category.id}`}
                    className="px-2.5 py-1 rounded-full text-xs transition-colors hover:opacity-80"
                    style={{ background: `color-mix(in srgb, ${categoryColor} 12%, transparent)`, color: categoryColor }}>
                    <FolderOpen className="w-3 h-3 inline mr-1" />
                    {category.name[locale]}
                  </Link>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading leading-tight mb-6"
                style={{ color: 'var(--color-text)' }}>
                {title}
              </h1>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 text-sm pb-6 border-b"
                style={{ color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.createdAt, locale)}
                </span>
                {article.updatedAt !== article.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {locale === 'zh-CN' ? '更新于' : 'Updated'} {formatDate(article.updatedAt, locale)}
                  </span>
                )}
                {viewCount > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {viewCount} {locale === 'zh-CN' ? '次浏览' : 'views'}
                  </span>
                )}
              </div>

              {/* Tags */}
              {articleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Tag className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                  {articleTags.map(tag => tag && (
                    (() => {
                      const tagColor = getTagColor(tag);
                      return (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.id}`}
                      className="px-2.5 py-1 rounded-full text-xs transition-all hover:opacity-80"
                      style={{
                        background: `color-mix(in srgb, ${tagColor} 12%, transparent)`,
                        color: tagColor,
                        border: `1px solid color-mix(in srgb, ${tagColor} 40%, transparent)`,
                      }}
                    >
                      {tag.name[locale]}
                    </Link>
                      );
                    })()
                  ))}
                </div>
              )}
            </div>

            {/* Article Body */}
            <div
              className="prose prose-themed max-w-none"
              id="article-content"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h1: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h1 id={id} {...props}>{children}</h1>;
                  },
                  h2: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h2 id={id} {...props}>{children}</h2>;
                  },
                  h3: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h3 id={id} {...props}>{children}</h3>;
                  },
                  h4: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h4 id={id} {...props}>{children}</h4>;
                  },
                  h5: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h5 id={id} {...props}>{children}</h5>;
                  },
                  h6: ({ children, ...props }) => {
                    const text = String(children);
                    const id = `heading-${text.toLowerCase().replace(/[^\w\u4e00-\u9fa5\s-]/g, '').replace(/\s+/g, '-').slice(0, 50)}`;
                    return <h6 id={id} {...props}>{children}</h6>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>

            {/* Reaction */}
            <div className="mt-12 pt-8 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <ReactionBar contentKey={contentKey} emojis={meta.reactionEmojis} />
            </div>
          </motion.article>

          {/* TOC Sidebar */}
          <TableOfContents content={content} />
        </div>
      </div>
    </div>
  );
}
