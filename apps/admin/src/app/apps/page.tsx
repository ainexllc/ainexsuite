'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Loader2, Save, CheckCircle2, AlertCircle, Sparkles, X, Zap, Cpu, Palette } from 'lucide-react';

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
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <Cpu className="h-8 w-8 text-cyan-400 animate-pulse" />
            </div>
            <div className="absolute -inset-2 rounded-3xl border border-cyan-500/20 animate-ping" />
          </div>
          <p className="text-cyan-400 text-sm font-mono animate-pulse">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Palette className="h-7 w-7 text-purple-400" />
              </div>
              <div>
                <h1 className="text-4xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 tracking-wider">
                  COLOR MATRIX
                </h1>
                <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em] mt-1">
                  Theme Configuration System
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 bg-black/60 border border-white/10 rounded-xl flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-sm font-mono text-zinc-400 uppercase tracking-wider">
                <span className="text-emerald-400 font-bold">{apps.length}</span> Modules Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <AlertCircle className="h-5 w-5" />
          <span className="font-mono text-base">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 backdrop-blur-sm shadow-[0_0_20px_rgba(52,211,153,0.1)]">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-mono text-base">{success}</span>
        </div>
      )}

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {apps.map((app) => (
          <div
            key={app.id}
            className="group relative bg-black/50 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all duration-300 rounded-2xl overflow-hidden"
          >
            {/* Gradient top border on hover */}
            <div
              className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${app.primary}, ${app.secondary})` }}
            />

            {/* Corner decoration */}
            <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-white/10 group-hover:border-cyan-500/30 transition-colors" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b border-l border-white/10 group-hover:border-cyan-500/30 transition-colors" />

            <div className="p-5 space-y-5">
              {/* Header with app name */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Color preview circle */}
                  <div
                    className="w-14 h-14 rounded-xl border border-white/20 shadow-lg transition-transform group-hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${app.primary} 0%, ${app.secondary} 100%)`,
                      boxShadow: `0 0 20px ${app.primary}40`
                    }}
                  />
                  <h3 className="font-orbitron font-bold text-xl text-white tracking-wide">
                    {app.name.toUpperCase()}
                  </h3>
                </div>
              </div>

              {/* Color Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold font-mono">
                    Color Config
                  </p>
                </div>

                {/* Primary Color */}
                <div className="relative group/input">
                  <label className="text-[11px] text-zinc-600 uppercase tracking-wider font-mono mb-1.5 block">Primary</label>
                  <div className="flex items-center gap-3 p-3 bg-black/60 border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors">
                    <div
                      className="w-8 h-8 rounded-md border border-white/20 shrink-0 shadow-inner"
                      style={{ backgroundColor: app.primary }}
                    />
                    <input
                      type="text"
                      value={app.primary}
                      onChange={(e) => handleColorChange(app.id, 'primary', e.target.value)}
                      className="flex-1 bg-transparent text-base text-white font-mono focus:outline-none uppercase tracking-wide"
                    />
                    <input
                      type="color"
                      value={app.primary}
                      onChange={(e) => handleColorChange(app.id, 'primary', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="relative group/input">
                  <label className="text-[11px] text-zinc-600 uppercase tracking-wider font-mono mb-1.5 block">Secondary</label>
                  <div className="flex items-center gap-3 p-3 bg-black/60 border border-white/10 hover:border-cyan-500/30 rounded-lg transition-colors">
                    <div
                      className="w-8 h-8 rounded-md border border-white/20 shrink-0 shadow-inner"
                      style={{ backgroundColor: app.secondary }}
                    />
                    <input
                      type="text"
                      value={app.secondary}
                      onChange={(e) => handleColorChange(app.id, 'secondary', e.target.value)}
                      className="flex-1 bg-transparent text-base text-white font-mono focus:outline-none uppercase tracking-wide"
                    />
                    <input
                      type="color"
                      value={app.secondary}
                      onChange={(e) => handleColorChange(app.id, 'secondary', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button
                  onClick={() => { setShowAIModal(app.id); setAiDescription(''); setAiMood(''); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all text-sm font-bold uppercase tracking-wider group/btn"
                >
                  <Sparkles className="h-4 w-4 group-hover/btn:animate-pulse" />
                  <span>AI Gen</span>
                </button>
                <button
                  onClick={() => handleSave(app)}
                  disabled={saving === app.id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg transition-all disabled:opacity-50 text-sm font-bold uppercase tracking-wider"
                >
                  {saving === app.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c0c14] border border-purple-500/40 rounded-2xl max-w-md w-full overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)] relative">
            {/* Top gradient bar */}
            <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-cyan-500 to-purple-500" />

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-white tracking-wide">AI PALETTE</h3>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Neural Color Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIModal(null)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Target Module */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">Target Module</label>
                  <div className="flex items-center gap-3 px-4 py-3 bg-black/60 rounded-xl border border-white/10">
                    <div
                      className="w-10 h-10 rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, ${apps.find(a => a.id === showAIModal)?.primary}, ${apps.find(a => a.id === showAIModal)?.secondary})`
                      }}
                    />
                    <span className="text-white font-orbitron font-bold tracking-wide text-lg">
                      {apps.find(a => a.id === showAIModal)?.name.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Context Parameters */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Context Parameters</label>
                  <input
                    type="text"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="e.g., High-performance analytics dashboard"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                  />
                </div>

                {/* Visual Mood */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">Visual Mood</label>
                  <input
                    type="text"
                    value={aiMood}
                    onChange={(e) => setAiMood(e.target.value)}
                    placeholder="e.g., Neon, Industrial, Calm, Energetic"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3.5 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowAIModal(null)}
                    className="flex-1 px-4 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl border border-white/10 transition-colors text-base font-bold uppercase tracking-wider font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const app = apps.find(a => a.id === showAIModal);
                      if (app) handleGenerateColors(app);
                    }}
                    disabled={generatingColors !== null}
                    className="flex-1 px-4 py-3.5 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 hover:from-purple-500/40 hover:to-cyan-500/40 text-white border border-purple-500/50 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base font-bold uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(168,85,247,0.2)]"
                  >
                    {generatingColors ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
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
