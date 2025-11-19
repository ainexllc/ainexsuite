'use client';

import { AuthProvider } from '@ainexsuite/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
