'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Loader2, Save, CheckCircle2, AlertCircle, Sparkles, X, Zap, LayoutGrid } from 'lucide-react';

interface AppConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

const DEFAULT_APPS: AppConfig[] = [
  { id: 'journey', name: 'Journey', primary: '#f97316', secondary: '#fb923c' },
  { id: 'notes', name: 'Notes', primary: '#3b82f6', secondary: '#60a5fa' },
  { id: 'fit', name: 'Fit', primary: '#22c55e', secondary: '#4ade80' },
  { id: 'grow', name: 'Grow', primary: '#8b5cf6', secondary: '#a78bfa' },
  { id: 'moments', name: 'Moments', primary: '#ec4899', secondary: '#f472b6' },
  { id: 'pulse', name: 'Pulse', primary: '#ef4444', secondary: '#f87171' },
  { id: 'todo', name: 'Todo', primary: '#f59e0b', secondary: '#fbbf24' },
  { id: 'health', name: 'Health', primary: '#10b981', secondary: '#34d399' },
  { id: 'projects', name: 'Project', primary: '#6366f1', secondary: '#818cf8' },
  { id: 'workflow', name: 'Workflow', primary: '#10b981', secondary: '#34d399' },
];

export default function AppsManagement() {
  const [apps, setApps] = useState<AppConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatingColors, setGeneratingColors] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [aiMood, setAiMood] = useState('');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(collection(db, 'apps'));
      if (snapshot.empty) {
        setApps(DEFAULT_APPS);
      } else {
        const loadedApps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...DEFAULT_APPS.find(d => d.id === doc.id),
            ...doc.data()
        } as AppConfig));
        setApps(loadedApps);
      }
    } catch {
      setError('Failed to load app configurations.');
      setApps(DEFAULT_APPS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (app: AppConfig) => {
    setSaving(app.id);
    try {
      await updateDoc(doc(db, 'apps', app.id), {
        primary: app.primary,
        secondary: app.secondary
      });
      setSuccess(`Updated ${app.name} colors`);
    } catch {
      try {
        await setDoc(doc(db, 'apps', app.id), app);
        setSuccess(`Created ${app.name} config`);
      } catch {
        setError(`Failed to save ${app.name}`);
      }
    } finally {
      setSaving(null);
      setTimeout(() => setSuccess(null), 3000);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleColorChange = (id: string, field: 'primary' | 'secondary', value: string) => {
    setApps(prev => prev.map(app =>
      app.id === id ? { ...app, [field]: value } : app
    ));
  };

  const handleGenerateColors = async (app: AppConfig) => {
    setGeneratingColors(app.id);
    setError(null);
    try {
      const response = await fetch('/api/generate-colors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appName: app.name,
          appDescription: aiDescription || undefined,
          mood: aiMood || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate colors');
      }

      const data = await response.json();

      if (data.success && data.colors) {
        setApps(prev => prev.map(a =>
          a.id === app.id
            ? { ...a, primary: data.colors.primary, secondary: data.colors.secondary }
            : a
        ));
        setSuccess(`AI generated new palette`);
        setShowAIModal(null);
      } else {
        throw new Error('Invalid response');
      }
    } catch {
      setError(`Failed to generate colors`);
    } finally {
      setGeneratingColors(null);
      setTimeout(() => setSuccess(null), 3000);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading && apps.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
          <p className="text-zinc-500 text-sm">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-indigo-400" />
            Apps Configuration
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage theme colors and branding for all suite applications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-zinc-800/50 border border-white/5 text-xs font-medium text-zinc-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {apps.length} Apps Active
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="glass-card rounded-xl overflow-hidden flex flex-col"
          >
            {/* Preview Strip */}
            <div 
              className="h-2 w-full"
              style={{ background: `linear-gradient(to right, ${app.primary}, ${app.secondary})` }}
            />

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${app.primary} 0%, ${app.secondary} 100%)`,
                  }}
                />
                <div>
                  <h3 className="font-semibold text-white text-lg leading-tight">
                    {app.name}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">ID: {app.id}</p>
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-3 flex-1">
                {['primary', 'secondary'].map((field) => (
                  <div key={field} className="relative">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold mb-1.5 block">
                      {field}
                    </label>
                    <div className="flex items-center gap-2 p-2 bg-black/20 border border-white/5 rounded-lg focus-within:border-white/20 transition-colors">
                      <div
                        className="w-6 h-6 rounded border border-white/10 shrink-0"
                        style={{ backgroundColor: app[field as keyof AppConfig] as string }}
                      />
                      <input
                        type="text"
                        value={app[field as keyof AppConfig] as string}
                        onChange={(e) => handleColorChange(app.id, field as 'primary' | 'secondary', e.target.value)}
                        className="flex-1 bg-transparent text-sm text-zinc-200 font-mono focus:outline-none"
                      />
                      <div className="relative w-6 h-6 overflow-hidden rounded cursor-pointer">
                        <input
                          type="color"
                          value={app[field as keyof AppConfig] as string}
                          onChange={(e) => handleColorChange(app.id, field as 'primary' | 'secondary', e.target.value)}
                          className="absolute -top-2 -left-2 w-10 h-10 p-0 border-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-5 mt-2 border-t border-white/5">
                <button
                  onClick={() => { setShowAIModal(app.id); setAiDescription(''); setAiMood(''); }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg transition-colors text-xs font-medium"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Gen
                </button>
                <button
                  onClick={() => handleSave(app)}
                  disabled={saving === app.id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-zinc-950 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50 text-xs font-medium"
                >
                  {saving === app.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">AI Palette Generator</h3>
                    <p className="text-xs text-zinc-500">Generate themes using AI</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(null)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-white/5 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-md shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${apps.find(a => a.id === showAIModal)?.primary}, ${apps.find(a => a.id === showAIModal)?.secondary})`
                    }}
                  />
                  <div>
                    <span className="text-xs text-zinc-500 block">Target App</span>
                    <span className="text-sm font-medium text-white">
                      {apps.find(a => a.id === showAIModal)?.name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Context / Description</label>
                  <input
                    type="text"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="e.g., Modern analytics dashboard for finance"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Visual Mood</label>
                  <input
                    type="text"
                    value={aiMood}
                    onChange={(e) => setAiMood(e.target.value)}
                    placeholder="e.g., Trustworthy, Energetic, Calm"
                    className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setShowAIModal(null)}
                    className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg border border-white/5 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const app = apps.find(a => a.id === showAIModal);
                      if (app) handleGenerateColors(app);
                    }}
                    disabled={generatingColors !== null}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
                  >
                    {generatingColors ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
