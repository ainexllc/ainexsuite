"use client";

import { useState } from "react";
import {
  DatePicker,
  DateTimePicker,
  DateRangePicker,
} from "@ainexsuite/ui/components";
import type { DateRange } from "@ainexsuite/ui/components";

export default function DatePickerMockupsPage() {
  // Single date state
  const [date1, setDate1] = useState<Date | null>(null);
  const [date2, setDate2] = useState<Date | null>(new Date());
  const [date3, setDate3] = useState<Date | null>(null);

  // DateTime state
  const [dateTime1, setDateTime1] = useState<Date | null>(null);
  const [dateTime2, setDateTime2] = useState<Date | null>(new Date());

  // Range state
  const [range1, setRange1] = useState<DateRange>({ start: null, end: null });
  const [range2, setRange2] = useState<DateRange>({
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          DatePicker Components
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          A comprehensive date picker suite with single date, date+time, and range selection.
        </p>

        {/* DatePicker Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            DatePicker - Single Date Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Default (Smart Presets)
              </label>
              <DatePicker
                value={date1}
                onChange={setDate1}
                placeholder="Pick a date"
                presets="smart"
              />
              <p className="text-xs text-zinc-500">
                Selected: {date1?.toLocaleDateString() || "None"}
              </p>
            </div>

            {/* With value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                With Initial Value
              </label>
              <DatePicker
                value={date2}
                onChange={setDate2}
                placeholder="Pick a date"
                presets="smart"
              />
              <p className="text-xs text-zinc-500">
                Selected: {date2?.toLocaleDateString() || "None"}
              </p>
            </div>

            {/* Basic presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Basic Presets
              </label>
              <DatePicker
                value={date3}
                onChange={setDate3}
                placeholder="Pick a date"
                presets="basic"
              />
              <p className="text-xs text-zinc-500">
                Selected: {date3?.toLocaleDateString() || "None"}
              </p>
            </div>

            {/* No presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No Presets
              </label>
              <DatePicker
                value={null}
                onChange={() => {}}
                placeholder="Calendar only"
                presets="none"
              />
            </div>

            {/* Disabled */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Disabled
              </label>
              <DatePicker
                value={new Date()}
                onChange={() => {}}
                disabled
              />
            </div>

            {/* Error state */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Error State
              </label>
              <DatePicker
                value={null}
                onChange={() => {}}
                placeholder="Required field"
                error
              />
            </div>

            {/* Min/Max dates */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                With Min/Max (Next 30 days)
              </label>
              <DatePicker
                value={null}
                onChange={() => {}}
                placeholder="Next 30 days only"
                minDate={new Date()}
                maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
              />
            </div>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-700 mb-12" />

        {/* DateTimePicker Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            DateTimePicker - Date + Time Selection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default 12h */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                12-Hour Format (Default)
              </label>
              <DateTimePicker
                value={dateTime1}
                onChange={setDateTime1}
                placeholder="Pick date & time"
                timeFormat="12h"
                minuteStep={15}
              />
              <p className="text-xs text-zinc-500">
                Selected: {dateTime1?.toLocaleString() || "None"}
              </p>
            </div>

            {/* 24h format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                24-Hour Format
              </label>
              <DateTimePicker
                value={dateTime2}
                onChange={setDateTime2}
                placeholder="Pick date & time"
                timeFormat="24h"
                minuteStep={15}
              />
              <p className="text-xs text-zinc-500">
                Selected: {dateTime2?.toLocaleString() || "None"}
              </p>
            </div>

            {/* 5 min steps */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                5-Minute Steps
              </label>
              <DateTimePicker
                value={null}
                onChange={() => {}}
                placeholder="Pick date & time"
                timeFormat="12h"
                minuteStep={5}
              />
            </div>

            {/* 30 min steps */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                30-Minute Steps
              </label>
              <DateTimePicker
                value={null}
                onChange={() => {}}
                placeholder="Pick date & time"
                timeFormat="12h"
                minuteStep={30}
              />
            </div>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-700 mb-12" />

        {/* DateRangePicker Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            DateRangePicker - Date Range Selection
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Default (dual calendar) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Dual Calendar View (Default)
              </label>
              <DateRangePicker
                value={range1}
                onChange={setRange1}
                placeholder="Select date range"
                numberOfMonths={2}
              />
              <p className="text-xs text-zinc-500">
                Start: {range1.start?.toLocaleDateString() || "None"} | End: {range1.end?.toLocaleDateString() || "None"}
              </p>
            </div>

            {/* With value */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                With Initial Range
              </label>
              <DateRangePicker
                value={range2}
                onChange={setRange2}
                placeholder="Select date range"
                numberOfMonths={2}
              />
              <p className="text-xs text-zinc-500">
                Start: {range2.start?.toLocaleDateString() || "None"} | End: {range2.end?.toLocaleDateString() || "None"}
              </p>
            </div>

            {/* Single calendar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Single Calendar View
              </label>
              <DateRangePicker
                value={{ start: null, end: null }}
                onChange={() => {}}
                placeholder="Select date range"
                numberOfMonths={1}
              />
            </div>

            {/* No presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Without Presets
              </label>
              <DateRangePicker
                value={{ start: null, end: null }}
                onChange={() => {}}
                placeholder="Select date range"
                presets="none"
                numberOfMonths={2}
              />
            </div>
          </div>
        </section>

        <hr className="border-zinc-200 dark:border-zinc-700 mb-12" />

        {/* Usage Examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Usage Examples
          </h2>
          <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Basic Usage
            </h3>
            <pre className="text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
{`import { DatePicker, DateTimePicker, DateRangePicker } from "@ainexsuite/ui/components";

// Single date
const [date, setDate] = useState<Date | null>(null);
<DatePicker value={date} onChange={setDate} presets="smart" />

// Date + Time
const [dateTime, setDateTime] = useState<Date | null>(null);
<DateTimePicker value={dateTime} onChange={setDateTime} timeFormat="12h" />

// Date range
const [range, setRange] = useState<DateRange>({ start: null, end: null });
<DateRangePicker value={range} onChange={setRange} numberOfMonths={2} />`}
            </pre>
          </div>
        </section>

        {/* Feature List */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Features
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Smart preset buttons (Today, Tomorrow, Next Week, etc.)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Smooth animations with Framer Motion
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Dark/light mode support
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Keyboard navigation (arrows, escape, enter)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Min/max date constraints
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Time input with 12h/24h format
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Dual calendar view for ranges
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Uses app primary color (CSS variable)
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
