'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Snowflake, Save, Trash2, Check, Flame, X } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { useAuth } from '@ainexsuite/auth';
import { Habit, FrequencyType, Schedule, Wager, Member } from '../../types/models';
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
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [assignees, setAssignees] = useState<string[]>([]);
  const [isFrozen, setIsFrozen] = useState(false);
  const [wager, setWager] = useState<Wager | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Load data if editing
  useEffect(() => {
    if (editHabitId && isOpen) {
      const habit = habits.find((h: Habit) => h.id === editHabitId);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentSpace) return; // Guard for TypeScript

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
        createdBy: user.uid,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl bg-foreground border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-foreground">
            {editHabitId ? 'Edit Habit' : 'New Habit'}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">What</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Morning Run"
                className="w-full bg-foreground/5 border border-border rounded-xl p-3 text-lg text-foreground focus:outline-none"
                style={{ '--tw-ring-color': primary } as React.CSSProperties}
                required
              />
            </div>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details..."
                className="w-full bg-foreground/5 border border-border rounded-xl p-3 text-sm text-muted-foreground focus:outline-none min-h-[80px]"
                style={{ '--tw-ring-color': primary } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="h-4 w-4" /> When
            </label>

            <div className="flex gap-2 mb-4">
              {['daily', 'specific_days', 'interval', 'weekly'].map((type: string) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSchedule({ type: type as FrequencyType, daysOfWeek: type === 'specific_days' ? [] : undefined })}
                  className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                    schedule.type === type
                      ? 'text-white'
                      : 'bg-foreground/5 text-muted-foreground hover:bg-foreground/10'
                  }`}
                  style={schedule.type === type ? { backgroundColor: primary } : undefined}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Specific Days UI */}
            {schedule.type === 'specific_days' && (
              <div className="flex justify-between gap-2 bg-foreground/5 p-4 rounded-xl">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      schedule.daysOfWeek?.includes(idx)
                        ? 'text-white scale-110'
                        : 'bg-foreground/10 text-foreground/40 hover:bg-foreground/20'
                    }`}
                    style={schedule.daysOfWeek?.includes(idx) ? { backgroundColor: primary } : undefined}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4" /> Who
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentSpace.members.map((member: Member) => (
                <button
                  key={member.uid}
                  type="button"
                  onClick={() => toggleAssignee(member.uid)}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${
                    assignees.includes(member.uid)
                      ? ''
                      : 'bg-foreground/5 border-border hover:bg-foreground/10'
                  }`}
                  style={assignees.includes(member.uid) ? {
                    backgroundColor: `${primary}20`,
                    borderColor: `${primary}80`
                  } : undefined}
                >
                  <div className="h-8 w-8 rounded-full surface-elevated flex items-center justify-center text-xs text-foreground">
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`text-sm ${assignees.includes(member.uid) ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {member.displayName}
                  </span>
                  {assignees.includes(member.uid) && <Check className="h-4 w-4 ml-auto" style={{ color: primary }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Gamification (Couples Only) */}
          {currentSpace.type === 'couple' && (
            <div
              className="border rounded-xl p-4 transition-colors"
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
                    <h4 className="text-sm font-medium" style={wager?.isActive ? { color: `${secondary}cc` } : undefined}>
                      Friendly Wager
                    </h4>
                    <p className="text-xs text-foreground/40">Add stakes to build streaks together</p>
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
                  <div className={`h-4 w-4 rounded-full bg-foreground transition-transform ${
                    wager?.isActive ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {wager?.isActive && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Stakes</label>
                    <input
                      type="text"
                      value={wager.description}
                      onChange={(e) => setWager({ ...wager, description: e.target.value })}
                      placeholder="e.g. Loser cooks dinner"
                      className="w-full bg-background/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                      style={{ '--tw-ring-color': secondary } as React.CSSProperties}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Target Streak (Days)</label>
                    <input
                      type="number"
                      min="3"
                      value={wager.targetStreak}
                      onChange={(e) => setWager({ ...wager, targetStreak: parseInt(e.target.value) })}
                      className="w-full bg-background/20 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
                      style={{ '--tw-ring-color': secondary } as React.CSSProperties}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Freezer Toggle */}
          <div className="surface-elevated border border-surface-hover p-4 rounded-xl flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-lg surface-card flex items-center justify-center text-muted-foreground">
                <Snowflake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium">Habit Freezer</h4>
                <p className="text-xs text-muted-foreground">Pause streaks without penalty (e.g. vacation)</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className="w-12 h-6 rounded-full p-1 transition-colors"
              style={{ backgroundColor: isFrozen ? primary : 'rgb(255 255 255 / 0.1)' }}
            >
              <div className={`h-4 w-4 rounded-full bg-foreground transition-transform ${
                isFrozen ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 shrink-0">
          {editHabitId && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto text-destructive hover:opacity-80 text-sm flex items-center gap-2 px-3 py-2 rounded-lg surface-hover transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
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
