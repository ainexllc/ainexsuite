'use client';

import { useState } from 'react';
import { Menu, Sparkles, ChevronDown, Bell, Sun, Moon, Check, PanelTop } from 'lucide-react';

const ICON_VARIANTS = {
  light: [
    {
      id: 'subtle-zinc',
      name: 'Subtle Zinc',
      description: 'Minimal zinc backgrounds, clean look',
      menu: 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300',
      bell: 'text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-700',
      ai: 'bg-amber-100 text-amber-600 hover:bg-amber-200',
      profile: 'bg-zinc-200/80 text-zinc-700 hover:bg-zinc-300',
      toggle: 'text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-600',
    },
    {
      id: 'ghost',
      name: 'Ghost Style',
      description: 'No backgrounds until hover',
      menu: 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900',
      bell: 'text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-700',
      ai: 'text-amber-500 hover:bg-amber-100 hover:text-amber-600',
      profile: 'text-zinc-600 hover:bg-zinc-200/60',
      toggle: 'text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-600',
    },
    {
      id: 'outlined',
      name: 'Outlined',
      description: 'Subtle borders, refined look',
      menu: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-400',
      bell: 'border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700',
      ai: 'border border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100',
      profile: 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100',
      toggle: 'border border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600',
    },
    {
      id: 'solid-contrast',
      name: 'Solid Contrast',
      description: 'Strong visual presence',
      menu: 'bg-zinc-900 text-white hover:bg-zinc-800',
      bell: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200',
      ai: 'bg-amber-500 text-white hover:bg-amber-600',
      profile: 'bg-zinc-900 text-white hover:bg-zinc-800',
      toggle: 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
    },
    {
      id: 'glass',
      name: 'Glass Effect',
      description: 'Frosted glass appearance',
      menu: 'bg-white/60 backdrop-blur-sm border border-zinc-200/50 text-zinc-700 hover:bg-white/80',
      bell: 'bg-white/40 backdrop-blur-sm text-zinc-500 hover:bg-white/60 hover:text-zinc-700',
      ai: 'bg-amber-500/20 backdrop-blur-sm text-amber-600 hover:bg-amber-500/30',
      profile: 'bg-white/60 backdrop-blur-sm border border-zinc-200/50 text-zinc-700 hover:bg-white/80',
      toggle: 'bg-white/40 backdrop-blur-sm text-zinc-400 hover:bg-white/60',
    },
    {
      id: 'soft-shadow',
      name: 'Soft Shadows',
      description: 'Elevated with subtle shadows',
      menu: 'bg-white shadow-md shadow-zinc-200/50 text-zinc-700 hover:shadow-lg',
      bell: 'text-zinc-500 hover:bg-white hover:shadow-md hover:shadow-zinc-200/50',
      ai: 'bg-amber-50 shadow-md shadow-amber-200/50 text-amber-600 hover:shadow-lg',
      profile: 'bg-white shadow-md shadow-zinc-200/50 text-zinc-700 hover:shadow-lg',
      toggle: 'text-zinc-400 hover:bg-white hover:shadow-md',
    },
  ],
  dark: [
    {
      id: 'subtle-zinc-dark',
      name: 'Subtle Zinc',
      description: 'Minimal zinc backgrounds',
      menu: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
      bell: 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
      ai: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30',
      profile: 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
      toggle: 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300',
    },
    {
      id: 'ghost-dark',
      name: 'Ghost Style',
      description: 'No backgrounds until hover',
      menu: 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
      bell: 'text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300',
      ai: 'text-amber-400 hover:bg-amber-500/20',
      profile: 'text-zinc-400 hover:bg-zinc-800/60',
      toggle: 'text-zinc-600 hover:bg-zinc-800/60 hover:text-zinc-400',
    },
    {
      id: 'outlined-dark',
      name: 'Outlined',
      description: 'Subtle borders',
      menu: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600',
      bell: 'border border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
      ai: 'border border-amber-500/50 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20',
      profile: 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800',
      toggle: 'border border-zinc-800 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400',
    },
    {
      id: 'glow',
      name: 'Glow Effect',
      description: 'Subtle glow on hover',
      menu: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50',
      bell: 'text-zinc-500 hover:text-zinc-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]',
      ai: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20',
      profile: 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50',
      toggle: 'text-zinc-600 hover:text-zinc-400 hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.1)]',
    },
    {
      id: 'elevated-dark',
      name: 'Elevated',
      description: 'Raised appearance',
      menu: 'bg-zinc-800 text-zinc-200 shadow-lg shadow-black/20 hover:bg-zinc-700',
      bell: 'bg-zinc-900 text-zinc-400 shadow-md shadow-black/20 hover:bg-zinc-800 hover:text-zinc-300',
      ai: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40',
      profile: 'bg-zinc-800 text-zinc-200 shadow-lg shadow-black/20 hover:bg-zinc-700',
      toggle: 'bg-zinc-900 text-zinc-500 shadow-md shadow-black/20 hover:bg-zinc-800',
    },
    {
      id: 'neon',
      name: 'Neon Accent',
      description: 'Vibrant accent colors',
      menu: 'bg-zinc-900 text-zinc-300 ring-1 ring-zinc-700 hover:ring-amber-500/50',
      bell: 'text-zinc-500 hover:text-amber-400',
      ai: 'bg-amber-500 text-zinc-900 font-medium hover:bg-amber-400 shadow-lg shadow-amber-500/30',
      profile: 'bg-zinc-900 text-zinc-300 ring-1 ring-zinc-700 hover:ring-amber-500/50',
      toggle: 'text-zinc-600 hover:text-amber-400',
    },
  ],
};

