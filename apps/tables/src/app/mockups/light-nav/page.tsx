'use client';

import { useState } from 'react';
import { Menu, Sparkles, ChevronDown, Bell, Check } from 'lucide-react';

const NAV_VARIANTS = [
  // Orange / Brand variants
  {
    id: 'orange-50',
    name: 'Orange 50',
    description: 'Very subtle orange tint, warm and inviting',
    className: 'bg-orange-50/95 border-orange-200',
  },
  {
    id: 'orange-100',
    name: 'Orange 100',
    description: 'Light orange, brand-forward',
    className: 'bg-orange-100/95 border-orange-200',
  },
  {
    id: 'orange-gradient',
    name: 'Orange Gradient',
    description: 'Gradient from orange-50 to white',
    className: 'bg-gradient-to-r from-orange-100/90 via-orange-50/80 to-white/90 border-orange-200',
  },
  {
    id: 'amber-warm',
    name: 'Amber Warm',
    description: 'Rich amber tone, like our logo',
    className: 'bg-amber-100/90 border-amber-300',
  },
  {
    id: 'amber-50',
    name: 'Amber 50',
    description: 'Softer amber, professional warmth',
    className: 'bg-amber-50/95 border-amber-200',
  },
  {
    id: 'orange-zinc',
    name: 'Orange + Zinc',
    description: 'Orange tint with zinc undertone',
    className: 'bg-gradient-to-r from-orange-50/90 to-zinc-100/90 border-orange-200/60',
  },
  // Darker orange options
  {
    id: 'dark-orange-tint',
    name: 'Dark Orange Tint',
    description: 'Stronger orange presence',
    className: 'bg-orange-200/80 border-orange-300',
  },
  {
    id: 'burnt-orange',
    name: 'Burnt Orange Light',
    description: 'Sophisticated burnt orange',
    className: 'bg-[#fff7ed]/95 border-[#fdba74]',
  },
  // Zinc with orange accent
  {
    id: 'zinc-orange-border',
    name: 'Zinc + Orange Border',
    description: 'Clean zinc with orange accent line',
    className: 'bg-zinc-100/95 border-b-2 border-orange-500',
  },
  {
    id: 'zinc-amber-border',
    name: 'Zinc + Amber Border',
    description: 'Clean zinc with amber accent line',
    className: 'bg-zinc-100/95 border-b-2 border-amber-500',
  },
  // Original favorites
  {
    id: 'zinc-100',
    name: 'Zinc 100',
    description: 'Neutral gray, clean and professional',
    className: 'bg-zinc-100/95 border-zinc-200',
  },
  {
    id: 'warm-cream',
    name: 'Warm Cream',
    description: 'Paper-like warmth, cozy feel',
    className: 'bg-amber-50/90 border-amber-100',
  },
];

function MockNav({ variant, isSelected, onSelect }: {
  variant: typeof NAV_VARIANTS[0];
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-orange-500 ring-offset-2' : 'hover:ring-2 hover:ring-zinc-300 hover:ring-offset-2'}`}
      onClick={onSelect}
    >
      {/* Background to show transparency */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-200" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(249, 115, 22, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)'
      }} />

      {/* Nav Bar */}
      <header className={`relative backdrop-blur-2xl border-b ${variant.className}`}>
        <div className="flex h-14 items-center px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300/80 transition">
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <span className="font-bold text-zinc-900 tracking-tight">AINEX</span>
              <span className="font-bold text-orange-500 tracking-tight">SUITE</span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/80 transition">
              <Bell className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition">
              <Sparkles className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-1.5 h-8 rounded-full bg-zinc-200/80 px-2 text-zinc-700 hover:bg-zinc-300/80 transition">
              <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                JD
              </div>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>
          </div>
        </div>
      </header>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Content preview area */}
      <div className="relative h-32 p-4">
        <div className="h-full rounded-lg bg-white/60 border border-zinc-200/50" />
      </div>
    </div>
  );
}

export default function LightNavMockups() {
  const [selected, setSelected] = useState<string>('orange-50');
  const selectedVariant = NAV_VARIANTS.find(v => v.id === selected);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Light Mode Nav Mockups</h1>
          <p className="text-zinc-500 mt-2">Click to select a variant. All shown with backdrop blur.</p>
        </div>

        {/* Selected info */}
        {selectedVariant && (
          <div className="mb-8 p-4 rounded-xl bg-orange-50 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-zinc-900">{selectedVariant.name}</h2>
                <p className="text-sm text-zinc-600">{selectedVariant.description}</p>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-white border border-orange-100">
              <code className="text-xs text-zinc-700 font-mono">{selectedVariant.className}</code>
            </div>
          </div>
        )}

        {/* Grid of variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {NAV_VARIANTS.map((variant) => (
            <div key={variant.id}>
              <MockNav
                variant={variant}
                isSelected={selected === variant.id}
                onSelect={() => setSelected(variant.id)}
              />
              <div className="mt-3 px-1">
                <h3 className="font-medium text-zinc-900">{variant.name}</h3>
                <p className="text-sm text-zinc-500">{variant.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Full width preview */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">Full Width Preview</h2>
          <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-xl">
            {/* Background */}
            <div className="relative h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 to-zinc-100" />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(249, 115, 22, 0.4) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(249, 115, 22, 0.3) 0%, transparent 40%)'
              }} />

              {/* Nav with selected variant */}
              <header className={`relative backdrop-blur-2xl border-b ${selectedVariant?.className}`}>
                <div className="flex h-16 items-center px-6">
                  <div className="flex items-center gap-4">
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-200/80 text-zinc-700">
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold text-zinc-900 tracking-tight">AINEX</span>
                      <span className="text-lg font-bold text-orange-500 tracking-tight">SUITE</span>
                    </div>
                  </div>

                  <div className="flex-1" />

                  <div className="flex items-center gap-3">
                    <button className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200/80">
                      <Bell className="h-[18px] w-[18px]" />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                      <Sparkles className="h-[18px] w-[18px]" />
                    </button>
                    <button className="flex items-center gap-2 h-9 rounded-full bg-zinc-200/80 px-2.5">
                      <div className="h-7 w-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold text-white">
                        JD
                      </div>
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
                    </button>
                  </div>
                </div>
              </header>

              {/* Content */}
              <div className="relative p-6 grid grid-cols-2 gap-4">
                <div className="h-40 rounded-xl bg-orange-50 border border-orange-200/50 p-4">
                  <div className="h-3 w-24 bg-zinc-900 rounded mb-2" />
                  <div className="h-2 w-full bg-zinc-300 rounded mb-1" />
                  <div className="h-2 w-3/4 bg-zinc-300 rounded" />
                </div>
                <div className="h-40 rounded-xl bg-white/80 border border-zinc-200/50 p-4">
                  <div className="h-3 w-20 bg-zinc-900 rounded mb-2" />
                  <div className="h-2 w-full bg-zinc-300 rounded mb-1" />
                  <div className="h-2 w-2/3 bg-zinc-300 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
