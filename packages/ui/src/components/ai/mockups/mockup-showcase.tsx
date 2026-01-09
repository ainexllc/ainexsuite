"use client";

import { useState } from "react";
import {
  CircularSoundWaves,
  HorizontalEQBars,
  SineWaveCircle,
  RadialSoundBurst,
  AudioWaveformRing,
  PulsingBrainOutline,
  NeuralNetworkNodes,
  CircuitMind,
  SynapseSpark,
  AICore,
  GlowingMic,
  MicWithWaves,
  VoiceBubble,
  SoundwaveMic,
  MorphingOrb,
  RotatingGradientRing,
  ParticleSwirl,
  BreathingCircle,
  AIEyeSoundwave,
  MagicSparkMic,
} from "./ai-voice-mockups";

import {
  ClassicMicPulse,
  MicLiveIndicator,
  PodcastMic,
  VoiceAssistantCircle,
  RecordingMic,
  SiriStyleMic,
  TapToSpeak,
  FrequencyMic,
  VoiceRecognition,
  AlexaStyleRing,
  ListeningEars,
  SoundInput,
  GlowMicButton,
  WaveformCircle,
  VoiceCommand,
  ActiveListening,
  SmartAssistant,
  VoiceDetector,
  SpeakNow,
  AudioCapture,
} from "./ai-mic-mockups";

interface MockupItem {
  name: string;
  component: React.ComponentType<{
    size?: number;
    color?: string;
    isAnimating?: boolean;
  }>;
  category: string;
  description: string;
}

