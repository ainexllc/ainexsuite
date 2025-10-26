'use client';

import { useState } from 'react';
import type { HealthMetric } from '@ainexsuite/types';
import { createHealthMetric, updateHealthMetric } from '@/lib/health';
import { format } from 'date-fns';

interface MetricEntryProps {
  onUpdate: () => void;
  existingMetrics: HealthMetric[];
}

export function MetricEntry({ onUpdate, existingMetrics }: MetricEntryProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayMetric = existingMetrics.find((m) => m.date === today);

  const [date, setDate] = useState(today);
  const [sleep, setSleep] = useState(todayMetric?.sleep?.toString() || '');
  const [water, setWater] = useState(todayMetric?.water?.toString() || '');
  const [weight, setWeight] = useState(todayMetric?.weight?.toString() || '');
  const [heartRate, setHeartRate] = useState(todayMetric?.heartRate?.toString() || '');
  const [systolic, setSystolic] = useState(todayMetric?.bloodPressure?.systolic.toString() || '');
  const [diastolic, setDiastolic] = useState(todayMetric?.bloodPressure?.diastolic.toString() || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        date,
        sleep: sleep ? parseFloat(sleep) : null,
        water: water ? parseInt(water) : null,
        exercise: null,
        mood: null,
        energy: null,
        weight: weight ? parseFloat(weight) : null,
        heartRate: heartRate ? parseInt(heartRate) : null,
        bloodPressure:
          systolic && diastolic
            ? { systolic: parseInt(systolic), diastolic: parseInt(diastolic) }
            : null,
        customMetrics: {},
        notes: '',
        ownerId: '',
      };

      if (todayMetric) {
        await updateHealthMetric(todayMetric.id, data);
      } else {
        await createHealthMetric(data);
      }

      onUpdate();
    } catch (error) {
      console.error('Failed to save metrics:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface-card rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-semibold mb-4">Log Today&#39;s Metrics</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="metric-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sleep (hours)</label>
        <input
          type="number"
          step="0.5"
          placeholder="8"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          className="metric-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Water (glasses)</label>
        <input
          type="number"
          placeholder="8"
          value={water}
          onChange={(e) => setWater(e.target.value)}
          className="metric-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
        <input
          type="number"
          step="0.1"
          placeholder="70"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="metric-input w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Heart Rate (bpm)</label>
        <input
          type="number"
          placeholder="70"
          value={heartRate}
          onChange={(e) => setHeartRate(e.target.value)}
          className="metric-input w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">Systolic</label>
          <input
            type="number"
            placeholder="120"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            className="metric-input w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Diastolic</label>
          <input
            type="number"
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            className="metric-input w-full"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg font-medium disabled:opacity-50 transition-colors"
      >
        {saving ? 'Saving...' : 'Save Metrics'}
      </button>
    </div>
  );
}
