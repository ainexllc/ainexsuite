'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import { db } from '@ainexsuite/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Space } from '@/types/models';
import { FamilyDashboard } from '@/components/family-dashboard/FamilyDashboard';

type DashboardStatus = 'loading' | 'valid' | 'invalid' | 'error';

function FamilyDashboardContent() {
  const searchParams = useSearchParams();
  const spaceId = searchParams.get('spaceId');
  const token = searchParams.get('token');

  const [status, setStatus] = useState<DashboardStatus>('loading');
  const [space, setSpace] = useState<Space | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateToken() {
      if (!spaceId || !token) {
        setStatus('invalid');
        setError('Missing spaceId or token in URL');
        return;
      }

      try {
        // Fetch space to validate token
        const spaceDoc = await getDoc(doc(db, 'spaces', spaceId));

        if (!spaceDoc.exists()) {
          setStatus('invalid');
          setError('Space not found');
          return;
        }

        const spaceData = { id: spaceDoc.id, ...spaceDoc.data() } as Space;

        // Validate dashboard token
        if (spaceData.dashboardToken !== token) {
          setStatus('invalid');
          setError('Invalid dashboard token');
          return;
        }

        // Only family spaces should have dashboards
        if (spaceData.type !== 'family') {
          setStatus('invalid');
          setError('Dashboard is only available for family spaces');
          return;
        }

        setSpace(spaceData);
        setStatus('valid');
      } catch (err) {
        console.error('Error validating dashboard token:', err);
        setStatus('error');
        setError('Failed to load dashboard');
      }
    }

    validateToken();
  }, [spaceId, token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="text-white/50 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'invalid' ? 'Invalid Dashboard Link' : 'Error'}
          </h1>
          <p className="text-white/60 mb-6">{error}</p>
          <p className="text-sm text-white/40">
            Please ask an admin to generate a new dashboard link from space settings.
          </p>
        </div>
      </div>
    );
  }

  if (!space) return null;

  return <FamilyDashboard space={space} token={token!} />;
}

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
        <p className="text-white/50 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function FamilyDashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FamilyDashboardContent />
    </Suspense>
  );
}
