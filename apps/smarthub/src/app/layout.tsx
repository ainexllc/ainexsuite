import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue, League_Spartan } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
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
  title: 'AINexSuite Smart Hub - Connect Your World',
  description: 'Centralize and control your Google Home devices. Monitor status, automate routines, and manage your smart home from one beautiful dashboard.',
  keywords: ['smart home', 'google home', 'iot', 'automation', 'dashboard', 'smart hub'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable} ${leagueSpartan.variable} theme-dark`} data-theme="dark">
      <body className="font-sans antialiased theme-dark">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}