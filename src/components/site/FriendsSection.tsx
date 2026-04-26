'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';

export function FriendsSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);

  const section = config?.layout.sections.find(s => s.id === 'friends');
  if (!section?.enabled || !config) return null;

  const friends = config.content.friends ?? [];
  const heading = locale === 'zh-CN' ? '友情链接' : 'Friend Links';
  const sub = locale === 'zh-CN' ? '我推荐的站点' : 'Sites I recommend';

  return (
    <section id="friends" className="py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.3 }}
          className="section-heading"
        >
          <h2>{heading}</h2>
          <p>{sub}</p>
        </motion.div>

        {friends.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            {locale === 'zh-CN' ? '在后台添加友情链接' : 'Add friend links in admin panel'}
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {friends.map((friend, i) => (
              <motion.a
                key={friend.id}
                href={friend.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
                className="glass rounded-2xl p-5 flex flex-col gap-2 group cursor-pointer"
                style={{
                  border: '1px solid var(--color-border)',
                  textDecoration: 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm group-hover:text-primary transition-colors" style={{ color: 'var(--color-text)' }}>
                    {friend.name}
                  </span>
                  <ExternalLink
                    className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--color-primary)' }}
                  />
                </div>
                {(friend.description?.[locale] || friend.description?.['zh-CN']) && (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                    {friend.description[locale] || friend.description['zh-CN']}
                  </p>
                )}
                <p className="text-xs truncate mt-auto pt-1" style={{ color: 'var(--color-primary)', opacity: 0.7 }}>
                  {friend.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </p>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
