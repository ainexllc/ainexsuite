'use client';

import { Square, Diamond, Circle, Inbox } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
      className="group flex cursor-grab flex-col items-center gap-2 rounded-lg border transition-all active:cursor-grabbing"
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
        className="flex h-12 w-12 items-center justify-center rounded-lg transition-all"
        style={{
          backgroundColor: `rgba(${theme.primaryRgb}, 0.2)`,
          color: theme.primary,
        }}
      >
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium text-white/70 group-hover:text-white">
        {label}
      </span>
    </div>
  );
}

interface ShapePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function ShapePalette({ onDragStart }: ShapePaletteProps) {
  const shapes = [
    { type: 'rectangle', label: 'Process', icon: Square },
    { type: 'diamond', label: 'Decision', icon: Diamond },
    { type: 'oval', label: 'Start/End', icon: Circle },
    { type: 'parallelogram', label: 'Input/Output', icon: Inbox },
  ];

  return (
    <div className="flex h-full w-64 flex-col gap-4 border-r border-white/10 bg-[#050505] p-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white">Shapes</h3>
        <p className="text-xs text-white/50">Drag onto canvas</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
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

      <div className="mt-auto flex flex-col gap-2 border-t border-white/10 pt-4">
        <div className="text-xs text-white/50">
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs">Delete</kbd> - Remove selected
        </div>
        <div className="text-xs text-white/50">
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs">Ctrl+Z</kbd> - Undo
        </div>
        <div className="text-xs text-white/50">
          <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-xs">Space</kbd> - Pan canvas
        </div>
      </div>
    </div>
  );
}
