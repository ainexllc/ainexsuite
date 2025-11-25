'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, LogOut, ShieldCheck, Play } from 'lucide-react';
import { AinexStudiosLogo } from '@ainexsuite/ui/components';
import { TimelineView } from '@/components/timeline-view';
import { PhotoDetail } from '@/components/photo-detail';
import { SlideshowPlayer } from '@/components/slideshow-player';
import { useMomentsStore } from '@/lib/store';
import type { Moment } from '@ainexsuite/types';

export default function SharedSpacePage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.spaceId as string;
  
  const { 
    guestAccessSpace, 
    setGuestSpace, 
    fetchMoments, 
    moments, 
    isLoadingMoments 
  } = useMomentsStore();
  
  const [detailMoment, setDetailMoment] = useState<Moment | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);

  // Verify access
  useEffect(() => {
    if (!guestAccessSpace || guestAccessSpace.id !== spaceId) {
      router.push('/join');
    } else {
      fetchMoments(spaceId);
    }
  }, [guestAccessSpace, spaceId, fetchMoments, router]);

  const handleExit = () => {
    setGuestSpace(null);
    router.push('/join');
  };

  if (!guestAccessSpace || guestAccessSpace.id !== spaceId) {
    return null; // Redirecting
  }

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-outline-subtle bg-surface-base/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AinexStudiosLogo size="sm" align="center" appName="MOMENTS" appColor="#ec4899" />
            <div className="h-4 w-px bg-outline-subtle" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-text-primary">{guestAccessSpace.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSlideshow(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-primary bg-surface-elevated hover:bg-surface-hover transition-colors"
            >
              <Play className="h-4 w-4" />
              Slideshow
            </button>
            <button
              onClick={handleExit}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoadingMoments ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent-500" />
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-20 rounded-2xl bg-surface-elevated border border-outline-subtle">
            <p className="text-text-muted">This album is empty.</p>
          </div>
        ) : (
          <TimelineView
            moments={moments}
            onDetail={(moment) => setDetailMoment(moment)}
          />
        )}
      </main>

      {detailMoment && (
        <PhotoDetail
          moment={detailMoment}
          onClose={() => setDetailMoment(null)}
          // No onEdit prop for guest mode
        />
      )}

      {showSlideshow && (
        <SlideshowPlayer
          moments={moments}
          onClose={() => setShowSlideshow(false)}
        />
      )}
    </div>
  );
}
