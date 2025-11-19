'use client';

import { DayStats } from '../../lib/analytics-utils';

interface ConsistencyChartProps {
  data: DayStats[];
}

export function ConsistencyChart({ data }: ConsistencyChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Last 7 Days Activity</h3>
      
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((d) => {
          const height = Math.max((d.count / maxCount) * 100, 5); // Min 5% height
          const isToday = new Date(d.date).getDate() === new Date().getDate();
          
          return (
            <div key={d.date} className="flex flex-col items-center gap-2 flex-1 group">
              <div className="w-full relative flex-1 flex items-end">
                <div 
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    isToday 
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none">
                    {d.count} completions
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-indigo-400' : 'text-white/30'}`}>
                {d.dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
