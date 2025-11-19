'use client';

import { useState } from 'react';
import { X, Crown, Gift, Calendar, Save } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Quest } from '../../types/models';
import { addDays, format } from 'date-fns';

interface QuestEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestEditor({ isOpen, onClose }: QuestEditorProps) {
  const { getCurrentSpace, addQuest } = useGrowStore();
  const currentSpace = getCurrentSpace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetCompletions, setTargetCompletions] = useState(50);
  const [reward, setReward] = useState('');
  const [durationDays, setDurationDays] = useState(7);

  if (!isOpen || !currentSpace) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date();
    const endDate = addDays(startDate, durationDays);

    const newQuest: Quest = {
      id: `quest_${Date.now()}`,
      spaceId: currentSpace.id,
      title,
      description,
      targetTotalCompletions: Number(targetCompletions),
      currentCompletions: 0,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      reward: reward || undefined,
      status: 'active',
    };

    await addQuest(newQuest);
    onClose();
    
    // Reset form
    setTitle('');
    setDescription('');
    setTargetCompletions(50);
    setReward('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-400">
              <Crown className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">New Team Quest</h3>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Basic Info */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Quest Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 100 Mile Month"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the goal? Inspire the team!"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 min-h-[80px]"
              required
            />
          </div>

          {/* Target & Duration Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Total Completions</label>
              <input
                type="number"
                min="1"
                value={targetCompletions}
                onChange={(e) => setTargetCompletions(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
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

          {/* Reward */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5 flex items-center gap-1">
              <Gift className="h-3.5 w-3.5 text-yellow-400" /> Reward (Optional)
            </label>
            <input
              type="text"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="e.g. Pizza Party"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-yellow-500 placeholder:text-white/20"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-500/20"
          >
            <Save className="h-4 w-4" />
            Launch Quest
          </button>

        </form>
      </div>
    </div>
  );
}
