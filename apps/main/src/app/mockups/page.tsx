'use client';

import { useState } from 'react';
import {
  FileText,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Camera,
  Activity,
  Dumbbell,
  Layers,
  GitBranch,
  Lock,
  Check,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Grid3x3,
  LayoutGrid
} from 'lucide-react';

const apps = [
  { name: 'Notes', icon: FileText, color: '#f59e0b', hasAccess: true, category: 'Productivity' },
  { name: 'Journey', icon: BookOpen, color: '#a855f7', hasAccess: true, category: 'Wellness' },
  { name: 'Tasks', icon: CheckSquare, color: '#3b82f6', hasAccess: true, category: 'Productivity' },
  { name: 'Track', icon: TrendingUp, color: '#22c55e', hasAccess: false, category: 'Productivity' },
  { name: 'Moments', icon: Camera, color: '#ec4899', hasAccess: false, category: 'Creative' },
  { name: 'Pulse', icon: Activity, color: '#ef4444', hasAccess: false, category: 'Health' },
  { name: 'Fit', icon: Dumbbell, color: '#f97316', hasAccess: true, category: 'Health' },
  { name: 'Projects', icon: Layers, color: '#6366f1', hasAccess: false, category: 'Productivity' },
  { name: 'Workflow', icon: GitBranch, color: '#10b981', hasAccess: false, category: 'System' },
];

const mockups = [
  {
    id: 1,
    name: 'Grid with Status Badges',
    description: 'Clean grid layout with prominent access indicators and upgrade CTAs'
  },
  {
    id: 2,
    name: 'Split View Dashboard',
    description: 'Two-column layout separating owned apps from available upgrades'
  },
  {
    id: 3,
    name: 'Card List with Progress',
    description: 'Detailed cards showing features and access state with inline actions'
  },
  {
    id: 4,
    name: 'Compact Tiles',
    description: 'High-density tile grid for quick scanning and navigation'
  },
  {
    id: 5,
    name: 'Category Sections',
    description: 'Organized by category with collapsible sections'
  }
];

