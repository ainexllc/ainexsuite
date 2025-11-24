import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue, VT323 } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { SSOHandler } from '@ainexsuite/firebase';
import '@ainexsuite/ui/styles';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-kanit',
});

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
});

const vt323 = VT323({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-vt323',
});

export const metadata: Metadata = {
  title: 'Pulse - Health Metrics',
  description: 'Track your health and wellness metrics',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${vt323.variable} theme-dark`} data-theme="dark">
      <body className="bg-surface-base text-ink-900 font-sans theme-dark">
        <SSOHandler />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
