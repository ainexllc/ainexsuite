'use client';

import { Activity } from 'lucide-react';
import { ConsistencyChart } from './ConsistencyChart';
import { InsightsGrid } from './InsightsGrid';
import { DayStats } from '../../lib/analytics-utils';

interface CombinedInsightsProps {
  weeklyStats: DayStats[];
  bestDay: string;
  totalCompletions: number;
  completionRate: number;
}

export function CombinedInsights({ 
  weeklyStats, 
  bestDay, 
  totalCompletions, 
  completionRate 
}: CombinedInsightsProps) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-6">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
        <Activity className="h-4 w-4" />
        Insights
      </div>
      
      <ConsistencyChart data={weeklyStats} transparent />
      
      <div className="pt-4 border-t border-white/10">
        <InsightsGrid 
          bestDay={bestDay} 
          totalCompletions={totalCompletions} 
          completionRate={completionRate} 
          transparent 
        />
      </div>
    </div>
  );
}
