import type { ReminderFrequency } from "@/lib/types/reminder";
import type { ReminderChannel } from "@/lib/types/settings";
import {
  BellRing,
  Mail,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export const DEFAULT_REMINDER_CHANNELS: ReminderChannel[] = ["push", "email"];

export const REMINDER_CHANNELS: Array<{
  id: ReminderChannel;
  label: string;
  icon: LucideIcon;
}> = [
  {
    id: "push",
    label: "Browser",
    icon: BellRing,
  },
  {
    id: "email",
    label: "Email",
    icon: Mail,
  },
  {
    id: "sms",
    label: "Text",
    icon: Smartphone,
  },
];

export const REMINDER_FREQUENCIES: Array<{ value: ReminderFrequency; label: string }> = [
  { value: "once", label: "One time" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "custom", label: "Custom" },
];
