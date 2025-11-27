import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
import { AdminShell } from '@/components/admin-shell';
import '@ainexsuite/ui/styles';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dashboard - AINexSuite Admin',
  description: 'Administrative control center for AINexSuite.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} font-sans bg-zinc-950 text-zinc-100 antialiased`}
      >
        <ThemeProvider>
          <AppColorProvider appId="admin" fallbackPrimary="#ffffff" fallbackSecondary="#a1a1aa">
            <AuthProvider>
              <AdminShell>
                {children}
              </AdminShell>
            </AuthProvider>
          </AppColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}