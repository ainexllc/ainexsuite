'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { getJournalEntry } from '@/lib/firebase/firestore';
import { JournalView } from '@/components/journal/journal-view';
import { useToast } from '@/lib/toast';
import type { JournalEntry } from '@ainexsuite/types';
import { ArrowLeft, Edit, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePrivacy } from '@/contexts/privacy-context';
import { PasscodeModal } from '@/components/privacy/passcode-modal';
import { BlurredContent } from '@/components/privacy/blurred-content';
import { PrivateEntryNotice } from '@/components/privacy/private-entry-notice';

export default function ViewJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();

  useEffect(() => {
    if (user && resolvedParams.id) {
      loadEntry();
    }
  }, [user, resolvedParams.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntry(resolvedParams.id);

      if (!data || data.userId !== user?.uid) {
        toast({
          title: 'Error',
          description: 'Journal entry not found',
          variant: 'error',
        });
        router.push('/workspace');
        return;
      }

      setEntry(data);

      // Check if entry is private and locked
      if (data.isPrivate && hasPasscode && !isUnlocked) {
        setShowPasscodeModal(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load journal entry',
        variant: 'error',
      });
      router.push('/workspace');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin w-8 h-8 text-[#f97316]" />
      </div>
    );
  }

  if (!entry) {
    return null;
  }

  const isLocked = entry.isPrivate && hasPasscode && !isUnlocked;

  const handlePasscodeSubmit = async (passcode: string) => {
    if (hasPasscode) {
      const success = await verifyPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    } else {
      const success = await setupPasscode(passcode);
      if (success) {
        setShowPasscodeModal(false);
      }
      return success;
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.45)] backdrop-blur">
        <div className="flex items-center justify-between">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>

          <Link
            href={`/workspace/${entry.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:border-[#f97316]/30 hover:bg-[#f97316]/10"
          >
            <Edit className="w-4 h-4" />
            Edit Entry
          </Link>
        </div>
      </div>

      <PrivateEntryNotice isPrivate={entry.isPrivate} />

      {isLocked ? (
        <div className="max-w-4xl rounded-3xl border border-white/10 bg-zinc-800/90 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-white/70" />
            <h1 className="text-2xl font-bold text-white">{entry.title}</h1>
          </div>
          <BlurredContent isLocked={true} onClick={() => setShowPasscodeModal(true)}>
            <div className="h-64" />
          </BlurredContent>
        </div>
      ) : (
        <JournalView entry={entry} />
      )}

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => {
          if (isLocked) {
            router.push('/workspace');
          } else {
            setShowPasscodeModal(false);
          }
        }}
        onSubmit={handlePasscodeSubmit}
        mode={hasPasscode ? 'verify' : 'setup'}
        title={hasPasscode ? 'Unlock Private Entry' : 'Set Privacy Passcode'}
      />
    </div>
  );
}
