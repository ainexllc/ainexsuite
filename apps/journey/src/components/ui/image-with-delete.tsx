'use client';

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { deleteFileByUrl } from '@/lib/firebase/storage';
import { ImageResizeHandles } from './image-resize-handles';
import { ImageLightbox } from './image-lightbox';
import { cn } from '@/lib/utils';

// Type declarations
export type ImageAlignment = 'left' | 'center' | 'right' | 'full';
export type ImageFrameStyle = 'none' | 'thin' | 'thick' | 'rounded' | 'shadow' | 'glass';
export type ImageSizePreset = 'small' | 'medium' | 'large' | 'full';

interface ImageAttrs {
  src: string;
  alt?: string;
  title?: string;
  width?: string;
  alignment?: ImageAlignment;
  frameStyle?: ImageFrameStyle;
  caption?: string;
  sizePreset?: ImageSizePreset;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        alignment?: ImageAlignment;
        frameStyle?: ImageFrameStyle;
        caption?: string;
      }) => ReturnType;
    };
  }
}

// Frame style classes
const FRAME_CLASSES: Record<ImageFrameStyle, string> = {
  none: '',
  thin: 'border border-zinc-300 dark:border-zinc-600',
  thick: 'border-4 border-zinc-400 dark:border-zinc-500',
  rounded: 'rounded-2xl overflow-hidden',
  shadow: 'shadow-xl shadow-black/20',
  glass: 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 shadow-xl p-3 rounded-xl',
};

// Alignment wrapper classes
const ALIGNMENT_CLASSES: Record<ImageAlignment, string> = {
  left: 'float-left mr-6 mb-4',
  center: 'mx-auto block clear-both',
  right: 'float-right ml-6 mb-4',
  full: 'w-full clear-both',
};

function ImageComponent({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const attrs = node.attrs as ImageAttrs;
  const [showLightbox, setShowLightbox] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const captionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [naturalWidth, setNaturalWidth] = useState(400);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [containerWidth, setContainerWidth] = useState(800);

  // Load natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = attrs.src;
  }, [attrs.src]);

  // Track container width for max resize limit
  useEffect(() => {
    if (containerRef.current?.parentElement) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
      });
      observer.observe(containerRef.current.parentElement);
      return () => observer.disconnect();
    }
  }, []);

  const handleDelete = async () => {
    const imageUrl = attrs.src;
    deleteNode();

    if (imageUrl?.includes('firebasestorage.googleapis.com')) {
      try {
        await deleteFileByUrl(imageUrl);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
      }
    }
  };

  const handleResize = (newWidth: number) => {
    updateAttributes({ width: `${newWidth}px`, sizePreset: null });
  };

  const handleCaptionBlur = () => {
    const newCaption = captionRef.current?.textContent?.trim() || null;
    updateAttributes({ caption: newCaption === 'Add caption...' ? null : newCaption });
    setIsEditingCaption(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Don't open lightbox if clicking caption or while resizing
    if ((e.target as HTMLElement).closest('figcaption')) return;
    setShowLightbox(true);
  };

  const alignment = attrs.alignment || 'center';
  const frameStyle = attrs.frameStyle || 'none';

  // Calculate current width
  let currentWidth = naturalWidth;
  if (attrs.width) {
    if (attrs.width.endsWith('%')) {
      currentWidth = (parseFloat(attrs.width) / 100) * containerWidth;
    } else {
      currentWidth = parseFloat(attrs.width);
    }
  }

  // Style based on alignment and size preset
  const wrapperStyle: React.CSSProperties = {};
  if (attrs.width) {
    wrapperStyle.width = attrs.width;
  } else if (alignment !== 'full') {
    wrapperStyle.width = 'auto';
    wrapperStyle.maxWidth = '100%';
  }

  return (
    <>
      <NodeViewWrapper
        ref={containerRef}
        className={cn(
          'relative group my-4',
          ALIGNMENT_CLASSES[alignment]
        )}
        style={wrapperStyle}
        data-alignment={alignment}
        data-frame-style={frameStyle}
      >
        <ImageResizeHandles
          initialWidth={currentWidth}
          containerWidth={containerWidth}
          aspectRatio={aspectRatio}
          onResize={handleResize}
          selected={selected}
        >
          <figure className={cn('relative', FRAME_CLASSES[frameStyle])}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attrs.src}
              alt={attrs.alt || ''}
              title={attrs.title || ''}
              onClick={handleImageClick}
              className={cn(
                'max-w-full h-auto cursor-zoom-in transition-all',
                selected && 'ring-2 ring-orange-500 ring-offset-2',
                frameStyle === 'rounded' && 'rounded-2xl'
              )}
              style={{ width: '100%' }}
              draggable={false}
            />

            {/* Caption */}
            {(attrs.caption || isEditingCaption) && (
              <figcaption
                ref={captionRef}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => setIsEditingCaption(true)}
                onBlur={handleCaptionBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    captionRef.current?.blur();
                  }
                }}
                className={cn(
                  'text-center text-sm mt-3 px-2 py-1.5 rounded-lg',
                  'outline-none transition-colors',
                  'text-zinc-500 dark:text-zinc-400',
                  isEditingCaption && 'bg-zinc-100 dark:bg-zinc-800',
                  !attrs.caption && 'text-zinc-400 dark:text-zinc-500 italic'
                )}
              >
                {attrs.caption || 'Add caption...'}
              </figcaption>
            )}

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              className={cn(
                'absolute top-2 right-2 h-8 w-8 rounded-full',
                'bg-black/60 text-white flex items-center justify-center',
                'opacity-0 group-hover:opacity-100',
                'hover:bg-red-500 transition-all backdrop-blur-sm',
                'focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50'
              )}
              aria-label="Delete image"
            >
              <X className="h-4 w-4" />
            </button>
          </figure>
        </ImageResizeHandles>
      </NodeViewWrapper>

      <ImageLightbox
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
        src={attrs.src}
        alt={attrs.alt}
        caption={attrs.caption}
      />
    </>
  );
}

