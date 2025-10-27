"use client";

import { useState } from "react";
import { TopNav } from "./top-nav";

type AppShellProps = {
  children: React.ReactNode;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
};

export function AppShell({ children, onSearchChange, searchQuery }: AppShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white dark:bg-gray-950">
      <div className="relative z-10 flex min-h-screen flex-col text-gray-900 dark:text-gray-100">
        <TopNav
          onMenuClick={() => setIsMenuOpen((prev) => !prev)}
          onSearchChange={onSearchChange}
          searchQuery={searchQuery}
          onOpenAiAssistant={() => setIsAiOpen((prev) => !prev)}
        />

        {/* Purple gradient glow effect below nav (matching Notes app's orange) */}
        <div className="pointer-events-none fixed inset-x-0 top-16 z-20 h-3 bg-gradient-to-b from-purple-400/45 via-purple-400/15 to-transparent blur-md" />

        <main className="flex-1 overflow-x-hidden pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
