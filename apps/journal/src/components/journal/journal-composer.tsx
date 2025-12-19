"use client";

import { useState } from "react";
import { FolderOpen, ChevronDown, Plus, Check } from "lucide-react";
import { clsx } from "clsx";
import { SpaceEditor as SharedSpaceEditor } from "@ainexsuite/ui";
import type { SpaceType as SharedSpaceType } from "@ainexsuite/types";
import type { SpaceType as JournalSpaceType } from "@/lib/types/space";
import { useSpaces } from "@/components/providers/spaces-provider";
import { useAuth } from "@ainexsuite/auth";
import { JournalComposerModal } from "./journal-composer-modal";

interface JournalComposerProps {
  onEntryCreated?: () => void;
}

export function JournalComposer({ onEntryCreated }: JournalComposerProps) {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, createSpace } = useSpaces();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpacePicker, setShowSpacePicker] = useState(false);
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  // Get current space name
  const currentSpace = spaces.find((s) => s.id === currentSpaceId);
  const currentSpaceName = currentSpace?.name || "Personal";

  const handleCreateSpace = async (data: { name: string; type: SharedSpaceType }) => {
    if (!user) return;
    const journalType = data.type as JournalSpaceType;
    await createSpace({ name: data.name, type: journalType });
  };

  return (
    <section className="w-full mb-8">
      <div className="flex w-full items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm transition bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700">
        <button
          type="button"
          className="flex-1 min-w-0 text-left text-sm text-zinc-400 dark:text-zinc-500 focus-visible:outline-none"
          onClick={() => setIsOpen(true)}
        >
          <span>Write a journal entry...</span>
        </button>
        {/* Compact space selector */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSpacePicker((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="max-w-[80px] truncate">{currentSpaceName}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          {showSpacePicker && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSpacePicker(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-30 min-w-[160px] rounded-xl border shadow-lg bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 py-1">
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => {
                      setCurrentSpace(space.id);
                      setShowSpacePicker(false);
                    }}
                    className={clsx(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition",
                      space.id === currentSpaceId
                        ? "text-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    <FolderOpen className="h-4 w-4" />
                    <span className="flex-1 truncate">{space.name}</span>
                    {space.id === currentSpaceId && <Check className="h-4 w-4" />}
                  </button>
                ))}
                <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSpacePicker(false);
                      setShowSpaceEditor(true);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Space</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <JournalComposerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onEntryCreated={onEntryCreated}
      />

      {/* Space Editor Dialog */}
      <SharedSpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
        onSubmit={handleCreateSpace}
        spaceTypes={[
          { value: "personal", label: "Personal", description: "Your private journal" },
          { value: "family", label: "Family", description: "Share memories with family" },
          { value: "couple", label: "Couple", description: "Journal together with your partner" },
        ]}
      />
    </section>
  );
}
