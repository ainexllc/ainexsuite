'use client';

import { useState } from 'react';
import { Bell, BellOff, Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReminderTime, ReminderSettings } from '@/types/models';
import { REMINDER_TIME_PRESETS, formatTimeDisplay } from '@/lib/notifications';

interface HabitReminderToggleProps {
  habitId: string;
  habitTitle: string;
  settings: ReminderSettings | null;
  onUpdate: (habitId: string, settings: ReminderSettings | null) => void;
  compact?: boolean;
}

const TIME_OPTIONS: { value: ReminderTime; label: string }[] = [
  { value: 'morning', label: `Morning (${REMINDER_TIME_PRESETS.morning.label})` },
  { value: 'afternoon', label: `Afternoon (${REMINDER_TIME_PRESETS.afternoon.label})` },
  { value: 'evening', label: `Evening (${REMINDER_TIME_PRESETS.evening.label})` },
  { value: 'custom', label: 'Custom time' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitReminderToggle({
  habitId,
  habitTitle,
  settings,
  onUpdate,
  compact = false,
}: HabitReminderToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localSettings, setLocalSettings] = useState<ReminderSettings>(
    settings || {
      enabled: false,
      time: 'morning',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    }
  );

  const handleToggle = () => {
    const newSettings = {
      ...localSettings,
      enabled: !localSettings.enabled,
    };
    setLocalSettings(newSettings);
    onUpdate(habitId, newSettings.enabled ? newSettings : null);
  };

  const handleTimeChange = (time: ReminderTime) => {
    const newSettings = { ...localSettings, time };
    setLocalSettings(newSettings);
    if (localSettings.enabled) {
      onUpdate(habitId, newSettings);
    }
  };

  const handleCustomTimeChange = (customTime: string) => {
    const newSettings = { ...localSettings, customTime };
    setLocalSettings(newSettings);
    if (localSettings.enabled) {
      onUpdate(habitId, newSettings);
    }
  };

  const handleDayToggle = (day: number) => {
    const currentDays = localSettings.daysOfWeek;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    // Don't allow empty selection
    if (newDays.length === 0) return;

    const newSettings = { ...localSettings, daysOfWeek: newDays };
    setLocalSettings(newSettings);
    if (localSettings.enabled) {
      onUpdate(habitId, newSettings);
    }
  };

  const getTimeDisplay = () => {
    if (localSettings.time === 'custom' && localSettings.customTime) {
      const [hour, minute] = localSettings.customTime.split(':').map(Number);
      return formatTimeDisplay(hour, minute);
    }
    if (localSettings.time !== 'custom') {
      return REMINDER_TIME_PRESETS[localSettings.time].label;
    }
    return 'Set time';
  };

  if (compact) {
    return (
      <button
        onClick={handleToggle}
        className={cn(
          'p-2 rounded-lg transition-colors',
          localSettings.enabled
            ? 'bg-indigo-500/20 text-indigo-400'
            : 'bg-white/5 text-white/40 hover:text-white/60'
        )}
        title={localSettings.enabled ? `Reminder at ${getTimeDisplay()}` : 'Add reminder'}
      >
        {localSettings.enabled ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-8 w-8 rounded-lg flex items-center justify-center',
            localSettings.enabled ? 'bg-indigo-500/20' : 'bg-white/5'
          )}>
            {localSettings.enabled ? (
              <Bell className="h-4 w-4 text-indigo-400" />
            ) : (
              <BellOff className="h-4 w-4 text-white/40" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{habitTitle}</p>
            {localSettings.enabled && (
              <p className="text-xs text-indigo-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getTimeDisplay()}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors',
              localSettings.enabled ? 'bg-indigo-500' : 'bg-white/10'
            )}
          >
            <div className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
              localSettings.enabled ? 'left-5' : 'left-0.5'
            )} />
          </button>
          <ChevronDown className={cn(
            'h-4 w-4 text-white/40 transition-transform',
            isExpanded && 'rotate-180'
          )} />
        </div>
      </button>

      {/* Expanded Settings */}
      {isExpanded && localSettings.enabled && (
        <div className="border-t border-white/5 p-4 space-y-4">
          {/* Time Selection */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Reminder Time</label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleTimeChange(option.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                    localSettings.time === option.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time Input */}
          {localSettings.time === 'custom' && (
            <div>
              <label className="block text-xs text-white/40 mb-2">Custom Time</label>
              <input
                type="time"
                value={localSettings.customTime || '09:00'}
                onChange={(e) => handleCustomTimeChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Days Selection */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Remind on these days</label>
            <div className="flex gap-1.5">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => handleDayToggle(index)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
                    localSettings.daysOfWeek.includes(index)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
