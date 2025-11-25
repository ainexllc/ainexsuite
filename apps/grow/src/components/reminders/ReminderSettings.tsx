'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Clock,
  Sun,
  Sunset,
  Moon,
  Volume2,
  VolumeX,
  Smartphone,
  Check,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getNotificationPermission,
  requestNotificationPermission,
  NotificationPermissionStatus,
  REMINDER_TIME_PRESETS,
  formatTimeDisplay,
} from '@/lib/notifications';
import { ReminderTime, UserReminderPreferences } from '@/types/models';

interface ReminderSettingsProps {
  preferences: UserReminderPreferences | null;
  onSave: (preferences: Partial<UserReminderPreferences>) => void;
}

const TIME_OPTIONS: { value: ReminderTime; label: string; icon: typeof Sun; description: string }[] = [
  { value: 'morning', label: 'Morning', icon: Sun, description: REMINDER_TIME_PRESETS.morning.label },
  { value: 'afternoon', label: 'Afternoon', icon: Clock, description: REMINDER_TIME_PRESETS.afternoon.label },
  { value: 'evening', label: 'Evening', icon: Sunset, description: REMINDER_TIME_PRESETS.evening.label },
  { value: 'custom', label: 'Custom', icon: Moon, description: 'Set your own time' },
];

export function ReminderSettings({ preferences, onSave }: ReminderSettingsProps) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('default');
  const [enabled, setEnabled] = useState(preferences?.globalEnabled ?? false);
  const [selectedTime, setSelectedTime] = useState<ReminderTime>(preferences?.defaultTime ?? 'morning');
  const [customTime, setCustomTime] = useState(preferences?.defaultCustomTime ?? '09:00');
  const [quietStart, setQuietStart] = useState(preferences?.quietHoursStart ?? '22:00');
  const [quietEnd, setQuietEnd] = useState(preferences?.quietHoursEnd ?? '07:00');
  const [soundEnabled, setSoundEnabled] = useState(preferences?.soundEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    getNotificationPermission().then(setPermissionStatus);
  }, []);

  useEffect(() => {
    // Check if any values differ from saved preferences
    const changed =
      enabled !== (preferences?.globalEnabled ?? false) ||
      selectedTime !== (preferences?.defaultTime ?? 'morning') ||
      customTime !== (preferences?.defaultCustomTime ?? '09:00') ||
      quietStart !== (preferences?.quietHoursStart ?? '22:00') ||
      quietEnd !== (preferences?.quietHoursEnd ?? '07:00') ||
      soundEnabled !== (preferences?.soundEnabled ?? true);
    setHasChanges(changed);
  }, [enabled, selectedTime, customTime, quietStart, quietEnd, soundEnabled, preferences]);

  const handleRequestPermission = async () => {
    const status = await requestNotificationPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      setEnabled(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        globalEnabled: enabled,
        defaultTime: selectedTime,
        defaultCustomTime: customTime,
        quietHoursStart: quietStart,
        quietHoursEnd: quietEnd,
        soundEnabled,
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const renderPermissionBanner = () => {
    if (permissionStatus === 'granted') return null;

    if (permissionStatus === 'unsupported') {
      return (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-400">Notifications Not Supported</p>
              <p className="text-xs text-white/50 mt-1">
                Your browser doesn&apos;t support notifications. Try using a modern browser or install the app.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (permissionStatus === 'denied') {
      return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <BellOff className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Notifications Blocked</p>
              <p className="text-xs text-white/50 mt-1">
                You&apos;ve blocked notifications. Enable them in your browser settings to receive reminders.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-indigo-400">Enable Notifications</p>
            <p className="text-xs text-white/50 mt-1">
              Allow notifications to receive habit reminders at your preferred times.
            </p>
            <button
              onClick={handleRequestPermission}
              className="mt-3 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderPermissionBanner()}

      {/* Main Toggle */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'h-10 w-10 rounded-lg flex items-center justify-center',
              enabled ? 'bg-indigo-500/20' : 'bg-white/5'
            )}>
              {enabled ? (
                <Bell className="h-5 w-5 text-indigo-400" />
              ) : (
                <BellOff className="h-5 w-5 text-white/40" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">Daily Reminders</p>
              <p className="text-xs text-white/50">Get notified to complete your habits</p>
            </div>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            disabled={permissionStatus !== 'granted'}
            className={cn(
              'relative w-12 h-6 rounded-full transition-colors',
              enabled ? 'bg-indigo-500' : 'bg-white/10',
              permissionStatus !== 'granted' && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className={cn(
              'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
              enabled ? 'left-7' : 'left-1'
            )} />
          </button>
        </div>
      </div>

      {/* Time Selection */}
      <div className={cn(!enabled && 'opacity-50 pointer-events-none')}>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
          Reminder Time
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TIME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedTime === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSelectedTime(option.value)}
                className={cn(
                  'relative p-4 rounded-xl border text-left transition-all',
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/50'
                    : 'bg-[#1a1a1a] border-white/10 hover:border-white/20'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-indigo-400" />
                  </div>
                )}
                <Icon className={cn(
                  'h-5 w-5 mb-2',
                  isSelected ? 'text-indigo-400' : 'text-white/40'
                )} />
                <p className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-white' : 'text-white/70'
                )}>
                  {option.label}
                </p>
                <p className="text-xs text-white/40">{option.description}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Time Input */}
        {selectedTime === 'custom' && (
          <div className="mt-3 bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
            <label className="block text-xs text-white/50 mb-2">Select Time</label>
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
            />
            {customTime && (
              <p className="text-xs text-indigo-400 mt-2">
                Reminder at {formatTimeDisplay(
                  parseInt(customTime.split(':')[0]),
                  parseInt(customTime.split(':')[1])
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className={cn(!enabled && 'opacity-50 pointer-events-none')}>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
          Quiet Hours
        </h3>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/50 mb-4">No notifications during these hours</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-white/40 mb-1">From</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-white/20 pt-5">→</div>
            <div className="flex-1">
              <label className="block text-xs text-white/40 mb-1">To</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className={cn(!enabled && 'opacity-50 pointer-events-none')}>
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3 px-1">
          Notification Sound
        </h3>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-white/60" />
              ) : (
                <VolumeX className="h-5 w-5 text-white/40" />
              )}
              <div>
                <p className="text-sm font-medium text-white">Sound</p>
                <p className="text-xs text-white/50">Play sound with notifications</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors',
                soundEnabled ? 'bg-indigo-500' : 'bg-white/10'
              )}
            >
              <div className={cn(
                'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                soundEnabled ? 'left-7' : 'left-1'
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Install App Prompt */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Install for Better Reminders</p>
            <p className="text-xs text-white/50 mt-1">
              Install Grow as an app for more reliable background notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-20 md:bottom-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
