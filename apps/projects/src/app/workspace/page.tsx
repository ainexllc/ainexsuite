'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@ainexsuite/auth';
import { AinexStudiosLogo } from '@/components/branding/ainex-studios-logo';
import { Loader2, Search, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { auth } from '@ainexsuite/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

export default function WorkspacePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dark relative isolate min-h-screen overflow-x-hidden bg-[#050505] text-white">
      {/* Atmospheric glows */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-[150px]"
        style={{
          backgroundColor: 'rgba(56, 189, 248, 0.35)'
        }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-[-12%] h-[460px] w-[460px] rounded-full blur-[160px]"
        style={{
          backgroundColor: 'rgba(14, 165, 233, 0.25)'
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Fixed Top Navigation - Same as main app */}
        <header
          className="fixed inset-x-0 top-0 z-30 backdrop-blur-2xl transition-colors border-b"
          style={{
            backgroundColor: 'rgba(5, 5, 5, 0.95)',
            borderColor: 'rgba(56, 189, 248, 0.2)',
            boxShadow: '0 8px 30px -12px rgba(56, 189, 248, 0.3)'
          }}
        >
          <div className="mx-auto flex h-16 w-full max-w-7xl 2xl:max-w-[1440px] items-center px-4 sm:px-6">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 shadow-sm transition hover:bg-white/10"
                aria-label="Toggle navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden sm:block">
                <AinexStudiosLogo size="sm" align="start" asLink={true} />
              </div>
            </div>

            {/* Center: Search bar */}
            <div className="mx-4 flex flex-1 items-center gap-2 rounded-full bg-white/5 px-3 py-1 shadow-sm transition hover:bg-white/10 max-w-2xl h-9">
              <Search className="h-4 w-4 text-white/50 shrink-0" aria-hidden />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white/70 shrink-0"
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
                className="flex h-9 w-9 items-center justify-center rounded-lg shadow-sm transition-all"
                style={{
                  backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  color: '#7dd3fc'
                }}
                aria-label="AI Assistant"
              >
                <Sparkles className="h-4 w-4" />
              </button>

              {/* Profile Dropdown Button */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 h-9 rounded-full bg-white/5 text-white/70 shadow-sm transition hover:bg-white/10 px-2"
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
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                      {user.displayName
                        ? user.displayName
                            .split(' ')
                            .map((part) => part.charAt(0))
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : (user.email?.charAt(0).toUpperCase() ?? 'U')}
                    </span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                </button>

                {/* Simple Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-white/10 bg-[#0a0a0a] shadow-xl z-20">
                      <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{user.displayName || 'User'}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            // Settings functionality here
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          Settings
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleSignOut();
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 transition hover:bg-white/10"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Empty workspace area */}
        <main className="flex-1 overflow-x-hidden pt-16">
          <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Welcome Section */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome to Projects, {user.displayName || 'there'}! 👋
              </h2>
              <p className="text-lg text-white/70">
                Your project workspace is ready for development
              </p>
            </div>

            {/* Empty Workspace Area */}
            <div className="min-h-[600px] rounded-xl border border-white/10 bg-white/5 backdrop-blur p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Workspace Ready</h3>
                <p className="text-white/60">
                  This workspace area is ready for future development. The top navigation matches the main app exactly.
                </p>
                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    Projects App - Development Mode
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
