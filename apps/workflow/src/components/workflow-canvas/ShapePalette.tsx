'use client';

import { useState } from 'react';
import {
  Square,
  Diamond,
  Circle,
  Inbox,
  Undo2,
  Redo2,
  Trash2,
  Eraser,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Workflow,
  Palette,
  Grid3x3,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  ArrowLeftRight,
  ArrowUpDown,
  Wrench,
  SunMedium,
  Shapes,
  Keyboard,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface ShapeTemplateProps {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function ShapeTemplate({ type, label, icon: Icon, onDragStart }: ShapeTemplateProps) {
  const { theme } = useTheme();

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, type)}
      className="group flex cursor-grab flex-col items-center gap-1.5 rounded border transition-all active:cursor-grabbing p-2"
      style={{
        borderColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(${theme.primaryRgb}, 0.5)`;
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded transition-all"
        style={{
          backgroundColor: `rgba(${theme.primaryRgb}, 0.2)`,
          color: theme.primary,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[10px] font-medium text-white/70 group-hover:text-white">
        {label}
      </span>
    </div>
  );
}

interface ToolButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: React.ReactNode;
  variant?: 'default' | 'danger';
}

function ToolButton({
  onClick,
  disabled = false,
  title,
  icon,
  variant = 'default',
}: ToolButtonProps) {
  const { theme } = useTheme();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex h-8 w-full items-center justify-center rounded transition-all
        ${disabled ? 'cursor-not-allowed opacity-30' : variant === 'danger' ? 'hover:bg-red-500/20' : 'hover:opacity-80'}
      `}
      style={{
        backgroundColor: disabled
          ? 'rgba(255, 255, 255, 0.05)'
          : variant === 'danger'
            ? 'rgba(239, 68, 68, 0.1)'
            : `rgba(${theme.primaryRgb}, 0.1)`,
        border: disabled
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : variant === 'danger'
            ? '1px solid rgba(239, 68, 68, 0.3)'
            : `1px solid rgba(${theme.primaryRgb}, 0.3)`,
        color: variant === 'default' && !disabled ? theme.primary : variant === 'danger' ? '#ef4444' : undefined,
      }}
    >
      {icon}
    </button>
  );
}

interface PaletteSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}

function PaletteSection({
  title,
  icon,
  defaultOpen = false,
  highlight = false,
  children,
}: PaletteSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={`
        rounded-lg border px-3 py-2 transition-all
        ${highlight ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5'}
      `}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-white/60"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </span>
        <span className="text-white/40">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && <div className="mt-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

type ArrowType = 'none' | 'end' | 'start' | 'both';
type LineStyle = 'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted';

interface ShapePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
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
  edgeType: 'default' | 'straight' | 'step' | 'smoothstep';
  onEdgeTypeChange: (type: 'default' | 'straight' | 'step' | 'smoothstep') => void;
  arrowType: ArrowType;
  onArrowTypeChange: (type: ArrowType) => void;
  lineStyle: LineStyle;
  onLineStyleChange: (style: LineStyle) => void;
  selectedNodeColor: string | null;
  onNodeColorChange: (color: string) => void;
  onNodeBgColorChange: (bgColor: string) => void;
  snapToGrid: boolean;
  onSnapToGridToggle: () => void;
  onAlignNodes: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'center-h' | 'center-v') => void;
  onDistributeNodes: (direction: 'horizontal' | 'vertical') => void;
}

