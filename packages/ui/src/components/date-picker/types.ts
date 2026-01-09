// DatePicker Component Types

export type PresetMode = 'smart' | 'basic' | 'none';
export type TimeFormat = '12h' | '24h';
export type MinuteStep = 5 | 10 | 15 | 30;

// Base props shared across all date picker variants
export interface DatePickerBaseProps {
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Whether to show error styling */
  error?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Preset button configuration */
  presets?: PresetMode;
  /** Additional CSS classes */
  className?: string;
  /** ID for form integration */
  id?: string;
  /** Name for form integration */
  name?: string;
}

// Single date picker props
export interface DatePickerProps extends DatePickerBaseProps {
  /** Currently selected date */
  value?: Date | null;
  /** Callback when date changes */
  onChange: (date: Date | null) => void;
}

// Date + time picker props
export interface DateTimePickerProps extends DatePickerBaseProps {
  /** Currently selected date and time */
  value?: Date | null;
  /** Callback when date/time changes */
  onChange: (date: Date | null) => void;
  /** Time display format */
  timeFormat?: TimeFormat;
  /** Minute increment step */
  minuteStep?: MinuteStep;
  /** Whether to show seconds */
  showSeconds?: boolean;
}

// Date range value type
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

// Date range picker props
export interface DateRangePickerProps extends DatePickerBaseProps {
  /** Currently selected date range */
  value?: DateRange;
  /** Callback when range changes */
  onChange: (range: DateRange) => void;
  /** Number of months to display */
  numberOfMonths?: 1 | 2;
}

// Calendar grid props (internal component)
export interface CalendarGridProps {
  /** Currently displayed month */
  currentMonth: Date;
  /** Selected date(s) */
  selectedDate?: Date | null;
  /** Selected range (for range picker) */
  selectedRange?: DateRange;
  /** Hover date for range preview */
  hoverDate?: Date | null;
  /** Callback when a date is clicked */
  onDateClick: (date: Date) => void;
  /** Callback when hovering over a date */
  onDateHover?: (date: Date | null) => void;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Whether selecting a range */
  isRangeMode?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// Preset button definition
export interface PresetOption {
  label: string;
  getValue: () => Date;
}

// Range preset button definition
export interface RangePresetOption {
  label: string;
  getValue: () => DateRange;
}

// Preset buttons props
export interface PresetButtonsProps {
  presets: PresetOption[];
  onSelect: (date: Date) => void;
  className?: string;
}

// Range preset buttons props
export interface RangePresetButtonsProps {
  presets: RangePresetOption[];
  onSelect: (range: DateRange) => void;
  className?: string;
}

// Time input props
export interface TimeInputProps {
  /** Current time value */
  value: Date | null;
  /** Callback when time changes */
  onChange: (date: Date) => void;
  /** Time format */
  format?: TimeFormat;
  /** Minute step */
  minuteStep?: MinuteStep;
  /** Show seconds selector */
  showSeconds?: boolean;
  /** Whether disabled */
  disabled?: boolean;
  /** Additional classes */
  className?: string;
}
