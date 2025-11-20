'use client';

import { Crown, Gift } from 'lucide-react';
import { Quest } from '../../types/models';

interface QuestBarProps {
  quest: Quest;
}

export function QuestBar({ quest }: QuestBarProps) {
  const progress = Math.min((quest.currentCompletions / quest.targetTotalCompletions) * 100, 100);
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/10 p-1 shadow-lg">
      <div className="relative z-10 bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-inner shadow-yellow-500/10">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{quest.title}</h3>
              <p className="text-xs text-white/50">{quest.description}</p>
            </div>
          </div>
          {quest.reward && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-yellow-200/80">
              <Gift className="h-3 w-3" />
              <span>{quest.reward}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="relative h-4 bg-black/40 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-200 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_2s_linear_infinite]" />
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-medium">
          <span className="text-white/40">0</span>
          <span className="text-yellow-400">{quest.currentCompletions} / {quest.targetTotalCompletions}</span>
        </div>
      </div>
    </div>
  );
}
