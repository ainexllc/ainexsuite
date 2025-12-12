'use client';

import { ReactNode } from 'react';
import { TableOfContents, TOCSection } from './components/table-of-contents';

interface ThemeShowcasePageProps {
  sections: TOCSection[];
  children: ReactNode;
}

export function ThemeShowcasePage({ sections, children }: ThemeShowcasePageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center px-6">
          <h1 className="text-2xl font-bold text-foreground">
            AinexSuite Design System
          </h1>
        </div>
      </header>

      {/* Main Layout */}
      <div className="container flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0">
          <TableOfContents sections={sections} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
