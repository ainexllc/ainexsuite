'use client';

import { X, Trash2, Pin, PinOff, Archive, Palette, Tag, CheckSquare, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ENTRY_COLOR_SWATCHES } from '@ainexsuite/ui';
import type { NoteColor } from '@/lib/types/note';
import { useLabels } from '@/components/providers/labels-provider';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onArchive: () => void;
  onColorChange: (color: NoteColor) => void;
  onLabelAdd: (labelId: string) => void;
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onPin,
  onUnpin,
  onArchive,
  onColorChange,
  onLabelAdd,
}: BulkActionBarProps) {
  const { labels } = useLabels();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const labelPickerRef = useRef<HTMLDivElement>(null);

  // Close pickers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (labelPickerRef.current && !labelPickerRef.current.contains(event.target as Node)) {
        setShowLabelPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-surface border border-border shadow-2xl backdrop-blur-xl">
        {/* Selection info */}
        <div className="flex items-center gap-2 pr-3 border-r border-border">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Pin/Unpin */}
          <button
            onClick={onPin}
            className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
            title="Pin selected"
          >
            <Pin className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>

          <button
            onClick={onUnpin}
            className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
            title="Unpin selected"
          >
            <PinOff className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>

          {/* Archive */}
          <button
            onClick={onArchive}
            className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
            title="Archive selected"
          >
            <Archive className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </button>

          {/* Color picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
              title="Change color"
            >
              <Palette className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-surface border border-border shadow-xl">
                <div className="grid grid-cols-4 gap-1.5">
                  {ENTRY_COLOR_SWATCHES.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        onColorChange(color.value as NoteColor);
                        setShowColorPicker(false);
                      }}
                      title={color.label}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${color.className}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Label picker */}
          {labels.length > 0 && (
            <div className="relative" ref={labelPickerRef}>
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
                title="Add label"
              >
                <Tag className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </button>

              {showLabelPicker && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-surface border border-border shadow-xl min-w-[160px] max-h-[200px] overflow-y-auto">
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => {
                        onLabelAdd(label.id);
                        setShowLabelPicker(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors text-sm"
                    >
                      {label.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
            title="Delete selected"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500" />
          </button>
        </div>

        {/* Close button */}
        <div className="pl-2 border-l border-border">
          <button
            onClick={onDeselectAll}
            className="p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
            title="Clear selection"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
