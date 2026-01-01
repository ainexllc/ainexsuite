'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  iconColor = 'text-indigo-400',
  iconBgColor = 'bg-indigo-500/20',
  children,
  defaultExpanded = true,
  badge,
  actions,
  compact = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between group",
          compact ? "py-1" : "py-1.5"
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg transition-colors", iconBgColor)}>
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          </div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {badge}
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-white/40 transition-transform duration-200",
              isExpanded ? "rotate-0" : "-rotate-90"
            )}
          />
        </div>
      </button>

      <div className={cn(
        "transition-all duration-200 overflow-hidden",
        isExpanded ? "opacity-100" : "opacity-0 h-0"
      )}>
        {children}
      </div>
    </section>
  );
}
