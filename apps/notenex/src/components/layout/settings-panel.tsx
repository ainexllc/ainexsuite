"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clsx } from "clsx";
import {
  BellRing,
  Check,
  Inbox,
  Loader2,
  Mail,
  Moon,
  Phone,
  Pin,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import type { ReminderChannel, UserPreference } from "@/lib/types/settings";

type SettingsPanelProps = {
  preferences: UserPreference;
  isLoading: boolean;
  onUpdate: (
    updates: Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onClose: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const MIN_PHONE_LENGTH = 10;

const BASE_CHANNELS: Array<{
  id: ReminderChannel;
  label: string;
  description: string;
  icon: typeof BellRing;
}> = [
  {
    id: "push",
    label: "Browser",
    description: "Real-time alerts while you work in NoteNex.",
    icon: BellRing,
  },
  {
    id: "email",
    label: "Email",
    description: "Follow-up summaries sent to your inbox.",
    icon: Mail,
  },
];

const PREFERENCE_TOGGLES = [
  {
    key: "digestEnabled" as const,
    label: "Daily summary email",
    description: "Receive a morning recap of new reminders and workspace activity.",
    icon: Inbox,
  },
  {
    key: "smartSuggestions" as const,
    label: "Smart suggestions",
    description: "Let NoteNex surface useful notes, automations, and follow-ups.",
    icon: Sparkles,
  },
  {
    key: "focusModePinned" as const,
    label: "Pin favorites in Focus Mode",
    description: "Keep pinned notes visible when you switch to Focus Mode.",
    icon: Pin,
  },
];

function sanitizePhone(value: string): { normalized: string; digits: string } {
  const cleaned = value.trim().replace(/[\s()-]/g, "");
  const digits = cleaned.replace(/[^0-9]/g, "");
  const startsWithPlus = cleaned.startsWith("+");

  if (!digits) {
    return { normalized: "", digits: "" };
  }

  return {
    normalized: startsWithPlus ? `+${digits}` : digits,
    digits,
  };
}

export function SettingsPanel({ preferences, isLoading, onUpdate, onClose }: SettingsPanelProps) {
  const [phoneInput, setPhoneInput] = useState(preferences.smsNumber ?? "");
  const [phoneSaveState, setPhoneSaveState] = useState<SaveState>("idle");
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const [quietHoursStart, setQuietHoursStart] = useState(preferences.quietHoursStart ?? "");
  const [quietHoursEnd, setQuietHoursEnd] = useState(preferences.quietHoursEnd ?? "");
  const [quietSaveState, setQuietSaveState] = useState<SaveState>("idle");
  const [quietError, setQuietError] = useState<string | null>(null);

  const [pendingChannel, setPendingChannel] = useState<ReminderChannel | null>(null);
  const [channelError, setChannelError] = useState<string | null>(null);

  const [pendingPreferenceKey, setPendingPreferenceKey] = useState<string | null>(null);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);

  useEffect(() => {
    setPhoneInput(preferences.smsNumber ?? "");
    setQuietHoursStart(preferences.quietHoursStart ?? "");
    setQuietHoursEnd(preferences.quietHoursEnd ?? "");
  }, [preferences.smsNumber, preferences.quietHoursStart, preferences.quietHoursEnd]);

  useEffect(() => {
    if (phoneSaveState !== "saved") {
      return;
    }
    const timeout = window.setTimeout(() => setPhoneSaveState("idle"), 2400);
    return () => window.clearTimeout(timeout);
  }, [phoneSaveState]);

  useEffect(() => {
    if (quietSaveState !== "saved") {
      return;
    }
    const timeout = window.setTimeout(() => setQuietSaveState("idle"), 2400);
    return () => window.clearTimeout(timeout);
  }, [quietSaveState]);

  const canUseSms = useMemo(() => Boolean(preferences.smsNumber?.trim()), [preferences.smsNumber]);
  const { normalized: normalizedPhone, digits: phoneDigits } = useMemo(
    () => sanitizePhone(phoneInput),
    [phoneInput],
  );
  const hasMinimumDigits = phoneDigits.length >= MIN_PHONE_LENGTH;
  const isPhoneDirty = (preferences.smsNumber ?? "") !== normalizedPhone;

  const storedQuietStart = preferences.quietHoursStart ?? "";
  const storedQuietEnd = preferences.quietHoursEnd ?? "";
  const isQuietDirty = quietHoursStart !== storedQuietStart || quietHoursEnd !== storedQuietEnd;
  const isQuietValid =
    (quietHoursStart === "" && quietHoursEnd === "") ||
    (Boolean(quietHoursStart) && Boolean(quietHoursEnd));

  const handlePhoneSave = useCallback(async () => {
    setPhoneError(null);
    const { normalized, digits } = sanitizePhone(phoneInput);
    if (!digits) {
      setPhoneError("Enter your mobile number before saving.");
      return;
    }
    if (digits.length < MIN_PHONE_LENGTH) {
      setPhoneError("Phone numbers must include at least 10 digits.");
      return;
    }

    setPhoneSaveState("saving");
    try {
      const nextChannels: ReminderChannel[] = preferences.reminderChannels.includes("sms")
        ? [...preferences.reminderChannels]
        : [...preferences.reminderChannels, "sms"];

      await onUpdate({
        smsNumber: normalized,
        reminderChannels: nextChannels,
      });
      setPhoneSaveState("saved");
    } catch (error) {
      setPhoneSaveState("error");
      setPhoneError(
        error instanceof Error ? error.message : "Unable to save your phone number. Try again.",
      );
    }
  }, [phoneInput, preferences.reminderChannels, onUpdate]);

  const handlePhoneRemove = useCallback(async () => {
    setPhoneError(null);
    setPhoneSaveState("saving");
    try {
      const nextChannels = preferences.reminderChannels.filter((channel) => channel !== "sms");
      await onUpdate({ smsNumber: null, reminderChannels: nextChannels });
      setPhoneInput("");
      setPhoneSaveState("saved");
    } catch (error) {
      setPhoneSaveState("error");
      setPhoneError(
        error instanceof Error ? error.message : "Unable to remove your number. Try again.",
      );
    }
  }, [preferences.reminderChannels, onUpdate]);

  const handleChannelToggle = useCallback(
    async (channel: ReminderChannel, enable: boolean) => {
      setChannelError(null);
      setPendingChannel(channel);
      try {
        let next = [...preferences.reminderChannels];
        if (enable) {
          if (!next.includes(channel)) {
            next.push(channel);
          }
        } else {
          if (!next.includes(channel)) {
            setPendingChannel(null);
            return;
          }
          next = next.filter((item) => item !== channel);
          if (!next.length) {
            setChannelError("Keep at least one channel enabled.");
            setPendingChannel(null);
            return;
          }
        }

        await onUpdate({ reminderChannels: next });
      } catch (error) {
        setChannelError(
          error instanceof Error ? error.message : "Unable to update channels right now.",
        );
      } finally {
        setPendingChannel(null);
      }
    },
    [preferences.reminderChannels, onUpdate],
  );

  const handleQuietHoursSave = useCallback(async () => {
    setQuietError(null);
    if (!isQuietValid) {
      setQuietError("Provide both start and end times or clear them.");
      return;
    }

    setQuietSaveState("saving");
    try {
      await onUpdate({
        quietHoursStart: quietHoursStart ? quietHoursStart : null,
        quietHoursEnd: quietHoursEnd ? quietHoursEnd : null,
      });
      setQuietSaveState("saved");
    } catch (error) {
      setQuietSaveState("error");
      setQuietError(
        error instanceof Error ? error.message : "Unable to update quiet hours. Try again.",
      );
    }
  }, [isQuietValid, quietHoursStart, quietHoursEnd, onUpdate]);

  const handleQuietHoursClear = useCallback(async () => {
    setQuietError(null);
    setQuietSaveState("saving");
    try {
      await onUpdate({ quietHoursStart: null, quietHoursEnd: null });
      setQuietHoursStart("");
      setQuietHoursEnd("");
      setQuietSaveState("saved");
    } catch (error) {
      setQuietSaveState("error");
      setQuietError(
        error instanceof Error ? error.message : "Unable to clear quiet hours. Try again.",
      );
    }
  }, [onUpdate]);

  type SimplePreferenceKey = (typeof PREFERENCE_TOGGLES)[number]["key"];

  const handlePreferenceToggle = useCallback(
    async (key: SimplePreferenceKey, value: boolean) => {
      setPreferenceError(null);
      setPendingPreferenceKey(key);
      try {
        await onUpdate({ [key]: value } as Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>);
      } catch (error) {
        setPreferenceError(
          error instanceof Error ? error.message : "Unable to update that preference just yet.",
        );
      } finally {
        setPendingPreferenceKey(null);
      }
    },
    [onUpdate],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
            <Shield className="h-3.5 w-3.5" />
            Settings
          </div>
          <h2 className="text-lg font-semibold text-ink-800">Notification preferences</h2>
          <p className="text-sm text-muted">
            Configure how we nudge you about reminders and workspace updates.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition hover:bg-surface-muted hover:text-ink-700"
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto pr-1">
        <div className="space-y-6 pb-10">
          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/50 p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-500/10 text-accent-600">
                <Phone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-800">Text notifications</h3>
                <p className="text-xs text-muted">
                  Add a mobile number to receive reminders via SMS. Standard carrier rates may apply.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Phone number
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(event) => {
                    setPhoneInput(event.target.value);
                    setPhoneSaveState("idle");
                    setPhoneError(null);
                  }}
                  placeholder="+1 555 555 5555"
                  className="w-full rounded-xl border border-outline-subtle/60 bg-white/90 px-3 py-2 text-sm text-ink-700 shadow-sm transition focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated/80 dark:text-ink-200"
                  aria-invalid={Boolean(phoneError)}
                  disabled={isLoading || phoneSaveState === "saving"}
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePhoneSave}
                  disabled={
                    isLoading || phoneSaveState === "saving" || !isPhoneDirty || !hasMinimumDigits
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {phoneSaveState === "saving" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save number"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handlePhoneRemove}
                  disabled={isLoading || phoneSaveState === "saving" || !preferences.smsNumber}
                  className="inline-flex items-center gap-2 rounded-full border border-outline-subtle/70 px-4 py-2 text-sm font-semibold text-ink-500 transition hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-outline-subtle disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
                {phoneSaveState === "saved" ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                    <Check className="h-4 w-4" />
                    Saved
                  </span>
                ) : null}
              </div>

              {phoneError ? (
                <p className="text-xs font-semibold text-danger">{phoneError}</p>
              ) : null}

              <div className="rounded-2xl border border-dashed border-outline-subtle/60 bg-white/60 px-4 py-3 text-xs text-muted dark:bg-surface-muted/70">
                <p>
                  The “Text” reminder option is{" "}
                  <span className={clsx(canUseSms ? "text-success font-semibold" : "font-semibold text-danger")}>
                    {canUseSms ? "enabled" : "disabled"}
                  </span>{" "}
                  in note reminders.
                </p>
                {!canUseSms ? (
                  <p className="mt-1">
                    Enter and save a phone number to unlock SMS notifications when scheduling reminders.
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Reminder channels</h3>
              <p className="text-xs text-muted">
                Toggle the default channels we use when you schedule new reminders.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {BASE_CHANNELS.map(({ id, label, description, icon: Icon }) => {
                const isActive = preferences.reminderChannels.includes(id);
                const isPending = pendingChannel === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleChannelToggle(id, !isActive)}
                    disabled={isLoading || isPending}
                    aria-pressed={isActive}
                    className={clsx(
                      "flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                      isActive
                        ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                        : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400",
                    )}
                  >
                    <div className="inline-flex items-center gap-2 text-sm font-semibold">
                      <Icon className="h-4 w-4" />
                      {label}
                      <span
                        className={clsx(
                          "text-[10px] uppercase tracking-wide",
                          isActive ? "text-accent-600" : "text-ink-400",
                        )}
                      >
                        {isPending ? "Updating…" : isActive ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{description}</p>
                  </button>
                );
              })}
            </div>
            <div className="rounded-2xl border border-dashed border-outline-subtle/60 bg-white/60 px-4 py-3 text-xs text-muted dark:bg-surface-muted/70">
              <p>SMS alerts are managed above. Once saved, “Text” appears whenever you set a reminder.</p>
            </div>
            {channelError ? <p className="text-xs font-semibold text-danger">{channelError}</p> : null}
          </section>

          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-500/10 text-indigo-600">
                <Moon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-ink-800">Quiet hours</h3>
                <p className="text-xs text-muted">
                  Pause push and SMS reminders during a specific window. Leave blank to receive notifications anytime.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                Start
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(event) => {
                    setQuietHoursStart(event.target.value);
                    setQuietSaveState("idle");
                    setQuietError(null);
                  }}
                  className="w-full rounded-xl border border-outline-subtle/60 bg-white/90 px-3 py-2 text-sm text-ink-700 shadow-sm transition focus:border-accent-500 focus:outline-none dark;border-outline-subtle dark:bg-surface-elevated/80 dark:text-ink-200"
                  disabled={isLoading || quietSaveState === "saving"}
                />
              </label>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                End
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(event) => {
                    setQuietHoursEnd(event.target.value);
                    setQuietSaveState("idle");
                    setQuietError(null);
                  }}
                  className="w-full rounded-xl border border-outline-subtle/60 bg-white/90 px-3 py-2 text-sm text-ink-700 shadow-sm transition focus:border-accent-500 focus:outline-none dark:border-outline-subtle dark:bg-surface-elevated/80 dark:text-ink-200"
                  disabled={isLoading || quietSaveState === "saving"}
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleQuietHoursSave}
                disabled={isLoading || quietSaveState === "saving" || !isQuietDirty || !isQuietValid}
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-sm font-semibold text-ink-50 shadow-sm transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {quietSaveState === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save quiet hours"
                )}
              </button>
              <button
                type="button"
                onClick={handleQuietHoursClear}
                disabled={
                  isLoading || quietSaveState === "saving" || (!storedQuietStart && !storedQuietEnd)
                }
                className="inline-flex items-center gap-2 rounded-full border border-outline-subtle/70 px-4 py-2 text-sm font-semibold text-ink-500 transition hover:text-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-outline-subtle disabled:cursor-not-allowed disabled:opacity-60"
              >
                Clear
              </button>
              {quietSaveState === "saved" ? (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-success">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              ) : null}
            </div>
            {!isQuietValid ? (
              <p className="text-xs font-semibold text-danger">
                Provide both start and end times or leave both blank.
              </p>
            ) : null}
            {quietError ? <p className="text-xs font-semibold text-danger">{quietError}</p> : null}
          </section>

          <section className="space-y-4 rounded-3xl border border-outline-subtle/60 bg-surface-muted/40 p-5 shadow-inner">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-ink-800">Workspace tuning</h3>
              <p className="text-xs text-muted">Personalize how NoteNex keeps you in the loop and highlights what matters.</p>
            </div>
            <div className="space-y-3">
              {PREFERENCE_TOGGLES.map(({ key, label, description, icon: Icon }) => {
                const isActive = preferences[key];
                const isPending = pendingPreferenceKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handlePreferenceToggle(key, !isActive)}
                    disabled={isLoading || isPending}
                    aria-pressed={isActive}
                    className={clsx(
                      "flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500",
                      isActive
                        ? "border-accent-500 bg-accent-500/10 text-ink-800 shadow-sm dark:text-ink-200"
                        : "border-outline-subtle/60 bg-white/80 text-ink-600 hover:text-ink-800 dark:border-outline-subtle dark:bg-surface-elevated/60 dark:text-ink-400",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <div className="space-y-1">
                      <div className="inline-flex items-start gap-2 text-sm font-semibold">
                        {label}
                        <span
                          className={clsx(
                            "text-[10px] uppercase tracking-wide",
                            isActive ? "text-accent-600" : "text-ink-400",
                          )}
                        >
                          {isPending ? "Updating…" : isActive ? "On" : "Off"}
                        </span>
                      </div>
                      <p className="text-xs text-muted">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {preferenceError ? (
              <p className="text-xs font-semibold text-danger">{preferenceError}</p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
