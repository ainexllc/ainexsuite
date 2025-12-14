import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Plus_Jakarta_Sans, Inter, DM_Sans, Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider, themeSyncScriptContent } from '@ainexsuite/theme';
import { getServerTheme } from '@ainexsuite/theme/server';
import '@ainexsuite/ui/styles';
import './globals.css';

// Primary fonts - user-selectable via Settings > Appearance
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getServerTheme();

  return (
    <html lang="en" className={`${theme} ${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSyncScriptContent }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={theme} enableSystem={true} storageKey="ainex-theme">
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
