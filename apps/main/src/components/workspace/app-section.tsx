'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AppSectionProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AppSection({ title, icon: Icon, description, children, className = '' }: AppSectionProps) {
  return (
    <section className={`mb-12 ${className}`}>
      <div className="flex items-center gap-3 mb-6 px-1">
        {Icon && (
          <div className="p-2 rounded-lg bg-foreground/5 text-foreground/80">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold text-foreground tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
