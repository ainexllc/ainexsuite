'use client';

import { LucideIcon, Calendar, TrendingUp, Award } from 'lucide-react';

interface Insight {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface InsightsGridProps {
  bestDay: string;
  totalCompletions: number;
  completionRate: number; // average
}

export function InsightsGrid({ bestDay, totalCompletions, completionRate }: InsightsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mb-2">
          <Calendar className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Best Day</p>
        <p className="text-sm font-bold text-white">{bestDay}</p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
        <div className="p-2 bg-green-500/10 rounded-lg text-green-400 mb-2">
          <Award className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Total Wins</p>
        <p className="text-sm font-bold text-white">{totalCompletions}</p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col items-center text-center">
        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400 mb-2">
          <TrendingUp className="h-4 w-4" />
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-wide mb-0.5">Success Rate</p>
        <p className="text-sm font-bold text-white">{completionRate}%</p>
      </div>
    </div>
  );
}
