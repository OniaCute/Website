import React from 'react';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/content';
import { ProjectDetailContent } from '@/components/site/ProjectDetailContent';

interface Params { params: { slug: string }; searchParams: { locale?: string } }

export default function ProjectDetailPage({ params, searchParams }: Params) {
  const locale = (searchParams.locale as 'zh-CN' | 'en-US') || 'zh-CN';
  const project = getProject(params.slug, locale);

  if (!project) notFound();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none" />
      <div
        className="absolute top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-float"
        style={{ background: 'var(--color-primary)' }}
      />
      <div
        className="absolute bottom-20 -right-24 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none animate-float"
        style={{ background: 'var(--color-accent)', animationDelay: '-2.5s' }}
      />

      <ProjectDetailContent project={project} locale={locale} />
    </div>
  );
}
