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
  /** Whether the current user can delete the selected items (owns all of them) */
  canDelete?: boolean;
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
  canDelete = true,
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-3 px-2 py-2 rounded-full bg-zinc-900/95 dark:bg-zinc-800/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
        {/* Selection count pill */}
        <div className="flex items-center gap-2 pl-2 pr-3">
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            title={allSelected ? 'Deselect all' : 'Select all'}
          >
            {allSelected ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          <span className="text-sm font-semibold text-white tabular-nums">
            {selectedCount}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-600/50" />

        {/* Action buttons in glass pill */}
        <div className="flex items-center gap-0.5 px-1 py-1 rounded-full bg-white/5 border border-white/10">
          {/* Pin */}
          <button
            onClick={onPin}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
            title="Add to Focus"
          >
            <Pin className="h-4 w-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
          </button>

          {/* Unpin */}
          <button
            onClick={onUnpin}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
            title="Remove from Focus"
          >
            <PinOff className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </button>

          {/* Archive */}
          <button
            onClick={onArchive}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
            title="Archive selected"
          >
            <Archive className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          </button>

          {/* Color picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
              title="Change color"
            >
              <Palette className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-4 gap-2">
                  {ENTRY_COLOR_SWATCHES.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        onColorChange(color.value as NoteColor);
                        setShowColorPicker(false);
                      }}
                      title={color.label}
                      className={`w-8 h-8 rounded-full transition-all hover:scale-110 hover:ring-2 hover:ring-white/30 ${color.className}`}
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
                className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors group"
                title="Add label"
              >
                <Tag className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
              </button>

              {showLabelPicker && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 p-2 rounded-2xl bg-zinc-900/95 border border-zinc-700/50 shadow-2xl backdrop-blur-xl min-w-[180px] max-h-[240px] overflow-y-auto">
                  <div className="space-y-0.5">
                    {labels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => {
                          onLabelAdd(label.id);
                          setShowLabelPicker(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm text-zinc-200"
                      >
                        {label.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delete button - separate for emphasis, only shown if user owns all selected */}
        {canDelete && (
          <button
            onClick={onDelete}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 transition-colors group"
            title="Delete selected"
          >
            <Trash2 className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
          </button>
        )}

        {/* Close button */}
        <button
          onClick={onDeselectAll}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          title="Clear selection"
        >
          <X className="h-4 w-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}
