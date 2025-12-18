'use client';

import type { HealthMetric } from '@ainexsuite/types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';

interface HealthChartProps {
  metrics: HealthMetric[];
}

export function HealthChart({ metrics }: HealthChartProps) {
  const chartData = metrics
    .slice()
    .reverse()
    .map((m) => ({
      date: format(new Date(m.date), 'MM/dd'),
      sleep: m.sleep || 0,
      water: m.water || 0,
      weight: m.weight || 0,
      heartRate: m.heartRate || 0,
    }));

  const axisTick = { fill: 'rgb(var(--color-ink-500))', fontSize: 12 };
  const tooltipStyle = {
    backgroundColor: 'rgb(var(--color-surface-card))',
    border: '1px solid var(--outline-base)',
    borderRadius: '8px',
    color: 'rgb(var(--color-ink-900))',
  };

  return (
    <div className="space-y-6">
      <div className="surface-card rounded-lg p-6">
        <h3 className="font-semibold mb-4">Sleep Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-subtle)" />
            <XAxis dataKey="date" tick={axisTick} stroke="var(--outline-base)" />
            <YAxis tick={axisTick} stroke="var(--outline-base)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke="var(--success-500)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--success-500)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="surface-card rounded-lg p-6">
        <h3 className="font-semibold mb-4">Weight Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-subtle)" />
            <XAxis dataKey="date" tick={axisTick} stroke="var(--outline-base)" />
            <YAxis tick={axisTick} stroke="var(--outline-base)" />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="var(--accent-500)"
              strokeWidth={2}
              dot={{ r: 4, fill: 'var(--accent-500)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
