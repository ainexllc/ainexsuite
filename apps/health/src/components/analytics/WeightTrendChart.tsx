'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { WeightChartData } from '@/lib/analytics-utils';

interface WeightTrendChartProps {
  data: WeightChartData[];
  targetWeight?: number | null;
}

export function WeightTrendChart({ data, targetWeight }: WeightTrendChartProps) {
  // Calculate min/max for Y axis
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1 || 2;

  // Calculate trend
  const firstValue = data[0]?.value;
  const lastValue = data[data.length - 1]?.value;
  const change = lastValue && firstValue ? lastValue - firstValue : 0;
  const changePercent = firstValue ? ((change / firstValue) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Current</div>
          <div className="text-lg font-semibold text-ink-900">
            {lastValue?.toFixed(1) ?? '--'} kg
          </div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Change</div>
          <div
            className={`text-lg font-semibold ${
              change < 0 ? 'text-emerald-600' : change > 0 ? 'text-red-600' : 'text-ink-900'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)} kg ({changePercent}%)
          </div>
        </div>
        {targetWeight && (
          <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
            <div className="text-ink-500">Target</div>
            <div className="text-lg font-semibold text-ink-900">{targetWeight} kg</div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              domain={[min - padding, max + padding]}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number) => [`${value.toFixed(1)} kg`, 'Weight']}
            />
            {targetWeight && (
              <ReferenceLine
                y={targetWeight}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{
                  value: 'Target',
                  position: 'right',
                  fill: '#10b981',
                  fontSize: 12,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
