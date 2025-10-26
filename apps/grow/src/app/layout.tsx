import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import '@ainexsuite/ui/styles';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'Grow - Learning Goals',
  description: 'Track your learning journey and skill development',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} theme-dark`} data-theme="dark">
      <body className="bg-surface-base text-ink-900 font-sans theme-dark">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
