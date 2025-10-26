'use client';

import { useEffect, useState } from 'react';
import { useAuth, SuiteGuard } from '@ainexsuite/auth';
import type { Moment } from '@ainexsuite/types';
import { TopNav } from '@/components/top-nav';
import { PhotoGrid } from '@/components/photo-grid';
import { PhotoEditor } from '@/components/photo-editor';
import { PhotoDetail } from '@/components/photo-detail';
import { AIAssistant } from '@/components/ai-assistant';
import { getMoments } from '@/lib/moments';
import { Plus, Image as ImageIcon } from 'lucide-react';

function MomentsWorkspaceContent() {
  const { user, loading: authLoading } = useAuth();
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

    void loadMoments();
  }, [user]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-ink-600">Loading moments...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ImageIcon className="h-16 w-16 text-ink-600 mx-auto" />
          <p className="text-ink-600">Please sign in to view your moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopNav selectedTag={selectedTag} onSelectTag={setSelectedTag} tags={allTags} />

      <main className="max-w-7xl mx-auto pb-20">
        {filteredMoments.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ImageIcon className="h-16 w-16 text-ink-600 mx-auto" />
            <p className="text-ink-600">
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
      </main>

      <button
        onClick={() => {
          setSelectedMoment(null);
          setShowEditor(true);
        }}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-accent-500 hover:bg-accent-600 shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
        type="button"
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

