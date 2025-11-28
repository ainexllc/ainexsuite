'use client';

import { Calendar, TrendingUp, Award } from 'lucide-react';

interface InsightsGridProps {
  bestDay: string;
  totalCompletions: number;
  completionRate: number; // average
  transparent?: boolean;
}

export function InsightsGrid({ bestDay, totalCompletions, completionRate, transparent }: InsightsGridProps) {
  const itemClass = transparent
    ? "bg-foreground/5 rounded-xl p-4 flex flex-col items-center text-center"
    : "bg-foreground border border-border rounded-xl p-4 flex flex-col items-center text-center";

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className={itemClass}>
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mb-2">
          <Calendar className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-foreground/40 uppercase tracking-wide mb-0.5">Best Day</p>
        <p className="text-sm font-bold text-foreground">{bestDay}</p>
      </div>

      <div className={itemClass}>
        <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mb-2">
          <Award className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-foreground/40 uppercase tracking-wide mb-0.5">Total Wins</p>
        <p className="text-sm font-bold text-foreground">{totalCompletions}</p>
      </div>

      <div className={itemClass}>
        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 mb-2">
          <TrendingUp className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-foreground/40 uppercase tracking-wide mb-0.5">Success Rate</p>
        <p className="text-sm font-bold text-foreground">{completionRate}%</p>
      </div>
    </div>
  );
}
