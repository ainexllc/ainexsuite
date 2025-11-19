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
          ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10" 
          : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Icon Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          "p-3 rounded-xl transition-colors",
          isDiscovery ? "bg-white/5 text-white/40 group-hover:text-white/60" : `bg-gradient-to-br ${app.color} text-white shadow-lg`
        )}>
          <app.icon className="h-6 w-6" />
        </div>
        {isDiscovery && (
          <div className="p-1.5 rounded-full bg-white/5 text-white/30 group-hover:text-accent-400 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h4 className={clsx(
          "text-lg font-semibold mb-2 transition-colors",
          isDiscovery ? "text-white/60 group-hover:text-white" : "text-white"
        )}>
          {app.name}
        </h4>
        <p className={clsx(
          "text-sm leading-relaxed line-clamp-2",
          isDiscovery ? "text-white/40 group-hover:text-white/60" : "text-white/60"
        )}>
          {app.description}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
        {isDiscovery ? (
          <span className="text-white/40 group-hover:text-accent-400 transition-colors flex items-center gap-2 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            Discover
          </span>
        ) : (
          <span className="text-white/60 group-hover:text-white transition-colors flex items-center gap-2 font-medium">
            Open App
            <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </span>
        )}
      </div>
    </Link>
  );
}
