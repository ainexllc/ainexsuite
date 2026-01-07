"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, Lightbulb, Target, ChevronLeft, ChevronRight, X } from "lucide-react";

const sampleInsights = [
  {
    icon: TrendingUp,
    label: "Productivity",
    content: "You've written 12 docs this week - 40% more than last week!",
    gradient: { from: "#eab308", to: "#f97316" }
  },
  {
    icon: Lightbulb,
    label: "Suggestion",
    content: "Consider organizing your 'Project Ideas' docs into a dedicated workspace.",
    gradient: { from: "#eab308", to: "#84cc16" }
  },
  {
    icon: Target,
    label: "Focus Area",
    content: "Your most active category is 'Development' with 28 docs.",
    gradient: { from: "#eab308", to: "#ef4444" }
  },
];

// Shared slideshow hook
function useSlideshow(length: number, interval = 5000) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPaused, length, interval]);

  const goTo = (index: number) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + length) % length);
  const next = () => setCurrent((c) => (c + 1) % length);
  const pause = () => setIsPaused(true);
  const resume = () => setIsPaused(false);

  return { current, isPaused, goTo, prev, next, pause, resume };
}

export default function AIInsightsMockups() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">AI Insights Banner - Based on Main App Slideshow</h1>
        <p className="text-white/60 mb-8">10 variations inspired by the MarketingSlideshow component with gradient backgrounds, glow effects, and smooth navigation.</p>

        <div className="space-y-12">
          <MockupContainer title="Mockup #1: Full Hero" description="Direct adaptation - large icon, gradient glow, bottom nav">
            <Mockup1 />
          </MockupContainer>

          <MockupContainer title="Mockup #2: Compact Hero" description="Shorter height, same styling">
            <Mockup2 />
          </MockupContainer>

          <MockupContainer title="Mockup #3: Horizontal Layout" description="Icon left, content center, nav right">
            <Mockup3 />
          </MockupContainer>

          <MockupContainer title="Mockup #4: Centered Content" description="Centered layout with subtle glow">
            <Mockup4 />
          </MockupContainer>

          <MockupContainer title="Mockup #5: Top Nav Bar" description="Navigation in header, content below">
            <Mockup5 />
          </MockupContainer>

          <MockupContainer title="Mockup #6: Side Glow" description="Asymmetric glow effect on one side">
            <Mockup6 />
          </MockupContainer>

          <MockupContainer title="Mockup #7: Minimal Banner" description="Clean single-line with gradient accent">
            <Mockup7 />
          </MockupContainer>

          <MockupContainer title="Mockup #8: Card Style" description="Elevated card with inner glow">
            <Mockup8 />
          </MockupContainer>

          <MockupContainer title="Mockup #9: Split Gradient" description="Half gradient background">
            <Mockup9 />
          </MockupContainer>

          <MockupContainer title="Mockup #10: Floating Controls" description="Overlay controls on hover">
            <Mockup10 />
          </MockupContainer>
        </div>
      </div>
    </div>
  );
}