const mockups: MockupItem[] = [
  // Category 1: Wave/Sound Visualizations (1-5)
  {
    name: "CircularSoundWaves",
    component: CircularSoundWaves,
    category: "Wave/Sound",
    description: "Concentric circles pulsing outward from center",
  },
  {
    name: "HorizontalEQBars",
    component: HorizontalEQBars,
    category: "Wave/Sound",
    description: "7 bars like an audio equalizer",
  },
  {
    name: "SineWaveCircle",
    component: SineWaveCircle,
    category: "Wave/Sound",
    description: "Animated sine wave in a circle",
  },
  {
    name: "RadialSoundBurst",
    component: RadialSoundBurst,
    category: "Wave/Sound",
    description: "Lines radiating from center with pulse",
  },
  {
    name: "AudioWaveformRing",
    component: AudioWaveformRing,
    category: "Wave/Sound",
    description: "Waveform wrapped around a circle",
  },
  // Category 2: AI Brain/Neural (6-10)
  {
    name: "PulsingBrainOutline",
    component: PulsingBrainOutline,
    category: "AI Brain/Neural",
    description: "Brain silhouette with neural pulse effect",
  },
  {
    name: "NeuralNetworkNodes",
    component: NeuralNetworkNodes,
    category: "AI Brain/Neural",
    description: "3 connected nodes with data flow animation",
  },
  {
    name: "CircuitMind",
    component: CircuitMind,
    category: "AI Brain/Neural",
    description: "Microchip-style brain with glowing traces",
  },
  {
    name: "SynapseSpark",
    component: SynapseSpark,
    category: "AI Brain/Neural",
    description: "Two neurons with sparking connection",
  },
  {
    name: "AICore",
    component: AICore,
    category: "AI Brain/Neural",
    description: "Hexagonal core with orbiting particles",
  },
  // Category 3: Original Microphone/Voice (11-14)
  {
    name: "GlowingMic",
    component: GlowingMic,
    category: "Original Mic",
    description: "Microphone icon with pulsing glow ring",
  },
  {
    name: "MicWithWaves",
    component: MicWithWaves,
    category: "Original Mic",
    description: "Microphone emitting sound waves",
  },
  {
    name: "VoiceBubble",
    component: VoiceBubble,
    category: "Original Mic",
    description: "Speech bubble with animated dots",
  },
  {
    name: "SoundwaveMic",
    component: SoundwaveMic,
    category: "Original Mic",
    description: "Microphone made of soundwave lines",
  },
  // Category 4: Abstract/Modern (15-18)
  {
    name: "MorphingOrb",
    component: MorphingOrb,
    category: "Abstract/Modern",
    description: "Liquid blob that morphs smoothly",
  },
  {
    name: "RotatingGradientRing",
    component: RotatingGradientRing,
    category: "Abstract/Modern",
    description: "Ring with animated gradient rotation",
  },
  {
    name: "ParticleSwirl",
    component: ParticleSwirl,
    category: "Abstract/Modern",
    description: "Particles orbiting a center point",
  },
  {
    name: "BreathingCircle",
    component: BreathingCircle,
    category: "Abstract/Modern",
    description: "Circle that expands/contracts with glow",
  },
  // Category 5: Hybrid/Unique (19-20)
  {
    name: "AIEyeSoundwave",
    component: AIEyeSoundwave,
    category: "Hybrid/Unique",
    description: "Eye icon with soundwave as pupil",
  },
  {
    name: "MagicSparkMic",
    component: MagicSparkMic,
    category: "Hybrid/Unique",
    description: "Microphone with sparkle animations",
  },
  // ============== NEW MIC-FOCUSED MOCKUPS (21-40) ==============
  {
    name: "ClassicMicPulse",
    component: ClassicMicPulse,
    category: "Mic - Listen",
    description: "Traditional mic with pulsing rings",
  },
  {
    name: "MicLiveIndicator",
    component: MicLiveIndicator,
    category: "Mic - Listen",
    description: "Mic with LIVE style red dot indicator",
  },
  {
    name: "PodcastMic",
    component: PodcastMic,
    category: "Mic - Listen",
    description: "Professional podcast-style microphone",
  },
  {
    name: "VoiceAssistantCircle",
    component: VoiceAssistantCircle,
    category: "Mic - Listen",
    description: "Circular design with mic and listening waves",
  },
  {
    name: "RecordingMic",
    component: RecordingMic,
    category: "Mic - Listen",
    description: "Mic with recording level bars",
  },
  {
    name: "SiriStyleMic",
    component: SiriStyleMic,
    category: "Mic - Listen",
    description: "Animated waveform surrounding a mic",
  },
  {
    name: "TapToSpeak",
    component: TapToSpeak,
    category: "Mic - Listen",
    description: "Tap indicator with mic pulse",
  },
  {
    name: "FrequencyMic",
    component: FrequencyMic,
    category: "Mic - Listen",
    description: "Mic with frequency visualization bars",
  },
  {
    name: "VoiceRecognition",
    component: VoiceRecognition,
    category: "Mic - Listen",
    description: "Mic with circular processing pattern",
  },
  {
    name: "AlexaStyleRing",
    component: AlexaStyleRing,
    category: "Mic - Listen",
    description: "Ring that lights up with listening animation",
  },
  {
    name: "ListeningEars",
    component: ListeningEars,
    category: "Mic - Listen",
    description: "Mic with animated ear curves",
  },
  {
    name: "SoundInput",
    component: SoundInput,
    category: "Mic - Listen",
    description: "Mic with input arrow indicators",
  },
  {
    name: "GlowMicButton",
    component: GlowMicButton,
    category: "Mic - Listen",
    description: "Circular button with mic and glow",
  },
  {
    name: "WaveformCircle",
    component: WaveformCircle,
    category: "Mic - Listen",
    description: "Mic surrounded by circular waveform",
  },
  {
    name: "VoiceCommand",
    component: VoiceCommand,
    category: "Mic - Listen",
    description: "Mic with command prompt indicator",
  },
  {
    name: "ActiveListening",
    component: ActiveListening,
    category: "Mic - Listen",
    description: "Concentric rings showing active listening",
  },
  {
    name: "SmartAssistant",
    component: SmartAssistant,
    category: "Mic - Listen",
    description: "AI assistant with sparkle and mic",
  },
  {
    name: "VoiceDetector",
    component: VoiceDetector,
    category: "Mic - Listen",
    description: "Radar-style voice detection",
  },
  {
    name: "SpeakNow",
    component: SpeakNow,
    category: "Mic - Listen",
    description: "Mic with speak indicator dots",
  },
  {
    name: "AudioCapture",
    component: AudioCapture,
    category: "Mic - Listen",
    description: "Mic with capturing animation corners",
  },
];

const categories = [
  "All",
  "Mic - Listen",
  "Wave/Sound",
  "AI Brain/Neural",
  "Original Mic",
  "Abstract/Modern",
  "Hybrid/Unique",
];

const sizes = [18, 24, 28, 32, 40, 48];

interface MockupShowcaseProps {
  defaultSize?: number;
  showControls?: boolean;
}

