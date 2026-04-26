'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { ArrowLeft, Pencil, Tag, ChevronDown } from 'lucide-react';
import { useLocaleStore } from '@/store/localeStore';
import { ReactionBar } from '@/components/site/blog/ReactionBar';
import type { BlogNote, BlogMeta } from '@/types';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const PAGE_SIZE = 15;
const GUTTER = 20;

export default function BlogNotesPage() {
  const { locale } = useLocaleStore();
  const [notes, setNotes] = useState<BlogNote[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [meta, setMeta] = useState<BlogMeta>({ categories: [], tags: [], reactionEmojis: [] });
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadedOnce = useRef(false);

  const getTagColor = (tag?: BlogMeta['tags'][number]) =>
    tag?.useCustomColor && tag.color ? tag.color : 'var(--color-primary)';

  // 切换 tag 时重置到第 1 页并清空列表
  useEffect(() => {
    setPage(1);
    setNotes([]);
    setHasMore(false);
    setTotal(0);
  }, [activeTag]);

  // 数据获取：依赖 page 和 activeTag
  useEffect(() => {
    if (page === 1 && !loadedOnce.current) setLoading(true);
    else if (page > 1) setLoadingMore(true);

    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    // activeTag 为空字符串时不传参，后端视为不过滤
    if (activeTag) params.set('tag', activeTag);

    let cancelled = false;

    Promise.all([
      fetch(`/api/blog/notes?${params}`).then(r => r.json()),
      fetch('/api/blog/meta').then(r => r.json()),
    ]).then(([notesJson, metaJson]) => {
      if (cancelled) return;

      if (notesJson.code === 200) {
        const newNotes = notesJson.data.notes as BlogNote[];
        setNotes(prev => page === 1 ? newNotes : [...prev, ...newNotes]);
        setTotal(notesJson.data.total);
        setHasMore(page * PAGE_SIZE < notesJson.data.total);
      }
      if (metaJson.code === 200) setMeta(metaJson.data);

      loadedOnce.current = true;
      setLoading(false);
      setLoadingMore(false);
    });

    return () => { cancelled = true; };
  }, [page, activeTag]);

  const loadMore = () => setPage(p => p + 1);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm mb-4 transition-colors hover:opacity-80"
            style={{ color: 'var(--color-text-muted)' }}>
            <ArrowLeft className="w-4 h-4" />
            {locale === 'zh-CN' ? '博客' : 'Blog'}
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-gradient">
                {locale === 'zh-CN' ? '随笔' : 'Notes'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {locale === 'zh-CN' ? `共 ${total} 条随笔` : `${total} notes`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tag filter */}
        {meta.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
            <button
              onClick={() => setActiveTag('')}
              className="px-3 py-1 rounded-full text-xs transition-all"
              style={{
                background: !activeTag ? 'var(--color-primary)' : 'transparent',
                color: !activeTag ? 'white' : 'var(--color-text-muted)',
                border: `1px solid ${!activeTag ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              {locale === 'zh-CN' ? '全部' : 'All'}
            </button>
            {meta.tags.map(tag => {
              const tagColor = getTagColor(tag);
              const active = activeTag === tag.id;
              return (
                <button
                  key={tag.id}
                  onClick={() => setActiveTag(prev => prev === tag.id ? '' : tag.id)}
                  className="px-3 py-1 rounded-full text-xs transition-all"
                  style={{
                    background: active ? tagColor : 'transparent',
                    color: active ? 'white' : tagColor,
                    border: `1px solid ${active ? tagColor : 'var(--color-border)'}`,
                  }}
                >
                  {tag.name[locale]}
                </button>
              );
            })}
          </div>
        )}

        {/* Timeline */}
        {loading && !loadedOnce.current ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: GUTTER }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-surface-alt)', marginTop: 14 }} />
                  {i < 3 && <div className="w-px flex-1 mt-1" style={{ background: 'var(--color-surface-alt)', minHeight: 80 }} />}
                </div>
                <div className="flex-1 space-y-2 pb-8">
                  <div className="h-3 rounded w-1/4" style={{ background: 'var(--color-surface-alt)' }} />
                  <div className="h-20 rounded-2xl" style={{ background: 'var(--color-surface-alt)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <Pencil className="w-12 h-12 mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
            <p style={{ color: 'var(--color-text-muted)' }}>
              {locale === 'zh-CN' ? '暂无随笔' : 'No notes yet'}
            </p>
          </div>
        ) : (
          <div>
            <AnimatePresence initial={false}>
              {notes.map((note, idx) => {
                const noteTags = (note.tags ?? [])
                  .map(tagId => meta.tags.find(t => t.id === tagId))
                  .filter(Boolean);
                const content = note.content[locale] || note.content['zh-CN'];
                const contentKey = `note:${note.id}`;
                const isLast = idx === notes.length - 1 && !hasMore;

                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx < 8 ? idx * 0.04 : 0 }}
                    className="flex gap-4"
                  >
                    {/* 左侧：竖线 + 圆点列 */}
                    <div
                      className="relative flex-shrink-0 flex flex-col items-center"
                      style={{ width: GUTTER }}
                    >
                      <div
                        className="relative z-10 w-3 h-3 rounded-full border-2 flex-shrink-0"
                        style={{
                          marginTop: 14,
                          background: 'var(--color-surface)',
                          borderColor: 'var(--color-primary)',
                        }}
                      />
                      {!isLast && (
                        <div
                          className="flex-1 w-px"
                          style={{ background: 'var(--color-border)', marginTop: 2 }}
                        />
                      )}
                    </div>

                    {/* 右侧：内容 */}
                    <div className="flex-1 min-w-0 pb-8">
                      <time className="block text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDate(note.createdAt, locale)}
                      </time>

                      <div
                        className="glass rounded-2xl p-5 transition-all hover:shadow-card"
                        style={{ border: '1px solid var(--color-border)' }}
                      >
                        <div className="prose prose-themed prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {content}
                          </ReactMarkdown>
                        </div>

                        {noteTags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            {noteTags.map(tag => {
                              if (!tag) return null;
                              const tagColor = getTagColor(tag);
                              return (
                                <span
                                  key={tag.id}
                                  className="px-2 py-0.5 rounded-full text-xs"
                                  style={{
                                    background: `color-mix(in srgb, ${tagColor} 12%, transparent)`,
                                    color: tagColor,
                                  }}
                                >
                                  {tag.name[locale]}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <ReactionBar contentKey={contentKey} emojis={meta.reactionEmojis} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center pt-2 pb-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--color-surface-alt)] disabled:opacity-50"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  {loadingMore ? (
                    <div className="w-4 h-4 rounded-full border-2 animate-spin"
                      style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {locale === 'zh-CN' ? '加载更多' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
