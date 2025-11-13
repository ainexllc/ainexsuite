'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