function MockupContainer({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/50">{description}</p>
      </div>
      <div className="border border-white/10 rounded-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// Mockup 1: Full Hero - Direct adaptation of MarketingSlideshow
function Mockup1() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[200px] overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-20 transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)` }}
        />

        {/* Glow Effects */}
        <div
          className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-30 transition-all duration-500"
          style={{ backgroundColor: slide.gradient.from }}
        />
        <div
          className="absolute bottom-0 left-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-25 transition-all duration-500"
          style={{ backgroundColor: slide.gradient.to }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center h-full px-8 py-6">
          <div className="flex items-center gap-6">
            {/* Icon */}
            <div
              className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              style={{ boxShadow: `0 0 40px ${slide.gradient.from}40` }}
            >
              <Icon className="w-8 h-8" style={{ color: slide.gradient.from }} />
            </div>

            {/* Text */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: slide.gradient.from }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>
                  {slide.label}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">{slide.content}</h2>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {sampleInsights.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 border border-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 2: Compact Hero - Shorter version
function Mockup2() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[140px] overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-15 transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)` }}
        />

        {/* Single Glow */}
        <div
          className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full blur-[80px] opacity-30 transition-all duration-500"
          style={{ backgroundColor: slide.gradient.from }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-between h-full px-6 py-4">
          <div className="flex items-center gap-5">
            <div
              className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl border border-white/10 bg-white/5"
              style={{ boxShadow: `0 0 30px ${slide.gradient.from}30` }}
            >
              <Icon className="w-7 h-7" style={{ color: slide.gradient.from }} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
              </div>
              <p className="text-lg font-semibold text-white">{slide.content}</p>
            </div>
          </div>
          <button className="p-2 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        {/* Bottom Navigation */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-6">
          <div className="flex items-center gap-1.5">
            {sampleInsights.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1 bg-white/30'}`} />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prev} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={next} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 3: Horizontal Layout - Icon left, content center, nav right inline
function Mockup3() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-15" style={{ background: `linear-gradient(90deg, ${slide.gradient.from}40 0%, transparent 50%)` }} />

        {/* Glow */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full blur-[60px] opacity-40" style={{ backgroundColor: slide.gradient.from }} />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4 px-5 py-4">
          {/* Icon */}
          <div
            className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5"
            style={{ boxShadow: `0 0 25px ${slide.gradient.from}30` }}
          >
            <Icon className="w-6 h-6" style={{ color: slide.gradient.from }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <Sparkles className="w-3 h-3" style={{ color: slide.gradient.from }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
            </div>
            <p className="text-sm text-white font-medium truncate">{slide.content}</p>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {sampleInsights.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5' : 'w-1.5 bg-white/30'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
              ))}
            </div>
            <div className="w-px h-4 bg-white/10" />
            <button onClick={prev} className="p-1 text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={next} className="p-1 text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            <button className="p-1 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 4: Centered Content
function Mockup4() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[160px] overflow-hidden">
        {/* Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full blur-[80px] opacity-20" style={{ backgroundColor: slide.gradient.from }} />

        {/* Content - Centered */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 py-4 text-center">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl border border-white/10 bg-white/5 mb-3"
            style={{ boxShadow: `0 0 30px ${slide.gradient.from}30` }}
          >
            <Icon className="w-6 h-6" style={{ color: slide.gradient.from }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: slide.gradient.from }}>{slide.label}</span>
          <p className="text-lg font-semibold text-white max-w-xl">{slide.content}</p>
        </div>

        {/* Close */}
        <button className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>

        {/* Bottom Nav */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
          <button onClick={prev} className="p-1 text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-2">
            {sampleInsights.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6' : 'w-1.5 bg-white/30'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
            ))}
          </div>
          <button onClick={next} className="p-1 text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 5: Top Nav Bar
function Mockup5() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Top Nav Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10" style={{ backgroundColor: `${slide.gradient.from}10` }}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: slide.gradient.from }} />
          <span className="text-sm font-semibold text-white">AI Insights</span>
          <span className="text-xs text-white/40">•</span>
          <span className="text-xs text-white/40">{current + 1} of {sampleInsights.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={next} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded"><ChevronRight className="w-4 h-4" /></button>
          <button className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded ml-1"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="relative h-[120px] overflow-hidden">
        {/* Gradient */}
        <div className="absolute inset-0 opacity-15" style={{ background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)` }} />
        <div className="absolute -bottom-10 -right-10 w-[200px] h-[200px] rounded-full blur-[80px] opacity-30" style={{ backgroundColor: slide.gradient.to }} />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-5 h-full px-5 py-4">
          <div
            className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl border border-white/10 bg-white/5"
            style={{ boxShadow: `0 0 30px ${slide.gradient.from}30` }}
          >
            <Icon className="w-7 h-7" style={{ color: slide.gradient.from }} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
            <p className="text-lg font-semibold text-white mt-0.5">{slide.content}</p>
          </div>
        </div>

        {/* Dots at bottom */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {sampleInsights.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`h-1 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1 bg-white/30'}`} />
          ))}
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 6: Side Glow - Asymmetric
function Mockup6() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[140px] overflow-hidden">
        {/* Strong side glow */}
        <div className="absolute top-0 bottom-0 -left-20 w-[250px] rounded-full blur-[60px] opacity-40" style={{ backgroundColor: slide.gradient.from }} />

        {/* Accent bar on left */}
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: slide.gradient.from }} />

        {/* Content */}
        <div className="relative z-10 flex items-center h-full pl-6 pr-4 py-4">
          <div className="flex items-center gap-5 flex-1">
            <div
              className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-white/5 border border-white/10"
              style={{ boxShadow: `0 0 30px ${slide.gradient.from}25` }}
            >
              <Icon className="w-7 h-7" style={{ color: slide.gradient.from }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: `${slide.gradient.from}25`, color: slide.gradient.from }}>
                  {slide.label}
                </span>
              </div>
              <p className="text-white font-medium">{slide.content}</p>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex flex-col items-center gap-2 ml-4">
            <button onClick={prev} className="p-1 text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex flex-col gap-1">
              {sampleInsights.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`w-1.5 rounded-full transition-all ${i === current ? 'h-4' : 'h-1.5 bg-white/30'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
              ))}
            </div>
            <button onClick={next} className="p-1 text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <button className="absolute top-3 right-3 p-1 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 7: Minimal Banner - Clean single-line
function Mockup7() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative overflow-hidden">
        {/* Subtle gradient line at top */}
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${slide.gradient.from}, ${slide.gradient.to})` }} />

        {/* Minimal glow */}
        <div className="absolute -top-10 left-1/4 w-[200px] h-[100px] rounded-full blur-[60px] opacity-20" style={{ backgroundColor: slide.gradient.from }} />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-4 px-5 py-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ backgroundColor: `${slide.gradient.from}20` }}>
            <Icon className="w-5 h-5" style={{ color: slide.gradient.from }} />
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: slide.gradient.from }}>{slide.label}</span>
            <span className="text-white/20">|</span>
            <p className="text-sm text-white truncate">{slide.content}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex gap-1">
              {sampleInsights.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-4' : 'w-1.5 bg-white/20'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
              ))}
            </div>
            <button onClick={prev} className="p-1 text-white/30 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={next} className="p-1 text-white/30 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            <button className="p-1 text-white/30 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
      <HandleTab gradient={slide.gradient} variant="minimal" />
    </div>
  );
}

