'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Workspace redirect page
 * Admin app uses root-level routing, so redirect /workspace to /
 */
export default function WorkspaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}
