'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Snowflake, Save, Trash2, Check, Flame, X, Target, Link2 } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import { Habit, FrequencyType, Schedule, Wager, Member, HabitCategory, HABIT_CATEGORIES } from '../../types/models';
import { ConfirmationDialog } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';

interface HabitEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editHabitId?: string;
}

const DEFAULT_SCHEDULE: Schedule = { type: 'daily' };

export function HabitEditor({ isOpen, onClose, editHabitId }: HabitEditorProps) {
  const { user } = useAuth();
  const { primary, secondary } = useAppColors();
  const {
    getCurrentSpace,
    addHabit,
    updateHabit,
    deleteHabit,
    habits
  } = useGrowStore();

  const currentSpace = getCurrentSpace();
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory | undefined>(undefined);
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [wager, setWager] = useState<Wager | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined);
  const [targetUnit, setTargetUnit] = useState<string>('mins');
  const [chainedTo, setChainedTo] = useState<string | undefined>(undefined);
  
  // Load data if editing
  useEffect(() => {
    if (editHabitId && isOpen) {
      const habit = habits.find((h: Habit) => h.id === editHabitId);
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setCategory(habit.category);
        setSchedule(habit.schedule);
        setAssignees(habit.assigneeIds);
        setIsFrozen(habit.isFrozen);
        setWager(habit.wager);
        setTargetValue(habit.targetValue);
        setTargetUnit(habit.targetUnit || 'mins');
        setChainedTo(habit.chainedTo);
      }
    } else if (isOpen && currentSpace) {
      // Default to assigning to self
      setAssignees([currentSpace.members[0].uid]);
      setSchedule(DEFAULT_SCHEDULE);
      setTitle('');
      setDescription('');
      setCategory(undefined);
      setIsFrozen(false);
      setWager(undefined);
      setTargetValue(undefined);
      setTargetUnit('mins');
      setChainedTo(undefined);
    }
  }, [editHabitId, isOpen, habits, currentSpace]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentSpace) return; // Guard for TypeScript

    const habitData: Partial<Habit> = {
      title,
      description,
      category,
      schedule,
      assigneeIds: assignees,
      isFrozen,
      wager,
      targetValue,
      targetUnit: targetValue ? targetUnit : undefined,
      chainedTo,
    };

    if (editHabitId) {
      updateHabit(editHabitId, habitData);
      // Update the "chainedFrom" field on the linked habit
      if (chainedTo) {
        updateHabit(chainedTo, { chainedFrom: editHabitId });
      }
    } else {
      const newId = `habit_${Date.now()}`;
      addHabit({
        id: newId,
        spaceId: currentSpace.id,
        title,
        description,
        category,
        schedule,
        assigneeIds: assignees,
        currentStreak: 0,
        bestStreak: 0,
        isFrozen,
        wager,
        targetValue,
        targetUnit: targetValue ? targetUnit : undefined,
        chainedTo,
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      });
      // Update the "chainedFrom" field on the linked habit
      if (chainedTo) {
        updateHabit(chainedTo, { chainedFrom: newId });
      }
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

  const handleDelete = async () => {
    if (!editHabitId) return;
    await deleteHabit(editHabitId);
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!isOpen || !currentSpace || !user) return null;

  return (
    <React.Fragment>
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Habit?"
        description={`"${title}" and all its completion history will be permanently deleted. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {editHabitId ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 dark:text-white/50 dark:hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Habit Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Run, Read 20 Pages, Meditate..."
                className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3.5 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': `${primary}50` } as React.CSSProperties}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                Description <span className="text-zinc-500 dark:text-white/50 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why is this habit important? Any tips or reminders for yourself?"
                className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-3 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all min-h-[80px] resize-none"
                style={{ '--tw-ring-color': `${primary}50` } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HABIT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(category === cat.value ? undefined : cat.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    category === cat.value
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  style={category === cat.value ? { backgroundColor: cat.color, boxShadow: `0 4px 12px ${cat.color}40` } : undefined}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-500 dark:text-white/50" /> Schedule
            </label>

            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: 'daily', label: 'Every Day' },
                { value: 'specific_days', label: 'Specific Days' },
                { value: 'interval', label: 'Every X Days' },
                { value: 'weekly', label: 'X Times/Week' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSchedule({ type: option.value as FrequencyType, daysOfWeek: option.value === 'specific_days' ? [] : undefined })}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    schedule.type === option.value
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-white/50 hover:bg-zinc-200 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  style={schedule.type === option.value ? { backgroundColor: primary, boxShadow: `0 4px 12px ${primary}40` } : undefined}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Specific Days UI */}
            {schedule.type === 'specific_days' && (
              <div className="flex justify-between gap-2 bg-zinc-100 dark:bg-white/5 p-4 rounded-2xl border border-zinc-200 dark:border-white/10">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      schedule.daysOfWeek?.includes(idx)
                        ? 'text-white scale-110 shadow-md'
                        : 'bg-zinc-200 dark:bg-white/10 text-zinc-400 dark:text-white/40 hover:bg-zinc-300 dark:hover:bg-white/20'
                    }`}
                    style={schedule.daysOfWeek?.includes(idx) ? { backgroundColor: primary, boxShadow: `0 4px 12px ${primary}40` } : undefined}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500 dark:text-white/50" /> Assign To
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentSpace.members.map((member: Member) => (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => toggleAssignee(member.uid)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    assignees.includes(member.uid)
                      ? 'shadow-md'
                      : 'bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10'
                  }`}
                  style={assignees.includes(member.uid) ? {
                    backgroundColor: `${primary}15`,
                    borderColor: primary
                  } : undefined}
                >
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium"
                    style={assignees.includes(member.uid) ? {
                      backgroundColor: `${primary}30`,
                      color: primary
                    } : {
                      backgroundColor: 'rgb(255 255 255 / 0.1)',
                      color: 'inherit'
                    }}
                  >
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm font-medium flex-1 text-left ${assignees.includes(member.uid) ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-white/50'}`}>
                    {member.displayName}
                  </span>
                  {assignees.includes(member.uid) && <Check className="h-4 w-4 flex-shrink-0" style={{ color: primary }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Gamification (Couples Only) */}
          {currentSpace.type === 'couple' && (
            <div
              className="border rounded-2xl p-4 transition-colors"
              style={wager?.isActive ? {
                backgroundColor: `${secondary}10`,
                borderColor: `${secondary}30`
              } : {
                backgroundColor: 'rgb(255 255 255 / 0.05)',
                borderColor: 'rgb(255 255 255 / 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-lg flex items-center justify-center transition-colors"
                    style={wager?.isActive ? {
                      backgroundColor: `${secondary}20`,
                      color: secondary
                    } : {
                      backgroundColor: 'rgb(255 255 255 / 0.1)',
                      color: 'rgb(255 255 255 / 0.4)'
                    }}
                  >
                    <Flame className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white" style={wager?.isActive ? { color: `${secondary}cc` } : undefined}>
                      Friendly Wager
                    </h4>
                    <p className="text-xs text-zinc-400 dark:text-white/40">Add stakes to build streaks together</p>
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
                  className="w-12 h-6 rounded-full p-1 transition-colors"
                  style={{ backgroundColor: wager?.isActive ? secondary : 'rgb(255 255 255 / 0.1)' }}
                >
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    wager?.isActive ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {wager?.isActive && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1.5">Stakes</label>
                    <input
                      type="text"
                      value={wager.description}
                      onChange={(e) => setWager({ ...wager, description: e.target.value })}
                      placeholder="e.g. Loser cooks dinner"
                      className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none"
                      style={{ '--tw-ring-color': secondary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1.5">Target Streak (Days)</label>
                    <input
                      type="number"
                      min="3"
                      value={wager.targetStreak}
                      onChange={(e) => setWager({ ...wager, targetStreak: parseInt(e.target.value) })}
                      className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
                      style={{ '--tw-ring-color': secondary } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Target Value (Optional - for tracking quantities) */}
          <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-500 dark:text-white/50">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Track Progress</h4>
                  <p className="text-xs text-zinc-500 dark:text-white/50">Set a daily/weekly target to measure</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTargetValue(targetValue ? undefined : 30)}
                className="w-12 h-6 rounded-full p-1 transition-colors"
                style={{ backgroundColor: targetValue ? primary : 'rgb(255 255 255 / 0.1)' }}
              >
                <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  targetValue ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {targetValue !== undefined && (
              <div className="flex gap-3 animate-fade-in">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1.5">Target</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                    className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none"
                    placeholder="30"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-zinc-500 dark:text-white/50 mb-1.5">Unit</label>
                  <select
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
                  >
                    <option value="mins">minutes</option>
                    <option value="hours">hours</option>
                    <option value="pages">pages</option>
                    <option value="reps">reps</option>
                    <option value="miles">miles</option>
                    <option value="km">km</option>
                    <option value="steps">steps</option>
                    <option value="glasses">glasses</option>
                    <option value="items">items</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Habit Chaining */}
          <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Chain to Next</h4>
                  <p className="text-xs text-zinc-500 dark:text-white/50">Link this habit to another for routines</p>
                </div>
              </div>
            </div>
            <select
              value={chainedTo || ''}
              onChange={(e) => setChainedTo(e.target.value || undefined)}
              className="w-full bg-zinc-100 dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none"
            >
              <option value="">None (end of chain)</option>
              {habits
                .filter((h: Habit) =>
                  h.id !== editHabitId &&
                  h.spaceId === currentSpace?.id &&
                  !h.chainedFrom // Not already following another habit
                )
                .map((h: Habit) => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
            </select>
          </div>

          {/* Freezer Toggle */}
          <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Snowflake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-900 dark:text-white">Habit Freezer</h4>
                <p className="text-xs text-zinc-500 dark:text-white/50">Pause streaks without penalty (e.g. vacation)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className="w-12 h-6 rounded-full p-1 transition-colors"
              style={{ backgroundColor: isFrozen ? '#3b82f6' : 'rgb(255 255 255 / 0.1)' }}
            >
              <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
                isFrozen ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-white/10 flex justify-end gap-3 shrink-0">
          {editHabitId && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto text-red-500 hover:opacity-80 text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-zinc-500 dark:text-white/50 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg"
            style={{ backgroundColor: primary, boxShadow: `0 10px 40px -10px ${primary}33` }}
          >
            <Save className="h-4 w-4" />
            Save Habit
          </button>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
}
