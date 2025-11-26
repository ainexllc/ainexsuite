import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
import { AdminShell } from '@/components/admin-shell';
import '@ainexsuite/ui/styles';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Admin - AINexSuite',
  description: 'Administrative dashboard for AINexSuite',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-surface-base text-ink-900 antialiased transition-colors duration-300`}
      >
        <ThemeProvider>
          <AppColorProvider appId="admin" fallbackPrimary="#6366f1" fallbackSecondary="#818cf8">
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
