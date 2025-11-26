'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { Loader2, Save, CheckCircle2, AlertCircle, Paintbrush, Eye } from 'lucide-react';

type BackgroundVariant = 'glow' | 'aurora' | 'minimal' | 'grid' | 'dots' | 'mesh';

interface ThemeConfig {
  backgroundVariant: BackgroundVariant;
  backgroundIntensity: number;
}

const VARIANTS: { id: BackgroundVariant; name: string; description: string }[] = [
  { id: 'glow', name: 'Glow', description: 'Soft radial glow from top with corner accent' },
  { id: 'aurora', name: 'Aurora', description: 'Northern lights style with multiple layers' },
  { id: 'minimal', name: 'Minimal', description: 'Very subtle, single gradient' },
  { id: 'grid', name: 'Grid', description: 'Subtle grid pattern with accent highlights' },
  { id: 'dots', name: 'Dots', description: 'Dot matrix pattern' },
  { id: 'mesh', name: 'Mesh', description: 'Multi-point mesh gradient with noise texture' },
];

const DEFAULT_THEME: ThemeConfig = {
  backgroundVariant: 'glow',
  backgroundIntensity: 0.25,
};

// Helper to convert hex to rgba for preview
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(74, 222, 128, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Preview component for background variants
function BackgroundPreview({ variant, intensity, color = '#4ade80' }: { variant: BackgroundVariant; intensity: number; color?: string }) {
  const previewStyles: Record<BackgroundVariant, React.CSSProperties> = {
    glow: {
      background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${hexToRgba(color, intensity)}, transparent 60%)`,
    },
    aurora: {
      background: `
        radial-gradient(ellipse 100% 40% at 50% 0%, ${hexToRgba(color, intensity * 0.8)}, transparent 50%),
        radial-gradient(ellipse 60% 30% at 70% 10%, ${hexToRgba(color, intensity * 0.5)}, transparent 40%)
      `,
    },
    minimal: {
      background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${hexToRgba(color, intensity)}, transparent 70%)`,
    },
    grid: {
      backgroundImage: `
        linear-gradient(${hexToRgba(color, intensity * 0.15)} 1px, transparent 1px),
        linear-gradient(90deg, ${hexToRgba(color, intensity * 0.15)} 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px',
    },
    dots: {
      backgroundImage: `radial-gradient(${hexToRgba(color, intensity * 0.4)} 1px, transparent 1px)`,
      backgroundSize: '8px 8px',
    },
    mesh: {
      background: `
        radial-gradient(at 40% 20%, ${hexToRgba(color, intensity * 0.4)} 0px, transparent 50%),
        radial-gradient(at 80% 0%, ${hexToRgba(color, intensity * 0.3)} 0px, transparent 50%),
        radial-gradient(at 0% 50%, ${hexToRgba(color, intensity * 0.2)} 0px, transparent 50%)
      `,
    },
  };

  return (
    <div
      className="absolute inset-0 rounded-xl"
      style={previewStyles[variant]}
    />
  );
}

export default function ThemeManagement() {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'settings', 'theme');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTheme(docSnap.data() as ThemeConfig);
      } else {
        // Initialize with defaults
        setTheme(DEFAULT_THEME);
      }
    } catch (err) {
      setError('Failed to load theme settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'settings', 'theme'), theme);
      setSuccess('Theme settings saved! Apps will update on next reload.');
    } catch (err) {
      console.error('Save error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to save theme settings: ${message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Paintbrush className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Theme Settings</h1>
            <p className="text-sm text-zinc-400">Configure global background styles for all apps.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2 backdrop-blur-sm">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Background Variant Selection */}
      <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-zinc-400" />
          Background Style
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {VARIANTS.map((variant) => (
            <button
              key={variant.id}
              onClick={() => setTheme((prev) => ({ ...prev, backgroundVariant: variant.id }))}
              className={`relative group rounded-xl border-2 transition-all overflow-hidden ${
                theme.backgroundVariant === variant.id
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Preview */}
              <div className="relative h-24 bg-zinc-950">
                <BackgroundPreview variant={variant.id} intensity={theme.backgroundIntensity} />
              </div>

              {/* Label */}
              <div className="p-3 bg-zinc-900/80 border-t border-white/5">
                <div className="text-sm font-medium text-white">{variant.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{variant.description}</div>
              </div>

              {/* Selected indicator */}
              {theme.backgroundVariant === variant.id && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Intensity Slider */}
      <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Intensity</h2>
          <span className="text-sm font-mono text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
            {Math.round(theme.backgroundIntensity * 100)}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={theme.backgroundIntensity * 100}
          onChange={(e) => setTheme((prev) => ({ ...prev, backgroundIntensity: Number(e.target.value) / 100 }))}
          className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />

        <div className="flex justify-between text-xs text-zinc-500 mt-2">
          <span>Subtle</span>
          <span>Bold</span>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-zinc-900/40 backdrop-blur-md p-6 rounded-2xl border border-white/5">
        <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>

        <div className="relative h-48 rounded-xl bg-zinc-950 overflow-hidden border border-white/5">
          <BackgroundPreview variant={theme.backgroundVariant} intensity={theme.backgroundIntensity} />

          {/* Mock content */}
          <div className="absolute inset-0 p-6">
            <div className="h-4 w-32 bg-white/10 rounded mb-3" />
            <div className="h-3 w-48 bg-white/5 rounded mb-2" />
            <div className="h-3 w-40 bg-white/5 rounded" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="h-16 rounded-lg bg-white/5 border border-white/10" />
                <div className="h-16 rounded-lg bg-white/5 border border-white/10" />
                <div className="h-16 rounded-lg bg-white/5 border border-white/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
