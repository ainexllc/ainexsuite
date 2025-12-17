'use client';

import { Node, mergeAttributes, CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { X } from 'lucide-react';
import { deleteFileByUrl } from '@/lib/firebase/storage';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}

function ImageComponent({ node, deleteNode, selected }: NodeViewProps) {
  const attrs = node.attrs as { src: string; alt?: string; title?: string };
  const handleDelete = async () => {
    const imageUrl = attrs.src;

    // Delete from editor first (immediate UI feedback)
    deleteNode();

    // Then delete from Firebase Storage if it's a Firebase URL
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        await deleteFileByUrl(imageUrl);
      } catch (error) {
        console.error('Failed to delete image from storage:', error);
      }
    }
  };

  return (
    <NodeViewWrapper className="relative inline-block my-4 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={attrs.src}
        alt={attrs.alt || ''}
        title={attrs.title || ''}
        className={`max-w-full h-auto rounded-lg transition-all ${
          selected ? 'ring-2 ring-orange-500' : ''
        }`}
      />
      <button
        type="button"
        onClick={handleDelete}
        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all backdrop-blur-sm"
        aria-label="Delete image"
      >
        <X className="h-4 w-4" />
      </button>
    </NodeViewWrapper>
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
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string }) =>
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
