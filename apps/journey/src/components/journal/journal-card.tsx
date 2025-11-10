'use client';

import { JournalEntry } from '@ainexsuite/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { cn } from '@/lib/utils';
import { deleteJournalEntry } from '@/lib/firebase/firestore';
import { deleteAllEntryFiles } from '@/lib/firebase/storage';
import { useToast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { Paperclip, Trash2, Edit, Link, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { usePrivacy } from '@/contexts/privacy-context';
import { BlurredContent } from '@/components/privacy/blurred-content';
import { PasscodeModal } from '@/components/privacy/passcode-modal';
import { format } from 'date-fns';

interface JournalCardProps {
  entry: JournalEntry;
  onUpdate: () => void;
}

export function JournalCard({ entry, onUpdate }: JournalCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'view' | 'edit' | null>(null);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode, isLoading: privacyLoading } = usePrivacy();

  // Private entries should only be locked if:
  // 1. Entry is private AND
  // 2. User HAS set up a passcode AND
  // 3. Session is not currently unlocked
  // If no passcode is set, private entries are just visually marked but still accessible
  const isLocked = entry.isPrivate && hasPasscode && !isUnlocked;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    setIsDeleting(true);
    try {
      // Delete attachments first
      if (entry.attachments && entry.attachments.length > 0) {
        await deleteAllEntryFiles(entry.userId, entry.id);
      }

      // Then delete the entry
      await deleteJournalEntry(entry.id);

      toast({
        title: 'Entry deleted',
        description: 'Your journal entry has been deleted.',
        variant: 'success',
      });

      onUpdate();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    if (isLocked) {
      setPendingAction('edit');
      setShowPasscodeModal(true);
    } else {
      router.push(`/workspace/${entry.id}`);
    }
  };

  const handleView = () => {
    if (isLocked) {
      setPendingAction('view');
      setShowPasscodeModal(true);
    } else {
      router.push(`/workspace/${entry.id}/view`);
    }
  };

  const handlePasscodeSubmit = async (passcode: string) => {
    let success = false;

    try {
      if (hasPasscode) {
        // Verify existing passcode
        success = await verifyPasscode(passcode);
      } else {
        // Set up new passcode
        success = await setupPasscode(passcode);
        // If setup was successful, immediately verify to unlock
        if (success) {
          success = await verifyPasscode(passcode);
        }
      }

      if (success) {
        // Close modal first
        setShowPasscodeModal(false);

        // Small delay to ensure modal closes
        setTimeout(() => {
          if (pendingAction === 'edit') {
            router.push(`/workspace/${entry.id}`);
          } else if (pendingAction === 'view') {
            router.push(`/workspace/${entry.id}/view`);
          }
          setPendingAction(null);
        }, 100);
      }
    } catch (error) {
      console.error('Error handling passcode:', error);
      toast({
        title: 'Error',
        description: 'Failed to process passcode. Please try again.',
        variant: 'error',
      });
    }

    return success;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    // First, add spaces between list items and paragraphs to avoid jumbled text
    let processedContent = content
      .replace(/<\/li>/gi, '</li> ') // Add space after list items
      .replace(/<\/p>/gi, '</p> ') // Add space after paragraphs
      .replace(/<br\s*\/?>/gi, ' ') // Replace line breaks with spaces
      .replace(/<\/div>/gi, '</div> ') // Add space after divs
      .replace(/<\/h[1-6]>/gi, ' ') // Add space after headings
      .replace(/<li>/gi, ' • '); // Add bullet point for list items

    // Strip HTML tags and decode entities
    let textContent = processedContent
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace ampersands
      .replace(/&lt;/g, '<') // Replace less than
      .replace(/&gt;/g, '>') // Replace greater than
      .replace(/&quot;/g, '"') // Replace quotes
      .replace(/&#39;/g, "'") // Replace apostrophes
      .replace(/&mdash;/g, '—') // Replace em dashes
      .replace(/&ndash;/g, '–') // Replace en dashes
      .replace(/\s+/g, ' ') // Clean up extra whitespace
      .trim();

    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className="bg-zinc-800/95 backdrop-blur-md hover:shadow-lg hover:shadow-[#f97316]/10 transition-all duration-200 relative group rounded-xl border border-white/10 p-6 overflow-hidden">
      {/* Action buttons overlay with orange theme */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
          className="p-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg shadow-lg shadow-[#f97316]/20 hover:shadow-xl hover:shadow-[#f97316]/30 transform hover:scale-110 transition-all duration-200"
          disabled={isDeleting}
          aria-label="Edit entry"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          disabled={isDeleting}
          aria-label="Delete entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {entry.isPrivate && (
              <div className="flex items-center" title={
                !hasPasscode ? "Private entry (no passcode set)" :
                isLocked ? "Private entry (locked)" :
                "Private entry (unlocked)"
              }>
                {!hasPasscode ? (
                  <Lock className="w-4 h-4 text-amber-500" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-red-500" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-500" />
                )}
              </div>
            )}
            {entry.isDraft && (
              <span className="rounded-full border border-dashed border-[#f97316]/50 bg-[#f97316]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#f97316]">
                Draft
              </span>
            )}
            <h3 className="font-semibold text-lg text-white line-clamp-1 pr-20">
              {entry.title}
            </h3>
          </div>
          <DateBadge createdAt={entry.createdAt} />
        </div>
      </div>

      <BlurredContent isLocked={isLocked} onClick={handleView} className="min-h-[70px] mb-4">
        <p className="text-white/70 line-clamp-3">
          {truncateContent(entry.content)}
        </p>
      </BlurredContent>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {entry.mood && (() => {
            const Icon = getMoodIcon(entry.mood);
            return (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                <Icon className="h-4 w-4" />
                {getMoodLabel(entry.mood)}
              </span>
            );
          })()}

          {entry.tags && entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-white/10 text-white px-2 py-1 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}

          {entry.tags && entry.tags.length > 3 && (
            <span className="text-xs text-white/60">
              +{entry.tags.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {entry.attachments && entry.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-white/60">
              <Paperclip className="w-4 h-4" />
              <span className="text-xs">{entry.attachments.length}</span>
            </div>
          )}

          {entry.links && entry.links.length > 0 && (
            <div className="flex items-center gap-1 text-[#f97316]">
              <Link className="w-4 h-4" />
              <span className="text-xs">{entry.links.length}</span>
            </div>
          )}
        </div>
      </div>

      {!isLocked && (
        <button
          onClick={handleView}
          className="absolute inset-0 z-10"
          aria-label="View entry"
        >
          <span className="sr-only">View entry</span>
        </button>
      )}

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => {
          setShowPasscodeModal(false);
          setPendingAction(null);
        }}
        onSubmit={handlePasscodeSubmit}
        mode={hasPasscode ? 'verify' : 'setup'}
        title={hasPasscode ? 'Unlock Private Entries' : 'Set Privacy Passcode'}
      />
    </div>
  );
}

function DateBadge({ createdAt }: { createdAt: Date | string | number }) {
  const date = typeof createdAt === 'string'
    ? new Date(createdAt)
    : typeof createdAt === 'number'
    ? new Date(createdAt)
    : createdAt;
  const month = format(date, 'MMM');
  const day = format(date, 'dd');
  const time = format(date, 'p');

  return (
    <div className="flex items-center gap-3 text-sm text-white/60">
      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-900/90 shadow-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#f97316]">
          {month}
        </span>
        <span className="text-lg font-bold text-white">{day}</span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-white">{formatDate(date)}</span>
        <span className="text-xs text-white/60 flex items-center gap-1">
          <span>{time}</span>
          <span>•</span>
          <span>{formatRelativeTime(date)}</span>
        </span>
      </div>
    </div>
  );
}
