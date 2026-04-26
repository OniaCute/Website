'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { Button } from '@/components/ui/Button';

export function HeroSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);

  if (!config) return null;

  const hero = config.content.hero;
  const text = hero[locale];

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: hero.background
          ? `url(${hero.background}) center/cover no-repeat`
          : undefined
      }}
    >
      {/* Animated background mesh */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" />

      {/* Decorative orbs */}
      <div
        className="absolute top-1/4 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none animate-float"
        style={{ background: 'var(--color-primary)' }}
      />
      <div
        className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none animate-float"
        style={{ background: 'var(--color-accent)', animationDelay: '-3s' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {hero.avatar && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="mb-8 flex justify-center"
          >
            <div className="relative w-28 h-28 md:w-36 md:h-36">
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-60"
                style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))` }}
              />
              <Image
                src={hero.avatar}
                alt="Avatar"
                fill
                className="rounded-full object-cover border-4"
                style={{ borderColor: 'var(--color-primary)' }}
                priority
              />
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-4"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium badge">{text.subtitle}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl md:text-7xl font-heading font-black mb-6 leading-none"
        >
          <span className="text-gradient">{text.title}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {text.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link href={text.ctaHref}>
            <Button size="lg">{text.cta}</Button>
          </Link>
          {config.content.contact.github && (
            <Link href={config.content.contact.github} target="_blank" rel="noopener noreferrer">
              <Button variant="glass" size="lg">GitHub</Button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          {locale === 'zh-CN' ? '向下滚动' : 'Scroll down'}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
