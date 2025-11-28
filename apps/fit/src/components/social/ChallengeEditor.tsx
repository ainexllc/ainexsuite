'use client';

import { useState } from 'react';
import { X, Trophy, Save } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-background/95 border border-border rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-foreground">New Challenge</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Basic Info */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Challenge Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Shred"
              className="w-full bg-foreground/5 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Metric */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Metric</label>
            <div className="grid grid-cols-2 gap-2">
              {['workouts', 'distance', 'calories', 'weight_volume'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m as Challenge['metric'])}
                  className={`px-3 py-2 rounded-lg text-xs capitalize transition-colors border ${
                    metric === m
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-foreground/5 text-muted-foreground border-border hover:bg-foreground/10'
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
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target {metric === 'workouts' ? '(Count)' : '(Value)'}</label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full bg-foreground/5 border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Duration (Days)</label>
              <div className="flex items-center bg-foreground/5 border border-border rounded-xl px-3">
                <input
                  type="number"
                  min="1"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-transparent py-2 text-foreground focus:outline-none"
                />
                <span className="text-xs text-muted-foreground ml-2">
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
