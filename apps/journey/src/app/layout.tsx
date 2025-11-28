import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Kanit, Bebas_Neue } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${kanit.variable} ${bebasNeue.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <AppColorProvider appId="journey" fallbackPrimary="#f97316" fallbackSecondary="#fb923c">
              {children}
            </AppColorProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
