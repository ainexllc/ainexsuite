import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Plus_Jakarta_Sans, Inter, DM_Sans, Kanit, Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
import { getServerTheme } from '@ainexsuite/theme/server';

// Inline script to sync cookie → localStorage BEFORE next-themes runs
const THEME_SYNC_SCRIPT = `(function(){try{var c=document.cookie.match(/(^| )ainex-theme=([^;]+)/);if(c&&c[2]){localStorage.setItem('ainex-theme',c[2]);console.log('[SYNC]',c[2])}}catch(e){}})();`;
import { Toaster } from '@ainexsuite/ui';
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
  title: 'Journey - AINexSuite',
  description: 'Daily reflections and mood tracking with AI insights',
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
    <html lang="en" suppressHydrationWarning className={`${theme} ${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SYNC_SCRIPT }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={theme} enableSystem={true} storageKey="ainex-theme">
          <AuthProvider>
            <AppColorProvider appId="journey" fallbackPrimary="#f97316" fallbackSecondary="#fb923c">
              {children}
              <Toaster />
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
