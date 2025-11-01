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
        "prose-headings:text-white",
        "prose-p:text-white/90",
        "prose-a:text-[#f97316] hover:prose-a:text-[#ea580c]",
        "prose-strong:text-white",
        "prose-ul:text-white/90",
        "prose-ol:text-white/90",
        "prose-blockquote:text-white/60",
        "prose-blockquote:border-white/20",
        "prose-code:text-white",
        "prose-code:bg-white/10",
        "prose-pre:bg-white/10",
        "prose-img:rounded-lg prose-img:shadow-md",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
