'use client';

import { useEffect, useState, useMemo } from 'react';
import { useWorkspaceAuth } from '@ainexsuite/auth';
import type { Moment } from '@ainexsuite/types';
import { EmptyState, WorkspacePageLayout } from '@ainexsuite/ui';
import { TimelineView } from '@/components/timeline-view';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { MomentComposer } from '@/components/moment-composer';
import { useMomentsStore } from '@/lib/store';
import { SpaceSettingsModal } from '@/components/space-settings-modal';
import { FlashbackWidget } from '@/components/flashback-widget';
import { TriviaGame } from '@/components/trivia-game';
import { FlipbookPlayer } from '@/components/flipbook-player';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { Image as ImageIcon, Loader2, Settings, Gamepad2, Play, Book, Share2 } from 'lucide-react';

export default function MomentsWorkspacePage() {
  const { user } = useWorkspaceAuth();

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

  // Convert spaces to SpaceItem format for WorkspacePageLayout
  const spacesConfig = useMemo(() => ({
    items: spaces.map((space) => ({
      id: space.id,
      name: space.name,
      type: space.type,
      color: space.type === 'personal' ? '#ec4899' : '#8b5cf6',
    })),
    currentSpaceId,
    onSpaceChange: (spaceId: string) => {
      const store = useMomentsStore.getState();
      store.setCurrentSpace(spaceId);
    },
  }), [spaces, currentSpaceId]);

  if (!user) return null;

  return (
    <>
      <WorkspacePageLayout
        composer={
          <MomentComposer
            spaceId={currentSpaceId || undefined}
            onMomentCreated={handleUpdate}
          />
        }
        spaces={spacesConfig}
      >
        {/* Space Controls & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
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

        {/* Flashback Widget - Full Width */}
        {!selectedTag && !isLoadingMoments && moments.length > 0 && (
          <FlashbackWidget onDetail={setDetailMoment} />
        )}

        {/* Moments Content */}
        {isLoadingMoments ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : filteredMoments.length === 0 ? (
          <EmptyState
            title={selectedTag ? `No moments with tag "${selectedTag}"` : "No moments yet"}
            description={selectedTag ? "Try selecting a different tag or create a new moment" : "Start capturing your memories! Create your first moment above."}
            icon={ImageIcon}
            variant="default"
          />
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
      </WorkspacePageLayout>

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
    </>
  );
}