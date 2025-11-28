'use client';

import Link from 'next/link';
import { LucideIcon, ArrowRight, Sparkles, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface App {
  name: string;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: string;
  url: string;
}

interface AppCardProps {
  app: App;
  variant?: 'default' | 'discovery';
}

export function AppCard({ app, variant = 'default' }: AppCardProps) {
  const isDiscovery = variant === 'discovery';

  return (
    <Link
      href={app.url}
      className={clsx(
        "group relative flex flex-col h-full p-6 rounded-2xl transition-all duration-300 border",
        isDiscovery
          ? "bg-foreground/[0.02] border-border hover:bg-foreground/[0.04] hover:border-border"
          : "bg-foreground/[0.04] border-border hover:bg-foreground/[0.08] hover:border-border hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Icon Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          "p-3 rounded-xl transition-colors",
          isDiscovery ? "bg-foreground/5 text-muted-foreground group-hover:text-foreground/60" : `bg-gradient-to-br ${app.color} text-foreground shadow-lg`
        )}>
          <app.icon className="h-6 w-6" />
        </div>
        {isDiscovery && (
          <div className="p-1.5 rounded-full bg-foreground/5 text-muted-foreground group-hover:text-accent-400 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className={clsx(
          "text-lg font-semibold mb-2 transition-colors",
          isDiscovery ? "text-muted-foreground group-hover:text-foreground" : "text-foreground"
        )}>
          {app.name}
        </h4>
        <p className={clsx(
          "text-sm leading-relaxed line-clamp-2",
          isDiscovery ? "text-muted-foreground group-hover:text-muted-foreground" : "text-muted-foreground"
        )}>
          {app.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm">
        {isDiscovery ? (
          <span className="text-muted-foreground group-hover:text-accent-400 transition-colors flex items-center gap-2 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Discover
          </span>
        ) : (
          <span className="text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-2 font-medium">
            Open App
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </span>
        )}
      </div>
    </Link>
  );
}
