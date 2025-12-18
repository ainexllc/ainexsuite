'use client';

import { useState } from 'react';
import { TileBase } from './tile-base';
import { StickyNote } from 'lucide-react';

interface NotesTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
}

export function NotesTile({
  id = 'notes',
  onRemove,
  isDraggable,
  onDragStart,
  className
}: NotesTileProps) {
  const [content, setContent] = useState('');

  return (
    <TileBase
      id={id}
      title="Quick Notes"
      onRemove={onRemove}
      isDraggable={isDraggable}
      onDragStart={onDragStart}
      className={`h-full min-h-[200px] flex flex-col ${className}`}
    >
      <div className="flex-1 flex flex-col relative group">
        <div className="absolute top-0 right-0 text-white/20 pointer-events-none">
            <StickyNote className="w-12 h-12 opacity-10 rotate-12" />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          className="w-full h-full bg-transparent resize-none border-none focus:ring-0 text-sm md:text-base text-white/90 placeholder-white/30 scrollbar-thin scrollbar-thumb-white/10"
          spellCheck={false}
        />
      </div>
    </TileBase>
  );
}
