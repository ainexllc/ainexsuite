"use client";

import { useState } from "react";
import { JournalComposerModal } from "./journal-composer-modal";

interface JournalComposerProps {
  onEntryCreated?: () => void;
}

export function JournalComposer({ onEntryCreated }: JournalComposerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="w-full mb-8">
      <button
        type="button"
        className="flex w-full items-center rounded-2xl border px-5 py-4 text-left text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
        onClick={() => setIsOpen(true)}
      >
        <span>Write a journal entry...</span>
      </button>

      <JournalComposerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onEntryCreated={onEntryCreated}
      />
    </section>
  );
}
