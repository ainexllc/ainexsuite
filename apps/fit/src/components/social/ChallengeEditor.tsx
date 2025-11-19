'use client';

import { useState } from 'react';
import { X, Trophy, Target, Calendar, Save } from 'lucide-react';
import { useFitStore } from '../../lib/store';
import { Challenge } from '../../types/models';
import { addDays, format } from 'date-fns';

interface ChallengeEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengeEditor({ isOpen, onClose }: ChallengeEditorProps) {
  const { getCurrentSpace, addChallenge } = useFitStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [metric, setMetric] = useState<Challenge['metric']>('workouts');
  const [target, setTarget] = useState(10);
  const [durationDays, setDurationDays] = useState(30);

  if (!isOpen || !currentSpace) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date();
    const endDate = addDays(startDate, durationDays);

    const newChallenge: Challenge = {
      id: `challenge_${Date.now()}`,
      spaceId: currentSpace.id,
      title,
      metric,
      target: Number(target),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      participants: [currentSpace.createdBy], // Default to creator
      status: 'active',
    };

    await addChallenge(newChallenge);
    onClose();
    
    // Reset form
    setTitle('');
    setMetric('workouts');
    setTarget(10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">New Challenge</h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Basic Info */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Challenge Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Shred"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Metric */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Metric</label>
            <div className="grid grid-cols-2 gap-2">
              {['workouts', 'distance', 'calories', 'weight_volume'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m as Challenge['metric'])}
                  className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors border ${
                    metric === m 
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {m.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Target & Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Target {metric === 'workouts' ? '(Count)' : '(Value)'}</label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Duration (Days)</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3">
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-transparent py-2 text-white focus:outline-none"
                />
                <span className="text-xs text-white/40 ml-2">
                  {format(addDays(new Date(), durationDays), 'MMM d')}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Save className="h-4 w-4" />
            Start Challenge
          </button>

        </form>
      </div>
    </div>
  );
}
