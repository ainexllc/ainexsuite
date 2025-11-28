'use client';

import type { JournalEntry } from '@ainexsuite/types';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { getMoodIcon, getMoodLabel } from '@/lib/utils/mood';
import { RichTextViewer } from '@/components/ui/rich-text-viewer';
import { Paperclip, Link as LinkIcon, Calendar, Clock, Tag } from 'lucide-react';

interface JournalViewProps {
  entry: JournalEntry;
}

export function JournalView({ entry }: JournalViewProps) {
  return (
    <article className="max-w-4xl rounded-3xl border border-border bg-zinc-800/90 p-8 shadow-sm">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {entry.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(new Date(entry.createdAt))}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{formatDateTime(new Date(entry.createdAt))}</span>
          </div>

          {entry.mood && (() => {
            const Icon = getMoodIcon(entry.mood);
            return (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-foreground/10 text-foreground">
                <Icon className="h-4 w-4" />
                {getMoodLabel(entry.mood)}
              </div>
            );
          })()}
        </div>
      </header>

      {/* Content */}
      <div className="mb-8">
        <RichTextViewer content={entry.content} />
      </div>

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-[#f97316]" />
            <h3 className="text-sm font-medium text-foreground">
              Tags
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="bg-foreground/10 text-foreground px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {entry.links && entry.links.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="w-4 h-4 text-[#f97316]" />
            <h3 className="text-sm font-medium text-foreground">
              Links
            </h3>
          </div>
          <div className="space-y-2">
            {entry.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#f97316] hover:text-[#ea580c] underline truncate"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {entry.attachments.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Paperclip className="w-4 h-4 text-[#f97316]" />
            <h3 className="text-sm font-medium text-foreground">
              Attachments
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entry.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-foreground/5 rounded-lg hover:bg-foreground/10 transition-colors"
              >
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <footer className="pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDateTime(new Date(entry.updatedAt))}
        </p>
      </footer>
    </article>
  );
}
