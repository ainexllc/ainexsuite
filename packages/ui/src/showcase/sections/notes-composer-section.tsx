'use client';

import { useState } from 'react';
import {
  CheckSquare,
  Image as ImageIcon,
  Calendar,
  Calculator,
  Palette,
  Pin,
  BellRing,
  Tag,
  User,
  Users,
  Briefcase,
  Heart,
  ChevronDown,
  Plus,
  Sparkles,
} from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Notes App Composer + SpaceSwitcher Mockup Section
 * Shows the note creation interface with space selector in light and dark mode
 */
export function NotesComposerSection() {
  const [expanded, setExpanded] = useState(true);
  const [spaceOpen, setSpaceOpen] = useState(false);

  // Mock spaces
  const spaces = [
    { id: '1', name: 'Personal Notes', type: 'personal' as const },
    { id: '2', name: 'Work Projects', type: 'work' as const },
    { id: '3', name: 'Family', type: 'family' as const },
  ];

  const currentSpace = spaces[0];

  const spaceIcons = {
    personal: User,
    work: Briefcase,
    family: Users,
    couple: Heart,
  };

  return (
    <div className="space-y-8">
      {/* Full Layout: Composer + SpaceSwitcher */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Notes Entry Layout</h4>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Note Composer - Left Side */}
          <div className="flex-1 min-w-0">
            {!expanded ? (
              /* Collapsed State */
              <button
                type="button"
                className="flex w-full items-center rounded-2xl border border-border bg-muted/30 px-5 py-4 text-left text-sm text-muted-foreground shadow-sm transition hover:bg-muted/50 hover:border-border/80 backdrop-blur-sm"
                onClick={() => setExpanded(true)}
              >
                <span>Take a note...</span>
              </button>
            ) : (
              /* Expanded State */
              <div className="w-full rounded-2xl shadow-xl bg-card border border-border backdrop-blur-xl">
                <div className="flex flex-col gap-3 px-5 py-4">
                  {/* Title Row */}
                  <div className="flex items-start gap-3">
                    <input
                      placeholder="Title"
                      className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
                      defaultValue="Meeting Notes"
                    />
                    <button
                      type="button"
                      className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body Textarea */}
                  <div className="relative">
                    <textarea
                      placeholder="What's on your mind?..."
                      rows={4}
                      className="min-h-[100px] w-full resize-none bg-transparent text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed pr-10"
                      defaultValue="Remember to follow up on the project timeline and send the weekly report to the team."
                    />
                    <button
                      type="button"
                      className="absolute bottom-2 right-0 p-1.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                      title="Enhance with AI"
                    >
                      <Sparkles className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      {[
                        { icon: CheckSquare, label: 'Checklist' },
                        { icon: ImageIcon, label: 'Image' },
                        { icon: Palette, label: 'Color' },
                        { icon: Tag, label: 'Labels' },
                        { icon: BellRing, label: 'Reminder' },
                        { icon: Calendar, label: 'Date' },
                        { icon: Calculator, label: 'Calculator' },
                      ].map(({ icon: Icon, label }) => (
                        <button
                          key={label}
                          type="button"
                          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={label}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setExpanded(false)}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Space Switcher - Right Side */}
          <div className="flex-shrink-0 md:w-[240px]">
            <div className="relative">
              <button
                onClick={() => setSpaceOpen(!spaceOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-all w-full min-w-[180px]"
              >
                <div className="h-8 w-8 rounded-md flex items-center justify-center text-primary-foreground flex-shrink-0 bg-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-foreground leading-none truncate">
                    {currentSpace.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize truncate">
                    {currentSpace.type}
                  </p>
                </div>
                <ChevronDown className={clsx('h-4 w-4 text-muted-foreground flex-shrink-0 transition-all', spaceOpen && 'rotate-180')} />
              </button>

              {/* Dropdown Preview */}
              {spaceOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setSpaceOpen(false)} />
                  <div className="absolute top-full left-0 min-w-full w-max max-w-sm mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="p-1">
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                        Spaces
                      </div>

                      {spaces.map((space) => {
                        const Icon = spaceIcons[space.type as keyof typeof spaceIcons] || User;
                        const isActive = currentSpace.id === space.id;

                        return (
                          <button
                            key={space.id}
                            onClick={() => setSpaceOpen(false)}
                            className={clsx(
                              'flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-all',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{space.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-border p-1">
                      <button className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-primary hover:bg-muted transition-all">
                        <Plus className="h-4 w-4" />
                        Create New Space
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed Note Composer */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Collapsed State</h4>
        <button
          type="button"
          className="flex w-full max-w-md items-center rounded-2xl border border-border bg-muted/30 px-5 py-4 text-left text-sm text-muted-foreground shadow-sm transition hover:bg-muted/50 hover:border-border/80 backdrop-blur-sm"
        >
          <span>Take a note...</span>
        </button>
      </div>

      {/* Note Color Variants */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Note Color Options</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'default', label: 'Default', class: 'bg-card border-border' },
            { id: 'white', label: 'White', class: 'bg-white border-gray-200' },
            { id: 'lemon', label: 'Lemon', class: 'bg-yellow-100 border-yellow-200' },
            { id: 'peach', label: 'Peach', class: 'bg-orange-100 border-orange-200' },
            { id: 'tangerine', label: 'Tangerine', class: 'bg-orange-200 border-orange-300' },
            { id: 'mint', label: 'Mint', class: 'bg-green-100 border-green-200' },
            { id: 'fog', label: 'Fog', class: 'bg-gray-100 border-gray-200' },
            { id: 'lavender', label: 'Lavender', class: 'bg-purple-100 border-purple-200' },
            { id: 'blush', label: 'Blush', class: 'bg-pink-100 border-pink-200' },
            { id: 'sky', label: 'Sky', class: 'bg-blue-100 border-blue-200' },
            { id: 'moss', label: 'Moss', class: 'bg-emerald-100 border-emerald-200' },
            { id: 'coal', label: 'Coal', class: 'bg-gray-800 border-gray-700' },
          ].map((color) => (
            <div
              key={color.id}
              className={clsx(
                'w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition hover:scale-105',
                color.class
              )}
              title={color.label}
            >
              <span className={clsx('text-xs font-medium', color.id === 'coal' ? 'text-white' : 'text-gray-600')}>
                {color.label[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Space Type Icons */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Space Type Icons</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { type: 'personal', icon: User, label: 'Personal' },
            { type: 'family', icon: Users, label: 'Family' },
            { type: 'work', icon: Briefcase, label: 'Work' },
            { type: 'couple', icon: Heart, label: 'Couple' },
          ].map(({ type, icon: Icon, label }) => (
            <div key={type} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="h-8 w-8 rounded-md flex items-center justify-center bg-primary text-primary-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar Icons Showcase */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-4">Composer Toolbar Icons</h4>
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border">
          {[
            { icon: CheckSquare, label: 'Checklist', active: false },
            { icon: ImageIcon, label: 'Image', active: false },
            { icon: Palette, label: 'Color', active: true },
            { icon: Tag, label: 'Labels', active: false },
            { icon: BellRing, label: 'Reminder', active: false },
            { icon: Calendar, label: 'Date', active: false },
            { icon: Calculator, label: 'Calculator', active: false },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              type="button"
              className={clsx(
                'p-2 rounded-full transition-colors',
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
