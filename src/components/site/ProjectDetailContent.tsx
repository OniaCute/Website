'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar } from 'lucide-react';
import { GithubIcon } from '@/components/ui/SocialIcons';
import type { Project, Locale } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface ProjectDetailContentProps {
  project: Project;
  locale: Locale;
}

const container: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function ProjectDetailContent({ project, locale }: ProjectDetailContentProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-24 pt-32"
    >
      <motion.div variants={item}>
        <Link href="/#projects" className="flex items-center gap-2 text-sm mb-8 hover:text-primary transition-colors" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          {locale === 'zh-CN' ? '返回项目列表' : 'Back to Projects'}
        </Link>
      </motion.div>

      <motion.div
        variants={item}
        className="glass rounded-2xl p-8 md:p-12 space-y-6"
        style={{
          background: 'linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 45%), var(--color-surface)',
        }}
      >
        <motion.div variants={item} className="flex flex-wrap gap-2">
          {project.tags.map(tag => <span key={tag} className="badge">{tag}</span>)}
        </motion.div>

        <motion.h1 variants={item} className="text-3xl md:text-4xl font-bold">
          {project.title}
        </motion.h1>

        {project.description && (
          <motion.p variants={item} className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            {project.description}
          </motion.p>
        )}

        <motion.div variants={item} className="flex flex-wrap gap-3 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
          {project.createdAt && (
            <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <Calendar className="w-4 h-4" />
              {project.createdAt}
            </div>
          )}
          {project.repoUrl && (
            <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              <GithubIcon className="w-4 h-4" /> Source Code
            </Link>
          )}
          {project.demoUrl && (
            <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm hover:text-primary transition-colors" style={{ color: 'var(--color-text-muted)' }}>
              <ExternalLink className="w-4 h-4" /> Live Demo
            </Link>
          )}
        </motion.div>

        <motion.div variants={item} className="prose prose-themed max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{project.content}</ReactMarkdown>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
