'use client';

import { useEffect, useState } from 'react';
import { useWorkspaceAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout, WorkspaceLoadingScreen } from '@ainexsuite/ui';
import type { Moment } from '@ainexsuite/types';
import { TimelineView } from '@/components/timeline-view';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { MomentComposer } from '@/components/moment-composer';
import { useMomentsStore } from '@/lib/store';
import { SpaceSwitcher } from '@/components/spaces';
import { SpaceSettingsModal } from '@/components/space-settings-modal';
import { FlashbackWidget } from '@/components/flashback-widget';
import { TriviaGame } from '@/components/trivia-game';
import { MomentsInsights } from '@/components/moments-insights';
import { FlipbookPlayer } from '@/components/flipbook-player';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { Image as ImageIcon, Loader2, Settings, Gamepad2, Play, Book, Share2 } from 'lucide-react';

function MomentsWorkspaceContent() {
  const { user, isLoading, isReady, handleSignOut } = useWorkspaceAuth();

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


  const handleUpdate = async () => {
    fetchMoments(currentSpaceId || undefined);
    setShowEditor(false);
    setSelectedMoment(null);
  };

  const allTags = Array.from(new Set(moments.flatMap((m) => m.tags || []))).sort();
  const filteredMoments = selectedTag ? moments.filter((m) => m.tags?.includes(selectedTag)) : moments;

  // Show standardized loading screen
  if (isLoading) {
    return <WorkspaceLoadingScreen />;
  }

  // Return null while redirecting
  if (!isReady || !user) {
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
                <SpaceSwitcher />
                
                {/* View Options - Always Available */}
                <button
                  onClick={() => setShowFlipbook(true)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="View as Flipbook"
                  disabled={filteredMoments.length === 0}
                >
                  <Book className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowSlideshow(true)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Play Slideshow"
                  disabled={filteredMoments.length === 0}
                >
                  <Play className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowGame(true)}
                  className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                  title="Play Trivia"
                  disabled={filteredMoments.length === 0}
                >
                  <Gamepad2 className="h-5 w-5" />
                </button>

                {/* Space Specific Controls */}
                {currentSpace && (
                  <>
                    <div className="w-px h-6 bg-outline-subtle mx-1" />
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-2 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors"
                      title="Share Space"
                    >
                      <Share2 className="h-5 w-5" />
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

            {/* AI Insights */}
            <MomentsInsights moments={moments} variant="sidebar" />

            {/* Quick Actions */}
            <div className="rounded-2xl bg-surface-elevated border border-outline-subtle p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowFlipbook(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
                  disabled={filteredMoments.length === 0}
                >
                  <Book className="h-4 w-4 text-pink-500" />
                  View Flipbook
                </button>
                <button
                  onClick={() => setShowSlideshow(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
                  disabled={filteredMoments.length === 0}
                >
                  <Play className="h-4 w-4 text-pink-500" />
                  Play Slideshow
                </button>
                <button
                  onClick={() => setShowGame(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors disabled:opacity-50"
                  disabled={filteredMoments.length === 0}
                >
                  <Gamepad2 className="h-4 w-4 text-pink-500" />
                  Memory Trivia
                </button>
                
                {currentSpace && (
                  <>
                    <div className="h-px bg-outline-subtle my-2" />
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-pink-500" />
                      Share Space
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:bg-surface-hover transition-colors"
                    >
                      <Settings className="h-4 w-4 text-pink-500" />
                      Space Settings
                    </button>
                  </>
                )}
              </div>
            </div>
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
