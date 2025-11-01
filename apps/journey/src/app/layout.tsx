import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ToastProvider } from '@/lib/toast';
import '@ainexsuite/ui/styles';
import './globals.css';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-kanit',
});

export const metadata: Metadata = {
  title: 'Journey - AINexSuite',
  description: 'Daily reflections and mood tracking with AI insights',
};
// Toast provider added for notifications

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} theme-dark`} data-theme="dark">
      <body className="font-sans antialiased theme-dark">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
