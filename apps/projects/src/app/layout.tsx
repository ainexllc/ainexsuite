import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue, League_Spartan } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { VisualStyleProvider } from '@/components/providers/visual-style-provider';
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
  title: 'AINexSuite - Your Productivity Hub',
  description: 'Access all your productivity apps in one place. Notes, Journey, Todo, Habits, and more.',
  keywords: ['productivity', 'notes', 'journey', 'todo', 'habits', 'ai assistant'],
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
          <VisualStyleProvider>
            {children}
          </VisualStyleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
