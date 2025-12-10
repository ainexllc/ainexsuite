'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Command,
  FileText,
  ListChecks,
  BookOpen,
  MessageCircle,
  CheckSquare,
  FolderPlus,
  Heart,
  Camera,
  Target,
  Activity,
  Dumbbell,
  Layout,
  GitBranch,
  CalendarPlus,
  Users,
  Grid,
} from 'lucide-react';
import type { QuickAction } from '@ainexsuite/types';

/**
 * QuickActionsMenu Component
 *
 * A dropdown menu with quick create actions.
 * Shows app-specific actions with keyboard shortcuts.
 */

export interface QuickActionsMenuProps {
  /** Whether the menu is open */
  isOpen: boolean;
  /** Callback to close the menu */
  onClose: () => void;
  /** Callback to toggle the menu */
  onToggle: () => void;
  /** Array of quick actions to display */
  actions: QuickAction[];
  /** Callback when an action is selected */
  onAction: (actionId: string) => void;
  /** Additional CSS classes for the button */
  buttonClassName?: string;
  /** Additional CSS classes for the dropdown */
  dropdownClassName?: string;
}

// Map icon names to components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Plus,
  FileText,
  ListChecks,
  BookOpen,
  MessageCircle,
  CheckSquare,
  FolderPlus,
  Heart,
  Camera,
  Target,
  Activity,
  Dumbbell,
  Layout,
  GitBranch,
  CalendarPlus,
  Users,
  Grid,
};

function getIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  return ICON_MAP[iconName] || Plus;
}

export function QuickActionsMenu({
  isOpen,
  onClose,
  onToggle,
  actions,
  onAction,
  buttonClassName = '',
  dropdownClassName = '',
}: QuickActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Group actions by category
  const groupedActions = actions.reduce<Record<string, QuickAction[]>>(
    (acc, action) => {
      const category = action.category || 'other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(action);
      return acc;
    },
    {}
  );

  const categoryLabels: Record<string, string> = {
    create: 'Create',
    navigate: 'Navigate',
    action: 'Actions',
    other: 'Other',
  };

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          flex h-9 w-9 items-center justify-center rounded-full
          transition-colors duration-150
          ${isOpen
            ? 'bg-primary text-primary-foreground'
            : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
          }
          focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background
          ${buttonClassName}
        `}
        aria-label="Quick actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Plus className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-45' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-full right-0 mt-2 w-64
            rounded-xl border border-border
            bg-background/95 backdrop-blur-xl
            shadow-xl
            animate-in fade-in slide-in-from-top-2 duration-200
            z-50
            ${dropdownClassName}
          `}
          role="menu"
          aria-label="Quick actions menu"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </span>
          </div>

          {/* Actions List */}
          <div className="py-1 max-h-80 overflow-y-auto">
            {Object.entries(groupedActions).map(([category, categoryActions]) => (
              <div key={category}>
                {Object.keys(groupedActions).length > 1 && (
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                      {categoryLabels[category] || category}
                    </span>
                  </div>
                )}
                {categoryActions.map((action) => {
                  const Icon = getIconComponent(action.icon);

                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => {
                        onAction(action.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-foreground/5 transition-colors group"
                      role="menuitem"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 group-hover:bg-foreground/10 transition-colors">
                        <Icon className="h-4 w-4 text-foreground/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {action.label}
                        </p>
                        {action.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {action.description}
                          </p>
                        )}
                      </div>
                      {action.shortcut && (
                        <kbd className="flex items-center gap-0.5 rounded bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                          {isMac ? (
                            <Command className="h-2.5 w-2.5" />
                          ) : (
                            <span>Ctrl+</span>
                          )}
                          <span>{action.shortcut}</span>
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {actions.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                No quick actions available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
