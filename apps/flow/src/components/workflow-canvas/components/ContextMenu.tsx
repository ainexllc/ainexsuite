'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Copy,
  Scissors,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  Lock,
  Unlock,
  MousePointerClick,
  Maximize2,
  Plus,
  Square,
  Diamond,
  Circle,
  StickyNote,
  Layers,
  Database,
  FileStack,
  Hexagon,
  Type,
} from 'lucide-react';

export type ContextMenuType = 'node' | 'edge' | 'canvas' | null;

interface Position {
  x: number;
  y: number;
}

interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  submenu?: ContextMenuItem[];
}

interface ContextMenuProps {
  isOpen: boolean;
  position: Position;
  type: ContextMenuType;
  onClose: () => void;
  // Node actions
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
  // Canvas actions
  onSelectAll: () => void;
  onFitView: () => void;
  onAddNode: (type: string) => void;
  // Edge actions
  onEditEdgeLabel?: () => void;
  // State
  hasSelection: boolean;
  hasClipboard: boolean;
  isLocked?: boolean;
}

const iconClass = 'w-4 h-4 opacity-70';

export function ContextMenu({
  isOpen,
  position,
  type,
  onClose,
  onCopy,
  onCut,
  onPaste,
  onDuplicate,
  onDelete,
  onBringToFront,
  onSendToBack,
  onLock,
  onUnlock,
  onSelectAll,
  onFitView,
  onAddNode,
  onEditEdgeLabel,
  hasSelection,
  hasClipboard,
  isLocked = false,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to keep menu on screen
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const padding = 10;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + rect.width > window.innerWidth - padding) {
      x = window.innerWidth - rect.width - padding;
    }

    // Adjust vertical position
    if (y + rect.height > window.innerHeight - padding) {
      y = window.innerHeight - rect.height - padding;
    }

    setAdjustedPosition({ x: Math.max(padding, x), y: Math.max(padding, y) });
  }, [isOpen, position]);

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

  const handleItemClick = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose]
  );

  const nodeTypes = [
    { type: 'rectangle', label: 'Process', icon: <Square className={iconClass} /> },
    { type: 'diamond', label: 'Decision', icon: <Diamond className={iconClass} /> },
    { type: 'oval', label: 'Start/End', icon: <Circle className={iconClass} /> },
    { type: 'parallelogram', label: 'Data', icon: <Hexagon className={iconClass} /> },
    { type: 'database', label: 'Database', icon: <Database className={iconClass} /> },
    { type: 'documents', label: 'Document', icon: <FileStack className={iconClass} /> },
    { type: 'subprocess', label: 'Subprocess', icon: <Layers className={iconClass} /> },
    { type: 'swimlane', label: 'Swimlane', icon: <Layers className={iconClass} /> },
    { type: 'sticky-note', label: 'Note', icon: <StickyNote className={iconClass} /> },
    { type: 'icon', label: 'Icon', icon: <Type className={iconClass} /> },
  ];

  const getMenuItems = (): ContextMenuItem[] => {
    if (type === 'node') {
      return [
        {
          id: 'copy',
          label: 'Copy',
          icon: <Copy className={iconClass} />,
          shortcut: '⌘C',
          onClick: onCopy,
          disabled: !hasSelection,
        },
        {
          id: 'cut',
          label: 'Cut',
          icon: <Scissors className={iconClass} />,
          shortcut: '⌘X',
          onClick: onCut,
          disabled: !hasSelection,
        },
        {
          id: 'paste',
          label: 'Paste',
          icon: <ClipboardPaste className={iconClass} />,
          shortcut: '⌘V',
          onClick: onPaste,
          disabled: !hasClipboard,
        },
        {
          id: 'duplicate',
          label: 'Duplicate',
          icon: <CopyPlus className={iconClass} />,
          shortcut: '⌘D',
          onClick: onDuplicate,
          disabled: !hasSelection,
          divider: true,
        },
        {
          id: 'bringToFront',
          label: 'Bring to Front',
          icon: <ArrowUpToLine className={iconClass} />,
          shortcut: '⌘]',
          onClick: onBringToFront,
          disabled: !hasSelection,
        },
        {
          id: 'sendToBack',
          label: 'Send to Back',
          icon: <ArrowDownToLine className={iconClass} />,
          shortcut: '⌘[',
          onClick: onSendToBack,
          disabled: !hasSelection,
          divider: true,
        },
        {
          id: 'lock',
          label: isLocked ? 'Unlock' : 'Lock',
          icon: isLocked ? <Unlock className={iconClass} /> : <Lock className={iconClass} />,
          shortcut: '⌘L',
          onClick: isLocked ? onUnlock || (() => {}) : onLock || (() => {}),
          disabled: !hasSelection,
          divider: true,
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 className={iconClass} />,
          shortcut: '⌫',
          onClick: onDelete,
          disabled: !hasSelection,
        },
      ];
    }

    if (type === 'edge') {
      return [
        {
          id: 'editLabel',
          label: 'Edit Label',
          icon: <Type className={iconClass} />,
          onClick: onEditEdgeLabel || (() => {}),
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: <Trash2 className={iconClass} />,
          shortcut: '⌫',
          onClick: onDelete,
          divider: true,
        },
      ];
    }

    // Canvas context menu
    return [
      {
        id: 'paste',
        label: 'Paste',
        icon: <ClipboardPaste className={iconClass} />,
        shortcut: '⌘V',
        onClick: onPaste,
        disabled: !hasClipboard,
      },
      {
        id: 'selectAll',
        label: 'Select All',
        icon: <MousePointerClick className={iconClass} />,
        shortcut: '⌘A',
        onClick: onSelectAll,
        divider: true,
      },
      {
        id: 'fitView',
        label: 'Fit View',
        icon: <Maximize2 className={iconClass} />,
        onClick: onFitView,
        divider: true,
      },
      {
        id: 'addNode',
        label: 'Add Node',
        icon: <Plus className={iconClass} />,
        onClick: () => {},
        submenu: nodeTypes.map((nt) => ({
          id: `add-${nt.type}`,
          label: nt.label,
          icon: nt.icon,
          onClick: () => onAddNode(nt.type),
        })),
      },
    ];
  };

  if (!isOpen || !type) return null;

  const menuItems = getMenuItems();

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[200px] rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      <div className="py-1.5">
        {menuItems.map((item, index) => (
          <div key={item.id}>
            {item.submenu ? (
              <div
                className="relative"
                onMouseEnter={() => setSubmenuOpen(item.id)}
                onMouseLeave={() => setSubmenuOpen(null)}
              >
                <button
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={item.disabled}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  <span className="text-muted-foreground">▸</span>
                </button>

                {submenuOpen === item.id && (
                  <div className="absolute left-full top-0 ml-1 min-w-[180px] rounded-lg border border-border/50 bg-background/95 backdrop-blur-xl shadow-xl overflow-hidden">
                    <div className="py-1.5 max-h-[300px] overflow-y-auto">
                      {item.submenu.map((subitem) => (
                        <button
                          key={subitem.id}
                          className="flex w-full items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors"
                          onClick={() => handleItemClick(subitem.onClick)}
                        >
                          {subitem.icon}
                          <span>{subitem.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-sm text-foreground hover:bg-primary/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={() => handleItemClick(item.onClick)}
                disabled={item.disabled}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.shortcut && (
                  <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                )}
              </button>
            )}
            {item.divider && index < menuItems.length - 1 && (
              <div className="my-1.5 border-t border-border/30" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}
