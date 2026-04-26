'use client';

import React, { useEffect } from 'react';
import { HeroSection } from '@/components/site/HeroSection';
import { AboutSection } from '@/components/site/AboutSection';
import { ProjectsSection } from '@/components/site/ProjectsSection';
import { SkillsSection } from '@/components/site/SkillsSection';
import { FriendsSection } from '@/components/site/FriendsSection';
import { ContactSection } from '@/components/site/ContactSection';
import { consumePendingHash } from '@/hooks/useHashNav';
import { useConfigStore } from '@/store/configStore';

// section id → 对应组件的映射表
const SECTION_MAP: Record<string, React.ReactNode> = {
  hero:     <HeroSection />,
  about:    <AboutSection />,
  projects: <ProjectsSection />,
  skills:   <SkillsSection />,
  friends:  <FriendsSection />,
  contact:  <ContactSection />,
};

export default function HomePage() {
  const config = useConfigStore((s) => s.config);

  useEffect(() => {
    consumePendingHash();

    const hash = window.location.hash.slice(1);
    if (hash) {
      history.replaceState(null, '', window.location.pathname);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.getElementById(hash);
          if (!el) return;
          const headerH = (document.querySelector('header')?.offsetHeight ?? 64) + 8;
          const top = el.getBoundingClientRect().top + window.scrollY - headerH;
          window.scrollTo({ top, behavior: 'smooth' });
        });
      });
    }
  }, []);

  // config 未加载时按默认顺序渲染，防止闪烁
  if (!config) {
    return (
      <>
        {Object.values(SECTION_MAP)}
      </>
    );
  }

  // 按 order 升序排列，过滤掉 enabled=false 的 section
  const orderedSections = [...config.layout.sections]
    .sort((a, b) => a.order - b.order)
    .filter(s => s.enabled);

  return (
    <>
      {orderedSections.map(s => {
        const component = SECTION_MAP[s.id];
        if (!component) return null;
        return <React.Fragment key={s.id}>{component}</React.Fragment>;
      })}
    </>
  );
}
