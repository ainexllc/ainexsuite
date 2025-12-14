import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Plus_Jakarta_Sans, Inter, DM_Sans, Kanit, Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { AppColorProvider, ThemeProvider, themeSyncScriptContent } from '@ainexsuite/theme';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getServerTheme();

  return (
    <html lang="en" className={`${theme} ${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSyncScriptContent }} />
        <meta name="theme-color" content="#0a0a0a" />
      </head>
      <body className="font-sans antialiased transition-colors duration-300">
        <ThemeProvider defaultTheme={theme} enableSystem={true} storageKey="ainex-theme">
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
