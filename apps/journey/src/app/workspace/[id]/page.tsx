'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { getJournalEntry, updateJournalEntry } from '@/lib/firebase/firestore';
import { uploadMultipleFiles, deleteFile } from '@/lib/firebase/storage';
import { JournalForm } from '@/components/journal/journal-form';
import { useToast } from '@/lib/toast';
import type { JournalEntry, JournalEntryFormData, Attachment } from '@ainexsuite/types';
import { sentimentService } from '@/lib/ai/sentiment-service';
import { saveSentimentAnalysis } from '@/lib/firebase/sentiment';
import { ArrowLeft, Loader2, Paperclip, X, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils/date';
import { usePrivacy } from '@/contexts/privacy-context';
import { PasscodeModal } from '@/components/privacy/passcode-modal';

export default function EditJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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
      setAttachments(data.attachments);

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

  const handleSubmit = async (data: JournalEntryFormData, newFiles: File[]) => {
    if (!user || !entry) return;

    setIsSubmitting(true);
    try {
      const isDraft = data.isDraft ?? entry.isDraft ?? false;
      // Update the journal entry
      await updateJournalEntry(entry.id, data);

      // Upload new attachments if any
      if (newFiles.length > 0) {
        const uploadedFiles = await uploadMultipleFiles(user.uid, entry.id, newFiles);
        const newAttachments = uploadedFiles.map(file => ({
          ...file,
          uploadedAt: new Date(),
        }));

        // Update attachments state
        setAttachments([...attachments, ...newAttachments]);
      }

      // Trigger sentiment re-analysis in the background
      getJournalEntry(entry.id).then(async (updatedEntry) => {
        if (updatedEntry) {
          try {
            const analysis = await sentimentService.analyzeEntry(updatedEntry);
            await saveSentimentAnalysis(analysis);
          } catch (error) {
            console.error('Sentiment analysis failed:', error);
            // Don't show error to user, analysis is optional
          }
        }
      });

      toast({
        title: isDraft ? 'Draft updated' : 'Success!',
        description: isDraft
          ? 'Your draft changes have been saved.'
          : 'Your journal entry has been updated.',
        variant: 'success',
      });

      router.push(isDraft ? `/workspace/${entry.id}` : '/workspace');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update journal entry',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttachment = async (attachment: Attachment) => {
    if (!user || !entry) return;

    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      // Extract filename from URL or use attachment ID
      const fileName = attachment.url.split('/').pop()?.split('?')[0] || attachment.id;

      // Delete from storage
      await deleteFile(user.uid, entry.id, fileName);

      // Update attachments state
      const updatedAttachments = attachments.filter(a => a.id !== attachment.id);
      setAttachments(updatedAttachments);

      toast({
        title: 'Attachment deleted',
        description: 'The attachment has been removed.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete attachment',
        variant: 'error',
      });
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

  if (isLocked) {
    return (
      <div className="space-y-8">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.45)] backdrop-blur">
          <Link
            href="/workspace"
            className="mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workspace
          </Link>

          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-white/70" />
            <h1 className="text-3xl font-semibold text-white">
              Private Entry
            </h1>
          </div>
          <p className="text-white/60 mt-2">
            This entry is private. Enter your passcode to edit.
          </p>
        </div>

        <div className="max-w-4xl rounded-3xl border border-white/10 bg-zinc-800/90 p-8 shadow-sm">
          <button
            onClick={() => setShowPasscodeModal(true)}
            className="w-full py-12 flex flex-col items-center justify-center gap-3 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Lock className="w-12 h-12 text-white/40" />
            <p className="text-white/60">Click to unlock and edit</p>
          </button>
        </div>

        <PasscodeModal
          isOpen={showPasscodeModal}
          onClose={() => {
            router.push('/workspace');
          }}
          onSubmit={handlePasscodeSubmit}
          mode={hasPasscode ? 'verify' : 'setup'}
          title={hasPasscode ? 'Unlock Private Entry' : 'Set Privacy Passcode'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_80px_-40px_rgba(249,115,22,0.45)] backdrop-blur">
        <Link
          href="/workspace"
          className="mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>

        <h1 className="text-3xl font-semibold text-white mb-2">
          Edit Journal Entry
        </h1>
        <p className="text-white/60">
          Last updated: {formatDateTime(entry.updatedAt)}
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {attachments.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-zinc-800/90 p-5 shadow-sm">
            <h3 className="text-sm font-medium text-white mb-3">
              Current Attachments
            </h3>
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between bg-zinc-700/60 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-[#f97316]" />
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white hover:text-[#f97316] truncate"
                    >
                      {attachment.name}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteAttachment(attachment)}
                    className="text-red-500 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/10 bg-zinc-800/90 p-6 shadow-sm">
          <JournalForm
            initialData={{
              title: entry.title,
              content: entry.content,
              tags: entry.tags,
              mood: entry.mood,
              links: entry.links || [],
              isPrivate: entry.isPrivate,
              isDraft: entry.isDraft,
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
