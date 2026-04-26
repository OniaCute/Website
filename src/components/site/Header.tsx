'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';
import { clsx } from 'clsx';
import { useHashNav } from '@/hooks/useHashNav';

export function Header() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useHashNav();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!config?.layout.header.visible) return null;

  const items = (config?.layout.header.items ?? []).filter(item => item.visible !== false);
  const siteName = config?.layout.header.brandTitle?.[locale] ?? config?.meta[locale]?.siteName ?? 'Onia';
  const sticky = config?.layout.header.sticky ?? true;

  function NavItem({ item, mobile }: { item: typeof items[number]; mobile?: boolean }) {
    const isHash = item.href.startsWith('#');
    const isExternal = item.external;

    if (isHash) {
      return (
        <button
          onClick={() => navigate(item.href, mobile ? () => setMobileOpen(false) : undefined)}
          className={clsx(
            'text-sm font-medium transition-all duration-150 hover:text-primary',
            mobile
              ? 'w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--color-surface-alt)]'
              : 'px-4 py-2 rounded-xl hover:bg-[var(--color-surface-alt)]'
          )}
          style={{ color: 'var(--color-text-muted)' }}
        >
          {item.label[locale]}
        </button>
      );
    }

    return (
      <Link
        href={item.href}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        onClick={mobile ? () => setMobileOpen(false) : undefined}
        className={clsx(
          'text-sm font-medium transition-all duration-150 hover:text-primary',
          mobile
            ? 'block px-4 py-3 rounded-xl hover:bg-[var(--color-surface-alt)]'
            : 'px-4 py-2 rounded-xl hover:bg-[var(--color-surface-alt)]'
        )}
        style={{ color: 'var(--color-text-muted)' }}
      >
        {item.label[locale]}
      </Link>
    );
  }

  return (
    <header
      className={clsx(
        'w-full z-40 transition-all duration-300 border-b',
        sticky ? 'fixed top-0 left-0 right-0' : 'relative',
        scrolled && 'glass-nav shadow-card'
      )}
      style={{ borderColor: scrolled ? 'var(--color-border)' : 'transparent' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-heading font-bold text-xl text-gradient hover:opacity-90 transition-opacity">
          {siteName}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            className="md:hidden btn-ghost btn p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-nav border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <nav className="flex flex-col p-4 gap-1">
              {items.map((item) => (
                <NavItem key={item.id} item={item} mobile />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
