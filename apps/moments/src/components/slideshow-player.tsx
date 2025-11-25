'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Play, Pause, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import type { Moment } from '@ainexsuite/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SlideshowPlayerProps {
  moments: Moment[];
  onClose: () => void;
  initialIndex?: number;
}

export function SlideshowPlayer({ moments, onClose, initialIndex = 0 }: SlideshowPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentMoment = moments[currentIndex];

  // Auto-play logic
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % moments.length);
      }, 4000); // 4 seconds per slide
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, moments.length]);

  // Hide controls after inactivity
  useEffect(() => {
    const resetControls = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', resetControls);
    window.addEventListener('click', resetControls);
    resetControls(); // Initial call

    return () => {
      window.removeEventListener('mousemove', resetControls);
      window.removeEventListener('click', resetControls);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev + 1) % moments.length);
      if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev - 1 + moments.length) % moments.length);
      if (e.key === ' ') {
        e.preventDefault(); // Prevent scroll
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, moments.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % moments.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + moments.length) % moments.length);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Blur Layer */}
      <div className="absolute inset-0 z-0 opacity-30 blur-3xl transform scale-110">
        <Image
          src={currentMoment.photoUrl}
          alt="Background"
          fill
          className="object-cover transition-all duration-1000"
          unoptimized
        />
      </div>

      {/* Main Image */}
      <div className="relative w-full h-full z-10 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-7xl max-h-screen aspect-[16/9] md:aspect-auto">
          <Image
            key={currentMoment.id} // Key change triggers animation
            src={currentMoment.photoUrl}
            alt={currentMoment.title || 'Slideshow'}
            fill
            className="object-contain animate-in fade-in duration-700"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Overlay Controls */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex flex-col justify-between p-6 transition-opacity duration-500",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          <div className="text-white drop-shadow-md">
            <h2 className="text-2xl font-bold">{currentMoment.title || format(new Date(currentMoment.date), 'MMMM d, yyyy')}</h2>
            {currentMoment.location && (
              <p className="text-white/80 text-sm">{currentMoment.location}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Center Navigation (Invisible areas) */}
        <div className="absolute inset-y-0 left-0 w-1/4 flex items-center justify-start pl-4" onClick={handlePrev}>
          <button className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110">
            <ChevronLeft className="h-8 w-8" />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/4 flex items-center justify-end pr-4" onClick={handleNext}>
          <button className="p-3 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all hover:scale-110">
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex flex-col items-center gap-4 pb-8">
          {currentMoment.caption && (
            <p className="text-white text-center text-lg font-medium drop-shadow-md max-w-2xl bg-black/30 backdrop-blur-md px-6 py-2 rounded-xl">
              {currentMoment.caption}
            </p>
          )}
          
          <div className="flex items-center gap-6 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            <span className="text-white/70 text-xs font-mono w-12 text-right">
              {currentIndex + 1} / {moments.length}
            </span>
            
            <button
              onClick={togglePlay}
              className="p-3 bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
            </button>

            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen();
                } else {
                  document.exitFullscreen();
                }
              }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
