'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReactionBarProps {
  contentKey: string;
  emojis: string[];
}

interface ReactionData {
  counts: Record<string, number>;
  userReacted: string[];
}

// 用 Intl.Segmenter 把字符串拆成完整 grapheme cluster 列表
// 支持 ZWJ 组合 emoji（如 😶‍🌫️ 👨‍👩‍👧‍👦），不会把它们拆开
function segmentGraphemes(str: string): string[] {
  const segmenter = new Intl.Segmenter('und', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(str)).map(s => s.segment);
}

// 提取字符串中的第一个 grapheme cluster
function firstGrapheme(str: string): string {
  return segmentGraphemes(str.trim())[0] ?? str.trim();
}

// 生成稳定的 React key：把 grapheme 里每个码点转成十六进制，用连字符连接
// 例：'😶‍🌫️' → '1f636-200d-1f32b-fe0f'
function emojiKey(grapheme: string): string {
  return Array.from(grapheme)
    .map(ch => ch.codePointAt(0)!.toString(16))
    .join('-');
}

export function ReactionBar({ contentKey, emojis }: ReactionBarProps) {
  const [data, setData] = useState<ReactionData>({ counts: {}, userReacted: [] });
  const [loading, setLoading] = useState(true);
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reactions/${encodeURIComponent(contentKey)}`)
      .then(r => r.json())
      .then(res => { if (res.code === 200) setData(res.data); })
      .finally(() => setLoading(false));
  }, [contentKey]);

  const handleReact = async (emoji: string) => {
    if (pendingEmoji !== null) return;
    setPendingEmoji(emoji);
    try {
      const res = await fetch(`/api/reactions/${encodeURIComponent(contentKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      const json = await res.json();
      if (json.code === 200) {
        setData({ counts: json.data.counts, userReacted: json.data.userReacted });
      }
    } finally {
      setTimeout(() => setPendingEmoji(null), 400);
    }
  };

  if (loading) return null;

  // 把配置里的 emoji 列表里每个元素取第一个 grapheme（防止存入了多余字符）
  const configEmojis = emojis.map(firstGrapheme).filter(Boolean);

  // 合并后端已有 reaction 数据里出现过的 emoji（用 firstGrapheme 确保一致性）
  const extraEmojis = Object.keys(data.counts)
    .map(firstGrapheme)
    .filter(e => e && !configEmojis.includes(e));

  const allEmojis = [...configEmojis, ...extraEmojis];

  // 把 userReacted 列表里每项也取 firstGrapheme，用于比较
  const userReactedNormalized = data.userReacted.map(firstGrapheme);

  return (
    <div className="reaction-bar">
      <p className="text-sm mb-3 font-medium" style={{ color: 'var(--color-text-muted)' }}>
        对这篇内容有什么感受？
      </p>
      <div className="flex flex-wrap gap-2">
        {allEmojis.map(emoji => {
          const count = data.counts[emoji] ?? 0;
          const reacted = userReactedNormalized.includes(emoji);
          const isAnimating = pendingEmoji === emoji;
          const key = emojiKey(emoji);

          return (
            <motion.button
              key={key}
              onClick={() => handleReact(emoji)}
              whileTap={{ scale: 0.82 }}
              disabled={pendingEmoji !== null}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all select-none"
              style={{
                background: reacted
                  ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                  : 'var(--color-surface-alt)',
                border: `1px solid ${reacted ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: reacted ? 'var(--color-primary)' : 'var(--color-text-muted)',
                cursor: pendingEmoji !== null ? 'default' : 'pointer',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={isAnimating ? 'active' : 'idle'}
                  initial={isAnimating ? { scale: 0.6, rotate: -15 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  style={{ fontFamily: 'initial', fontSize: '1.1rem', lineHeight: 1 }}
                >
                  {emoji}
                </motion.span>
              </AnimatePresence>
              {count > 0 && (
                <span className="text-xs font-medium tabular-nums">{count}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
