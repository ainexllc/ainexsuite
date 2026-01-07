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
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

function useThemeColors() {
  const [themePrimary, setThemePrimary] = useState('#06b6d4');

  useEffect(() => {
    const updateColors = () => {
      const primary = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#06b6d4';
      setThemePrimary(primary);
    };
    updateColors();
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    return () => observer.disconnect();
  }, []);

  return { primary: themePrimary };
}

interface ShapeTemplateProps {
  type: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

function ShapeTemplate({ type, label, icon: Icon, onDragStart }: ShapeTemplateProps) {
  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, type)}
      className="group flex cursor-grab flex-col items-center gap-0.5 rounded-md p-1.5 transition-all active:cursor-grabbing hover:bg-muted dark:hover:bg-zinc-800/80"
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted transition-all dark:bg-zinc-800 group-hover:bg-primary/20">
        <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
      <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground">
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

function ToolButton({ onClick, disabled = false, title, icon, variant = 'default' }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        group flex h-7 w-full items-center justify-center rounded-md transition-all
        ${disabled
          ? 'cursor-not-allowed opacity-50'
          : variant === 'danger'
            ? 'hover:bg-red-500/10 dark:hover:bg-red-500/20'
            : 'hover:bg-muted dark:hover:bg-zinc-800/80'
        }
      `}
    >
      <div
        className={`
          flex h-6 w-6 items-center justify-center rounded transition-all
          ${disabled
            ? 'bg-muted/50 dark:bg-zinc-800/50'
            : variant === 'danger'
              ? 'bg-muted dark:bg-zinc-800 group-hover:bg-red-500'
              : 'bg-muted dark:bg-zinc-800 group-hover:bg-primary'
          }
        `}
      >
        <span className={`transition-colors ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground group-hover:text-white'}`}>
          {icon}
        </span>
      </div>
    </button>
  );
}

interface PaletteSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  storageId: string;
  isCollapsed?: boolean;
}

