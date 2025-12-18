'use client';

import { Medal } from 'lucide-react';
import { MemberContribution } from '../../lib/analytics-utils';

interface TeamLeaderboardProps {
  data: MemberContribution[];
}

export function TeamLeaderboard({ data }: TeamLeaderboardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white">Squad Leaderboard</h3>
        <span className="text-xs text-white/40">This Week</span>
      </div>
      
      <div className="divide-y divide-white/5">
        {data.map((member, index) => (
          <div key={member.uid} className="p-3 flex items-center justify-between hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                  {member.displayName.slice(0, 2).toUpperCase()}
                </div>
                {index === 0 && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-lg">
                    <Medal className="h-2 w-2 text-black" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.displayName}</p>
                <p className="text-[10px] text-white/40">{member.totalCompletions} all-time</p>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-sm font-bold text-indigo-400">{member.weeklyCompletions}</span>
              <span className="text-[10px] text-white/30 ml-1">done</span>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="p-6 text-center text-white/30 text-xs">
            No activity recorded this week.
          </div>
        )}
      </div>
    </div>
  );
}