// Mockup 8: Card Style - Elevated with inner glow
function Mockup8() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full p-4 bg-zinc-900/50"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div
        className="relative rounded-2xl overflow-hidden border bg-black/40 backdrop-blur-xl"
        style={{
          borderColor: `${slide.gradient.from}30`,
          boxShadow: `0 0 60px -20px ${slide.gradient.from}40, inset 0 0 60px -30px ${slide.gradient.from}20`
        }}
      >
        <div className="relative h-[130px] overflow-hidden">
          {/* Inner glow */}
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(ellipse at center, ${slide.gradient.from} 0%, transparent 70%)` }} />

          {/* Content */}
          <div className="relative z-10 flex items-center gap-5 h-full px-6 py-4">
            <div
              className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl"
              style={{
                backgroundColor: `${slide.gradient.from}15`,
                boxShadow: `0 0 30px ${slide.gradient.from}30`
              }}
            >
              <Icon className="w-7 h-7" style={{ color: slide.gradient.from }} />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
              <p className="text-lg font-semibold text-white mt-1">{slide.content}</p>
            </div>
            <button className="p-2 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-6">
            <div className="flex gap-2">
              {sampleInsights.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6' : 'w-1.5 bg-white/20'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={prev} className="p-1 text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={next} className="p-1 text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mockup 9: Split Gradient - Half background
function Mockup9() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[140px] flex">
        {/* Left - Gradient side */}
        <div
          className="w-1/3 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${slide.gradient.from}30 0%, ${slide.gradient.to}20 100%)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-sm"
              style={{ boxShadow: `0 0 40px ${slide.gradient.from}40` }}
            >
              <Icon className="w-8 h-8" style={{ color: slide.gradient.from }} />
            </div>
          </div>
        </div>

        {/* Right - Content side */}
        <div className="flex-1 bg-black/40 backdrop-blur-xl flex flex-col justify-center px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3" style={{ color: slide.gradient.from }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
          </div>
          <p className="text-lg font-semibold text-white">{slide.content}</p>

          {/* Nav */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2">
              {sampleInsights.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`h-1 rounded-full transition-all ${i === current ? 'w-5' : 'w-1 bg-white/20'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined }} />
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={prev} className="p-1 text-white/40 hover:text-white"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={next} className="p-1 text-white/40 hover:text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <button className="absolute top-3 right-3 p-1 text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Mockup 10: Floating Controls - Overlay on hover
function Mockup10() {
  const { current, goTo, prev, next, pause, resume } = useSlideshow(sampleInsights.length);
  const slide = sampleInsights[current];
  const Icon = slide.icon;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-xl group"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="relative h-[150px] overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${slide.gradient.from} 0%, ${slide.gradient.to} 100%)` }} />

        {/* Glows */}
        <div className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full blur-[80px] opacity-30" style={{ backgroundColor: slide.gradient.from }} />
        <div className="absolute -bottom-10 -left-10 w-[150px] h-[150px] rounded-full blur-[60px] opacity-20" style={{ backgroundColor: slide.gradient.to }} />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-5 h-full px-6 py-4">
          <div
            className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-xl border border-white/10 bg-white/5"
            style={{ boxShadow: `0 0 30px ${slide.gradient.from}30` }}
          >
            <Icon className="w-7 h-7" style={{ color: slide.gradient.from }} />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: slide.gradient.from }}>{slide.label}</span>
            <p className="text-lg font-semibold text-white mt-1">{slide.content}</p>
          </div>
        </div>

        {/* Floating Controls - Show on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
          <button onClick={prev} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-3">
            {sampleInsights.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`w-3 h-3 rounded-full transition-all ${i === current ? '' : 'bg-white/30 hover:bg-white/50'}`} style={{ backgroundColor: i === current ? slide.gradient.from : undefined, boxShadow: i === current ? `0 0 15px ${slide.gradient.from}` : undefined }} />
            ))}
          </div>
          <button onClick={next} className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Close - always visible */}
        <button className="absolute top-3 right-3 p-1.5 text-white/40 hover:text-white z-20"><X className="w-4 h-4" /></button>

        {/* Bottom dots - visible when not hovered */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 group-hover:opacity-0 transition-opacity">
          {sampleInsights.map((_, i) => (
            <div key={i} className={`h-1 rounded-full ${i === current ? 'w-5 bg-white' : 'w-1 bg-white/30'}`} />
          ))}
        </div>
      </div>
      <HandleTab gradient={slide.gradient} />
    </div>
  );
}

// Handle Tab Component
function HandleTab({ gradient, variant = 'default' }: { gradient: { from: string; to: string }; variant?: 'default' | 'minimal' }) {
  return (
    <div className="flex justify-center">
      <div
        className="px-6 py-1.5 rounded-b-xl border border-t-0"
        style={{
          backgroundColor: variant === 'minimal' ? `${gradient.from}10` : `${gradient.from}15`,
          borderColor: `${gradient.from}25`,
          boxShadow: variant === 'default' ? `0 4px 15px ${gradient.from}15` : undefined
        }}
      >
        <div
          className="w-8 h-1 rounded-full"
          style={{ background: `linear-gradient(90deg, ${gradient.from}, ${gradient.to})` }}
        />
      </div>
    </div>
  );
}
