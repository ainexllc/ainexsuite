'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Square,
  Circle,
  Sparkles,
  Trash2,
  Expand,
  Type,
  ChevronDown,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageBubbleMenuProps {
  editor: Editor;
  onOpenLightbox: () => void;
}

type Alignment = 'left' | 'center' | 'right' | 'full';
type FrameStyle = 'none' | 'thin' | 'thick' | 'rounded' | 'shadow' | 'glass';
type SizePreset = 'small' | 'medium' | 'large' | 'full';

const SIZE_PRESETS: { id: SizePreset; label: string; width: string }[] = [
  { id: 'small', label: '25%', width: '25%' },
  { id: 'medium', label: '50%', width: '50%' },
  { id: 'large', label: '75%', width: '75%' },
  { id: 'full', label: '100%', width: '100%' },
];

const FRAME_STYLES: { id: FrameStyle; label: string; icon: React.ElementType }[] = [
  { id: 'none', label: 'None', icon: Square },
  { id: 'thin', label: 'Thin Border', icon: Square },
  { id: 'thick', label: 'Thick Border', icon: Layers },
  { id: 'rounded', label: 'Rounded', icon: Circle },
  { id: 'shadow', label: 'Shadow', icon: Square },
  { id: 'glass', label: 'Glassmorphism', icon: Sparkles },
];

export function ImageBubbleMenu({ editor, onOpenLightbox }: ImageBubbleMenuProps) {
  const [showFrameMenu, setShowFrameMenu] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when selection changes
  useEffect(() => {
    const updatePosition = () => {
      if (!editor.isActive('image')) {
        setPosition(null);
        return;
      }

      // Find the selected image element
      const { view } = editor;
      const { from } = view.state.selection;
      const node = view.nodeDOM(from) as HTMLElement | null;

      if (node) {
        const img = node.querySelector('img') || node;
        if (img) {
          const rect = img.getBoundingClientRect();
          setPosition({
            top: rect.top - 50,
            left: rect.left + rect.width / 2,
          });
        }
      }
    };

    // Listen for selection changes
    editor.on('selectionUpdate', updatePosition);
    editor.on('transaction', updatePosition);

    // Initial position
    updatePosition();

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('transaction', updatePosition);
    };
  }, [editor]);

  const updateImageAttribute = (key: string, value: string | null) => {
    editor.chain().focus().updateAttributes('image', { [key]: value }).run();
  };

  const currentAlignment = (editor.getAttributes('image').alignment as Alignment) || 'center';
  const currentFrame = (editor.getAttributes('image').frameStyle as FrameStyle) || 'none';
  const currentSize = editor.getAttributes('image').sizePreset as SizePreset | undefined;
  const hasCaption = !!editor.getAttributes('image').caption;

  const handleDelete = () => {
    editor.chain().focus().deleteSelection().run();
  };

  const toggleCaption = () => {
    const currentCaption = editor.getAttributes('image').caption;
    updateImageAttribute('caption', currentCaption ? null : 'Add caption...');
  };

  const handleClose = () => {
    // Move selection to end of document to deselect image and close toolbar
    const { doc } = editor.state;
    editor.chain().focus().setTextSelection(doc.content.size - 1).run();
  };

  // Don't render if not active or no position
  if (!editor.isActive('image') || !position || !mounted) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center gap-1 p-1.5 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
      style={{
        top: Math.max(10, position.top),
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {/* Alignment */}
      <div className="flex items-center gap-0.5 border-r border-white/10 pr-1.5">
        <MenuButton
          active={currentAlignment === 'left'}
          onClick={() => updateImageAttribute('alignment', 'left')}
          title="Float Left (text wraps)"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          active={currentAlignment === 'center'}
          onClick={() => updateImageAttribute('alignment', 'center')}
          title="Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          active={currentAlignment === 'right'}
          onClick={() => updateImageAttribute('alignment', 'right')}
          title="Float Right (text wraps)"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          active={currentAlignment === 'full'}
          onClick={() => updateImageAttribute('alignment', 'full')}
          title="Full Width"
        >
          <Maximize2 className="w-4 h-4" />
        </MenuButton>
      </div>

      {/* Size Presets */}
      <div className="flex items-center gap-0.5 border-r border-white/10 px-1.5">
        {SIZE_PRESETS.map((preset) => (
          <MenuButton
            key={preset.id}
            active={currentSize === preset.id}
            onClick={() => {
              updateImageAttribute('sizePreset', preset.id);
              updateImageAttribute('width', preset.width);
            }}
            title={`Size: ${preset.label}`}
          >
            <span className="text-[10px] font-semibold">{preset.label}</span>
          </MenuButton>
        ))}
      </div>

      {/* Frame Styles Dropdown */}
      <div className="relative border-r border-white/10 px-1.5">
        <MenuButton
          active={currentFrame !== 'none'}
          onClick={() => setShowFrameMenu(!showFrameMenu)}
          title="Frame Style"
        >
          {currentFrame === 'glass' ? (
            <Sparkles className="w-4 h-4" />
          ) : currentFrame === 'rounded' ? (
            <Circle className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <ChevronDown className="w-3 h-3 ml-0.5" />
        </MenuButton>

        {showFrameMenu && (
          <div
            className="absolute bottom-full left-0 mb-2 flex flex-col gap-0.5 p-1.5 rounded-lg bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-xl min-w-[140px]"
            onMouseLeave={() => setShowFrameMenu(false)}
          >
            {FRAME_STYLES.map((frame) => (
              <button
                key={frame.id}
                onClick={() => {
                  updateImageAttribute('frameStyle', frame.id);
                  setShowFrameMenu(false);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors text-left',
                  currentFrame === frame.id
                    ? 'bg-orange-500 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <frame.icon className="w-3.5 h-3.5" />
                {frame.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Caption Toggle */}
      <MenuButton
        active={hasCaption}
        onClick={toggleCaption}
        title={hasCaption ? 'Remove Caption' : 'Add Caption'}
      >
        <Type className="w-4 h-4" />
      </MenuButton>

      {/* Lightbox */}
      <MenuButton onClick={onOpenLightbox} title="View Full Size">
        <Expand className="w-4 h-4" />
      </MenuButton>

      {/* Delete */}
      <MenuButton
        onClick={handleDelete}
        title="Delete Image"
        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
      >
        <Trash2 className="w-4 h-4" />
      </MenuButton>

      {/* Close */}
      <MenuButton
        onClick={handleClose}
        title="Close Toolbar"
        className="border-l border-white/10 ml-1 pl-1.5"
      >
        <X className="w-4 h-4" />
      </MenuButton>
    </div>
  );

  return createPortal(menu, document.body);
}

function MenuButton({
  children,
  active,
  onClick,
  title,
  className,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-md transition-colors flex items-center',
        active
          ? 'bg-orange-500 text-white'
          : 'text-white/70 hover:bg-white/10 hover:text-white',
        className
      )}
    >
      {children}
    </button>
  );
}
