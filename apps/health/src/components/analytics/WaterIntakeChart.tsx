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
import type { WaterChartData } from '@/lib/analytics-utils';

interface WaterIntakeChartProps {
  data: WaterChartData[];
}

export function WaterIntakeChart({ data }: WaterIntakeChartProps) {
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
          <div className="text-lg font-semibold text-ink-900">{avg.toFixed(1)} glasses</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Goal Met</div>
          <div className="text-lg font-semibold text-cyan-600">
            {goalPercentage}%{' '}
            <span className="text-sm text-ink-500 font-normal">
              ({goalMetDays}/{data.length} days)
            </span>
          </div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Goal</div>
          <div className="text-lg font-semibold text-ink-900">{goal} glasses</div>
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
              domain={[0, Math.max(goal + 4, Math.max(...values) + 2)]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name, props) => {
                const percentage = props.payload?.percentage ?? 0;
                return [`${value} glasses (${Math.round(percentage)}%)`, 'Water'];
              }}
            />
            <ReferenceLine
              y={goal}
              stroke="#06b6d4"
              strokeDasharray="5 5"
              label={{
                value: `${goal} goal`,
                position: 'right',
                fill: '#06b6d4',
                fontSize: 11,
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.goalMet ? '#06b6d4' : '#a5f3fc'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-ink-500 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cyan-500" />
          <span>Goal met</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-cyan-200" />
          <span>Below goal</span>
        </div>
      </div>
    </div>
  );
}
