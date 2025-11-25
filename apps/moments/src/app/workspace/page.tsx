'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { Moment } from '@ainexsuite/types';
import { TimelineView } from '@/components/timeline-view';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { MomentComposer } from '@/components/moment-composer';
import { useMomentsStore } from '@/lib/store';
import { MomentsSpaceSwitcher } from '@/components/moments-space-switcher';
import { SpaceSettingsModal } from '@/components/space-settings-modal';
import { FlashbackWidget } from '@/components/flashback-widget';
import { TriviaGame } from '@/components/trivia-game';
import { FlipbookPlayer } from '@/components/flipbook-player';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { Image as ImageIcon, Loader2, Settings, Gamepad2, Play, Book } from 'lucide-react';

function MomentsWorkspaceContent() {
  const { user, loading: authLoading, bootstrapStatus } = useAuth();
  const router = useRouter();

  const {
    moments,
    isLoadingMoments,
    fetchSpaces,
    fetchMoments,
    currentSpaceId,
    spaces
  } = useMomentsStore();

  const [showEditor, setShowEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [detailMoment, setDetailMoment] = useState<Moment | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const currentSpace = spaces.find(s => s.id === currentSpaceId);

  // Initial Data Load
  useEffect(() => {
    if (user?.uid) {
      fetchSpaces(user.uid);
    }
  }, [user?.uid, fetchSpaces]);

  // Fetch moments when space changes
  useEffect(() => {
    if (user?.uid) {
      fetchMoments(currentSpaceId || undefined);
    }
  }, [currentSpaceId, fetchMoments, user?.uid]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      const { auth } = await import('@ainexsuite/firebase');
      const firebaseAuth = await import('firebase/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (firebaseAuth as any).signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleUpdate = async () => {
    fetchMoments(currentSpaceId || undefined);
    setShowEditor(false);
    setSelectedMoment(null);
  };

  const allTags = Array.from(new Set(moments.flatMap((m) => m.tags || []))).sort();
  const filteredMoments = selectedTag ? moments.filter((m) => m.tags?.includes(selectedTag)) : moments;

  // Show loading while authenticating or bootstrapping
  if (authLoading || bootstrapStatus === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WorkspaceLayout
      user={user}
      onSignOut={handleSignOut}
      searchPlaceholder="Search moments..."
      appName="Moments"
    >
      <div className="max-w-7xl mx-auto">
        {/* Two-column layout like Journey */}
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-8">
          {/* Left Column: Main Content */}
          <div className="space-y-6">
            {/* Composer - Entry point like Journey */}
            <MomentComposer
              spaceId={currentSpaceId || undefined}
              onMomentCreated={handleUpdate}
            />

            {/* Space Controls & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MomentsSpaceSwitcher userId={user.uid} />
                {currentSpace && (
                  <>
                    <button
                      onClick={() => setShowFlipbook(true)}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      title="View as Flipbook"
                    >
                      <Book className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowSlideshow(true)}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      title="Play Slideshow"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowGame(true)}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      title="Play Trivia"
                    >
                      <Gamepad2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      title="Space Settings"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      !selectedTag
                        ? 'bg-pink-500 text-white'
                        : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                    }`}
                  >
                    All
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedTag === tag
                          ? 'bg-pink-500 text-white'
                          : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Flashback shown inline */}
            {!selectedTag && !isLoadingMoments && moments.length > 0 && (
              <div className="xl:hidden">
                <FlashbackWidget onDetail={setDetailMoment} />
              </div>
            )}

            {/* Moments Content */}
            {isLoadingMoments ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
              </div>
            ) : filteredMoments.length === 0 ? (
              <div className="text-center py-20 space-y-4 rounded-2xl bg-surface-elevated border border-outline-subtle">
                <ImageIcon className="h-16 w-16 text-text-muted mx-auto" />
                <p className="text-text-muted">
                  {selectedTag
                    ? `No moments with tag "${selectedTag}"`
                    : 'No moments yet. Start capturing your memories!'}
                </p>
              </div>
            ) : (
              <TimelineView
                moments={filteredMoments}
                onEdit={(moment) => {
                  setSelectedMoment(moment);
                  setShowEditor(true);
                }}
                onDetail={(moment) => setDetailMoment(moment)}
              />
            )}
          </div>

          {/* Right Column: Sidebar (visible on xl screens) */}
          <div className="sticky top-28 hidden h-fit flex-col gap-6 xl:flex">
            {!selectedTag && !isLoadingMoments && moments.length > 0 && (
              <FlashbackWidget onDetail={setDetailMoment} />
            )}

            {/* Stats Card */}
            <div className="rounded-2xl bg-surface-elevated border border-outline-subtle p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Your Moments</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{moments.length}</p>
                  <p className="text-xs text-text-muted">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{allTags.length}</p>
                  <p className="text-xs text-text-muted">Tags</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">{spaces.length}</p>
                  <p className="text-xs text-text-muted">Spaces</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-pink-500">
                    {moments.filter(m => {
                      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                      return m.date > weekAgo;
                    }).length}
                  </p>
                  <p className="text-xs text-text-muted">This Week</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {currentSpace && (
              <div className="rounded-2xl bg-surface-elevated border border-outline-subtle p-5">
                <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowFlipbook(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Book className="h-4 w-4 text-pink-500" />
                    View Flipbook
                  </button>
                  <button
                    onClick={() => setShowSlideshow(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Play className="h-4 w-4 text-pink-500" />
                    Play Slideshow
                  </button>
                  <button
                    onClick={() => setShowGame(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Gamepad2 className="h-4 w-4 text-pink-500" />
                    Memory Trivia
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                  >
                    <Settings className="h-4 w-4 text-pink-500" />
                    Space Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditor && (
        <PhotoEditor
          moment={selectedMoment}
          spaceId={currentSpaceId || undefined}
          onClose={() => {
            setShowEditor(false);
            setSelectedMoment(null);
          }}
          onSave={handleUpdate}
        />
      )}

      {detailMoment && (
        <PhotoDetail
          moment={detailMoment}
          onClose={() => setDetailMoment(null)}
          onEdit={() => {
            setSelectedMoment(detailMoment);
            setDetailMoment(null);
            setShowEditor(true);
          }}
        />
      )}

      {showSettings && currentSpace && (
        <SpaceSettingsModal
          space={currentSpace}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showGame && (
        <TriviaGame
          moments={moments}
          onClose={() => setShowGame(false)}
        />
      )}

      {showSlideshow && (
        <SlideshowPlayer
          moments={filteredMoments}
          onClose={() => setShowSlideshow(false)}
        />
      )}

      {showFlipbook && (
        <FlipbookPlayer
          moments={filteredMoments}
          onClose={() => setShowFlipbook(false)}
        />
      )}
    </WorkspaceLayout>
  );
}

export default function MomentsWorkspacePage() {
  return (
    <SuiteGuard appName="moments">
      <MomentsWorkspaceContent />
    </SuiteGuard>
  );
}
