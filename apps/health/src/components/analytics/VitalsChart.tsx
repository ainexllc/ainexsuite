'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { VitalsChartData } from '@/lib/analytics-utils';

interface VitalsChartProps {
  data: VitalsChartData[];
}

export function VitalsChart({ data }: VitalsChartProps) {
  // Filter data for charts
  const heartRateData = data.filter((d) => d.heartRate !== undefined);
  const bpData = data.filter((d) => d.systolic !== undefined && d.diastolic !== undefined);

  // Calculate averages
  const avgHeartRate =
    heartRateData.length > 0
      ? heartRateData.reduce((sum, d) => sum + (d.heartRate ?? 0), 0) / heartRateData.length
      : null;

  const avgSystolic =
    bpData.length > 0
      ? bpData.reduce((sum, d) => sum + (d.systolic ?? 0), 0) / bpData.length
      : null;

  const avgDiastolic =
    bpData.length > 0
      ? bpData.reduce((sum, d) => sum + (d.diastolic ?? 0), 0) / bpData.length
      : null;

  // Format date for display
  const formattedData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex gap-4 text-sm">
        {avgHeartRate && (
          <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
            <div className="text-ink-500">Avg Heart Rate</div>
            <div className="text-lg font-semibold text-red-600">
              {avgHeartRate.toFixed(0)} bpm
            </div>
          </div>
        )}
        {avgSystolic && avgDiastolic && (
          <div className="flex-1 p-3 bg-surface-subtle rounded-lg">
            <div className="text-ink-500">Avg Blood Pressure</div>
            <div className="text-lg font-semibold text-blue-600">
              {avgSystolic.toFixed(0)}/{avgDiastolic.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      {/* Heart Rate Chart */}
      {heartRateData.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-ink-700">Heart Rate</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
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
                  formatter={(value: number) => [`${value} bpm`, 'Heart Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Blood Pressure Chart */}
      {bpData.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-ink-700">Blood Pressure</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
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
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="diastolic"
                  name="Diastolic"
                  stroke="#93c5fd"
                  strokeWidth={2}
                  dot={{ fill: '#93c5fd', strokeWidth: 0, r: 3 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Reference ranges */}
      <div className="text-xs text-ink-400">
        Normal ranges: Heart Rate 60-100 bpm, Blood Pressure &lt;120/80
      </div>
    </div>
  );
}
