'use client';

import { Sparkles, X, ChevronDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSystemUpdates } from '../../hooks/use-system-updates';
import { clsx } from 'clsx';

export interface Update {
  id: string;
  title: string;
  description: string;
  date: string;
  badge?: string; // e.g., 'NEW', 'IMPROVED'
  badgeColor?: string;
}

export interface WhatsNewProps {
  // updates prop is now optional and mainly for overriding/testing
  // If not provided, it fetches from the hook
  updates?: Update[];
}

export function WhatsNew({ updates: propUpdates }: WhatsNewProps) {
  const { updates: systemUpdates, loading, loadMore, hasMore, loadingMore } = useSystemUpdates(7);
  const [dismissed, setDismissed] = useState<string[]>([]);

  // Convert system updates to display format if prop updates are not provided
  const displayUpdates = propUpdates || systemUpdates.map(u => {
    let badge = 'NEW';
    let badgeColor = 'blue';

    switch (u.type) {
      case 'feature':
        badge = 'NEW';
        badgeColor = 'purple';
        break;
      case 'improvement':
        badge = 'IMPROVED';
        badgeColor = 'blue';
        break;
      case 'fix':
        badge = 'FIXED';
        badgeColor = 'orange';
        break;
      case 'announcement':
        badge = 'NEWS';
        badgeColor = 'green';
        break;
    }

    return {
      id: u.id,
      title: u.title,
      description: u.description,
      date: u.date?.toDate ? u.date.toDate().toISOString() : new Date().toISOString(),
      badge,
      badgeColor
    };
  });

  const visibleUpdates = displayUpdates.filter((update) => !dismissed.includes(update.id));

  if (loading && !propUpdates) {
    return (
      <div className="space-y-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-3 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2">
           {[1, 2].map(i => (
             <div key={i} className="h-24 bg-muted/10 animate-pulse rounded-lg border border-border/50" />
           ))}
        </div>
      </div>
    );
  }

  if (visibleUpdates.length === 0) {
    return null;
  }

  const handleDismiss = (id: string) => {
    setDismissed([...dismissed, id]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-4 w-4 text-yellow-400" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          What&apos;s New
        </h3>
      </div>

      <div className="space-y-2">
        {visibleUpdates.map((update) => {
          const badgeColors = {
            blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
          };

          const badgeColor = (update.badgeColor as keyof typeof badgeColors) || 'blue';

          return (
            <div
              key={update.id}
              className="relative rounded-lg bg-gradient-to-br from-foreground/5 to-foreground/[0.02] border border-border p-3 group"
            >
              {/* Dismiss Button */}
              <button
                onClick={() => handleDismiss(update.id)}
                className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded hover:bg-foreground/10 transition opacity-0 group-hover:opacity-100"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>

              {/* Badge */}
              {update.badge && (
                <span
                  className={clsx(
                    "inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border mb-2",
                    badgeColors[badgeColor]
                  )}
                >
                  {update.badge}
                </span>
              )}

              {/* Content */}
              <h4 className="text-sm font-semibold text-foreground pr-6 mb-1">
                {update.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {update.description}
              </p>

              {/* Date */}
              <p className="text-[10px] text-muted-foreground/70 mt-2">
                {new Date(update.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          );
        })}
        
        {!propUpdates && hasMore && (
            <button 
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
            >
                {loadingMore ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <ChevronDown className="h-3 w-3" />
                )}
                {loadingMore ? 'Loading...' : 'Show More Updates'}
            </button>
        )}
      </div>
    </div>
  );
}

