'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Menu, X, Search, Sparkles, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { AtmosphericGlows } from '../components/layouts/atmospheric-glows';
import { AinexStudiosLogo } from '../components/branding/ainex-studios-logo';
import { ProfileSidebar } from '../components/layout/profile-sidebar';
import { WelcomeHeader } from '../components/layouts/welcome-header';
import { NavigationPanel, type NavSection } from '../components/layout/navigation-panel';
import { ActivityPanel } from '../components/layout/activity-panel';

interface WorkspacePageProps {
  user: { displayName?: string | null; photoURL?: string | null; email?: string | null } | null;
  loading: boolean;
  appName: string;
  appColor: string;
  searchPlaceholder?: string;
  children: React.ReactNode;
  navSections?: NavSection[];
  onNavigationToggle?: (isOpen: boolean) => void;
  onActivityToggle?: (view: 'activity' | 'settings' | 'ai-assistant' | null) => void;
}

/**
 * WorkspacePage Template
 * ...
 */
export function WorkspacePage({
  user,
  loading,
  appName,
  appColor,
  searchPlaceholder = "Search...",
  children,
  navSections = [],
  onNavigationToggle,
  onActivityToggle,
}: WorkspacePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'activity' | 'settings' | 'ai-assistant' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Handle navigation panel toggle
  const handleNavToggle = (open: boolean) => {
    setIsNavOpen(open);
    onNavigationToggle?.(open);
  };

  // Handle activity panel toggle
  const handleActivityToggle = (view: 'activity' | 'settings' | 'ai-assistant' | null) => {
    setActivePanel(view);
    onActivityToggle?.(view);
  };

  // Escape key handler for panels
  useEffect(() => {
    if (!isNavOpen && !activePanel) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activePanel) {
          handleActivityToggle(null);
        } else if (isNavOpen) {
          handleNavToggle(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavOpen, activePanel]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch {
      // Sign out failed - ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      {/* Atmospheric glows with app-specific colors */}
      <AtmosphericGlows primaryColor={appColor} />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Fixed Top Navigation */}
        <header
          className="fixed inset-x-0 top-0 z-30 backdrop-blur-2xl transition-colors border-b"
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.95)',
            borderColor: `${appColor}33`, // 20% opacity
            boxShadow: `0 8px 30px -12px ${appColor}4d` // 30% opacity
          }}
        >
          <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleNavToggle(!isNavOpen)}
                className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg bg-foreground/5 shadow-sm transition hover:bg-foreground/10"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <AinexStudiosLogo size="sm" align="center" asLink={true} appName={appName} />
              </div>
            </div>

            {/* Center: Search bar */}
            <div className="mx-4 flex flex-1 items-center gap-2 rounded-full bg-foreground/5 px-3 py-1 shadow-sm transition hover:bg-foreground/10 max-w-2xl h-9">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground/70 shrink-0"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Right: Actions */}
            <div className="ml-auto flex items-center gap-2">
              {/* AI Assistant Button */}
              <button
                type="button"
                onClick={() => handleActivityToggle(activePanel === 'ai-assistant' ? null : 'ai-assistant')}
                className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all"
                style={{
                  backgroundColor: `${appColor}26`, // 15% opacity
                  color: appColor
                }}
                aria-label="AI Assistant"
              >
                <Sparkles className="h-4 w-4" />
              </button>

              {/* Profile Sidebar Toggle */}
              <button
                type="button"
                className="flex items-center gap-2 h-9 rounded-full bg-foreground/5 text-muted-foreground shadow-sm transition hover:bg-foreground/10 px-2"
                aria-label="Profile menu"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName ?? user.email ?? 'Account'}
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                    sizes="28px"
                  />
                ) : (
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-foreground"
                    style={{ backgroundColor: appColor }}
                  >
                    {user.displayName
                      ? user.displayName
                          .split(' ')
                          .map((part: string) => part.charAt(0))
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()
                      : (user.email?.charAt(0).toUpperCase() ?? 'U')}
                  </span>
                )}
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </header>

        {/* Profile Sidebar */}
        <ProfileSidebar
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onSignOut={handleSignOut}
          onSettingsClick={() => handleActivityToggle('settings')}
          onActivityClick={() => handleActivityToggle('activity')}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden pt-16">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <section className="space-y-6">
              {/* Welcome Header */}
              <WelcomeHeader
                userName={user.displayName ? user.displayName.split(' ')[0] : 'there'}
                appName={appName}
              />

              {/* App-specific content slot */}
              {children}
            </section>
          </div>
        </main>

        {/* Navigation overlay panel */}
        {isNavOpen && (
          <div
            className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
            onClick={() => handleNavToggle(false)}
          />
        )}
        <NavigationPanel
          isOpen={isNavOpen}
          onClose={() => handleNavToggle(false)}
          sections={navSections}
          pathname={pathname || '/'}
        />

        {/* Right panel overlay */}
        {activePanel && (
          <div
            className="fixed inset-0 z-30 bg-overlay/60 backdrop-blur-sm"
            onClick={() => handleActivityToggle(null)}
          />
        )}
        <ActivityPanel
          isOpen={!!activePanel}
          activeView={activePanel}
          onClose={() => handleActivityToggle(null)}
        />
      </div>
    </div>
  );
}
