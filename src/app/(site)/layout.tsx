import React from 'react';
import { redirect } from 'next/navigation';
import { isSetupComplete } from '@/lib/config';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { AnnouncementToast } from '@/components/site/AnnouncementToast';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  if (!isSetupComplete()) {
    redirect('/setup');
  }

  return (
    <>
      <Header />
      <AnnouncementToast />
      <main className="flex flex-col min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
