'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Copy } from 'lucide-react';
import {
  GithubIcon, TwitterIcon, LinkedinIcon,
  DiscordIcon, TelegramIcon, SteamIcon,
  BilibiliIcon, QQIcon, WeChatIcon,
  YoutubeIcon, InstagramIcon,
} from '@/components/ui/SocialIcons';
import { ClipboardToastContainer, type ToastItem } from '@/components/ui/ClipboardToast';
import { useConfigStore } from '@/store/configStore';
import { useLocaleStore } from '@/store/localeStore';
import { Button } from '@/components/ui/Button';

export function ContactSection() {
  const config = useConfigStore((s) => s.config);
  const locale = useLocaleStore((s) => s.locale);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const copyToClipboard = useCallback((label: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, label, value, locale }]);
    });
  }, [locale]);

  const section = config?.layout.sections.find(s => s.id === 'contact');
  if (!section?.enabled || !config) return null;

  const contact = config.content.contact;
  const heading = locale === 'zh-CN' ? '联系我' : 'Contact Me';
  const sub = locale === 'zh-CN'
    ? '有任何问题或合作意向，欢迎随时联系'
    : 'Have a question or want to work together?';

  type LinkItem = { icon: React.ReactNode; label: string } & (
    | { type: 'link'; href: string }
    | { type: 'copy'; value: string }
  );

  const links: LinkItem[] = ([
    contact.email     && { icon: <Mail className="w-5 h-5" />,            label: 'Email',     type: 'link', href: `mailto:${contact.email}` },
    contact.github    && { icon: <GithubIcon className="w-5 h-5" />,      label: 'GitHub',    type: 'link', href: contact.github },
    contact.twitter   && { icon: <TwitterIcon className="w-5 h-5" />,     label: 'Twitter',   type: 'link', href: contact.twitter },
    contact.linkedin  && { icon: <LinkedinIcon className="w-5 h-5" />,    label: 'LinkedIn',  type: 'link', href: contact.linkedin },
    contact.discord   && { icon: <DiscordIcon className="w-5 h-5" />,     label: 'Discord',   type: 'link', href: contact.discord },
    contact.telegram  && { icon: <TelegramIcon className="w-5 h-5" />,    label: 'Telegram',  type: 'link', href: contact.telegram },
    contact.steam     && { icon: <SteamIcon className="w-5 h-5" />,       label: 'Steam',     type: 'link', href: contact.steam },
    contact.bilibili  && { icon: <BilibiliIcon className="w-5 h-5" />,    label: 'Bilibili',  type: 'link', href: contact.bilibili },
    contact.qq        && { icon: <QQIcon className="w-5 h-5" />,          label: 'QQ',        type: 'copy', value: contact.qq },
    contact.wechat    && { icon: <WeChatIcon className="w-5 h-5" />,      label: 'WeChat',    type: 'copy', value: contact.wechat },
    contact.youtube   && { icon: <YoutubeIcon className="w-5 h-5" />,     label: 'YouTube',   type: 'link', href: contact.youtube },
    contact.instagram && { icon: <InstagramIcon className="w-5 h-5" />,   label: 'Instagram', type: 'link', href: contact.instagram },
  ] as (LinkItem | false)[]).filter(Boolean) as LinkItem[];

  return (
    <>
      <ClipboardToastContainer toasts={toasts} onRemove={removeToast} />

      <section id="contact" className="py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-heading">
              <h2>{heading}</h2>
              <p>{sub}</p>
            </div>

            {links.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {links.map((item) => {
                  if (item.type === 'copy') {
                    return (
                      <Button
                        key={item.label}
                        variant="glass"
                        size="lg"
                        className="gap-3"
                        onClick={() => copyToClipboard(item.label, item.value)}
                      >
                        {item.icon}
                        {item.label}
                        <Copy className="w-3.5 h-3.5 opacity-50" />
                      </Button>
                    );
                  }
                  return (
                    <Link key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="glass" size="lg" className="gap-3">
                        {item.icon}
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {locale === 'zh-CN' ? '在后台配置联系方式' : 'Configure contact info in admin panel'}
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
