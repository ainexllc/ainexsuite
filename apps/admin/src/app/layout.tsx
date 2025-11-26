import type { Metadata } from 'next';
import { JetBrains_Mono, Orbitron, Rajdhani } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { ThemeProvider, AppColorProvider } from '@ainexsuite/theme';
import { AdminShell } from '@/components/admin-shell';
import { CyberBackground } from '@/components/cyber-background';
import '@ainexsuite/ui/styles';
import './globals.css';

// Cyberpunk fonts
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

const rajdhani = Rajdhani({
  variable: '--font-rajdhani',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'AINEX CONTROL - AINexSuite Admin',
  description: 'Command center for AINexSuite operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${jetbrainsMono.variable} ${orbitron.variable} ${rajdhani.variable} font-jetbrains bg-[#0a0a0f] text-white antialiased`}
      >
        <CyberBackground />
        <ThemeProvider>
          <AppColorProvider appId="admin" fallbackPrimary="#06b6d4" fallbackSecondary="#d946ef">
            <AuthProvider>
              <AdminShell>
                {children}
              </AdminShell>
            </AuthProvider>
          </AppColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