export default function MockupsPage() {
  const [selectedMockup, setSelectedMockup] = useState(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutGrid className="h-6 w-6 text-blue-400" />
                Layout Mockups
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Compare 5 different layout concepts for the app launcher
              </p>
            </div>
            <div className="flex gap-2">
              {mockups.map((mockup) => (
                <button
                  key={mockup.id}
                  onClick={() => setSelectedMockup(mockup.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedMockup === mockup.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mockup.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mockup Info */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-2">
            {mockups[selectedMockup - 1].name}
          </h2>
          <p className="text-slate-400">
            {mockups[selectedMockup - 1].description}
          </p>
        </div>

        {/* Mockup Content */}
        <div className="bg-slate-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {selectedMockup === 1 && <Mockup1 apps={apps} />}
          {selectedMockup === 2 && <Mockup2 apps={apps} />}
          {selectedMockup === 3 && <Mockup3 apps={apps} />}
          {selectedMockup === 4 && <Mockup4 apps={apps} />}
          {selectedMockup === 5 && <Mockup5 apps={apps} />}
        </div>
      </div>
    </div>
  );
}

// Mockup 1: Grid with Status Badges
function Mockup1({ apps }: { apps: typeof apps }) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Your Apps</h3>
        <p className="text-sm text-slate-400">Click any app to launch</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.name}
              className={`relative group rounded-2xl border p-6 transition-all ${
                app.hasAccess
                  ? 'bg-slate-800/50 border-white/10 hover:border-white/20 cursor-pointer hover:scale-[1.02]'
                  : 'bg-slate-900/30 border-white/5 opacity-60'
              }`}
            >
              {/* Access Badge */}
              <div className="absolute top-4 right-4">
                {app.hasAccess ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <Check className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-green-400 font-medium">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
                    <Lock className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-amber-400 font-medium">Locked</span>
                  </div>
                )}
              </div>

              {/* App Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${app.color}20`, border: `2px solid ${app.color}40` }}
              >
                <Icon className="h-7 w-7" style={{ color: app.color }} />
              </div>

              {/* App Info */}
              <h4 className="text-lg font-semibold text-white mb-1">{app.name}</h4>
              <p className="text-sm text-slate-400 mb-4">{app.category}</p>

              {/* Action */}
              {app.hasAccess ? (
                <div className="text-sm text-blue-400 font-medium flex items-center gap-1">
                  Open App
                  <ArrowRight className="h-4 w-4" />
                </div>
              ) : (
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                  Upgrade to Unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mockup 2: Split View Dashboard
function Mockup2({ apps }: { apps: typeof apps }) {
  const ownedApps = apps.filter((app) => app.hasAccess);
  const availableApps = apps.filter((app) => !app.hasAccess);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Owned Apps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-400" />
            Your Apps ({ownedApps.length})
          </h3>
        </div>
        <div className="space-y-3">
          {ownedApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="group bg-slate-800/50 border border-white/10 rounded-xl p-4 hover:border-white/20 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: app.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white">{app.name}</h4>
                    <p className="text-sm text-slate-400">{app.category}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Apps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Available Upgrades ({availableApps.length})
          </h3>
        </div>
        <div className="space-y-3">
          {availableApps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="bg-slate-900/50 border border-white/5 rounded-xl p-4 hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 opacity-50"
                    style={{ backgroundColor: `${app.color}20` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: app.color }} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-white flex items-center gap-2">
                      {app.name}
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                    </h4>
                    <p className="text-sm text-slate-400">{app.category}</p>
                  </div>
                  <button className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Unlock
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Mockup 3: Card List with Progress
function Mockup3({ apps }: { apps: typeof apps }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">All Apps</h3>
          <p className="text-sm text-slate-400">
            {apps.filter((a) => a.hasAccess).length} of {apps.length} apps unlocked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-blue-500"
              style={{ width: `${(apps.filter((a) => a.hasAccess).length / apps.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-400 font-medium">
            {Math.round((apps.filter((a) => a.hasAccess).length / apps.length) * 100)}%
          </span>
        </div>
      </div>

      {apps.map((app) => {
        const Icon = app.icon;
        return (
          <div
            key={app.name}
            className={`relative rounded-xl border p-6 transition-all ${
              app.hasAccess
                ? 'bg-slate-800/50 border-white/10 hover:border-white/20'
                : 'bg-slate-900/30 border-white/5'
            }`}
          >
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  app.hasAccess ? '' : 'opacity-40'
                }`}
                style={{ backgroundColor: `${app.color}20`, border: `2px solid ${app.color}40` }}
              >
                <Icon className="h-8 w-8" style={{ color: app.color }} />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      {app.name}
                      {app.hasAccess && (
                        <Check className="h-4 w-4 text-green-400" />
                      )}
                    </h4>
                    <p className="text-sm text-slate-400">{app.category}</p>
                  </div>
                  <div>
                    {app.hasAccess ? (
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-400 font-medium">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-800 border border-white/10 text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span>✓ AI-powered</span>
                  <span>✓ Cloud sync</span>
                  <span>✓ Mobile apps</span>
                </div>

                {/* Actions */}
                {app.hasAccess ? (
                  <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Open App
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    Unlock Now
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Mockup 4: Compact Tiles
function Mockup4({ apps }: { apps: typeof apps }) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Your Workspace</h3>
        <p className="text-sm text-slate-400">Quick access to all your tools</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.name}
              className={`relative group rounded-xl p-4 transition-all ${
                app.hasAccess
                  ? 'bg-slate-800/50 border border-white/10 hover:border-white/20 hover:scale-105 cursor-pointer'
                  : 'bg-slate-900/30 border border-white/5 opacity-50'
              }`}
            >
              {/* Lock Icon */}
              {!app.hasAccess && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                </div>
              )}

              {/* App Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto"
                style={{ backgroundColor: `${app.color}20` }}
              >
                <Icon className="h-6 w-6" style={{ color: app.color }} />
              </div>

              {/* App Name */}
              <h4 className="text-sm font-semibold text-white text-center mb-1">
                {app.name}
              </h4>
              <p className="text-xs text-slate-400 text-center">{app.category}</p>

              {/* Unlock Button */}
              {!app.hasAccess && (
                <button className="w-full mt-3 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Unlock
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mockup 5: Category Sections
function Mockup5({ apps }: { apps: typeof apps }) {
  const categories = Array.from(new Set(apps.map((app) => app.category)));

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const categoryApps = apps.filter((app) => app.category === category);
        const unlockedCount = categoryApps.filter((app) => app.hasAccess).length;

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                <Grid3x3 className="h-5 w-5 text-blue-400" />
                {category}
                <span className="text-sm text-slate-400 font-normal">
                  ({unlockedCount}/{categoryApps.length} unlocked)
                </span>
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${(unlockedCount / categoryApps.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryApps.map((app) => {
                const Icon = app.icon;
                return (
                  <div
                    key={app.name}
                    className={`relative group rounded-xl border p-5 transition-all ${
                      app.hasAccess
                        ? 'bg-slate-800/50 border-white/10 hover:border-white/20 cursor-pointer'
                        : 'bg-slate-900/30 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          app.hasAccess ? '' : 'opacity-40'
                        }`}
                        style={{ backgroundColor: `${app.color}20` }}
                      >
                        <Icon className="h-6 w-6" style={{ color: app.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white truncate flex items-center gap-2">
                          {app.name}
                          {app.hasAccess ? (
                            <Check className="h-3.5 w-3.5 text-green-400 flex-shrink-0" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
                          )}
                        </h4>
                        {app.hasAccess ? (
                          <span className="text-xs text-green-400 font-medium">Ready to use</span>
                        ) : (
                          <button className="text-xs text-purple-400 font-medium hover:text-purple-300 transition-colors">
                            Upgrade to unlock →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
