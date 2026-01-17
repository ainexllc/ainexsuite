"use client";

import { cn } from "../../lib/utils";
import { BellRing, CalendarClock, X, type LucideIcon } from "lucide-react";

/**
 * Reminder frequency options
 */
export type ReminderFrequency =
  | "once"
  | "daily"
  | "weekdays"
  | "weekly"
  | "monthly"
  | "custom";

/**
 * Reminder channel type
 */
export type ReminderChannel = "push" | "email" | "sms";

/**
 * Reminder channel configuration
 */
export interface ReminderChannelConfig {
  id: ReminderChannel;
  label: string;
  icon: LucideIcon;
}

/**
 * Reminder configuration
 */
export interface ReminderConfig {
  enabled: boolean;
  dateTime: string; // ISO format for datetime-local input
  channels: ReminderChannel[];
  frequency: ReminderFrequency;
  customCron?: string;
}

/**
 * Frequency option configuration
 */
export interface FrequencyOption {
  value: ReminderFrequency;
  label: string;
}

/**
 * Default frequency options
 */
export const DEFAULT_FREQUENCIES: FrequencyOption[] = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays (M-F)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom (cron)" },
];

export interface ReminderPickerProps {
  /** Current reminder configuration */
  value: ReminderConfig;
  /** Callback when configuration changes */
  onChange: (config: ReminderConfig) => void;
  /** Callback when the panel should close */
  onClose: () => void;
  /** Available reminder channels */
  channels: ReminderChannelConfig[];
  /** Which channels are disabled (e.g., SMS without phone) */
  disabledChannels?: ReminderChannel[];
  /** Message shown for disabled channels */
  disabledChannelMessage?: string;
  /** Available frequency options */
  frequencies?: FrequencyOption[];
  /** Show custom cron input for 'custom' frequency */
  showCustomCron?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Helper to format date for datetime-local input
 */
export function formatDateTimeLocalInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * ReminderPicker - Shared reminder configuration panel
 *
 * Features:
 * - Enable/disable toggle
 * - Date/time selection
 * - Channel selection (push, email, SMS)
 * - Frequency selection with custom cron
 *
 * @example
 * ```tsx
 * <ReminderPicker
 *   value={reminderConfig}
 *   onChange={setReminderConfig}
 *   onClose={() => setShowPicker(false)}
 *   channels={[
 *     { id: 'push', label: 'Push', icon: Bell },
 *     { id: 'email', label: 'Email', icon: Mail },
 *   ]}
 * />
 * ```
 */
export function ReminderPicker({
  value,
  onChange,
  onClose,
  channels,
  disabledChannels = [],
  disabledChannelMessage,
  frequencies = DEFAULT_FREQUENCIES,
  showCustomCron = true,
  className,
}: ReminderPickerProps) {
  const { enabled, dateTime, channels: selectedChannels, frequency, customCron } = value;

  const handleToggle = () => {
    if (!enabled) {
      // Enable with defaults
      const defaultTime = new Date();
      defaultTime.setMinutes(0, 0, 0);
      defaultTime.setHours(defaultTime.getHours() + 1);

      onChange({
        ...value,
        enabled: true,
        dateTime: formatDateTimeLocalInput(defaultTime),
      });
    } else {
      onChange({ ...value, enabled: false });
    }
  };

  const handleChannelToggle = (channelId: ReminderChannel) => {
    const newChannels = selectedChannels.includes(channelId)
      ? selectedChannels.filter((c) => c !== channelId)
      : [...selectedChannels, channelId];

    // Ensure at least one channel is selected
    if (newChannels.length === 0) {
      return;
    }

    onChange({ ...value, channels: newChannels });
  };

  const handleDateTimeChange = (newDateTime: string) => {
    onChange({ ...value, dateTime: newDateTime });
  };

  const handleFrequencyChange = (newFrequency: ReminderFrequency) => {
    onChange({ ...value, frequency: newFrequency });
  };

  const handleCustomCronChange = (newCron: string) => {
    onChange({ ...value, customCron: newCron });
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-outline-subtle/60 bg-surface-muted/55 p-4 shadow-inner transition-colors dark:border-outline-subtle/70 dark:bg-surface-muted/80",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-outline-subtle/60 pb-3 dark:border-outline-subtle/70">
        <div>
          <p className="text-sm font-semibold text-ink-base dark:text-ink-200">
            Set Reminder
          </p>
          <p className="text-xs text-ink-muted dark:text-ink-400">
            Schedule a notification via your preferred channels.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Close reminder panel"
        >
          <X className="h-4 w-4 text-zinc-500" />
        </button>
      </div>

      <div className="mt-3 space-y-3">
        {/* Enable/Disable toggle */}
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            enabled
              ? "bg-accent-500 text-white shadow-sm"
              : "border border-outline-subtle/60 bg-white text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated dark:text-ink-300 dark:hover:text-ink-100"
          )}
        >
          <BellRing className="h-3.5 w-3.5" />
          {enabled ? "Enabled" : "Add Reminder"}
        </button>

