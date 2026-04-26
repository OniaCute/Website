'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import type { BlogNote, BlogTag } from '@/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface NoteEditorProps {
  note?: BlogNote;
  tags: BlogTag[];
  onSave: (data: Partial<BlogNote>) => Promise<void>;
  onClose: () => void;
}

export function NoteEditor({ note, tags, onSave, onClose }: NoteEditorProps) {
  const mode = useThemeStore(s => s.mode);

  const [contentZh, setContentZh] = useState(note?.content?.['zh-CN'] ?? '');
  const [contentEn, setContentEn] = useState(note?.content?.['en-US'] ?? '');
  const [selectedTags, setSelectedTags] = useState<string[]>(note?.tags ?? []);
  const [published, setPublished] = useState(note?.published ?? false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'zh-CN' | 'en-US'>('zh-CN');

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    if (!contentZh.trim()) return;
    setSaving(true);
    try {
      await onSave({
        content: { 'zh-CN': contentZh, 'en-US': contentEn },
        tags: selectedTags,
        published,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        <h2 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
          {note ? '编辑随笔' : '新建随笔'}
        </h2>
        <div className="flex items-center gap-3">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 max-w-xs">
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="px-2 py-0.5 rounded-full text-xs transition-all"
                style={{
                  background: selectedTags.includes(tag.id) ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                  color: selectedTags.includes(tag.id) ? 'white' : 'var(--color-text-muted)',
                  border: `1px solid ${selectedTags.includes(tag.id) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                }}
              >
                {tag.name['zh-CN']}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <span>发布</span>
            <div
              onClick={() => setPublished(!published)}
              className="relative w-10 h-5 rounded-full transition-colors cursor-pointer"
              style={{ background: published ? 'var(--color-success)' : 'var(--color-surface-alt)', border: '1px solid var(--color-border)' }}
            >
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
                style={{ left: published ? '22px' : '2px' }} />
            </div>
          </label>
          <button
            onClick={handleSave}
            disabled={saving || !contentZh.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
          >
            {saving ? '保存中...' : '保存'}
          </button>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-surface-alt)] transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Lang Tabs */}
      <div className="px-6 pt-3 pb-2 flex gap-2 flex-shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}>
        {(['zh-CN', 'en-US'] as const).map(lang => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === lang ? 'var(--color-primary)' : 'var(--color-surface-alt)',
              color: activeTab === lang ? 'white' : 'var(--color-text-muted)',
            }}
          >
            {lang === 'zh-CN' ? '中文' : 'English'}
          </button>
        ))}
      </div>

      {/* MD Editor */}
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
  );
}
