'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Users, Snowflake, Save, Trash2, Plus, Check, Flame } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Habit, FrequencyType, Schedule, Wager } from '../../types/models';

interface HabitEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editHabitId?: string;
}

const DEFAULT_SCHEDULE: Schedule = { type: 'daily' };

export function HabitEditor({ isOpen, onClose, editHabitId }: HabitEditorProps) {
  const { 
    getCurrentSpace, 
    addHabit, 
    updateHabit, 
    habits 
  } = useGrowStore();
  
  const currentSpace = getCurrentSpace();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [wager, setWager] = useState<Wager | undefined>(undefined);
  
  // Load data if editing
  useEffect(() => {
    if (editHabitId && isOpen) {
      const habit = habits.find(h => h.id === editHabitId);
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setSchedule(habit.schedule);
        setAssignees(habit.assigneeIds);
        setIsFrozen(habit.isFrozen);
        setWager(habit.wager);
      }
    } else if (isOpen && currentSpace) {
      // Default to assigning to self
      setAssignees([currentSpace.members[0].uid]);
      setSchedule(DEFAULT_SCHEDULE);
      setTitle('');
      setDescription('');
      setIsFrozen(false);
      setWager(undefined);
    }
  }, [editHabitId, isOpen, habits, currentSpace]);

  if (!isOpen || !currentSpace) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const habitData: Partial<Habit> = {
      title,
      description,
      schedule,
      assigneeIds: assignees,
      isFrozen,
      wager,
    };

    if (editHabitId) {
      updateHabit(editHabitId, habitData);
    } else {
      addHabit({
        id: `habit_${Date.now()}`,
        spaceId: currentSpace.id,
        title,
        description,
        schedule,
        assigneeIds: assignees,
        currentStreak: 0,
        bestStreak: 0,
        isFrozen,
        wager,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  const toggleAssignee = (uid: string) => {
    setAssignees(prev => 
      prev.includes(uid) 
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const toggleDay = (dayIndex: number) => {
    const currentDays = schedule.daysOfWeek || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter(d => d !== dayIndex)
      : [...currentDays, dayIndex];
    
    setSchedule({ ...schedule, daysOfWeek: newDays.sort() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-white">
            {editHabitId ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2 uppercase tracking-wider">What</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Run"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-lg text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/70 focus:outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" /> When
            </label>
            
            <div className="flex gap-2 mb-4">
              {['daily', 'specific_days', 'interval', 'weekly'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSchedule({ type: type as FrequencyType, daysOfWeek: type === 'specific_days' ? [] : undefined })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                    schedule.type === type 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Specific Days UI */}
            {schedule.type === 'specific_days' && (
              <div className="flex justify-between gap-2 bg-white/5 p-4 rounded-xl">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      schedule.daysOfWeek?.includes(idx)
                        ? 'bg-indigo-500 text-white scale-110'
                        : 'bg-white/10 text-white/40 hover:bg-white/20'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-3 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Who
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentSpace.members.map((member) => (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => toggleAssignee(member.uid)}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                    assignees.includes(member.uid)
                      ? 'bg-indigo-500/20 border-indigo-500/50'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm ${assignees.includes(member.uid) ? 'text-white' : 'text-white/60'}`}>
                    {member.displayName}
                  </span>
                  {assignees.includes(member.uid) && <Check className="h-4 w-4 text-indigo-400 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Gamification (Couples Only) */}
          {currentSpace.type === 'couple' && (
            <div className={`border rounded-xl p-4 transition-colors ${wager?.isActive ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/5 border-white/5'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${wager?.isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/40'}`}>
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-medium ${wager?.isActive ? 'text-orange-100' : 'text-white/70'}`}>Friendly Wager</h4>
                    <p className="text-xs text-white/40">Add stakes to build streaks together</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (wager?.isActive) {
                      setWager(undefined);
                    } else {
                      setWager({
                        isActive: true,
                        description: '',
                        targetStreak: 7,
                        startDate: new Date().toISOString(),
                        participants: assignees,
                        status: 'pending'
                      });
                    }
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${
                    wager?.isActive ? 'bg-orange-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    wager?.isActive ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {wager?.isActive && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Stakes</label>
                    <input
                      type="text"
                      value={wager.description}
                      onChange={(e) => setWager({ ...wager, description: e.target.value })}
                      placeholder="e.g. Loser cooks dinner"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1.5">Target Streak (Days)</label>
                    <input
                      type="number"
                      min="3"
                      value={wager.targetStreak}
                      onChange={(e) => setWager({ ...wager, targetStreak: parseInt(e.target.value) })}
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Freezer Toggle */}
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Snowflake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-100">Habit Freezer</h4>
                <p className="text-xs text-blue-300/60">Pause streaks without penalty (e.g. vacation)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${
                isFrozen ? 'bg-blue-500' : 'bg-white/10'
              }`}
            >
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                isFrozen ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
          {editHabitId && (
            <button className="mr-auto text-red-400 hover:text-red-300 text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <Save className="h-4 w-4" />
            Save Habit
          </button>
        </div>
      </div>
    </div>
  );
}
