'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { WorkspaceLayout } from '@ainexsuite/ui/components';
import { useRouter } from 'next/navigation';
import type { Moment } from '@ainexsuite/types';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { AIAssistant } from '@/components/ai-assistant';
import { getMoments } from '@/lib/moments';
import { Plus, Image as ImageIcon, Loader2 } from 'lucide-react';

function MomentsWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);
  const [detailMoment, setDetailMoment] = useState<Moment | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadMoments = async () => {
      setLoading(true);
      try {
        const data = await getMoments();
        setMoments(data);
      } catch (error) {
        console.error('Failed to load moments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMoments();
  }, [user]);

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
    if (!user) return;
    const data = await getMoments();
    setMoments(data);
    setShowEditor(false);
    setSelectedMoment(null);
  };

  const allTags = Array.from(new Set(moments.flatMap((m) => m.tags || []))).sort();
  const filteredMoments = selectedTag ? moments.filter((m) => m.tags?.includes(selectedTag)) : moments;

  if (authLoading || loading) {
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
        {/* Filter Bar */}
        {allTags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
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

        {filteredMoments.length === 0 ? (
          <div className="text-center py-20 space-y-4 rounded-2xl bg-surface-elevated border border-outline-subtle">
            <ImageIcon className="h-16 w-16 text-text-muted mx-auto" />
            <p className="text-text-muted">
              {selectedTag
                ? `No moments with tag "${selectedTag}"`
                : 'No moments yet. Start capturing your memories!'}
            </p>
          </div>
        ) : (
          <PhotoGrid
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