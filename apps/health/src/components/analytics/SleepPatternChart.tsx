'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { SleepChartData } from '@/lib/analytics-utils';

interface SleepPatternChartProps {
  data: SleepChartData[];
}

export function SleepPatternChart({ data }: SleepPatternChartProps) {
  // Calculate stats
  const values = data.map((d) => d.value);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const goal = data[0]?.goal ?? 8;
  const goalMetDays = data.filter((d) => d.goalMet).length;
  const goalPercentage = Math.round((goalMetDays / data.length) * 100);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Average</div>
          <div className="text-lg font-semibold text-ink-900">{avg.toFixed(1)} hrs</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Goal Met</div>
          <div className="text-lg font-semibold text-emerald-600">
            {goalPercentage}%{' '}
            <span className="text-sm text-ink-500 font-normal">
              ({goalMetDays}/{data.length} days)
            </span>
          </div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Goal</div>
          <div className="text-lg font-semibold text-ink-900">{goal} hrs</div>
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
              domain={[0, 12]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Sleep']}
            />
            <ReferenceLine
              y={goal}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{
                value: `${goal}h goal`,
                position: 'right',
                fill: '#10b981',
                fontSize: 11,
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.goalMet ? '#8b5cf6' : '#c4b5fd'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-ink-500 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-500" />
          <span>Goal met</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-violet-300" />
          <span>Below goal</span>
        </div>
      </div>
    </div>
  );
}
