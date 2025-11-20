'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import { useRouter } from 'next/navigation';
import type { Moment } from '@ainexsuite/types';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { AIAssistant } from '@/components/ai-assistant';
import { TopNav } from '@/components/top-nav';
import { getMoments } from '@/lib/moments';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen surface-base">
      <TopNav
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        tags={allTags}
        onAddMoment={() => {
          setSelectedMoment(null);
          setShowEditor(true);
        }}
      />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
      </main>

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
    </div>
  );
}

export default function MomentsWorkspacePage() {
  return (
    <SuiteGuard appName="moments">
      <MomentsWorkspaceContent />
    </SuiteGuard>
  );
}