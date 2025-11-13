'use client';

import {
  Undo2,
  Redo2,
  Trash2,
  Eraser,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onClearCanvas: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedCount: number;
}

interface ToolbarButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger';
}

function ToolbarButton({
  onClick,
  disabled = false,
  title,
  icon,
  variant = 'default',
}: ToolbarButtonProps) {
  const defaultStyle = disabled
    ? {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }
    : variant === 'danger'
      ? {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }
      : {
          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
          border: '1px solid rgba(var(--theme-primary-rgb), 0.3)',
        };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-9 w-9 items-center justify-center rounded-lg transition-all
        ${
          disabled
            ? 'cursor-not-allowed opacity-30'
            : variant === 'danger'
              ? 'hover:bg-red-500/20 hover:text-red-400'
              : ''
        }
        ${variant === 'default' ? '' : 'text-red-400'}
      `}
      style={{
        ...defaultStyle,
        color: variant === 'default' && !disabled ? 'var(--theme-primary)' : undefined,
      }}
    >
      {icon}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="h-6 w-px bg-white/10" />;
}

export function Toolbar({
  onUndo,
  onRedo,
  onDelete,
  onClearCanvas,
  onFitView,
  onZoomIn,
  onZoomOut,
  canUndo,
  canRedo,
  selectedCount,
}: ToolbarProps) {
  return (
    <div
      className="fixed top-20 right-4 z-20 flex items-center gap-2 rounded-lg p-2 shadow-xl backdrop-blur-lg"
      style={{
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        border: '1px solid rgba(var(--theme-primary-rgb), 0.2)',
      }}
    >
      {/* Edit Actions */}
      <ToolbarButton
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        icon={<Undo2 className="h-4 w-4" />}
      />
      <ToolbarButton
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
        icon={<Redo2 className="h-4 w-4" />}
      />

      <ToolbarDivider />

      {/* Delete Actions */}
      <ToolbarButton
        onClick={onDelete}
        disabled={selectedCount === 0}
        title={`Delete Selected (${selectedCount}) - Delete Key`}
        icon={<Trash2 className="h-4 w-4" />}
        variant="danger"
      />
      <ToolbarButton
        onClick={onClearCanvas}
        disabled={false}
        title="Clear Canvas"
        icon={<Eraser className="h-4 w-4" />}
        variant="danger"
      />

      <ToolbarDivider />

      {/* View Controls */}
      <ToolbarButton
        onClick={onZoomIn}
        disabled={false}
        title="Zoom In"
        icon={<ZoomIn className="h-4 w-4" />}
      />
      <ToolbarButton
        onClick={onZoomOut}
        disabled={false}
        title="Zoom Out"
        icon={<ZoomOut className="h-4 w-4" />}
      />
      <ToolbarButton
        onClick={onFitView}
        disabled={false}
        title="Fit View"
        icon={<Maximize2 className="h-4 w-4" />}
      />

      <ToolbarDivider />

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </div>
  );
}
