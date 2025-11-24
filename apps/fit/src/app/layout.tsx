import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { SSOHandler } from '@ainexsuite/firebase';
import '@ainexsuite/ui/styles';
import './globals.css';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
});

export const metadata: Metadata = {
  title: 'Fit - Fitness Tracking',
  description: 'Track your workouts and fitness progress',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${bebasNeue.variable} theme-dark`} data-theme="dark">
      <body className="bg-surface-base text-ink-900 font-sans theme-dark">
        <AuthProvider>
          <SSOHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
