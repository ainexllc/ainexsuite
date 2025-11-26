'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Loader2, Save, RotateCcw, LayoutGrid, CheckCircle2, AlertCircle, Sparkles, X, Palette, Activity, Code, Zap } from 'lucide-react';

interface AppConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  status?: 'live' | 'maintenance' | 'beta';
  version?: string;
  userCount?: number;
  lastDeployed?: string;
}

const DEFAULT_APPS: AppConfig[] = [
  { id: 'journey', name: 'Journey', primary: '#f97316', secondary: '#fb923c', status: 'live', version: '2.1.0', userCount: 1245, lastDeployed: '2h ago' },
  { id: 'notes', name: 'Notes', primary: '#3b82f6', secondary: '#60a5fa', status: 'live', version: '1.8.4', userCount: 3421, lastDeployed: '1d ago' },
  { id: 'fit', name: 'Fit', primary: '#22c55e', secondary: '#4ade80', status: 'beta', version: '0.9.2', userCount: 156, lastDeployed: '4h ago' },
  { id: 'grow', name: 'Grow', primary: '#8b5cf6', secondary: '#a78bfa', status: 'live', version: '1.2.0', userCount: 890, lastDeployed: '3d ago' },
  { id: 'moments', name: 'Moments', primary: '#ec4899', secondary: '#f472b6', status: 'live', version: '1.5.1', userCount: 2100, lastDeployed: '12h ago' },
  { id: 'pulse', name: 'Pulse', primary: '#ef4444', secondary: '#f87171', status: 'maintenance', version: '1.0.1', userCount: 430, lastDeployed: '5m ago' },
  { id: 'todo', name: 'Todo', primary: '#f59e0b', secondary: '#fbbf24', status: 'live', version: '3.0.0', userCount: 5600, lastDeployed: '1w ago' },
  { id: 'health', name: 'Health', primary: '#10b981', secondary: '#34d399', status: 'beta', version: '0.5.0', userCount: 89, lastDeployed: '2d ago' },
  { id: 'projects', name: 'Project', primary: '#6366f1', secondary: '#818cf8', status: 'live', version: '1.1.2', userCount: 670, lastDeployed: '6h ago' },
  { id: 'workflow', name: 'Workflow', primary: '#10b981', secondary: '#34d399', status: 'beta', version: '0.8.0', userCount: 210, lastDeployed: '3h ago' },
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
        setApps(DEFAULT_APPS); // Use defaults if empty
      } else {
        const loadedApps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...DEFAULT_APPS.find(d => d.id === doc.id), // Merge defaults for missing fields
            ...doc.data()
        } as AppConfig));
        setApps(loadedApps);
      }
    } catch (err) {
      setError('Failed to load app configurations.');
      setApps(DEFAULT_APPS); // Fallback
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
    } catch (err) {
      // If doc doesn't exist, create it
      try {
        await setDoc(doc(db, 'apps', app.id), app);
        setSuccess(`Created ${app.name} config`);
      } catch (createErr) {
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
    } catch (err) {
      setError(`Failed to generate colors`);
    } finally {
      setGeneratingColors(null);
      setTimeout(() => setSuccess(null), 3000);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading && apps.length === 0) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
        </div>
    );
  }

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bebas tracking-widest leading-none">
            APP MATRIX
          </h1>
          <p className="text-zinc-500 uppercase tracking-[0.3em] text-[10px] mt-1">System Configuration & Deployment</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-black/40 border border-white/10 rounded text-[10px] font-mono text-zinc-400">
            TOTAL_MODULES: <span className="text-cyan-400 font-bold">{apps.length}</span>
          </div>
        </div>
      </div>

      {error && (
          <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 backdrop-blur-sm text-[10px] uppercase tracking-wide">
              <AlertCircle className="h-4 w-4" />
              {error}
          </div>
      )}

      {success && (
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 backdrop-blur-sm text-[10px] uppercase tracking-wide">
              <CheckCircle2 className="h-4 w-4" />
              {success}
          </div>
      )}

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {apps.map((app) => (
            <div key={app.id} className="group relative bg-black/40 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                {/* Top Status Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-zinc-900 border border-white/10 group-hover:border-white/20 transition-colors">
                                <LayoutGrid className="h-5 w-5" style={{ color: app.primary }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-white tracking-wide">{app.name.toUpperCase()}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${app.status === 'live' ? 'bg-emerald-500 animate-pulse' : app.status === 'beta' ? 'bg-cyan-500' : 'bg-yellow-500'}`} />
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-wider">{app.status || 'UNKNOWN'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => { setShowAIModal(app.id); setAiDescription(''); setAiMood(''); }}
                                className="p-1.5 text-purple-400 hover:text-white hover:bg-purple-500/20 rounded transition-colors"
                                title="AI Generate"
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => handleSave(app)}
                                disabled={saving === app.id}
                                className="p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded transition-colors disabled:opacity-50"
                                title="Save"
                            >
                                {saving === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 py-2 border-y border-white/5">
                        <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                            <p className="text-[9px] text-zinc-500 uppercase">Users</p>
                            <p className="text-xs font-bold text-white font-mono">{app.userCount?.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/[0.02] p-2 rounded border border-white/5">
                            <p className="text-[9px] text-zinc-500 uppercase">Version</p>
                            <p className="text-xs font-bold text-white font-mono">{app.version}</p>
                        </div>
                        <div className="col-span-2 bg-white/[0.02] p-2 rounded border border-white/5 flex justify-between items-center">
                            <p className="text-[9px] text-zinc-500 uppercase">Last Deploy</p>
                            <p className="text-[10px] text-zinc-300 font-mono">{app.lastDeployed}</p>
                        </div>
                    </div>

                    {/* Color Controls */}
                    <div className="space-y-2">
                        <p className="text-[9px] text-zinc-600 uppercase tracking-wider font-bold">Theme Config</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-white/5 rounded opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                                <div className="flex items-center gap-2 p-1.5 border border-white/10 rounded bg-black/20">
                                    <div className="w-3 h-3 rounded-sm ring-1 ring-white/20" style={{ backgroundColor: app.primary }} />
                                    <input
                                        type="text"
                                        value={app.primary}
                                        onChange={(e) => handleColorChange(app.id, 'primary', e.target.value)}
                                        className="w-full bg-transparent text-[10px] text-zinc-300 font-mono focus:outline-none uppercase"
                                    />
                                </div>
                            </div>
                            <div className="relative group/input">
                                <div className="absolute inset-0 bg-white/5 rounded opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none" />
                                <div className="flex items-center gap-2 p-1.5 border border-white/10 rounded bg-black/20">
                                    <div className="w-3 h-3 rounded-sm ring-1 ring-white/20" style={{ backgroundColor: app.secondary }} />
                                    <input
                                        type="text"
                                        value={app.secondary}
                                        onChange={(e) => handleColorChange(app.id, 'secondary', e.target.value)}
                                        className="w-full bg-transparent text-[10px] text-zinc-300 font-mono focus:outline-none uppercase"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* AI Modal - Cyberpunk Style */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-purple-500/30 rounded-xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden">
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-purple-400 animate-pulse" />
                    <h3 className="text-lg font-bold text-white font-bebas tracking-wide">AI PALETTE GEN</h3>
                </div>
                <button onClick={() => setShowAIModal(null)} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
                </div>

                <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Target Module</label>
                    <div className="text-sm font-mono text-white bg-white/5 px-3 py-2 rounded border border-white/10">
                        {apps.find(a => a.id === showAIModal)?.name}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Context Parameters</label>
                    <input
                    type="text"
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder="e.g., High-performance analytics dashboard"
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Visual Mood</label>
                    <input
                    type="text"
                    value={aiMood}
                    onChange={(e) => setAiMood(e.target.value)}
                    placeholder="e.g., Neon, Industrial, Calm"
                    className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/50 transition-colors font-mono"
                    />
                </div>

                <div className="pt-4 flex gap-2">
                    <button
                    onClick={() => setShowAIModal(null)}
                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded border border-white/5 transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                    Abort
                    </button>
                    <button
                    onClick={() => {
                        const app = apps.find(a => a.id === showAIModal);
                        if (app) handleGenerateColors(app);
                    }}
                    disabled={generatingColors !== null}
                    className="flex-1 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/50 rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                    >
                    {generatingColors ? (
                        <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                        </>
                    ) : (
                        <>
                        <Zap className="h-3 w-3" />
                        Execute
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