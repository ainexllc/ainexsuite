'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ExerciseChartData } from '@/lib/analytics-utils';

interface ExerciseTrackingChartProps {
  data: ExerciseChartData[];
}

export function ExerciseTrackingChart({ data }: ExerciseTrackingChartProps) {
  // Calculate stats
  const values = data.map((d) => d.value);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length > 0 ? total / values.length : 0;
  const max = Math.max(...values, 0);
  const activeDays = values.filter((v) => v > 0).length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Total</div>
          <div className="text-lg font-semibold text-ink-900">{total} min</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Daily Avg</div>
          <div className="text-lg font-semibold text-ink-900">{avg.toFixed(0)} min</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Active Days</div>
          <div className="text-lg font-semibold text-emerald-600">
            {activeDays}/{data.length}
          </div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Best Day</div>
          <div className="text-lg font-semibold text-ink-900">{max} min</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `${v}m`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value} minutes`, 'Exercise']}
            />
            <Bar
              dataKey="value"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Summary */}
      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm">
        <span className="font-medium text-emerald-800 dark:text-emerald-200">
          Weekly total:{' '}
        </span>
        <span className="text-emerald-700 dark:text-emerald-300">
          {total} minutes ({Math.round(total / 60 * 10) / 10} hours)
        </span>
      </div>
    </div>
  );
}