export const ImageWithDelete = Node.create({
  name: 'image',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      alignment: { default: 'center' },
      frameStyle: { default: 'none' },
      caption: { default: null },
      sizePreset: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-image-node]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};
          const el = element as HTMLElement;
          const img = el.querySelector('img');
          const figcaption = el.querySelector('figcaption');
          return {
            src: img?.getAttribute('src'),
            alt: img?.getAttribute('alt'),
            title: img?.getAttribute('title'),
            width: el.style?.width || el.getAttribute('data-width'),
            alignment: el.getAttribute('data-alignment') || 'center',
            frameStyle: el.getAttribute('data-frame-style') || 'none',
            caption: figcaption?.textContent || null,
            sizePreset: el.getAttribute('data-size-preset'),
          };
        },
      },
      {
        tag: 'img[src]',
        getAttrs: (element) => {
          if (typeof element === 'string') return {};
          const el = element as HTMLImageElement;
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt'),
            title: el.getAttribute('title'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const figureAttrs: Record<string, string | undefined> = {
      'data-image-node': 'true',
      'data-alignment': HTMLAttributes.alignment || 'center',
      'data-frame-style': HTMLAttributes.frameStyle || 'none',
      'data-width': HTMLAttributes.width,
      'data-size-preset': HTMLAttributes.sizePreset,
      style: HTMLAttributes.width ? `width: ${HTMLAttributes.width}` : undefined,
    };

    // Clean up undefined values
    Object.keys(figureAttrs).forEach(key => {
      if (figureAttrs[key] === undefined) {
        delete figureAttrs[key];
      }
    });

    const imgAttrs = mergeAttributes(this.options.HTMLAttributes, {
      src: HTMLAttributes.src,
      alt: HTMLAttributes.alt,
      title: HTMLAttributes.title,
    });

    if (HTMLAttributes.caption) {
      return ['figure', figureAttrs, ['img', imgAttrs], ['figcaption', {}, HTMLAttributes.caption]];
    }

    return ['figure', figureAttrs, ['img', imgAttrs]];
  },

  addCommands() {
    return {
      setImage:
        (options: {
          src: string;
          alt?: string;
          title?: string;
          width?: string;
          alignment?: ImageAlignment;
          frameStyle?: ImageFrameStyle;
          caption?: string;
        }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent);
  },
});
