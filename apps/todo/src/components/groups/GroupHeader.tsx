'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Trash2, Palette } from 'lucide-react';
import { clsx } from 'clsx';
import { useDroppable } from '@dnd-kit/core';
import {
  getEntryColorConfig,
  ColorPickerDropdown,
} from '@ainexsuite/ui';
import type { EntryColor } from '@ainexsuite/types';
import type { TaskGroup } from '../../types/models';

interface GroupHeaderProps {
  group: TaskGroup;
  count: number;
  completedCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRename: (newName: string) => void;
  onColorChange: (color: EntryColor) => void;
  onDelete: () => void;
}

export function GroupHeader({
  group,
  count,
  completedCount,
  isCollapsed,
  onToggleCollapse,
  onRename,
  onColorChange,
  onDelete,
}: GroupHeaderProps) {
  // Calculate progress percentage
  const progressPercent = count > 0 ? (completedCount / count) * 100 : 0;
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const [colorPickerPosition, setColorPickerPosition] = useState<{ left: number; top: number; openUpward: boolean } | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const colorPickerButtonRef = useRef<HTMLButtonElement>(null);
  const colorPickerDropdownRef = useRef<HTMLDivElement>(null);

  // Get color config
  const colorConfig = getEntryColorConfig(group.color || 'default');

  // Make group header droppable (for receiving tasks)
  const { setNodeRef, isOver } = useDroppable({
    id: `group-${group.id}`,
    data: { type: 'group', groupId: group.id },
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  // Calculate color picker position when opened
  useEffect(() => {
    if (showColorPicker && colorPickerButtonRef.current) {
      const rect = colorPickerButtonRef.current.getBoundingClientRect();
      const pickerHeight = 350; // Approximate height of color picker
      const viewportHeight = window.innerHeight;
      const spaceAbove = rect.top;
      const spaceBelow = viewportHeight - rect.bottom;

      // Decide if we should open upward or downward
      const openUpward = spaceAbove > pickerHeight || spaceAbove > spaceBelow;

      setColorPickerPosition({
        left: rect.right - 280, // Align right edge
        top: openUpward ? rect.top - 8 : rect.bottom + 8,
        openUpward,
      });
    }
  }, [showColorPicker]);

  // Close color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        colorPickerButtonRef.current &&
        !colorPickerButtonRef.current.contains(target) &&
        colorPickerDropdownRef.current &&
        !colorPickerDropdownRef.current.contains(target)
      ) {
        setShowColorPicker(false);
      }
    };
    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColorPicker]);

  const handleSaveName = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== group.name) {
      onRename(trimmedName);
    } else {
      setEditName(group.name);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  // Determine background color and text color based on background
  const getBgColor = () => {
    if (group.color === 'default' || !group.color) return '';
    return colorConfig.cardClass;
  };

  // Get border color based on group color
  const getBorderColor = () => {
    if (group.color === 'default' || !group.color) {
      return 'border-zinc-200 dark:border-zinc-700';
    }
    return colorConfig.borderClass;
  };

  // Get text color classes based on background
  const getTextColor = () => {
    if (group.color === 'default' || !group.color) return '';
    if (colorConfig.textMode === 'dark') {
      return 'text-zinc-900 dark:text-zinc-900';
    } else if (colorConfig.textMode === 'light') {
      return 'text-white dark:text-white';
    }
    return ''; // theme mode - use default
  };

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'flex items-center gap-2 px-3 py-1 rounded-md transition-colors',
        'group/header',
        'border',
        getBorderColor(),
        getBgColor(),
        isOver && 'bg-blue-50 dark:bg-blue-950/30 ring-2 ring-blue-400 ring-inset'
      )}
    >
      {/* Collapse/Expand button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        onPointerDown={(e) => e.stopPropagation()}
        className={clsx(
          'p-0.5 rounded transition-colors flex-shrink-0',
          getTextColor() ? `${getTextColor()} opacity-70 hover:opacity-100` : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
        )}
        title={isCollapsed ? 'Expand group' : 'Collapse group'}
        aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
      >
        <ChevronDown
          className={clsx('h-3.5 w-3.5 transition-transform', isCollapsed && 'rotate-[-90deg]')}
        />
      </button>

      {/* Group name (editable) */}
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          onPointerDown={(e) => e.stopPropagation()}
          className={clsx(
            'flex-1 min-w-0 px-1.5 py-0.5 text-xs font-medium rounded outline-none',
            getTextColor()
              ? `bg-black/20 border border-${getTextColor() === 'text-white dark:text-white' ? 'white' : 'black'}/30 ${getTextColor()}`
              : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100'
          )}
        />
      ) : (
        <h3
          onDoubleClick={() => setIsEditing(true)}
          onPointerDown={(e) => e.stopPropagation()}
          className={clsx(
            'flex-1 min-w-0 text-xs font-medium cursor-text truncate',
            getTextColor() || 'text-zinc-800 dark:text-zinc-200'
          )}
          title="Double-click to rename"
        >
          {group.name}
        </h3>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Progress bar */}
        {count > 0 && (
          <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-300',
                progressPercent === 100 ? 'bg-green-500' : 'bg-[var(--color-primary)]'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {/* Count */}
        <span className={clsx(
          'text-[10px] font-medium flex-shrink-0',
          getTextColor()
            ? progressPercent === 100
              ? `${getTextColor()}`
              : `${getTextColor()} opacity-75`
            : progressPercent === 100
              ? 'text-green-500'
              : 'text-zinc-500 dark:text-zinc-400'
        )}>
          {completedCount}/{count}
        </span>
      </div>

      {/* Action buttons (color, rename, delete) - visible on hover */}
      <div className="relative flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover/header:opacity-100 transition-opacity">
        {/* Color picker */}
        <div className="relative">
          <button
            ref={colorPickerButtonRef}
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            onPointerDown={(e) => e.stopPropagation()}
            className={clsx(
              'p-0.5 rounded transition-colors',
              getTextColor() ? `${getTextColor()} opacity-50 hover:opacity-75` : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70'
            )}
            title="Change color"
            aria-label="Change color"
          >
            <Palette className="h-3 w-3" />
          </button>

          {/* Color picker dropdown - positioned smartly above or below */}
          {showColorPicker && colorPickerPosition && typeof document !== 'undefined' && createPortal(
            <div
              ref={colorPickerDropdownRef}
              className={clsx(
                'fixed z-[99999] animate-in fade-in duration-200',
                colorPickerPosition.openUpward ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
              )}
              style={{
                left: `${colorPickerPosition.left}px`,
                top: `${colorPickerPosition.top}px`,
                transform: colorPickerPosition.openUpward ? 'translateY(-100%)' : 'translateY(0)',
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <ColorPickerDropdown
                selectedColor={group.color || 'default'}
                onColorChange={(color) => {
                  onColorChange(color);
                  setShowColorPicker(false);
                }}
              />
            </div>,
            document.body
          )}
        </div>

        <button
          type="button"
          onClick={onDelete}
          onPointerDown={(e) => e.stopPropagation()}
          className={clsx(
            'p-0.5 rounded transition-colors',
            getTextColor() ? 'text-red-400 opacity-70 hover:opacity-100' : 'text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30'
          )}
          title="Delete group (tasks will be ungrouped)"
          aria-label="Delete group"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
