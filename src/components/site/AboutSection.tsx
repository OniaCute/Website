'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';

export function AboutSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);

  const section = config?.layout.sections.find(s => s.id === 'about');
  if (!section?.enabled || !config) return null;

  const content = config.content.about[locale];
  const heading = locale === 'zh-CN' ? '关于我' : 'About Me';

  return (
    <section id="about" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-heading">
            <h2>{heading}</h2>
          </div>

          <div className="glass rounded-2xl p-8 md:p-12 prose prose-themed max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
