'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { GithubIcon } from '@/components/ui/SocialIcons';
import type { ProjectMeta } from '@/types';

interface ProjectCardProps {
  project: ProjectMeta;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const router = useRouter();
  const detailHref = `/projects/${project.slug}?locale=${encodeURIComponent(project.locale)}`;

  React.useEffect(() => {
    const preload = () => router.prefetch(detailHref);
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = (window as Window).setTimeout(preload, 300);
    return () => (window as Window).clearTimeout(timer);
  }, [router, detailHref]);

  const tint = [
    'color-mix(in srgb, var(--color-primary) 11%, transparent)',
    'color-mix(in srgb, var(--color-accent) 9%, transparent)',
    'color-mix(in srgb, var(--color-success) 8%, transparent)',
  ][index % 3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group glass-card flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${tint} 0%, transparent 42%), var(--color-surface)`,
      }}
    >
      {project.cover && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={project.cover}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--color-surface), transparent)' }} />
        </div>
      )}

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="badge text-xs">{tag}</span>
          ))}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{project.title}</h3>
          {project.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex gap-2">
            {project.repoUrl && (
              <Link href={project.repoUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost text-xs py-1.5 px-3">
                <GithubIcon className="w-3.5 h-3.5" />
                Code
              </Link>
            )}
            {project.demoUrl && (
              <Link href={project.demoUrl} target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost text-xs py-1.5 px-3">
                <ExternalLink className="w-3.5 h-3.5" />
                Demo
              </Link>
            )}
          </div>
          <Link href={detailHref}
            prefetch
            onMouseEnter={() => router.prefetch(detailHref)}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-primary"
            style={{ color: 'var(--color-text-muted)' }}>
            详情 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
