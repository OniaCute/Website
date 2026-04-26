'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { useThemeStore } from '@/store/themeStore';

export function SkillsSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);
  const mode = useThemeStore((s) => s.mode);

  const section = config?.layout.sections.find(s => s.id === 'skills');
  if (!section?.enabled || !config) return null;

  const skills = config.content.skills ?? [];
  const styleConfig = config.theme[mode].skills;
  const heading = locale === 'zh-CN' ? '技术栈' : 'Tech Stack';
  const sub = locale === 'zh-CN' ? '我掌握的技能' : 'Technologies I work with';

  const categories = Array.from(new Set(skills.map(s => s.category)));

  return (
    <section id="skills" className="py-24 px-4 sm:px-6" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.3 }}
          className="section-heading"
        >
          <h2>{heading}</h2>
          <p>{sub}</p>
        </motion.div>

        {skills.length === 0 ? (
          <p className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            {locale === 'zh-CN' ? '在后台添加技能' : 'Add skills in admin panel'}
          </p>
        ) : (
          <div className="space-y-10">
            {categories.map((cat, ci) => (
              <div key={cat}>
                <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-primary)' }}>
                  {cat}
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {skills.filter(s => s.category === cat).map((skill, si) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      whileHover={{ y: -4, scale: 1.01 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ duration: 0.25, delay: (ci * 0.04) + (si * 0.02) }}
                    >
                      <div
                        className="glass rounded-xl p-4 transition-shadow duration-300"
                        style={{
                          background: `linear-gradient(135deg, color-mix(in srgb, ${styleConfig.cardColor} ${Math.round(styleConfig.cardOpacity * 100)}%, transparent), transparent 62%), var(--color-surface)`,
                          boxShadow: `0 0 0 1px color-mix(in srgb, ${styleConfig.cardColor} 28%, transparent) inset`,
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {skill.icon && (
                              <motion.span className="text-xl" whileHover={{ rotate: [0, -8, 8, 0] }}                             transition={{ duration: 0.2 }}>
                                {skill.icon}
                              </motion.span>
                            )}
                            <span className="font-medium text-sm">{skill.name}</span>
                          </div>
                          <span className="text-xs font-mono" style={{ color: styleConfig.progressColor }}>
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-alt)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${styleConfig.progressColor}, var(--color-accent))` }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true, margin: '-20px' }}
                            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
