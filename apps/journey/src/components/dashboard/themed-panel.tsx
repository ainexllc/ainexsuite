import React from 'react';
import { clsx } from 'clsx';
import { DashboardTheme } from '@/lib/dashboard-themes';

interface ThemedPanelProps {
  theme: DashboardTheme;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  border?: boolean;
  onClick?: () => void;
}

export function ThemedPanel({ 
  theme, 
  children, 
  className, 
  hover = false, 
  border = true,
  onClick
}: ThemedPanelProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "relative overflow-hidden transition-all duration-300",
        theme.panel,
        theme.radius,
        theme.shadow,
        // Only apply border if explicitly requested (default true) AND the theme has a border class
        border ? theme.border : '',
        hover && theme.panelHover,
        (hover || onClick) && "cursor-pointer group",
        className
      )}
    >
      {children}
    </div>
  );
}
