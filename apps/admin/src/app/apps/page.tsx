'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Loader2, Save, RotateCcw, LayoutGrid, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

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
  { id: 'track', name: 'Track', primary: '#14b8a6', secondary: '#2dd4bf' },
  { id: 'projects', name: 'Projects', primary: '#6366f1', secondary: '#818cf8' },
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
        // No apps found, offer to seed
        setApps([]);
      } else {
        const loadedApps = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AppConfig));
        setApps(loadedApps);
      }
    } catch (err) {
      console.error('Error fetching apps:', err);
      setError('Failed to load app configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      for (const app of DEFAULT_APPS) {
        await setDoc(doc(db, 'apps', app.id), app);
      }
      await fetchApps();
      setSuccess('Apps seeded successfully!');
    } catch (err) {
        console.error('Error seeding apps:', err);
        setError('Failed to seed database.');
    } finally {
        setLoading(false);
        setTimeout(() => setSuccess(null), 3000);
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
      console.error('Error saving app:', err);
      setError(`Failed to save ${app.name}`);
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
        // Update the app colors
        setApps(prev => prev.map(a =>
          a.id === app.id
            ? { ...a, primary: data.colors.primary, secondary: data.colors.secondary }
            : a
        ));
        const providerName = data.provider === 'grok' ? 'Grok' : data.provider === 'claude' ? 'Claude' : 'Algorithm';
        setSuccess(`Generated new colors for ${app.name} using ${providerName}`);
        setShowAIModal(null);
        setAiDescription('');
        setAiMood('');
      } else {
        throw new Error('Invalid response from color generation API');
      }
    } catch (err) {
      console.error('Error generating colors:', err);
      setError(`Failed to generate colors for ${app.name}`);
    } finally {
      setGeneratingColors(null);
      setTimeout(() => setSuccess(null), 3000);
      setTimeout(() => setError(null), 3000);
    }
  };

  const openAIModal = (appId: string) => {
    setShowAIModal(appId);
    setAiDescription('');
    setAiMood('');
  };

  if (loading && apps.length === 0) {
    return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">App Management</h1>
            <p className="text-zinc-400">Manage theme colors and configurations for all apps.</p>
        </div>
        {apps.length === 0 && !loading && (
            <button
                onClick={handleSeed}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
                <RotateCcw className="h-4 w-4" />
                Seed Defaults
            </button>
        )}
      </div>

      {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
          </div>
      )}

      {success && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {success}
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {apps.map((app) => (
            <div key={app.id} className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5">
                            <LayoutGrid className="h-5 w-5" style={{ color: app.primary }} />
                        </div>
                        <h3 className="font-semibold text-lg text-white">{app.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openAIModal(app.id)}
                            disabled={generatingColors === app.id}
                            className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Generate colors with AI"
                        >
                            {generatingColors === app.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Sparkles className="h-5 w-5" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSave(app)}
                            disabled={saving === app.id}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving === app.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Primary Color
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="color"
                                    value={app.primary}
                                    onChange={(e) => handleColorChange(app.id, 'primary', e.target.value)}
                                    className="h-10 w-10 rounded-lg border-0 p-0 bg-transparent cursor-pointer overflow-hidden"
                                />
                                <div 
                                    className="absolute inset-0 rounded-lg pointer-events-none ring-1 ring-white/10"
                                    style={{ backgroundColor: app.primary }}
                                />
                            </div>
                            <input
                                type="text"
                                value={app.primary}
                                onChange={(e) => handleColorChange(app.id, 'primary', e.target.value)}
                                className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Secondary Color
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="color"
                                    value={app.secondary}
                                    onChange={(e) => handleColorChange(app.id, 'secondary', e.target.value)}
                                    className="h-10 w-10 rounded-lg border-0 p-0 bg-transparent cursor-pointer overflow-hidden"
                                />
                                <div 
                                    className="absolute inset-0 rounded-lg pointer-events-none ring-1 ring-white/10"
                                    style={{ backgroundColor: app.secondary }}
                                />
                            </div>
                            <input
                                type="text"
                                value={app.secondary}
                                onChange={(e) => handleColorChange(app.id, 'secondary', e.target.value)}
                                className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 mt-2 border-t border-white/5">
                        <div className="text-xs text-zinc-500 mb-2">Preview</div>
                        <div className="flex items-center gap-2">
                            <div 
                                className="flex-1 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: app.primary }}
                            >
                                Primary
                            </div>
                            <div 
                                className="flex-1 h-8 rounded-md flex items-center justify-center text-xs font-bold text-white"
                                style={{ backgroundColor: app.secondary }}
                            >
                                Secondary
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* AI Color Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Generate Colors with AI</h3>
              </div>
              <button
                onClick={() => setShowAIModal(null)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-4">
                  Optionally provide details to help AI generate better colors for{' '}
                  <span className="text-white font-medium">
                    {apps.find(a => a.id === showAIModal)?.name}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  App Description (Optional)
                </label>
                <input
                  type="text"
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="e.g., a health and fitness tracking app"
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Mood/Feel (Optional)
                </label>
                <input
                  type="text"
                  value={aiMood}
                  onChange={(e) => setAiMood(e.target.value)}
                  placeholder="e.g., energetic, calm, professional"
                  className="w-full bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-sm text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAIModal(null)}
                  className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const app = apps.find(a => a.id === showAIModal);
                    if (app) handleGenerateColors(app);
                  }}
                  disabled={generatingColors !== null}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generatingColors ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
