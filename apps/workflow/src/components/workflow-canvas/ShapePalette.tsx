'use client';

import { useState, useEffect, type ComponentType, type ReactNode } from 'react';
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
  Shapes,
  Keyboard,
  KanbanSquare,
  StickyNote,
  Image,
  Database,
  Files,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ShapeTemplateProps {
  type: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function ShapeTemplate({ type, label, icon: Icon, onDragStart }: ShapeTemplateProps) {
  const { theme } = useTheme();

  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, type)}
      className="group flex cursor-grab flex-col items-center gap-1.5 rounded border p-2 transition-all active:cursor-grabbing"
      style={{
        borderColor: 'rgba(var(--border-rgb, 255, 255, 255), 0.1)',
        backgroundColor: 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(${theme.primaryRgb}, 0.5)`;
        e.currentTarget.style.backgroundColor = 'rgba(var(--foreground-rgb, 255, 255, 255), 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(var(--border-rgb, 255, 255, 255), 0.1)';
        e.currentTarget.style.backgroundColor = 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)';
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
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
        {label}
      </span>
    </div>
  );
}

interface ToolButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: ReactNode;
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
          ? 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)'
          : variant === 'danger'
            ? 'rgba(239, 68, 68, 0.1)'
            : `rgba(${theme.primaryRgb}, 0.1)`,
        border: disabled
          ? '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)'
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
  icon?: ReactNode;
  defaultOpen?: boolean;
  highlight?: boolean;
  children: ReactNode;
  storageId: string;
  isCollapsed?: boolean;
}

function PaletteSection({
  title,
  icon,
  defaultOpen = false,
  highlight = false,
  children,
  storageId,
  isCollapsed = false,
}: PaletteSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Hydrate the persisted state on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(storageId);
    if (saved !== null) {
      setIsOpen(saved === 'true');
    }
  }, [storageId]);

  // Persist whenever the section toggles
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageId, String(isOpen));
  }, [isOpen, storageId]);

  if (isCollapsed) {
    return (
      <div
        className={`
          flex justify-center rounded-lg border px-2 py-3 transition-all
          ${highlight ? 'border-border bg-foreground/10' : 'border-border bg-foreground/5'}
        `}
        title={title}
      >
        {icon}
      </div>
    );
  }

  return (
    <div
      className={`
        rounded-lg border px-3 py-2 transition-all
        ${highlight ? 'border-border bg-foreground/10' : 'border-border bg-foreground/5'}
      `}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
      >
        <span className="flex items-center gap-1.5">
          {icon}
          <span>{title}</span>
        </span>
        <span className="text-muted-foreground opacity-60">{isOpen ? '-' : '+'}</span>
      </button>
      {isOpen && <div className="mt-2 flex flex-col gap-2">{children}</div>}
    </div>
  );
}

type ArrowType = 'none' | 'end' | 'start' | 'both';
type LineStyle = 'solid' | 'dashed' | 'dotted' | 'animated-solid' | 'animated-dashed' | 'animated-dotted';
// type EdgeValidationMode = 'strict' | 'relaxed';
// type BranchTemplate = 'ifElse' | 'loop';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const shapes = [
    { type: 'rectangle', label: 'Process', icon: Square },
    { type: 'diamond', label: 'Decision', icon: Diamond },
    { type: 'oval', label: 'Start/End', icon: Circle },
    { type: 'parallelogram', label: 'Input/Output', icon: Inbox },
    { type: 'swimlane', label: 'Swimlane', icon: KanbanSquare },
    { type: 'subprocess', label: 'Subprocess', icon: Workflow },
    { type: 'sticky-note', label: 'Sticky Note', icon: StickyNote },
    { type: 'icon', label: 'Icon/Emoji', icon: Image },
    { type: 'database', label: 'Database', icon: Database },
    { type: 'documents', label: 'Docs/Queue', icon: Files },
  ];
  const backgroundColors = [
    'rgba(10, 10, 10, 0.7)',
    'rgba(255, 255, 255, 0.1)',
    'rgba(239, 68, 68, 0.2)',
    'rgba(249, 115, 22, 0.2)',
    'rgba(234, 179, 8, 0.2)',
    'rgba(34, 197, 94, 0.2)',
    'rgba(6, 182, 212, 0.2)',
    'rgba(59, 130, 246, 0.2)',
    'rgba(139, 92, 246, 0.2)',
    'rgba(236, 72, 153, 0.2)',
    'rgba(255, 255, 255, 0.9)',
    'rgba(0, 0, 0, 0.9)',
  ];

  return (
    <div
      className={`workflow-tool-menu flex h-full flex-col gap-3 overflow-y-auto border-r border-border bg-background p-3 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 hover:bg-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
          title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <PaletteSection
        title="Tools"
        icon={<Wrench className="h-3.5 w-3.5 text-muted-foreground" />}
        defaultOpen
        storageId="workflow-section-tools"
        isCollapsed={isCollapsed}
      >
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
            title="Zoom In"
            icon={<ZoomIn className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onZoomOut}
            title="Zoom Out"
            icon={<ZoomOut className="h-3.5 w-3.5" />}
          />
          <ToolButton
            onClick={onFitView}
            title="Fit View"
            icon={<Maximize2 className="h-3.5 w-3.5" />}
          />
        </div>
        <ToolButton
          onClick={onClearCanvas}
          title="Clear Canvas"
          icon={<Eraser className="h-3.5 w-3.5" />}
          variant="danger"
        />
      </PaletteSection>

      <PaletteSection
        title="Shapes"
        icon={<Shapes className="h-3.5 w-3.5 text-muted-foreground" />}
        defaultOpen
        storageId="workflow-section-shapes"
        isCollapsed={isCollapsed}
      >
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
      </PaletteSection>

      <PaletteSection
        title="Connectors"
        icon={<Workflow className="h-3.5 w-3.5 text-muted-foreground" />}
        storageId="workflow-section-connectors"
        defaultOpen
        isCollapsed={isCollapsed}
      >
        <div className="grid grid-cols-2 gap-1.5">
          {(['smoothstep', 'straight', 'step', 'default'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onEdgeTypeChange(type)}
              className={`
                rounded px-2 py-1.5 text-[10px] capitalize transition-all
                ${edgeType === type ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: edgeType === type ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
                border: edgeType === type ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                color: edgeType === type ? theme.primary : 'var(--muted-foreground)',
              }}
            >
              {type === 'default' ? 'Bezier' : type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {([
            { type: 'end' as const, symbol: '-->' },
            { type: 'start' as const, symbol: '<--' },
            { type: 'both' as const, symbol: '<->' },
            { type: 'none' as const, symbol: '---' },
          ]).map(({ type, symbol }) => (
            <button
              key={type}
              onClick={() => onArrowTypeChange(type)}
              title={`Arrow: ${type}`}
              className={`
                flex items-center justify-center rounded px-1 py-1.5 text-xs transition-all
                ${arrowType === type ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: arrowType === type ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
                border: arrowType === type ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                color: arrowType === type ? theme.primary : 'var(--muted-foreground)',
              }}
            >
              <span className="font-mono text-xs leading-none">{symbol}</span>
            </button>
          ))}
        </div>

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
                flex items-center justify-center rounded px-1 py-1.5 text-xs transition-all
                ${lineStyle === style ? 'font-medium' : 'hover:bg-white/10'}
              `}
              style={{
                backgroundColor: lineStyle === style ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
                border: lineStyle === style ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
                color: lineStyle === style ? theme.primary : 'var(--muted-foreground)',
              }}
            >
              <span className="font-mono text-sm leading-none tracking-wider">{preview}</span>
            </button>
          ))}
        </div>
      </PaletteSection>

      <PaletteSection
        title="Node Style"
        icon={<Palette className="h-3.5 w-3.5 text-muted-foreground" />}
        highlight={selectedCount > 0}
        defaultOpen
        storageId="workflow-section-node-style"
        isCollapsed={isCollapsed}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted-foreground">
              {selectedCount > 0 ? `Color (${selectedCount} selected)` : 'Node Color'}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[
                theme.primary,
                '#ef4444',
                '#f97316',
                '#eab308',
                '#22c55e',
                '#06b6d4',
                '#3b82f6',
                '#8b5cf6',
                '#ec4899',
                '#64748b',
                '#ffffff',
                '#000000',
              ].map((color, index) => (
                <button
                  key={`${color}-${index}`}
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted-foreground">
              {selectedCount > 0 ? `Background (${selectedCount} selected)` : 'Background Color'}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {backgroundColors.map((bgColor, index) => (
                <button
                  key={`${bgColor}-${index}`}
                  type="button"
                  onClick={() => onNodeBgColorChange(bgColor)}
                  title={index === 0 ? 'Default dark' : bgColor}
                  className="relative h-8 w-8 overflow-hidden rounded border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: bgColor,
                    borderColor: 'rgba(var(--foreground-rgb, 255, 255, 255), 0.3)',
                  }}
                  disabled={selectedCount === 0}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                      backgroundImage:
                        'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
                      backgroundSize: '4px 4px',
                      backgroundPosition: '0 0, 0 2px, 2px -2px, -2px 0px',
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </PaletteSection>

      <PaletteSection
        title="Alignment"
        icon={<Grid3x3 className="h-3.5 w-3.5 text-muted-foreground" />}
        highlight={selectedCount >= 2}
        storageId="workflow-section-alignment"
        isCollapsed={isCollapsed}
      >
        <button
          type="button"
          onClick={onSnapToGridToggle}
          className={`
            flex items-center justify-center gap-2 rounded px-3 py-2 text-xs transition-all
            ${snapToGrid ? 'font-medium' : 'hover:bg-white/10'}
          `}
          style={{
            backgroundColor: snapToGrid ? `rgba(${theme.primaryRgb}, 0.2)` : 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)',
            border: snapToGrid ? `1px solid rgba(${theme.primaryRgb}, 0.5)` : '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)',
            color: snapToGrid ? theme.primary : 'var(--muted-foreground)',
          }}
        >
          <Grid3x3 className="h-3.5 w-3.5" />
          Snap to Grid
        </button>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-muted-foreground">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted-foreground">
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
                  backgroundColor: selectedCount < 3 ? 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)' : `rgba(${theme.primaryRgb}, 0.1)`,
                  border: selectedCount < 3 ? '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)' : `1px solid rgba(${theme.primaryRgb}, 0.3)`,
                  color: selectedCount < 3 ? 'var(--muted-foreground)' : theme.primary,
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
                  backgroundColor: selectedCount < 3 ? 'rgba(var(--foreground-rgb, 255, 255, 255), 0.05)' : `rgba(${theme.primaryRgb}, 0.1)`,
                  border: selectedCount < 3 ? '1px solid rgba(var(--border-rgb, 255, 255, 255), 0.1)' : `1px solid rgba(${theme.primaryRgb}, 0.3)`,
                  color: selectedCount < 3 ? 'var(--muted-foreground)' : theme.primary,
                }}
              >
                <ArrowUpDown className="h-3 w-3" />
                Vertical
              </button>
            </div>
          </div>
        </div>
      </PaletteSection>

      <PaletteSection
        title="Shortcuts"
        icon={<Keyboard className="h-3.5 w-3.5 text-muted-foreground" />}
        storageId="workflow-section-shortcuts"
        isCollapsed={isCollapsed}
      >
        <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
          <div>
            <kbd className="rounded bg-foreground/10 px-1 py-0.5 text-[9px]">Del</kbd> Delete
          </div>
          <div>
            <kbd className="rounded bg-foreground/10 px-1 py-0.5 text-[9px]">⌘Z</kbd> Undo
          </div>
          <div>
            <kbd className="rounded bg-foreground/10 px-1 py-0.5 text-[9px]">Space</kbd> Pan
          </div>
        </div>
      </PaletteSection>
    </div>
  );
}