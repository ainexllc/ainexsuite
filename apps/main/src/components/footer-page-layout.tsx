'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LogoWordmark } from '@/components/branding/logo-wordmark';
import { Footer } from '@/components/footer';

interface FooterPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'narrow' | 'medium' | 'wide';
}

export function FooterPageLayout({ children, maxWidth = 'narrow' }: FooterPageLayoutProps) {
  const maxWidthClass = {
    narrow: 'max-w-4xl',
    medium: 'max-w-5xl',
    wide: 'max-w-6xl',
  }[maxWidth];

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center">
            <LogoWordmark iconSize={44} />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className={`mx-auto ${maxWidthClass} px-6 pt-36 pb-12`}>
        {children}
      </main>

      <Footer
        productLinks={[
          { label: 'Features', href: '/features' },
          { label: 'Plans', href: '/plans' },
        ]}
      />
    </div>
  );
}
