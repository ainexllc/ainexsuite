'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ImageLightbox } from './image-lightbox';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt?: string;
    caption?: string;
  } | null>(null);

  // Handle image clicks for lightbox
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const figure = img.closest('figure');
      const caption = figure?.querySelector('figcaption')?.textContent;
      setLightboxImage({
        src: img.src,
        alt: img.alt || undefined,
        caption: caption || undefined,
      });
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={cn(
          "prose prose-sm sm:prose max-w-none",
          // Text colors
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
          // Base image styling
          "prose-img:rounded-lg prose-img:cursor-zoom-in prose-img:transition-all",
          // Clear floats after content
          "after:content-[''] after:clear-both after:table",
          // Image alignment styles via data attributes
          "[&_figure[data-alignment='left']]:float-left [&_figure[data-alignment='left']]:mr-6 [&_figure[data-alignment='left']]:mb-4",
          "[&_figure[data-alignment='right']]:float-right [&_figure[data-alignment='right']]:ml-6 [&_figure[data-alignment='right']]:mb-4",
          "[&_figure[data-alignment='center']]:mx-auto [&_figure[data-alignment='center']]:block [&_figure[data-alignment='center']]:clear-both",
          "[&_figure[data-alignment='full']]:w-full [&_figure[data-alignment='full']]:clear-both",
          // Frame style: thin border
          "[&_figure[data-frame-style='thin']]:border [&_figure[data-frame-style='thin']]:border-zinc-300 [&_figure[data-frame-style='thin']]:dark:border-zinc-600 [&_figure[data-frame-style='thin']]:rounded-lg [&_figure[data-frame-style='thin']]:overflow-hidden",
          // Frame style: thick border
          "[&_figure[data-frame-style='thick']]:border-4 [&_figure[data-frame-style='thick']]:border-zinc-400 [&_figure[data-frame-style='thick']]:dark:border-zinc-500 [&_figure[data-frame-style='thick']]:rounded-lg [&_figure[data-frame-style='thick']]:overflow-hidden",
          // Frame style: rounded
          "[&_figure[data-frame-style='rounded']]:rounded-2xl [&_figure[data-frame-style='rounded']]:overflow-hidden",
          "[&_figure[data-frame-style='rounded']_img]:rounded-2xl",
          // Frame style: shadow
          "[&_figure[data-frame-style='shadow']]:shadow-xl [&_figure[data-frame-style='shadow']]:shadow-black/20",
          // Frame style: glassmorphism
          "[&_figure[data-frame-style='glass']]:bg-white/10 [&_figure[data-frame-style='glass']]:dark:bg-white/5",
          "[&_figure[data-frame-style='glass']]:backdrop-blur-md [&_figure[data-frame-style='glass']]:backdrop-saturate-150",
          "[&_figure[data-frame-style='glass']]:border [&_figure[data-frame-style='glass']]:border-white/20",
          "[&_figure[data-frame-style='glass']]:shadow-xl [&_figure[data-frame-style='glass']]:p-3 [&_figure[data-frame-style='glass']]:rounded-xl",
          // Caption styling
          "[&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-zinc-500 [&_figcaption]:dark:text-zinc-400 [&_figcaption]:mt-3",
          // Figure base styling
          "[&_figure]:my-4 [&_figure]:inline-block [&_figure[data-image-node]_img]:w-full",
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src || ''}
        alt={lightboxImage?.alt}
        caption={lightboxImage?.caption}
      />
    </>
  );
}
