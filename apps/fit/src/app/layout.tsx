import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AppColorProvider appId="fit" fallbackPrimary="#3b82f6" fallbackSecondary="#60a5fa">
              {children}
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
