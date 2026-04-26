'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ExternalLink } from 'lucide-react';
import { GithubIcon, TwitterIcon, LinkedinIcon } from '@/components/ui/SocialIcons';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';

const ICONS: Record<string, React.ReactNode> = {
  github: <GithubIcon className="w-4 h-4" />,
  twitter: <TwitterIcon className="w-4 h-4" />,
  linkedin: <LinkedinIcon className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  default: <ExternalLink className="w-4 h-4" />,
};

export function Footer() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);

  if (!config?.layout.footer.visible) return null;

  const { copyright, socialLinks } = config.layout.footer;

  return (
    <footer
      className="w-full py-8 mt-auto"
      style={{ borderTop: '1px solid var(--color-border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {copyright[locale]}
        </p>

        {socialLinks.length > 0 && (
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <Link
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:bg-[var(--color-surface-alt)] hover:text-primary"
                style={{ color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}
                title={link.platform}
              >
                {ICONS[link.icon] ?? ICONS.default}
              </Link>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
