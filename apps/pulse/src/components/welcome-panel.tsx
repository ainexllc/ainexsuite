'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Monitor,
  Palette,
  Sparkles,
  Clock,
  Layout,
  Maximize2,
  Settings2,
  GripVertical,
  Info
} from 'lucide-react';

interface WelcomePanelProps {
  onDismiss: () => void;
}

export function WelcomePanel({ onDismiss }: WelcomePanelProps) {
  return (
    <div className="glass-card rounded-2xl p-6 mb-6 border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10 relative overflow-hidden">
      {/* Subtle animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 animate-pulse opacity-50" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Welcome to Pulse</h2>
              <p className="text-sm text-zinc-400">Your customizable smart display</p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-zinc-300 mb-6 leading-relaxed">
          Pulse is designed to be your always-on ambient display - something beautiful to look at while you work,
          relax, or just have running in the background. Customize it to match your style with animated backgrounds,
          different clock styles, and useful widgets.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <FeatureCard
            icon={<Clock className="h-5 w-5" />}
            title="Multiple Clock Styles"
            description="Digital, analog, neon, flip clock, and retro styles to match your aesthetic"
          />
          <FeatureCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Animated Effects"
            description="Rain, snow, stars, fireflies, and more atmospheric effects"
          />
          <FeatureCard
            icon={<Palette className="h-5 w-5" />}
            title="Custom Backgrounds"
            description="AI-generated images, solid colors, or your own uploaded backgrounds"
          />
          <FeatureCard
            icon={<Layout className="h-5 w-5" />}
            title="Flexible Layouts"
            description="Choose from classic, dashboard, focus, or studio layouts"
          />
          <FeatureCard
            icon={<GripVertical className="h-5 w-5" />}
            title="Drag & Drop Tiles"
            description="Calendar, weather, focus timer, market data, and more widgets"
          />
          <FeatureCard
            icon={<Maximize2 className="h-5 w-5" />}
            title="Fullscreen Mode"
            description="Go fullscreen for a distraction-free ambient display experience"
          />
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <Info className="h-5 w-5 text-indigo-400 shrink-0" />
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-300 font-medium">Pro tip:</span> Click the <Settings2 className="inline h-4 w-4 mx-1" />
            icon in the top-right corner of the display to customize your clock, add tiles, change backgrounds, and apply effects.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-indigo-400">{icon}</div>
        <h3 className="font-medium text-white text-sm">{title}</h3>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
    </div>
  );
}

// Hook to manage welcome panel visibility
export function useWelcomePanel() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pulse-welcome-dismissed');
    if (!dismissed) {
      setShowWelcome(true);
    }
    setIsLoaded(true);
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem('pulse-welcome-dismissed', 'true');
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem('pulse-welcome-dismissed');
    setShowWelcome(true);
  };

  return { showWelcome: isLoaded && showWelcome, dismissWelcome, resetWelcome };
}
