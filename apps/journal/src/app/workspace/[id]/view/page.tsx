'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { getJournalEntry } from '@/lib/firebase/firestore';
import { JournalEntryViewer } from '@/components/journal/journal-entry-viewer';
import { useToast } from '@ainexsuite/ui';
import type { JournalEntry } from '@ainexsuite/types';
import { Loader2 } from 'lucide-react';

export default function ViewJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && resolvedParams.id) {
      loadEntry();
    }
  }, [user, resolvedParams.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEntry = async () => {
    try {
      setLoading(true);
      const data = await getJournalEntry(resolvedParams.id);

      if (!data || data.ownerId !== user?.uid) {
        toast({
          title: 'Error',
          description: 'Journal entry not found',
          variant: 'error',
        });
        router.push('/workspace');
        return;
      }

      setEntry(data);
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

  return (
    <JournalEntryViewer
      entry={entry}
      onClose={() => router.push('/workspace')}
      onEdit={() => router.push(`/workspace/${entry.id}`)}
    />
  );
}
