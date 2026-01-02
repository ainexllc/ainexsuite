'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import type { MoodEnergyData, CorrelationResult } from '@/lib/analytics-utils';

interface MoodEnergyCorrelationProps {
  data: MoodEnergyData[];
  correlation: CorrelationResult;
  sleepCorrelation: CorrelationResult;
}

const MOOD_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Below Avg',
  3: 'Neutral',
  4: 'Good',
  5: 'Great',
};

export function MoodEnergyCorrelation({
  data,
  correlation,
  sleepCorrelation,
}: MoodEnergyCorrelationProps) {
  // Calculate mood distribution
  const moodCounts: Record<string, number> = {};
  data.forEach((d) => {
    moodCounts[d.moodLabel] = (moodCounts[d.moodLabel] || 0) + 1;
  });

  // Get most common mood
  const mostCommonMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'neutral';

  // Average energy
  const avgEnergy = data.reduce((sum, d) => sum + d.energy, 0) / data.length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Most Common Mood</div>
          <div className="text-lg font-semibold text-ink-900 capitalize">{mostCommonMood}</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Avg Energy</div>
          <div className="text-lg font-semibold text-ink-900">{avgEnergy.toFixed(1)}/10</div>
        </div>
        <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
          <div className="text-ink-500">Correlation</div>
          <div
            className={`text-lg font-semibold ${
              correlation.strength === 'strong'
                ? 'text-emerald-600'
                : correlation.strength === 'moderate'
                  ? 'text-blue-600'
                  : 'text-ink-500'
            }`}
          >
            {correlation.strength === 'none' ? 'None' : `${correlation.strength} ${correlation.direction}`}
          </div>
        </div>
      </div>

      {/* Scatter Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="mood"
              domain={[1, 5]}
              name="Mood"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => MOOD_LABELS[v] || v}
              label={{ value: 'Mood', position: 'bottom', offset: -5, fontSize: 12, fill: '#9ca3af' }}
            />
            <YAxis
              type="number"
              dataKey="energy"
              domain={[1, 10]}
              name="Energy"
              tick={{ fontSize: 11, fill: '#6b7280' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              label={{ value: 'Energy', angle: -90, position: 'left', fontSize: 12, fill: '#9ca3af' }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Mood') {
                  return [MOOD_LABELS[value] || value, name];
                }
                return [`${value}/10`, name];
              }}
            />
            <Scatter
              name="Mood vs Energy"
              data={data}
              fill="#8b5cf6"
              fillOpacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-ink-700">Insights</h4>
        <ul className="text-sm text-ink-600 space-y-1">
          {correlation.strength !== 'none' && (
            <li className="flex items-start gap-2">
              <span className="text-violet-500 mt-1">•</span>
              <span>
                Your mood and energy levels show a{' '}
                <strong className="text-ink-900">{correlation.strength} {correlation.direction}</strong>{' '}
                correlation (r = {correlation.coefficient.toFixed(2)})
              </span>
            </li>
          )}
          {sleepCorrelation.strength !== 'none' && (
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>
                Sleep and energy show a{' '}
                <strong className="text-ink-900">{sleepCorrelation.strength} {sleepCorrelation.direction}</strong>{' '}
                correlation
              </span>
            </li>
          )}
          {correlation.direction === 'positive' && (
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 mt-1">•</span>
              <span>Better mood tends to come with higher energy levels</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
