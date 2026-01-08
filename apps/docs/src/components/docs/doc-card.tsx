"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Users,
  Check,
} from "lucide-react";
import { FocusIcon } from "@/components/icons/focus-icon";
import { clsx } from "clsx";
import { ConfirmationDialog, PriorityIcon, FocusGlow } from "@ainexsuite/ui";
import type { Doc } from "@/lib/types/doc";
import { useDocs } from "@/components/providers/docs-provider";
import { DOC_COLORS } from "@/lib/constants/doc-colors";
import { useLabels } from "@/components/providers/labels-provider";
import { getBackgroundById, getTextColorClasses, getOverlayClasses, FALLBACK_BACKGROUNDS } from "@/lib/backgrounds";
import { useBackgrounds } from "@/components/providers/backgrounds-provider";
import { useCovers } from "@/components/providers/covers-provider";
import { ImageModal } from "@/components/ui/image-modal";
import { stripHtml } from "@/lib/utils/strip-html";

type DocCardProps = {
  doc: Doc;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (docId: string, event: React.MouseEvent) => void;
};

export function DocCard({ doc, isSelectMode = false, isSelected = false, onSelect }: DocCardProps) {
  const router = useRouter();
  const { togglePin, deleteDoc } = useDocs();
  const { labels } = useLabels();
  const { backgrounds: firestoreBackgrounds } = useBackgrounds();
  const { covers } = useCovers();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const labelMap = useMemo(() => {
    return new Map(labels.map((label) => [label.id, label]));
  }, [labels]);

  const docLabels = useMemo(() => {
    return doc.labelIds
      .map((labelId) => labelMap.get(labelId))
      .filter((label): label is NonNullable<typeof label> => Boolean(label));
  }, [doc.labelIds, labelMap]);

  // Combine Firestore backgrounds with fallback
  const availableBackgrounds = useMemo(() => {
    return firestoreBackgrounds.length > 0 ? firestoreBackgrounds : FALLBACK_BACKGROUNDS;
  }, [firestoreBackgrounds]);

  const docColorConfig = DOC_COLORS.find((c) => c.id === doc.color);
  const cardClass = docColorConfig?.cardClass || "bg-zinc-50 dark:bg-zinc-900";
  const backgroundImage = doc.backgroundImage ? getBackgroundById(doc.backgroundImage, availableBackgrounds) ?? null : null;

  // Get current cover object
  const currentCover = useMemo(() => {
    if (!doc.coverImage) return null;
    return covers.find((c) => c.id === doc.coverImage) || null;
  }, [doc.coverImage, covers]);

  // Determine if we're using a cover image
  const hasCover = currentCover !== null;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteDoc(doc.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }
    setShowDeleteConfirm(false);
  };

  const handlePin = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    await togglePin(doc.id, !doc.pinned);
  };

  return (
    <>
      <article
        className={clsx(
          // Use theme lab color system for light/dark mode
          !backgroundImage && !hasCover && cardClass,
          "border border-zinc-200 dark:border-zinc-800",
          "group relative cursor-pointer overflow-hidden rounded-2xl",
          // Only transition on hover, not on initial render (prevents blinking)
          "hover:transition-[border-color,box-shadow,transform] hover:duration-200",
          "hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md",
          "break-inside-avoid px-4 py-4 h-[220px] flex flex-col",
          // Selection styles - glow effect and scale
          isSelected && "border-primary dark:border-primary ring-4 ring-primary/20 scale-[0.98]",
        )}
        onClick={(event) => {
          if (isSelectMode && onSelect) {
            event.preventDefault();
            event.stopPropagation();
            onSelect(doc.id, event);
          } else {
            // Navigate to full-page editor
            router.push(`/workspace/${doc.id}`);
          }
        }}
      >
        {/* Animated glow effect for pinned cards */}
        {doc.pinned && <FocusGlow />}

        {/* Selection Checkbox - shows on hover or in select mode */}
        {onSelect && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(doc.id, event);
            }}
            className={clsx(
              "absolute z-30 h-5 w-5 rounded-full transition-all duration-200",
              "flex items-center justify-center",
              "backdrop-blur-xl border shadow-sm",
              // Position in title row, right side but left of pin corner
              "top-3 right-[36px]",
              isSelected
                ? "bg-primary border-primary scale-110"
                : clsx(
                    "border-white/30 dark:border-zinc-600/50",
                    backgroundImage || hasCover
                      ? "bg-black/20"
                      : "bg-white/80 dark:bg-zinc-800/80"
                  ),
              isSelectMode
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100 hover:scale-110",
            )}
            aria-label={isSelected ? "Deselect doc" : "Select doc"}
          >
            {isSelected ? (
              <Check className="h-3 w-3 text-white" />
            ) : (
              <div className={clsx(
                "h-2 w-2 rounded-full border-[1.5px]",
                backgroundImage || hasCover
                  ? "border-white/50"
                  : "border-zinc-400 dark:border-zinc-500"
              )} />
            )}
          </button>
        )}

        {/* Cover Image Layer */}
        {hasCover && !backgroundImage && currentCover && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <img
              src={currentCover.thumbnail}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* Subtle overlay for text readability */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </div>
        )}

        {/* Background Image Layer */}
        {backgroundImage && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${backgroundImage.fullImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Overlay for text readability */}
            <div className={clsx(getOverlayClasses(backgroundImage, doc.backgroundOverlay ?? 'auto'), 'z-10')} />
          </div>
        )}

        {/* Corner Focus Badge - clickable to toggle focus */}
        <button
          type="button"
          onClick={handlePin}
          className="absolute -top-0 -right-0 w-10 h-10 overflow-hidden rounded-tr-lg z-20 group/pin"
          aria-label={doc.pinned ? "Remove from Focus" : "Add to Focus"}
        >
          {doc.pinned ? (
            <>
              <div className="absolute top-0 right-0 bg-[var(--color-primary)] group-hover/pin:brightness-90 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all" />
              <FocusIcon focused className="absolute top-1.5 right-1.5 h-3 w-3 text-white" />
            </>
          ) : (
            <>
              <div className={clsx(
                "absolute top-0 right-0 w-14 h-14 rotate-45 translate-x-7 -translate-y-7 transition-all",
                "opacity-0 group-hover:opacity-100",
                backgroundImage?.brightness === 'light'
                  ? "bg-black/10"
                  : backgroundImage || hasCover
                    ? "bg-white/10"
                    : "bg-zinc-200/50 dark:bg-zinc-700/50"
              )} />
              <FocusIcon className={clsx(
                "absolute top-1.5 right-1.5 h-3 w-3 transition-all",
                "opacity-0 group-hover:opacity-100",
                backgroundImage?.brightness === 'light'
                  ? "text-[var(--color-primary)]"
                  : backgroundImage || hasCover
                    ? "text-[var(--color-primary)]/80"
                    : "text-[var(--color-primary)]"
              )} />
            </>
          )}
        </button>

        {/* Header with title */}
        {doc.title && (
          <div className={clsx(
            "relative z-10 -mx-4 -mt-4 px-4 py-2.5 rounded-t-2xl border-b mb-2",
            backgroundImage?.brightness === 'light'
              ? "bg-white/30 backdrop-blur-sm border-black/10"
              : backgroundImage
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : hasCover
                  ? "bg-black/30 backdrop-blur-sm border-white/10"
                  : "border-transparent"
          )}>
            <h3 className={clsx(
              "pr-8 text-[14px] font-semibold tracking-[-0.02em] line-clamp-1",
              hasCover && !backgroundImage
                ? "text-white"
                : getTextColorClasses(backgroundImage, 'title')
            )}>
              {doc.title}
            </h3>
          </div>
        )}

        <div className="relative z-10 w-full flex-1 flex flex-col overflow-hidden">
          <div
            className="overflow-y-auto pr-1 flex-1"
          >

            {doc.type === "checklist" ? (
              <>
              <ul className="space-y-1">
                {doc.checklist.slice(0, 5).map((item) => {
                  const indentLevel = item.indent ?? 0;
                  return (
                    <li
                      key={item.id}
                      className={clsx(
                        "flex items-start gap-2 text-[12px]",
                        item.completed
                          ? clsx(
                              hasCover && !backgroundImage
                                ? "text-white/50"
                                : getTextColorClasses(backgroundImage, 'checklist-completed'),
                              "line-through"
                            )
                          : hasCover && !backgroundImage
                            ? "text-white/90"
                            : getTextColorClasses(backgroundImage, 'checklist'),
                      )}
                      style={{ paddingLeft: `${indentLevel * 12}px` }}
                    >
                      <span className={clsx(
                        "mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0",
                        item.completed
                          ? hasCover && !backgroundImage
                            ? "bg-white/30"
                            : backgroundImage?.brightness === 'light' ? "bg-black/20" : backgroundImage ? "bg-white/30" : "bg-zinc-300 dark:bg-zinc-700"
                          : "bg-yellow-500"
                      )} />
                      <span className="line-clamp-1">{item.text}</span>
                    </li>
                  );
                })}
                {doc.checklist.length > 5 ? (
                  <li className={clsx(
                    "text-[10px]",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    +{doc.checklist.length - 5} more
                  </li>
                ) : null}
              </ul>
              {/* Progress indicator */}
              {doc.checklist.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={clsx(
                    "flex-1 h-1 rounded-full overflow-hidden",
                    hasCover && !backgroundImage
                      ? "bg-white/20"
                      : backgroundImage?.brightness === 'light'
                        ? "bg-black/10"
                        : backgroundImage
                          ? "bg-white/20"
                          : "bg-zinc-200 dark:bg-zinc-700"
                  )}>
                    <div
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{
                        width: `${(doc.checklist.filter(i => i.completed).length / doc.checklist.length) * 100}%`
                      }}
                    />
                  </div>
                  <span className={clsx(
                    "text-[10px] font-medium tabular-nums",
                    hasCover && !backgroundImage
                      ? "text-white/70"
                      : getTextColorClasses(backgroundImage, 'muted')
                  )}>
                    {doc.checklist.filter(i => i.completed).length}/{doc.checklist.length}
                  </span>
                </div>
              )}
              </>
            ) : doc.body ? (
              <p className={clsx(
                "whitespace-pre-wrap text-[13px] leading-5 tracking-[-0.01em] line-clamp-4",
                hasCover && !backgroundImage
                  ? "text-white/90"
                  : getTextColorClasses(backgroundImage, 'body')
              )}>
                {stripHtml(doc.body)}
              </p>
            ) : null}

            {doc.attachments.length ? (
              <div className="mt-2 grid gap-1.5 grid-cols-2">
                {doc.attachments.slice(0, 2).map((attachment) => (
                  <figure
                    key={attachment.id}
                    className="overflow-hidden rounded-lg bg-foreground/10 shadow-sm border border-border cursor-zoom-in hover:brightness-95 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewImage(attachment.downloadURL);
                    }}
                  >
                    <img
                      src={attachment.downloadURL}
                      alt={attachment.name}
                      className="h-16 w-full object-cover"
                    />
                  </figure>
                ))}
                {doc.attachments.length > 2 ? (
                  <div className="grid place-items-center rounded-lg bg-foreground/10 p-2 text-[10px] font-medium text-muted-foreground">
                    +{doc.attachments.length - 2} more
                  </div>
                ) : null}
              </div>
            ) : null}

            {docLabels.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-1">
                {docLabels.slice(0, 2).map((label) => (
                  <span
                    key={label.id}
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                      hasCover && !backgroundImage
                        ? "bg-white/10 text-white/90"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        label.color === "default"
                          ? "bg-zinc-400"
                          : `bg-${label.color}-500`,
                      )}
                    />
                    <span>{label.name}</span>
                  </span>
                ))}
                {docLabels.length > 2 && (
                  <span className="text-[10px] text-zinc-400">+{docLabels.length - 2}</span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer - outside overflow wrapper so it extends to card edges */}
        <footer className={clsx(
          "relative z-10 mt-auto flex items-center justify-between pt-2 -mx-4 -mb-4 px-4 pb-3 rounded-b-2xl border-t",
          backgroundImage?.brightness === 'light'
            ? "bg-white/30 backdrop-blur-sm border-black/10"
            : backgroundImage
              ? "bg-black/30 backdrop-blur-sm border-white/10"
              : hasCover
                ? "bg-black/30 backdrop-blur-sm border-white/10"
                : "bg-black/5 dark:bg-white/5 border-transparent"
        )}>
          {/* Glass pill for date/shared info */}
          <div className={clsx(
            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full backdrop-blur-xl border",
            backgroundImage
              ? backgroundImage.brightness === 'dark'
                ? "bg-white/10 border-white/20"
                : "bg-black/5 border-black/10"
              : hasCover
                ? "bg-white/10 border-white/20"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            {doc.sharedWithUserIds?.length ? (
              <span className={clsx(
                "h-5 flex items-center gap-1 rounded-full px-1.5 text-[10px] font-medium",
                hasCover && !backgroundImage
                  ? "text-white/70"
                  : getTextColorClasses(backgroundImage, 'muted')
              )}>
                <Users className="h-3 w-3" />
                {doc.sharedWithUserIds.length}
              </span>
            ) : null}
            <span className={clsx(
              "h-5 flex items-center px-1.5 rounded-full text-[10px] font-medium",
              hasCover && !backgroundImage
                ? "text-white/70"
                : getTextColorClasses(backgroundImage, 'muted')
            )}>
              {(doc.updatedAt.getTime() !== doc.createdAt.getTime() ? doc.updatedAt : doc.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              {' · '}
              {doc.updatedAt.getTime() !== doc.createdAt.getTime() ? 'Edited' : 'Created'}
            </span>
          </div>
          {/* Glass pill for actions */}
          <div className={clsx(
            "flex items-center gap-0.5 px-1 py-0.5 rounded-full backdrop-blur-xl border",
            backgroundImage
              ? backgroundImage.brightness === 'dark'
                ? "bg-white/10 border-white/20"
                : "bg-black/5 border-black/10"
              : hasCover
                ? "bg-white/10 border-white/20"
                : "bg-zinc-100/80 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-700/50"
          )}>
            {/* Priority Indicator */}
            {doc.priority && (
              <div
                className="h-5 w-5 rounded-full flex items-center justify-center"
                title={`${doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)} priority`}
              >
                <PriorityIcon priority={doc.priority} size="sm" showOnlyHighPriority={false} />
              </div>
            )}
            <button
              type="button"
              onClick={handleDeleteClick}
              className={clsx(
                "h-5 w-5 rounded-full flex items-center justify-center transition",
                backgroundImage?.brightness === 'light'
                  ? "text-red-600 hover:bg-red-500/20 hover:text-red-700"
                  : backgroundImage
                    ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                    : hasCover
                      ? "text-red-300 hover:bg-red-500/30 hover:text-red-200"
                      : "text-red-400 hover:bg-red-500/20 hover:text-red-500"
              )}
              aria-label="Delete doc"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </footer>
      </article>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete this doc?"
        description="This will move the doc to the Trash. You can restore it from there within the next 30 days."
        confirmText="Delete doc"
        cancelText="Keep doc"
        variant="danger"
      />
      <ImageModal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        src={previewImage || ""}
      />
    </>
  );
}