function PaletteSection({ title, icon, defaultOpen = false, children, storageId, isCollapsed = false }: PaletteSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(storageId);
    if (saved !== null) setIsOpen(saved === 'true');
  }, [storageId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageId, String(isOpen));
  }, [isOpen, storageId]);

  if (isCollapsed) {
    return (
      <div className="flex justify-center rounded-md p-2 transition-all hover:bg-muted dark:hover:bg-zinc-800/50" title={title}>
        {icon}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background/95 dark:border-zinc-700/50 dark:bg-zinc-900/95">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-2.5 py-1.5 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-800/50"
      >
        <div className="flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded bg-muted dark:bg-zinc-800">
            {icon}
          </div>
          <span className="text-[11px] font-medium text-foreground">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </button>
      {isOpen && <div className="border-t border-border p-2 dark:border-zinc-700/50">{children}</div>}
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
  onDragStart, onUndo, onRedo, onDelete, onClearCanvas, onFitView, onZoomIn, onZoomOut,
  canUndo, canRedo, selectedCount, edgeType, onEdgeTypeChange, arrowType, onArrowTypeChange,
  lineStyle, onLineStyleChange, selectedNodeColor, onNodeColorChange, onNodeBgColorChange,
  snapToGrid, onSnapToGridToggle, onAlignNodes, onDistributeNodes,
}: ShapePaletteProps) {
  const theme = useThemeColors();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const shapes = [
    { type: 'rectangle', label: 'Process', icon: Square },
    { type: 'diamond', label: 'Decision', icon: Diamond },
    { type: 'oval', label: 'Start/End', icon: Circle },
    { type: 'parallelogram', label: 'I/O', icon: Inbox },
    { type: 'swimlane', label: 'Swimlane', icon: KanbanSquare },
    { type: 'subprocess', label: 'Subprocess', icon: Workflow },
    { type: 'sticky-note', label: 'Note', icon: StickyNote },
    { type: 'icon', label: 'Icon', icon: Image },
    { type: 'database', label: 'Database', icon: Database },
    { type: 'documents', label: 'Docs', icon: Files },
  ];

  const backgroundColors = [
    '#18181b', '#27272a', '#f4f4f5', '#ffffff',
    '#1e3a5f', '#14532d', '#7f1d1d', '#581c87',
    '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3',
  ];

  const nodeColors = [
    theme.primary, '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#3b82f6', '#8b5cf6', '#ec4899', '#64748b', '#ffffff', '#000000',
  ];

  return (
    <div className={`workflow-tool-menu flex h-full flex-col gap-2 overflow-y-auto border-r border-border bg-background/50 p-2 backdrop-blur-sm transition-all duration-300 dark:bg-zinc-950/50 ${isCollapsed ? 'w-14' : 'w-56'}`}>
      {/* Collapse toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground transition-all hover:text-foreground dark:bg-zinc-800"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </div>

      {/* Tools */}
      <PaletteSection title="Tools" icon={<Wrench className="h-2.5 w-2.5 text-muted-foreground" />} defaultOpen storageId="workflow-section-tools" isCollapsed={isCollapsed}>
        <div className="grid grid-cols-3 gap-0.5">
          <ToolButton onClick={onUndo} disabled={!canUndo} title="Undo" icon={<Undo2 className="h-3 w-3" />} />
          <ToolButton onClick={onRedo} disabled={!canRedo} title="Redo" icon={<Redo2 className="h-3 w-3" />} />
          <ToolButton onClick={onDelete} disabled={selectedCount === 0} title="Delete" icon={<Trash2 className="h-3 w-3" />} variant="danger" />
          <ToolButton onClick={onZoomIn} title="Zoom In" icon={<ZoomIn className="h-3 w-3" />} />
          <ToolButton onClick={onZoomOut} title="Zoom Out" icon={<ZoomOut className="h-3 w-3" />} />
          <ToolButton onClick={onFitView} title="Fit View" icon={<Maximize2 className="h-3 w-3" />} />
        </div>
        <div className="mt-1">
          <ToolButton onClick={onClearCanvas} title="Clear Canvas" icon={<Eraser className="h-3 w-3" />} variant="danger" />
        </div>
      </PaletteSection>

      {/* Shapes */}
      <PaletteSection title="Shapes" icon={<Shapes className="h-2.5 w-2.5 text-muted-foreground" />} defaultOpen storageId="workflow-section-shapes" isCollapsed={isCollapsed}>
        <div className="grid grid-cols-2 gap-0.5">
          {shapes.map((shape) => (
            <ShapeTemplate key={shape.type} type={shape.type} label={shape.label} icon={shape.icon} onDragStart={onDragStart} />
          ))}
        </div>
      </PaletteSection>

      {/* Connectors */}
      <PaletteSection title="Connectors" icon={<Workflow className="h-2.5 w-2.5 text-muted-foreground" />} defaultOpen storageId="workflow-section-connectors" isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-1">
            {(['smoothstep', 'straight', 'step', 'default'] as const).map((type) => (
              <button
                key={type}
                onClick={() => onEdgeTypeChange(type)}
                className={`rounded px-2 py-1 text-[9px] font-medium capitalize transition-all ${edgeType === type ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground dark:bg-zinc-800'}`}
              >
                {type === 'default' ? 'Bezier' : type}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {([{ type: 'end' as const, s: '→' }, { type: 'start' as const, s: '←' }, { type: 'both' as const, s: '↔' }, { type: 'none' as const, s: '—' }]).map(({ type, s }) => (
              <button
                key={type}
                onClick={() => onArrowTypeChange(type)}
                className={`rounded px-1.5 py-1 text-xs transition-all ${arrowType === type ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground dark:bg-zinc-800'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-1">
            {([{ style: 'solid' as const, p: '━' }, { style: 'dashed' as const, p: '┅' }, { style: 'dotted' as const, p: '·' }, { style: 'animated-solid' as const, p: '⟿' }, { style: 'animated-dashed' as const, p: '⤳' }, { style: 'animated-dotted' as const, p: '⋯' }]).map(({ style, p }) => (
              <button
                key={style}
                onClick={() => onLineStyleChange(style)}
                title={style}
                className={`rounded px-1.5 py-1 text-xs transition-all ${lineStyle === style ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground dark:bg-zinc-800'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </PaletteSection>

      {/* Node Style */}
      <PaletteSection title="Style" icon={<Palette className="h-2.5 w-2.5 text-muted-foreground" />} defaultOpen storageId="workflow-section-node-style" isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">{selectedCount > 0 ? `Color (${selectedCount})` : 'Color'}</span>
            <div className="grid grid-cols-6 gap-1">
              {nodeColors.map((color, i) => (
                <button
                  key={`${color}-${i}`}
                  onClick={() => onNodeColorChange(color)}
                  title={color === theme.primary ? 'Theme' : color}
                  className={`h-5 w-5 rounded transition-all ${selectedNodeColor === color ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : 'hover:scale-110'} ${color === '#000000' ? 'border border-white/30' : color === '#ffffff' ? 'border border-black/20' : ''}`}
                  style={{ backgroundColor: color }}
                  disabled={selectedCount === 0}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">{selectedCount > 0 ? `Background (${selectedCount})` : 'Background'}</span>
            <div className="grid grid-cols-6 gap-1">
              {backgroundColors.map((bg, i) => {
                const isLight = ['#f4f4f5', '#ffffff', '#dbeafe', '#dcfce7', '#fef3c7', '#fce7f3'].includes(bg);
                return (
                  <button
                    key={`${bg}-${i}`}
                    onClick={() => onNodeBgColorChange(bg)}
                    className={`h-5 w-5 rounded transition-all hover:scale-110 ${isLight ? 'border border-black/20' : 'border border-white/20'}`}
                    style={{ backgroundColor: bg }}
                    disabled={selectedCount === 0}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </PaletteSection>

      {/* Alignment */}
      <PaletteSection title="Align" icon={<Grid3x3 className="h-2.5 w-2.5 text-muted-foreground" />} storageId="workflow-section-alignment" isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-2">
          <button
            onClick={onSnapToGridToggle}
            className={`flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[9px] font-medium transition-all ${snapToGrid ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground dark:bg-zinc-800'}`}
          >
            <Grid3x3 className="h-3 w-3" /> Snap to Grid
          </button>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">{selectedCount >= 2 ? `Align (${selectedCount})` : 'Align'}</span>
            <div className="grid grid-cols-3 gap-0.5">
              <ToolButton onClick={() => onAlignNodes('left')} disabled={selectedCount < 2} title="Left" icon={<AlignStartVertical className="h-3 w-3" />} />
              <ToolButton onClick={() => onAlignNodes('center-h')} disabled={selectedCount < 2} title="Center H" icon={<AlignCenterVertical className="h-3 w-3" />} />
              <ToolButton onClick={() => onAlignNodes('right')} disabled={selectedCount < 2} title="Right" icon={<AlignEndVertical className="h-3 w-3" />} />
              <ToolButton onClick={() => onAlignNodes('top')} disabled={selectedCount < 2} title="Top" icon={<AlignStartHorizontal className="h-3 w-3" />} />
              <ToolButton onClick={() => onAlignNodes('center-v')} disabled={selectedCount < 2} title="Center V" icon={<AlignCenterHorizontal className="h-3 w-3" />} />
              <ToolButton onClick={() => onAlignNodes('bottom')} disabled={selectedCount < 2} title="Bottom" icon={<AlignEndHorizontal className="h-3 w-3" />} />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-muted-foreground">{selectedCount >= 3 ? `Distribute (${selectedCount})` : 'Distribute'}</span>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onDistributeNodes('horizontal')}
                disabled={selectedCount < 3}
                className={`flex items-center justify-center gap-1 rounded px-1.5 py-1 text-[9px] font-medium transition-all ${selectedCount < 3 ? 'cursor-not-allowed opacity-50 bg-muted dark:bg-zinc-800 text-muted-foreground' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-white dark:bg-zinc-800'}`}
              >
                <ArrowLeftRight className="h-2.5 w-2.5" /> H
              </button>
              <button
                onClick={() => onDistributeNodes('vertical')}
                disabled={selectedCount < 3}
                className={`flex items-center justify-center gap-1 rounded px-1.5 py-1 text-[9px] font-medium transition-all ${selectedCount < 3 ? 'cursor-not-allowed opacity-50 bg-muted dark:bg-zinc-800 text-muted-foreground' : 'bg-muted text-muted-foreground hover:bg-primary hover:text-white dark:bg-zinc-800'}`}
              >
                <ArrowUpDown className="h-2.5 w-2.5" /> V
              </button>
            </div>
          </div>
        </div>
      </PaletteSection>

      {/* Shortcuts */}
      <PaletteSection title="Keys" icon={<Keyboard className="h-2.5 w-2.5 text-muted-foreground" />} storageId="workflow-section-shortcuts" isCollapsed={isCollapsed}>
        <div className="flex flex-col gap-1 text-[9px]">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delete</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground dark:bg-zinc-800">Del</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Undo</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground dark:bg-zinc-800">⌘Z</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pan</span>
            <kbd className="rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground dark:bg-zinc-800">Space</kbd>
          </div>
        </div>
      </PaletteSection>
    </div>
  );
}