export function ShapePalette({
  onDragStart,
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
  edgeType,
  onEdgeTypeChange,
  arrowType,
  onArrowTypeChange,
  lineStyle,
  onLineStyleChange,
  selectedNodeColor,
  onNodeColorChange,
  onNodeBgColorChange,
  snapToGrid,
  onSnapToGridToggle,
  onAlignNodes,
  onDistributeNodes,
}: ShapePaletteProps) {
  const { theme } = useTheme();
  const shapes = [
    { type: 'rectangle', label: 'Process', icon: Square },
    { type: 'diamond', label: 'Decision', icon: Diamond },
    { type: 'oval', label: 'Start/End', icon: Circle },
    { type: 'parallelogram', label: 'Input/Output', icon: Inbox },
  ];

  return (
    <div className="flex h-full w-64 flex-col gap-3 border-r border-white/10 bg-[#050505] p-3">
      {/* Tools Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Tools</h3>

        {/* All Actions in single grid */}
        <div className="grid grid-cols-3 gap-1.5">
          <ToolButton
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            icon={<Undo2 className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            icon={<Redo2 className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onDelete}
            disabled={selectedCount === 0}
            title={`Delete Selected (${selectedCount})`}
            icon={<Trash2 className="h-3.5 w-3.5" />}
            variant="danger"
          />
          <ToolButton
            onClick={onZoomIn}
            disabled={false}
            title="Zoom In"
            icon={<ZoomIn className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onZoomOut}
            disabled={false}
            title="Zoom Out"
            icon={<ZoomOut className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onFitView}
            disabled={false}
            title="Fit View"
            icon={<Maximize2 className="h-3.5 w-3.5" />}
          />
        </div>

        {/* Clear Canvas - Full Width */}
        <ToolButton
          onClick={onClearCanvas}
          disabled={false}
          title="Clear Canvas"
          icon={<Eraser className="h-3.5 w-3.5" />}
          variant="danger"
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Connector Settings */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Workflow className="h-3 w-3 text-white/50" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Connectors</h3>
        </div>

        {/* Edge Type - Compact 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {(['smoothstep', 'straight', 'step', 'default'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onEdgeTypeChange(type)}
              className={`
                px-2 py-1.5 text-[10px] rounded transition-all capitalize
                ${edgeType === type ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: edgeType === type ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(255, 255, 255, 0.05)',
                border: edgeType === type ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(255, 255, 255, 0.1)',
                color: edgeType === type ? theme.primary : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              {type === 'default' ? 'Bezier' : type}
            </button>
          ))}
        </div>

        {/* Arrow Direction - Compact 4-column Grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { type: 'end' as const, symbol: '—▶' },
            { type: 'start' as const, symbol: '◀—' },
            { type: 'both' as const, symbol: '◀▶' },
            { type: 'none' as const, symbol: '——' },
          ]).map(({ type, symbol }) => (
            <button
              key={type}
              onClick={() => onArrowTypeChange(type)}
              title={`Arrow: ${type}`}
              className={`
                px-1 py-1.5 text-xs rounded transition-all flex items-center justify-center
                ${arrowType === type ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: arrowType === type ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(255, 255, 255, 0.05)',
                border: arrowType === type ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(255, 255, 255, 0.1)',
                color: arrowType === type ? theme.primary : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <span className="text-sm leading-none font-mono">{symbol}</span>
            </button>
          ))}
        </div>

        {/* Line Style - Compact 3x2 Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {([
            { style: 'solid' as const, preview: '──' },
            { style: 'dashed' as const, preview: '─ ─' },
            { style: 'dotted' as const, preview: '···' },
            { style: 'animated-solid' as const, preview: '⟿⟿' },
            { style: 'animated-dashed' as const, preview: '⟿ ⟿' },
            { style: 'animated-dotted' as const, preview: '⋯⋯' },
          ]).map(({ style, preview }) => (
            <button
              key={style}
              onClick={() => onLineStyleChange(style)}
              title={style.replace('-', ' ')}
              className={`
                px-1 py-1.5 text-xs rounded transition-all flex items-center justify-center
                ${lineStyle === style ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: lineStyle === style ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(255, 255, 255, 0.05)',
                border: lineStyle === style ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(255, 255, 255, 0.1)',
                color: lineStyle === style ? theme.primary : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <span className="text-sm leading-none font-mono tracking-wider">{preview}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Theme */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Theme</h3>
        <ThemeSwitcher />
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Node Styling */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Palette className="h-3 w-3 text-white/50" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Node Style</h3>
        </div>

        {/* Color Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-white/50">
            {selectedCount > 0 ? `Color (${selectedCount} selected)` : 'Node Color'}
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              theme.primary, // Theme color
              '#ef4444', // Red
              '#f97316', // Orange
              '#eab308', // Yellow
              '#22c55e', // Green
              '#06b6d4', // Cyan
              '#3b82f6', // Blue
              '#8b5cf6', // Purple
              '#ec4899', // Pink
              '#64748b', // Gray
              '#ffffff', // White
              '#000000', // Black
            ].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onNodeColorChange(color)}
                title={color === theme.primary ? 'Theme color' : color}
                className={`
                  h-8 w-8 rounded border-2 transition-all
                  ${selectedNodeColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-110'}
                `}
                style={{
                  backgroundColor: color,
                  borderColor: color === '#000000' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)',
                }}
                disabled={selectedCount === 0}
              />
            ))}
          </div>
        </div>

        {/* Background Color Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-white/50">
            {selectedCount > 0 ? `Background (${selectedCount} selected)` : 'Background Color'}
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {[
              'rgba(10, 10, 10, 0.7)', // Dark (default)
              'rgba(255, 255, 255, 0.1)', // Light transparent
              'rgba(239, 68, 68, 0.2)', // Red transparent
              'rgba(249, 115, 22, 0.2)', // Orange transparent
              'rgba(234, 179, 8, 0.2)', // Yellow transparent
              'rgba(34, 197, 94, 0.2)', // Green transparent
              'rgba(6, 182, 212, 0.2)', // Cyan transparent
              'rgba(59, 130, 246, 0.2)', // Blue transparent
              'rgba(139, 92, 246, 0.2)', // Purple transparent
              'rgba(236, 72, 153, 0.2)', // Pink transparent
              'rgba(255, 255, 255, 0.9)', // White solid
              'rgba(0, 0, 0, 0.9)', // Black solid
            ].map((bgColor, index) => (
              <button
                key={bgColor}
                type="button"
                onClick={() => onNodeBgColorChange(bgColor)}
                title={index === 0 ? 'Default dark' : bgColor}
                className="h-8 w-8 rounded border-2 transition-all hover:scale-110 relative overflow-hidden"
                style={{
                  backgroundColor: bgColor,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
                disabled={selectedCount === 0}
              >
                {/* Checkerboard pattern for transparency preview */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
                }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Grid & Alignment */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Grid3x3 className="h-3 w-3 text-white/50" />
          <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Alignment</h3>
        </div>

        {/* Snap to Grid Toggle */}
        <button
          type="button"
          onClick={onSnapToGridToggle}
          className={`
            flex items-center justify-center gap-2 rounded px-3 py-2 text-xs transition-all
            ${snapToGrid ? 'font-medium' : 'hover:bg-white/10'}
          `}
          style={{
            backgroundColor: snapToGrid ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(255, 255, 255, 0.05)',
            border: snapToGrid ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(255, 255, 255, 0.1)',
            color: snapToGrid ? theme.primary : 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Snap to Grid
        </button>

        {/* Alignment Buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-white/50">
            {selectedCount >= 2 ? `Align (${selectedCount} selected)` : 'Align Nodes'}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <ToolButton
              onClick={() => onAlignNodes('left')}
              disabled={selectedCount < 2}
              title="Align Left"
              icon={<AlignStartVertical className="h-3.5 w-3.5" />}
            />
            <ToolButton
              onClick={() => onAlignNodes('center-h')}
              disabled={selectedCount < 2}
              title="Center Horizontal"
              icon={<AlignCenterVertical className="h-3.5 w-3.5" />}
            />
            <ToolButton
              onClick={() => onAlignNodes('right')}
              disabled={selectedCount < 2}
              title="Align Right"
              icon={<AlignEndVertical className="h-3.5 w-3.5" />}
            />
            <ToolButton
              onClick={() => onAlignNodes('top')}
              disabled={selectedCount < 2}
              title="Align Top"
              icon={<AlignStartHorizontal className="h-3.5 w-3.5" />}
            />
            <ToolButton
              onClick={() => onAlignNodes('center-v')}
              disabled={selectedCount < 2}
              title="Center Vertical"
              icon={<AlignCenterHorizontal className="h-3.5 w-3.5" />}
            />
            <ToolButton
              onClick={() => onAlignNodes('bottom')}
              disabled={selectedCount < 2}
              title="Align Bottom"
              icon={<AlignEndHorizontal className="h-3.5 w-3.5" />}
            />
          </div>

          {/* Distribute Buttons */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/50">
              {selectedCount >= 3 ? `Distribute (${selectedCount} selected)` : 'Distribute Evenly'}
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onDistributeNodes('horizontal')}
                disabled={selectedCount < 3}
                title="Distribute Horizontally"
                className={`
                  flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[10px] transition-all
                  ${selectedCount < 3 ? 'cursor-not-allowed opacity-30' : 'hover:opacity-80'}
                `}
                style={{
                  backgroundColor: selectedCount < 3 ? 'rgba(255, 255, 255, 0.05)' : `rgba(${theme.primaryRgb}, 0.1)`,
                  border: selectedCount < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid rgba(${theme.primaryRgb}, 0.3)`,
                  color: selectedCount < 3 ? 'rgba(255, 255, 255, 0.3)' : theme.primary,
                }}
              >
                <ArrowLeftRight className="h-3 w-3" />
                Horizontal
              </button>
              <button
                type="button"
                onClick={() => onDistributeNodes('vertical')}
                disabled={selectedCount < 3}
                title="Distribute Vertically"
                className={`
                  flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[10px] transition-all
                  ${selectedCount < 3 ? 'cursor-not-allowed opacity-30' : 'hover:opacity-80'}
                `}
                style={{
                  backgroundColor: selectedCount < 3 ? 'rgba(255, 255, 255, 0.05)' : `rgba(${theme.primaryRgb}, 0.1)`,
                  border: selectedCount < 3 ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid rgba(${theme.primaryRgb}, 0.3)`,
                  color: selectedCount < 3 ? 'rgba(255, 255, 255, 0.3)' : theme.primary,
                }}
              >
                <ArrowUpDown className="h-3 w-3" />
                Vertical
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Shapes Section */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Shapes</h3>
        <div className="grid grid-cols-2 gap-2">
          {shapes.map((shape) => (
            <ShapeTemplate
              key={shape.type}
              type={shape.type}
              label={shape.label}
              icon={shape.icon}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts - Compact */}
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wide">Shortcuts</h3>
        <div className="text-[10px] text-white/50 leading-relaxed">
          <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px]">Del</kbd> Delete
        </div>
        <div className="text-[10px] text-white/50 leading-relaxed">
          <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px]">⌘Z</kbd> Undo
        </div>
        <div className="text-[10px] text-white/50 leading-relaxed">
          <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px]">Space</kbd> Pan
        </div>
      </div>
    </div>
  );
}