export function MockupShowcase({
  defaultSize = 32,
  showControls = true,
}: MockupShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [iconSize, setIconSize] = useState(defaultSize);
  const [isAnimating, setIsAnimating] = useState(true);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);

  const filteredMockups =
    selectedCategory === "All"
      ? mockups
      : mockups.filter((m) => m.category === selectedCategory);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
        AI Voice Icon Mockups
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        40 animated icon designs for the AI assistant button (click to listen)
      </p>

      {showControls && (
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {/* Category Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} {cat === "Mic - Listen" ? "(NEW)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Size
            </label>
            <select
              value={iconSize}
              onChange={(e) => setIconSize(Number(e.target.value))}
              className="px-3 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}px
                </option>
              ))}
            </select>
          </div>

          {/* Animation Toggle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Animation
            </label>
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                isAnimating
                  ? "bg-amber-500 border-amber-500 text-white"
                  : "bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {isAnimating ? "On" : "Off"}
            </button>
          </div>

          {/* Quick filter for mic icons */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Quick Filter
            </label>
            <button
              onClick={() => setSelectedCategory("Mic - Listen")}
              className="px-3 py-1.5 text-sm rounded-md border border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              Show Mic Icons (21-40)
            </button>
          </div>
        </div>
      )}

      {/* Mockup Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMockups.map((mockup, _index) => {
          const Icon = mockup.component;
          const isSelected = selectedMockup === mockup.name;
          const globalIndex = mockups.findIndex((m) => m.name === mockup.name) + 1;
          const isNewMic = mockup.category === "Mic - Listen";

          return (
            <button
              key={mockup.name}
              onClick={() =>
                setSelectedMockup(isSelected ? null : mockup.name)
              }
              className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                  : isNewMic
                  ? "border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/50 bg-amber-50/50 dark:bg-amber-500/5"
                  : "border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-500/50 bg-white dark:bg-zinc-800"
              }`}
            >
              {/* NEW badge for mic icons */}
              {isNewMic && (
                <span className="absolute top-1 right-1 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded">
                  NEW
                </span>
              )}

              {/* Icon Preview with Button Container */}
              <div
                className="flex items-center justify-center rounded-full transition-colors bg-amber-200 hover:bg-amber-300 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 mb-3"
                style={{
                  width: iconSize + 16,
                  height: iconSize + 16,
                  filter: "drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))",
                }}
              >
                <Icon
                  size={iconSize}
                  color="#f59e0b"
                  isAnimating={isAnimating}
                />
              </div>

              {/* Number Badge */}
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                #{globalIndex}
              </span>

              {/* Name */}
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 text-center">
                {mockup.name}
              </span>

              {/* Category Tag */}
              <span className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
                {mockup.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Mockup Details */}
      {selectedMockup && (
        <div className="mt-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          {(() => {
            const mockup = mockups.find((m) => m.name === selectedMockup);
            if (!mockup) return null;
            const Icon = mockup.component;
            const globalIndex = mockups.findIndex((m) => m.name === selectedMockup) + 1;

            return (
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Large Preview */}
                <div className="flex flex-col items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-full bg-amber-200 dark:bg-amber-500/20"
                    style={{
                      width: 80,
                      height: 80,
                      filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))",
                    }}
                  >
                    <Icon size={48} color="#f59e0b" isAnimating={isAnimating} />
                  </div>
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                    Large (48px)
                  </span>
                </div>

                {/* Size Comparison */}
                <div className="flex gap-4 items-end">
                  {[18, 24, 32].map((s) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div
                        className="flex items-center justify-center rounded-full bg-amber-200 dark:bg-amber-500/20"
                        style={{
                          width: s + 12,
                          height: s + 12,
                          filter:
                            "drop-shadow(0 0 4px rgba(245, 158, 11, 0.4))",
                        }}
                      >
                        <Icon
                          size={s}
                          color="#f59e0b"
                          isAnimating={isAnimating}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{s}px</span>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    #{globalIndex} {mockup.name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    {mockup.description}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded">
                    {mockup.category}
                  </span>

                  {/* Usage Code */}
                  <pre className="mt-4 p-3 bg-zinc-900 dark:bg-zinc-950 rounded-lg text-xs text-zinc-300 overflow-x-auto">
                    {`import { ${mockup.name} } from "@ainexsuite/ui/components";

<${mockup.name} size={24} color="#f59e0b" isAnimating={true} />`}
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 flex gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <span>
          Showing {filteredMockups.length} of {mockups.length} mockups
        </span>
        <span>|</span>
        <span>Current size: {iconSize}px</span>
        <span>|</span>
        <span>Animation: {isAnimating ? "enabled" : "disabled"}</span>
      </div>
    </div>
  );
}

export default MockupShowcase;
