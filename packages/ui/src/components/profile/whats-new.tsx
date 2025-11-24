'use client';

import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export interface Update {
  id: string;
  title: string;
  description: string;
  date: string;
  badge?: string; // e.g., 'NEW', 'IMPROVED'
  badgeColor?: string;
}

export interface WhatsNewProps {
  updates?: Update[];
}

const defaultUpdates: Update[] = [
  {
    id: '1',
    title: 'Enhanced Profile Sidebar',
    description: 'New activity stats, connected apps, and usage tracking.',
    date: '2025-01-23',
    badge: 'NEW',
    badgeColor: 'blue',
  },
  {
    id: '2',
    title: 'AI Query Tracking',
    description: 'Monitor your AI usage with visual progress meters.',
    date: '2025-01-23',
    badge: 'NEW',
    badgeColor: 'purple',
  },
];

export function WhatsNew({ updates = defaultUpdates }: WhatsNewProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleUpdates = updates.filter((update) => !dismissed.includes(update.id));

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
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
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

          const badgeColor = update.badgeColor as keyof typeof badgeColors || 'blue';

          return (
            <div
              key={update.id}
              className="relative rounded-lg bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-3"
            >
              {/* Dismiss Button */}
              <button
                onClick={() => handleDismiss(update.id)}
                className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded hover:bg-white/10 transition"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3 text-white/40" />
              </button>

              {/* Badge */}
              {update.badge && (
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border mb-2 ${badgeColors[badgeColor]}`}
                >
                  {update.badge}
                </span>
              )}

              {/* Content */}
              <h4 className="text-sm font-semibold text-white pr-6 mb-1">
                {update.title}
              </h4>
              <p className="text-xs text-white/60 leading-relaxed">
                {update.description}
              </p>

              {/* Date */}
              <p className="text-[10px] text-white/40 mt-2">
                {new Date(update.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
