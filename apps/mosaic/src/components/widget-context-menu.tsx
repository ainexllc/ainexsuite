'use client';

import { useEffect, useRef } from 'react';
import { Check, Trash2, RotateCcw } from 'lucide-react';
import {
  getWidgetSizePresets,
  getCurrentSizePreset,
  WIDGET_DISPLAY_NAMES,
  WidgetSizePreset
} from '@/lib/widget-sizes';
import { WIDGET_CONSTRAINTS } from '@/lib/layouts';

interface WidgetContextMenuProps {
  widgetId: string;
  widgetType: string;
  currentW: number;
  currentH: number;
  position: { x: number; y: number };
  onResize: (widgetId: string, w: number, h: number) => void;
  onRemove: (widgetId: string) => void;
  onClose: () => void;
}

export function WidgetContextMenu({
  widgetId,
  widgetType,
  currentW,
  currentH,
  position,
  onResize,
  onRemove,
  onClose,
}: WidgetContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close on escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const presets = getWidgetSizePresets(widgetType);
  const currentPreset = getCurrentSizePreset(widgetType, currentW, currentH);
  const displayName = WIDGET_DISPLAY_NAMES[widgetType] || widgetType;
  const defaultSize = WIDGET_CONSTRAINTS[widgetType];

  const handleSizeSelect = (preset: { key: WidgetSizePreset; config: { w: number; h: number } }) => {
    onResize(widgetId, preset.config.w, preset.config.h);
    onClose();
  };

  const handleResetToDefault = () => {
    if (defaultSize) {
      onResize(widgetId, defaultSize.defaultW, defaultSize.defaultH);
    }
    onClose();
  };

  const handleRemove = () => {
    onRemove(widgetId);
    onClose();
  };

  // Calculate menu position (ensure it stays in viewport)
  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 200),
    top: Math.min(position.y, window.innerHeight - 300),
    zIndex: 9999,
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="bg-surface-card border border-outline-subtle rounded-lg shadow-xl py-2 min-w-[180px] animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Widget name header */}
      <div className="px-3 py-1.5 text-xs font-medium text-ink-600 border-b border-outline-subtle mb-1">
        {displayName}
      </div>

      {/* Size presets */}
      {presets.length > 0 && (
        <>
          <div className="px-3 py-1 text-xs text-ink-400">Size</div>
          {presets.map((preset) => (
            <button
              key={preset.key}
              onClick={() => handleSizeSelect(preset)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-sm text-ink-700 hover:bg-surface-subtle transition-colors"
            >
              <span>{preset.config.label}</span>
              {currentPreset === preset.key && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
          <div className="border-t border-outline-subtle my-1" />
        </>
      )}

      {/* Actions */}
      <button
        onClick={handleResetToDefault}
        className="w-full px-3 py-1.5 flex items-center gap-2 text-sm text-ink-700 hover:bg-surface-subtle transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to Default
      </button>
      <button
        onClick={handleRemove}
        className="w-full px-3 py-1.5 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        Remove Widget
      </button>
    </div>
  );
}