        {enabled && (
          <>
            {/* Date/Time picker */}
            <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
              <span className="flex items-center gap-2 text-[11px] text-ink-500 dark:text-ink-400">
                <CalendarClock className="h-3.5 w-3.5 text-accent-500" />
                Scheduled for
              </span>
              <input
                type="datetime-local"
                value={dateTime}
                min={formatDateTimeLocalInput(new Date())}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
              />
            </label>

            {/* Channels */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                Channels
              </p>
              <div className="flex flex-wrap gap-2">
                {channels.map(({ id, label, icon: Icon }) => {
                  const isActive = selectedChannels.includes(id);
                  const isDisabled = disabledChannels.includes(id);

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => {
                        if (!isDisabled) {
                          handleChannelToggle(id);
                        }
                      }}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition",
                        isDisabled
                          ? "cursor-not-allowed border-dashed border-outline-subtle/60 bg-white/60 text-ink-400 opacity-60 dark:border-outline-subtle dark:bg-surface-muted/40 dark:text-ink-500"
                          : isActive
                            ? "border-accent-500 bg-accent-100 text-accent-600 dark:bg-accent-500 dark:text-white"
                            : "border-outline-subtle/60 bg-white text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated dark:text-ink-300 dark:hover:text-ink-100"
                      )}
                      aria-pressed={isActive}
                      aria-disabled={isDisabled}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
              {disabledChannels.length > 0 && disabledChannelMessage && (
                <p className="text-xs text-ink-muted dark:text-ink-400">
                  {disabledChannelMessage}
                </p>
              )}
            </div>

            {/* Frequency */}
            <div className="space-y-3">
              <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                <span className="block text-[11px] text-ink-500 dark:text-ink-400">
                  Frequency
                </span>
                <select
                  value={frequency}
                  onChange={(e) =>
                    handleFrequencyChange(e.target.value as ReminderFrequency)
                  }
                  className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
                >
                  {frequencies.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {showCustomCron && frequency === "custom" ? (
                <label className="space-y-2 text-xs font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-400">
                  <span className="block text-[11px] text-ink-500 dark:text-ink-400">
                    Cron expression
                  </span>
                  <input
                    value={customCron || ""}
                    onChange={(e) => handleCustomCronChange(e.target.value)}
                    placeholder="0 9 * * 1-5"
                    className="w-full rounded-xl border border-outline-subtle/60 bg-white px-3 py-2 text-sm text-ink-base shadow-sm transition-colors focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated dark:text-white"
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-dashed border-outline-subtle/70 bg-surface-muted/60 px-3 py-2 text-xs text-ink-muted dark:border-outline-subtle/50 dark:bg-surface-base/40 dark:text-ink-400">
                  Snooze or auto-repeat options become available once reminders
                  are sent.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReminderPicker;
