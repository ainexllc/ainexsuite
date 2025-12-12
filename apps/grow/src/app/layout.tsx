import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { AppColorProvider, ThemeProvider } from '@ainexsuite/theme';
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

export const metadata: Metadata = {
  title: 'Grow - Learning Goals',
  description: 'Track your learning journey and skill development',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <AppColorProvider appId="grow" fallbackPrimary="#14b8a6" fallbackSecondary="#6366f1">
              {children}
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
