'use client';

import { Menu, ChevronDown, Sparkles, Bell, Search } from 'lucide-react';

/**
 * TopNav Mockup Section - Shows the shared top navigation in light and dark mode
 */
export function TopNavSection() {
  return (
    <div className="space-y-8">
      {/* TopNav Full Preview */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Full TopNav</h4>
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Mock TopNav */}
          <div className="relative h-16 backdrop-blur-2xl bg-background/95 border-b border-border shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]">
            <div className="mx-auto flex h-full w-full items-center px-4 sm:px-6" style={{ maxWidth: '1280px' }}>
              {/* Left: Hamburger + Logo */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 shadow-sm transition hover:bg-muted text-foreground"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[var(--color-primary,#f97316)] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="font-semibold text-foreground">AinexSpace</span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="ml-auto flex items-center gap-2">
                {/* Search Button */}
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Search className="h-4 w-4" />
                </button>

                {/* AI Button */}
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground relative"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">3</span>
                </button>

                {/* Profile Button */}
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 rounded-full bg-muted/80 text-foreground shadow-sm transition hover:bg-muted px-2"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary,#f97316)] text-white text-xs font-semibold">
                    JD
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Components */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Individual Elements</h4>
        <div className="flex flex-wrap items-center gap-4">
          {/* Menu Button */}
          <div className="text-center">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 shadow-sm transition hover:bg-muted text-foreground"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-xs text-muted-foreground mt-2">Menu</p>
          </div>

          {/* AI Button */}
          <div className="text-center">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground mt-2">AI</p>
          </div>

          {/* Profile with initials */}
          <div className="text-center">
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full bg-muted/80 text-foreground shadow-sm transition hover:bg-muted px-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary,#f97316)] text-white text-xs font-semibold">
                JD
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground mt-2">Profile (Initials)</p>
          </div>

          {/* Profile with avatar */}
          <div className="text-center">
            <button
              type="button"
              className="flex items-center gap-2 h-9 rounded-full bg-muted/80 text-foreground shadow-sm transition hover:bg-muted px-2"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground mt-2">Profile (Avatar)</p>
          </div>
        </div>
      </div>

      {/* App Branding Variants */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">App Branding Colors</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Main', color: '#f97316' },
            { name: 'Notes', color: '#eab308' },
            { name: 'Journey', color: '#f97316' },
            { name: 'Todo', color: '#8b5cf6' },
            { name: 'Health', color: '#10b981' },
            { name: 'Moments', color: '#ec4899' },
            { name: 'Grow', color: '#14b8a6' },
            { name: 'Pulse', color: '#ef4444' },
          ].map((app) => (
            <div key={app.name} className="flex items-center gap-2 p-2 rounded-lg bg-surface-muted">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: app.color }}
              >
                {app.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.color}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glassmorphism Effect Demo */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Backdrop Blur Effect</h4>
        <div className="relative h-32 rounded-xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-20 h-20 rounded-full bg-white" />
            <div className="absolute bottom-4 right-12 w-16 h-16 rounded-full bg-yellow-300" />
            <div className="absolute top-8 right-8 w-12 h-12 rounded-full bg-blue-400" />
          </div>

          {/* TopNav overlay */}
          <div className="absolute top-0 left-0 right-0 h-16 backdrop-blur-2xl bg-background/80 border-b border-border/50 flex items-center px-4 gap-3">
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 text-foreground">
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold text-foreground">Glassmorphism Nav</span>
            <div className="ml-auto flex items-center gap-2">
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
