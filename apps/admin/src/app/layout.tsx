import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@ainexsuite/auth';
import { AdminShell } from '@/components/admin-shell';
import '@ainexsuite/ui/styles';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin - AINexSuite',
  description: 'Administrative dashboard for AINexSuite',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-50`}>
        <AuthProvider>
          <AdminShell>
            {children}
          </AdminShell>
        </AuthProvider>
      </body>
    </html>
  );
}
