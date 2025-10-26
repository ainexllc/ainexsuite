import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import '@ainexsuite/ui/styles';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-kanit',
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} theme-dark`} data-theme="dark">
      <body className="font-sans antialiased theme-dark">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
