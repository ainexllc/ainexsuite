'use client';

import { cn } from '@/lib/utils';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  return (
    <div
      className={cn(
        "prose prose-sm sm:prose max-w-none",
        "prose-headings:text-foreground",
        "prose-p:text-foreground/90",
        "prose-a:text-[#f97316] hover:prose-a:text-[#ea580c]",
        "prose-strong:text-foreground",
        "prose-ul:text-foreground/90",
        "prose-ol:text-foreground/90",
        "prose-blockquote:text-muted-foreground",
        "prose-blockquote:border-border",
        "prose-code:text-foreground",
        "prose-code:bg-foreground/10",
        "prose-pre:bg-foreground/10",
        "prose-img:rounded-lg prose-img:shadow-md",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
