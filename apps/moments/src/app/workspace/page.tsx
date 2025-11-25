'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { Moment } from '@ainexsuite/types';
import { TimelineView } from '@/components/timeline-view';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { AIAssistant } from '@/components/ai-assistant';
import { useMomentsStore } from '@/lib/store';
import { MomentsSpaceSwitcher } from '@/components/moments-space-switcher';
import { SpaceSettingsModal } from '@/components/space-settings-modal';
import { FlashbackWidget } from '@/components/flashback-widget';
import { TriviaGame } from '@/components/trivia-game';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { Plus, Image as ImageIcon, Loader2, Settings, Gamepad2, Play } from 'lucide-react';

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
      // fetchMoments handles undefined spaceId correctly (fetches personal)
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
        <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <MomentsSpaceSwitcher userId={user.uid} />
            {currentSpace && (
              <>
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
          
          {/* Filter Bar */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  !selectedTag
                    ? 'bg-accent-500 text-white'
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
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-elevated text-text-muted hover:bg-surface-hover'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {!selectedTag && !isLoadingMoments && moments.length > 0 && (
          <FlashbackWidget onDetail={setDetailMoment} />
        )}

        {isLoadingMoments ? (
           <div className="flex items-center justify-center py-20">
             <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
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

      <button
        onClick={() => {
          setSelectedMoment(null);
          setShowEditor(true);
        }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        type="button"
        aria-label="Add moment"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

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

      <AIAssistant />
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