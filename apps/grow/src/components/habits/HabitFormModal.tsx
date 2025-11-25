'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Hash,
  Repeat,
  CalendarDays,
  Type,
  AlignLeft,
} from 'lucide-react';
import { Modal, ModalFooter, ModalButton } from '@/components/ui/Modal';
import { Habit, Schedule, FrequencyType } from '@/types/models';
import { cn } from '@/lib/utils';

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: Partial<Habit>) => Promise<void>;
  habit?: Habit | null; // If provided, we're editing
  spaceId: string;
  userId: string;
}

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string; icon: typeof Calendar; description: string }[] = [
  { value: 'daily', label: 'Daily', icon: Calendar, description: 'Every day' },
  { value: 'specific_days', label: 'Specific Days', icon: CalendarDays, description: 'Choose days of week' },
  { value: 'weekly', label: 'Weekly', icon: Repeat, description: 'X times per week' },
  { value: 'interval', label: 'Interval', icon: Hash, description: 'Every X days' },
];

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function HabitFormModal({
  isOpen,
  onClose,
  onSubmit,
  habit,
  spaceId,
  userId,
}: HabitFormModalProps) {
  const isEditing = !!habit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [intervalDays, setIntervalDays] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Reset form when modal opens/closes or habit changes
  useEffect(() => {
    if (isOpen) {
      if (habit) {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setFrequencyType(habit.schedule.type);
        setDaysOfWeek(habit.schedule.daysOfWeek || [1, 2, 3, 4, 5]);
        setTimesPerWeek(habit.schedule.timesPerWeek || 3);
        setIntervalDays(habit.schedule.intervalDays || 2);
      } else {
        setTitle('');
        setDescription('');
        setFrequencyType('daily');
        setDaysOfWeek([1, 2, 3, 4, 5]);
        setTimesPerWeek(3);
        setIntervalDays(2);
      }
      setErrors({});
    }
  }, [isOpen, habit]);

  const handleDayToggle = (day: number) => {
    setDaysOfWeek((prev) => {
      if (prev.includes(day)) {
        // Don't allow empty selection
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== day);
      }
      return [...prev, day].sort();
    });
  };

  const validateForm = (): boolean => {
    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Habit name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const schedule: Schedule = {
        type: frequencyType,
        ...(frequencyType === 'specific_days' && { daysOfWeek }),
        ...(frequencyType === 'weekly' && { timesPerWeek }),
        ...(frequencyType === 'interval' && { intervalDays }),
      };

      const habitData: Partial<Habit> = {
        title: title.trim(),
        description: description.trim() || undefined,
        schedule,
        spaceId,
        assigneeIds: [userId],
      };

      if (!isEditing) {
        // New habit defaults
        habitData.id = `habit_${Date.now()}`;
        habitData.currentStreak = 0;
        habitData.bestStreak = 0;
        habitData.isFrozen = false;
        habitData.createdAt = new Date().toISOString();
      }

      await onSubmit(habitData);
      onClose();
    } catch (error) {
      console.error('Failed to save habit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Habit' : 'Create New Habit'}
      description={isEditing ? 'Update your habit details' : 'Build a new habit to track'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <Type className="h-4 w-4" />
            Habit Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Morning Meditation"
            className={cn(
              'w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder:text-white/30',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500',
              errors.title ? 'border-red-500' : 'border-white/10'
            )}
            autoFocus
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
            <AlignLeft className="h-4 w-4" />
            Description
            <span className="text-white/30 font-normal">(optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this habit important to you?"
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Frequency Type */}
        <div>
          <label className="text-sm font-medium text-white/70 mb-3 block">
            How often?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {FREQUENCY_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = frequencyType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequencyType(option.value)}
                  className={cn(
                    'relative p-4 rounded-xl border text-left transition-all',
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mb-2', isSelected ? 'text-indigo-400' : 'text-white/40')} />
                  <p className={cn('text-sm font-medium', isSelected ? 'text-white' : 'text-white/70')}>
                    {option.label}
                  </p>
                  <p className="text-xs text-white/40">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Days Selection */}
        {frequencyType === 'specific_days' && (
          <div>
            <label className="text-sm font-medium text-white/70 mb-3 block">
              Which days?
            </label>
            <div className="flex gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium transition-all',
                    daysOfWeek.includes(day.value)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/50 hover:bg-white/10'
                  )}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Times */}
        {frequencyType === 'weekly' && (
          <div>
            <label className="text-sm font-medium text-white/70 mb-3 block">
              Times per week
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={1}
                max={7}
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="w-12 text-center text-lg font-bold text-indigo-400">
                {timesPerWeek}x
              </span>
            </div>
          </div>
        )}

        {/* Interval Days */}
        {frequencyType === 'interval' && (
          <div>
            <label className="text-sm font-medium text-white/70 mb-3 block">
              Every how many days?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={14}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="w-20 text-center text-lg font-bold text-indigo-400">
                {intervalDays} days
              </span>
            </div>
          </div>
        )}

        <ModalFooter>
          <ModalButton variant="ghost" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!title.trim()}
          >
            {isEditing ? 'Save Changes' : 'Create Habit'}
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
}
