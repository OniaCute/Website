'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { ProjectCard } from './ProjectCard';
import type { ProjectMeta } from '@/types';

export function ProjectsSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);
  const [projects, setProjects] = useState<ProjectMeta[]>([]);

  const section = config?.layout.sections.find(s => s.id === 'projects');

  useEffect(() => {
    if (!section?.enabled) return;
    fetch(`/api/content/projects?locale=${locale}`)
      .then(r => r.json())
      .then(res => { if (res.code === 200) setProjects(res.data); })
      .catch(() => {});
  }, [locale, section?.enabled]);

  if (!section?.enabled) return null;

  const heading = locale === 'zh-CN' ? '我的项目' : 'My Projects';
  const sub = locale === 'zh-CN' ? '一些我构建的作品' : 'Things I\'ve built';

  return (
    <section id="projects" className="py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="section-heading"
        >
          <h2>{heading}</h2>
          <p>{sub}</p>
        </motion.div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center py-16"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <p className="text-lg">{locale === 'zh-CN' ? '暂无项目' : 'No projects yet'}</p>
            <p className="text-sm mt-2">{locale === 'zh-CN' ? '在后台添加你的第一个项目' : 'Add your first project in the admin panel'}</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