function IconPreview({ variant, mode }: { variant: typeof ICON_VARIANTS.light[0]; mode: 'light' | 'dark' }) {
  const bgClass = mode === 'light' ? 'bg-zinc-100' : 'bg-zinc-950';
  const navBg = mode === 'light' ? 'bg-zinc-100/95 border-amber-500' : 'bg-zinc-950/90 border-zinc-800';
  const logoColor = mode === 'light' ? 'text-zinc-900' : 'text-zinc-100';

  return (
    <div className={`rounded-xl overflow-hidden ${bgClass}`}>
      <header className={`${navBg} border-b-2 px-4 py-3`}>
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${variant.menu}`}>
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              <span className={`font-bold tracking-tight ${logoColor}`}>AINEX</span>
              <span className="font-bold text-amber-500 tracking-tight">SUITE</span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${variant.toggle}`}>
              <PanelTop className="h-4 w-4" />
            </button>
            <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${variant.bell}`}>
              <Bell className="h-4 w-4" />
            </button>
            <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${variant.ai}`}>
              <Sparkles className="h-4 w-4" />
            </button>
            <button className={`flex items-center gap-1.5 h-8 rounded-full px-2 transition-all ${variant.profile}`}>
              <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                JD
              </div>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-20" />
    </div>
  );
}

export default function NavIconsMockups() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [selectedLight, setSelectedLight] = useState('subtle-zinc');
  const [selectedDark, setSelectedDark] = useState('subtle-zinc-dark');

  const variants = mode === 'light' ? ICON_VARIANTS.light : ICON_VARIANTS.dark;
  const selected = mode === 'light' ? selectedLight : selectedDark;
  const setSelected = mode === 'light' ? setSelectedLight : setSelectedDark;
  const selectedVariant = variants.find(v => v.id === selected);

  return (
    <div className={`min-h-screen p-8 transition-colors ${mode === 'light' ? 'bg-white' : 'bg-zinc-900'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl font-bold ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>
              Nav Icon Mockups
            </h1>
            <p className={`mt-2 ${mode === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
              Click to select a variant. Toggle between light and dark mode.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-full bg-zinc-200 dark:bg-zinc-800">
            <button
              onClick={() => setMode('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'light'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              onClick={() => setMode('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === 'dark'
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </div>

        {/* Selected info */}
        {selectedVariant && (
          <div className={`mb-8 p-4 rounded-xl ${mode === 'light' ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className={`font-semibold ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>
                  {selectedVariant.name}
                </h2>
                <p className={`text-sm ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                  {selectedVariant.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid of variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {variants.map((variant) => (
            <div
              key={variant.id}
              onClick={() => setSelected(variant.id)}
              className={`cursor-pointer rounded-xl overflow-hidden transition-all ${
                selected === variant.id
                  ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-transparent'
                  : mode === 'light'
                    ? 'hover:ring-2 hover:ring-zinc-300 hover:ring-offset-2'
                    : 'hover:ring-2 hover:ring-zinc-600 hover:ring-offset-2 hover:ring-offset-zinc-900'
              }`}
            >
              <IconPreview variant={variant} mode={mode} />
              <div className={`px-4 py-3 ${mode === 'light' ? 'bg-white' : 'bg-zinc-800'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>
                      {variant.name}
                    </h3>
                    <p className={`text-sm ${mode === 'light' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      {variant.description}
                    </p>
                  </div>
                  {selected === variant.id && (
                    <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Icon breakdown */}
        {selectedVariant && (
          <div className="mt-12">
            <h2 className={`text-xl font-semibold mb-4 ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>
              Icon Styles Breakdown
            </h2>
            <div className={`rounded-xl border overflow-hidden ${mode === 'light' ? 'border-zinc-200 bg-white' : 'border-zinc-700 bg-zinc-800'}`}>
              <table className="w-full">
                <thead>
                  <tr className={mode === 'light' ? 'bg-zinc-50' : 'bg-zinc-900'}>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>Element</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>Classes</th>
                    <th className={`px-4 py-3 text-left text-sm font-medium ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>Preview</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${mode === 'light' ? 'divide-zinc-100' : 'divide-zinc-700'}`}>
                  <tr>
                    <td className={`px-4 py-3 text-sm font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>Menu Button</td>
                    <td className={`px-4 py-3 text-xs font-mono ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{selectedVariant.menu}</td>
                    <td className="px-4 py-3">
                      <button className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${selectedVariant.menu}`}>
                        <Menu className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 text-sm font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>Bell / Notifications</td>
                    <td className={`px-4 py-3 text-xs font-mono ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{selectedVariant.bell}</td>
                    <td className="px-4 py-3">
                      <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${selectedVariant.bell}`}>
                        <Bell className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 text-sm font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>AI Sparkles</td>
                    <td className={`px-4 py-3 text-xs font-mono ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{selectedVariant.ai}</td>
                    <td className="px-4 py-3">
                      <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${selectedVariant.ai}`}>
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 text-sm font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>Toggle Button</td>
                    <td className={`px-4 py-3 text-xs font-mono ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{selectedVariant.toggle}</td>
                    <td className="px-4 py-3">
                      <button className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${selectedVariant.toggle}`}>
                        <PanelTop className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className={`px-4 py-3 text-sm font-medium ${mode === 'light' ? 'text-zinc-900' : 'text-zinc-100'}`}>Profile Button</td>
                    <td className={`px-4 py-3 text-xs font-mono ${mode === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{selectedVariant.profile}</td>
                    <td className="px-4 py-3">
                      <button className={`flex items-center gap-1.5 h-8 rounded-full px-2 transition-all ${selectedVariant.profile}`}>
                        <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white">
                          JD
                        </div>
                        <ChevronDown className="h-3 w-3 opacity-60" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
