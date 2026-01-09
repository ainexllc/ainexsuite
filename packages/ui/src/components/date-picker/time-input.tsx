'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getTime, setTime } from './utils';
import type { TimeInputProps } from './types';

export function TimeInput({
  value,
  onChange,
  format = '12h',
  minuteStep = 15,
  showSeconds: _showSeconds = false,
  disabled = false,
  className,
}: TimeInputProps) {
  const is12h = format === '12h';
  const { hours: currentHours, minutes: currentMinutes } = value
    ? getTime(value)
    : { hours: 12, minutes: 0 };

  // Convert to 12h format if needed
  const displayHours = is12h
    ? currentHours === 0
      ? 12
      : currentHours > 12
        ? currentHours - 12
        : currentHours
    : currentHours;
  const isPM = currentHours >= 12;

  const [localHours, setLocalHours] = useState(displayHours.toString().padStart(2, '0'));
  const [localMinutes, setLocalMinutes] = useState(currentMinutes.toString().padStart(2, '0'));
  const [localPeriod, setLocalPeriod] = useState<'AM' | 'PM'>(isPM ? 'PM' : 'AM');

  const hoursRef = useRef<HTMLInputElement>(null);
  const minutesRef = useRef<HTMLInputElement>(null);

  // Update local state when value changes externally
  useEffect(() => {
    if (value) {
      const { hours, minutes } = getTime(value);
      const dh = is12h ? (hours === 0 ? 12 : hours > 12 ? hours - 12 : hours) : hours;
      setLocalHours(dh.toString().padStart(2, '0'));
      setLocalMinutes(minutes.toString().padStart(2, '0'));
      setLocalPeriod(hours >= 12 ? 'PM' : 'AM');
    }
  }, [value, is12h]);

  // Commit changes to parent
  const commitChanges = (h: string, m: string, period: 'AM' | 'PM') => {
    let hours = parseInt(h, 10) || 0;
    const minutes = parseInt(m, 10) || 0;

    if (is12h) {
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
    }

    // Clamp values
    hours = Math.max(0, Math.min(23, hours));
    const clampedMinutes = Math.max(0, Math.min(59, minutes));

    const baseDate = value || new Date();
    onChange(setTime(baseDate, hours, clampedMinutes));
  };

  const handleHoursChange = (newValue: string) => {
    const cleaned = newValue.replace(/\D/g, '').slice(0, 2);
    setLocalHours(cleaned);
  };

  const handleMinutesChange = (newValue: string) => {
    const cleaned = newValue.replace(/\D/g, '').slice(0, 2);
    setLocalMinutes(cleaned);
  };

  const handleHoursBlur = () => {
    let h = parseInt(localHours, 10) || 0;
    const max = is12h ? 12 : 23;
    const min = is12h ? 1 : 0;
    h = Math.max(min, Math.min(max, h));
    const padded = h.toString().padStart(2, '0');
    setLocalHours(padded);
    commitChanges(padded, localMinutes, localPeriod);
  };

  const handleMinutesBlur = () => {
    let m = parseInt(localMinutes, 10) || 0;
    m = Math.max(0, Math.min(59, m));
    // Round to nearest step
    m = Math.round(m / minuteStep) * minuteStep;
    if (m >= 60) m = 60 - minuteStep;
    const padded = m.toString().padStart(2, '0');
    setLocalMinutes(padded);
    commitChanges(localHours, padded, localPeriod);
  };

  const handlePeriodToggle = () => {
    const newPeriod = localPeriod === 'AM' ? 'PM' : 'AM';
    setLocalPeriod(newPeriod);
    commitChanges(localHours, localMinutes, newPeriod);
  };

  const incrementHours = () => {
    let h = parseInt(localHours, 10) || 0;
    h = h + 1;
    const max = is12h ? 12 : 23;
    const min = is12h ? 1 : 0;
    if (h > max) h = min;
    const padded = h.toString().padStart(2, '0');
    setLocalHours(padded);
    commitChanges(padded, localMinutes, localPeriod);
  };

  const decrementHours = () => {
    let h = parseInt(localHours, 10) || 0;
    h = h - 1;
    const max = is12h ? 12 : 23;
    const min = is12h ? 1 : 0;
    if (h < min) h = max;
    const padded = h.toString().padStart(2, '0');
    setLocalHours(padded);
    commitChanges(padded, localMinutes, localPeriod);
  };

  const incrementMinutes = () => {
    let m = parseInt(localMinutes, 10) || 0;
    m = m + minuteStep;
    if (m >= 60) m = 0;
    const padded = m.toString().padStart(2, '0');
    setLocalMinutes(padded);
    commitChanges(localHours, padded, localPeriod);
  };

  const decrementMinutes = () => {
    let m = parseInt(localMinutes, 10) || 0;
    m = m - minuteStep;
    if (m < 0) m = 60 - minuteStep;
    const padded = m.toString().padStart(2, '0');
    setLocalMinutes(padded);
    commitChanges(localHours, padded, localPeriod);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />

      <div className="flex items-center gap-1 bg-foreground/5 rounded-lg px-2 py-1">
        {/* Hours */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={incrementHours}
            disabled={disabled}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <input
            ref={hoursRef}
            type="text"
            inputMode="numeric"
            value={localHours}
            onChange={(e) => handleHoursChange(e.target.value)}
            onBlur={handleHoursBlur}
            disabled={disabled}
            className={cn(
              'w-7 text-center text-sm font-medium bg-transparent',
              'text-foreground focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Hours"
          />
          <button
            type="button"
            onClick={decrementHours}
            disabled={disabled}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <span className="text-muted-foreground font-medium">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={incrementMinutes}
            disabled={disabled}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronUp className="h-3 w-3" />
          </button>
          <input
            ref={minutesRef}
            type="text"
            inputMode="numeric"
            value={localMinutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            onBlur={handleMinutesBlur}
            disabled={disabled}
            className={cn(
              'w-7 text-center text-sm font-medium bg-transparent',
              'text-foreground focus:outline-none',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Minutes"
          />
          <button
            type="button"
            onClick={decrementMinutes}
            disabled={disabled}
            className="p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        {/* AM/PM Toggle */}
        {is12h && (
          <button
            type="button"
            onClick={handlePeriodToggle}
            disabled={disabled}
            className={cn(
              'ml-1 px-2 py-1 text-xs font-semibold rounded transition-colors',
              'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
              'hover:bg-[var(--color-primary)]/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {localPeriod}
          </button>
        )}
      </div>
    </div>
  );
}
