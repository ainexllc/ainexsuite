'use client';

import Link from 'next/link';
import { AinexStudiosLogo } from '@ainexsuite/ui/components';
import { Footer } from '@/components/footer';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

interface FooterPageLayoutProps {
  children: React.ReactNode;
  maxWidth?: 'narrow' | 'medium' | 'wide';
}

export function FooterPageLayout({ children, maxWidth = 'narrow' }: FooterPageLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const maxWidthClass = {
    narrow: 'max-w-4xl',
    medium: 'max-w-5xl',
    wide: 'max-w-6xl',
  }[maxWidth];

  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/plans', label: 'Plans' },
  ];

  return (
    <div className="dark min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
             {/* Using the same Logo component as HomepageTemplate */}
            <AinexStudiosLogo size="md" align="center" appNameOffset={-4} />
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <div className="w-px h-5 bg-white/10" />
            <Link
              href="/?signup=false"
              className="text-sm text-white/80 hover:text-white transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/?signup=true"
              className="px-5 py-2 text-white text-sm font-semibold rounded-lg transition-all hover:brightness-90 flex items-center gap-2 bg-[#f97316]"
            >
              Sign Up
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition hover:bg-white/5 md:hidden"
          >
             <span className="sr-only">Toggle menu</span>
             <div className="space-y-1.5">
                <span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
             </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="absolute inset-x-0 top-full bg-[#0a0a0a] border-b border-white/10 p-4 md:hidden">
              <nav className="flex flex-col gap-4">
                 {navLinks.map((item) => (
                    <Link 
                       key={item.href} 
                       href={item.href}
                       className="text-sm font-medium text-white/80 hover:text-white"
                       onClick={() => setIsMobileMenuOpen(false)}
                    >
                       {item.label}
                    </Link>
                 ))}
                 <div className="h-px bg-white/10" />
                 <Link
                    href="/?signup=false"
                    className="text-sm font-medium text-white/80 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                 >
                    Sign In
                 </Link>
                 <Link
                    href="/?signup=true"
                    className="px-4 py-2 text-center text-white text-sm font-semibold rounded-lg bg-[#f97316]"
                    onClick={() => setIsMobileMenuOpen(false)}
                 >
                    Sign Up
                 </Link>
              </nav>
           </div>
        )}
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