import type { Metadata } from 'next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { Plus_Jakarta_Sans, Inter, DM_Sans, Kanit, Bebas_Neue, League_Spartan } from 'next/font/google';
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

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-league-spartan',
});

export const metadata: Metadata = {
  title: 'AINexSuite - Your Productivity Hub',
  description: 'Access all your productivity apps in one place. Notes, Journey, Todo, Habits, and more.',
  keywords: ['productivity', 'notes', 'journey', 'todo', 'habits', 'ai assistant'],
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
    <html lang="en" suppressHydrationWarning className={`${theme} ${plusJakartaSans.variable} ${inter.variable} ${GeistSans.variable} ${dmSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeSyncScriptContent }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={theme} enableSystem={false} storageKey="ainex-theme">
          <AuthProvider>
            <AppColorProvider appId="main" fallbackPrimary="#f97316" fallbackSecondary="#fb923c">
              {children}
            </AppColorProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
