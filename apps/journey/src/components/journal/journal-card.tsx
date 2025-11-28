import { JournalEntry } from '@ainexsuite/types';
import { formatDate, formatRelativeTime } from '@/lib/utils/date';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { cn } from '@/lib/utils';
import { deleteJournalEntry } from '@/lib/firebase/firestore';
import { deleteAllEntryFiles } from '@/lib/firebase/storage';
import { useToast } from '@ainexsuite/ui';
import { useRouter } from 'next/navigation';
import { Paperclip, Trash2, Edit, Link as LinkIcon, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import { usePrivacy } from '@/contexts/privacy-context';
import { BlurredContent } from '@/components/privacy/blurred-content';
import { PasscodeModal } from '@/components/privacy/passcode-modal';
import { format } from 'date-fns';
import { DashboardTheme } from '@/lib/dashboard-themes';

interface JournalCardProps {
  entry: JournalEntry;
  onUpdate: () => void;
  theme?: DashboardTheme;
}

export function JournalCard({ entry, onUpdate, theme }: JournalCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<'view' | 'edit' | null>(null);
  const { isUnlocked, hasPasscode, verifyPasscode, setupPasscode } = usePrivacy();

  // Fallbacks
  const textPrimary = theme?.textPrimary || 'text-white';
  const textSecondary = theme?.textSecondary || 'text-white/70';
  const accentText = theme?.accent || 'text-[#f97316]';
  const accentBg = theme?.accentBg || 'bg-[#f97316]';
  const bgSurface = theme?.bgSurface || 'bg-zinc-800/95';
  const borderClass = theme?.border || 'border-white/10';
  
  // Private entries logic...
  const isLocked = entry.isPrivate && hasPasscode && !isUnlocked;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    setIsDeleting(true);
    try {
      if (entry.attachments && entry.attachments.length > 0) {
        await deleteAllEntryFiles(entry.ownerId, entry.id);
      }
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
        success = await verifyPasscode(passcode);
      } else {
        success = await setupPasscode(passcode);
        if (success) {
          success = await verifyPasscode(passcode);
        }
      }
      if (success) {
        setShowPasscodeModal(false);
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
      toast({
        title: 'Error',
        description: 'Failed to process passcode. Please try again.',
        variant: 'error',
      });
    }
    return success;
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    const processedContent = content
      .replace(/<\/li>/gi, '</li> ')
      .replace(/<\/p>/gi, '</p> ')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/div>/gi, '</div> ')
      .replace(/<\/h[1-6]>/gi, ' ')
      .replace(/<li>/gi, ' • ');

    const textContent = processedContent
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–')
      .replace(/\s+/g, ' ')
      .trim();

    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={cn("relative group overflow-hidden transition-all duration-300", 
        theme ? cn(theme.panel, theme.radius, theme.border, theme.shadow, theme.bgHover) : "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10"
    )}>
      {/* Action buttons overlay */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit();
          }}
          className={cn("p-2.5 text-white rounded-lg shadow-lg transform hover:scale-110 transition-all duration-200", accentBg)}
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

      <div className="p-6">
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
                <span className={cn("rounded-full border border-dashed px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", borderClass, accentText)}>
                    Draft
                </span>
                )}
                <h3 className={cn("font-semibold text-lg line-clamp-1 pr-20", textPrimary)}>
                {entry.title}
                </h3>
            </div>
            <DateBadge createdAt={entry.createdAt} theme={theme} />
            </div>
        </div>

        <BlurredContent isLocked={isLocked} onClick={handleView} className="min-h-[70px] mb-4">
            <p className={cn("line-clamp-3", textSecondary)}>
            {truncateContent(entry.content)}
            </p>
        </BlurredContent>

        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
            {entry.mood && (() => {
                const Icon = getMoodIcon(entry.mood);
                return (
                <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", bgSurface, textPrimary)}>
                    <Icon className="h-4 w-4" />
                    {getMoodLabel(entry.mood)}
                </span>
                );
            })()}

            {entry.tags && entry.tags.slice(0, 3).map((tag) => (
                <span
                key={tag}
                className={cn("px-2 py-1 rounded-full text-xs", bgSurface, textPrimary)}
                >
                {tag}
                </span>
            ))}

            {entry.tags && entry.tags.length > 3 && (
                <span className={cn("text-xs", textSecondary)}>
                +{entry.tags.length - 3} more
                </span>
            )}
            </div>

            <div className="flex items-center gap-3">
            {entry.attachments && entry.attachments.length > 0 && (
                <div className={cn("flex items-center gap-1", textSecondary)}>
                <Paperclip className="w-4 h-4" />
                <span className="text-xs">{entry.attachments.length}</span>
                </div>
            )}

            {entry.links && entry.links.length > 0 && (
                <div className={cn("flex items-center gap-1", accentText)}>
                <LinkIcon className="w-4 h-4" />
                <span className="text-xs">{entry.links.length}</span>
                </div>
            )}
            </div>
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

function DateBadge({ createdAt, theme }: { createdAt: Date | string | number, theme?: DashboardTheme }) {
  const date = typeof createdAt === 'string'
    ? new Date(createdAt)
    : typeof createdAt === 'number'
    ? new Date(createdAt)
    : createdAt;
  const month = format(date, 'MMM');
  const day = format(date, 'dd');
  const time = format(date, 'p');
  
  const accentText = theme?.accent || 'text-[#f97316]';
  const textPrimary = theme?.textPrimary || 'text-white';
  const textSecondary = theme?.textSecondary || 'text-white/60';
  const bgSurface = theme?.bgSurface || 'bg-white/5';
  const borderClass = theme?.border || 'border-white/10';

  return (
    <div className={cn("flex items-center gap-3 text-sm", textSecondary)}>
      <div className={cn("flex h-12 w-12 flex-col items-center justify-center rounded-xl border shadow-sm", borderClass, bgSurface)}>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", accentText)}>
          {month}
        </span>
        <span className={cn("text-lg font-bold", textPrimary)}>{day}</span>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={cn("text-sm font-medium", textPrimary)}>{formatDate(date)}</span>
        <span className={cn("text-xs flex items-center gap-1", textSecondary)}>
          <span>{time}</span>
          <span>•</span>
          <span>{formatRelativeTime(date)}</span>
        </span>
      </div>
    </div>
  );
}
