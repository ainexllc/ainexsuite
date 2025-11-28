import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue, League_Spartan } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider } from '@ainexsuite/theme';
import { VisualStyleProvider } from '@/components/providers/visual-style-provider';
import { Toaster } from '@ainexsuite/ui';
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

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-league-spartan',
});

export const metadata: Metadata = {
  title: 'Calendar - AINexSuite',
  description: 'Manage your schedule and events with AINexSuite Calendar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <VisualStyleProvider>
              {children}
            </VisualStyleProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
