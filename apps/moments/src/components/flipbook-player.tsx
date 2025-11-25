'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import type { Moment } from '@ainexsuite/types';
import { format } from 'date-fns';

interface FlipbookPlayerProps {
  moments: Moment[];
  onClose: () => void;
}

export function FlipbookPlayer({ moments, onClose }: FlipbookPlayerProps) {
  // Pages logic: 
  // Cover + Moments + Back Cover
  // To simplify, we treat each moment as a right-side page initially, 
  // or we can group them. Let's do a simple "one moment per view" 
  // but styled as a book.
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalPages = moments.length; // +2 for covers if we want

  const handleNext = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#121212] flex flex-col items-center justify-center overflow-hidden perspective-1000">
      {/* Controls Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
        <div className="text-white font-serif italic text-xl">
          Memory Book
        </div>
        <div className="flex gap-4">
          <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors">
            {isFullscreen ? <Minimize2 className="h-6 w-6" /> : <Maximize2 className="h-6 w-6" />}
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* The Book */}
      <div className="relative w-[90vw] h-[80vh] max-w-6xl max-h-[800px] flex items-center justify-center perspective-2000">
        <div className="relative w-full h-full flex items-center justify-center transform-style-3d transition-transform duration-700">
          
          {/* Left Click Area */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2 z-50 cursor-w-resize hover:bg-white/5 transition-colors"
            onClick={handlePrev}
          />
          
          {/* Right Click Area */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2 z-50 cursor-e-resize hover:bg-white/5 transition-colors"
            onClick={handleNext}
          />

          {/* Pages */}
          {moments.map((moment, index) => {
            // Determine state of this page relative to current
            const isFlipped = index < currentPage;

            // Calculate rotation
            // If flipped (past), rotate -180deg
            // If current or future, rotate 0deg (or slightly open book effect)
            
            // We need a specialized book structure:
            // Pages are stacked on the right.
            // When flipped, they move to the left.
            
            // Simplified: Stack of cards with 3D rotate
            // Origin should be left-center for right-hand pages
            
            return (
              <div
                key={moment.id}
                className={`absolute top-[5%] bottom-[5%] w-[45%] bg-white rounded-r-lg shadow-2xl overflow-hidden origin-left transition-all duration-700 ease-in-out border-l border-gray-300`}
                style={{
                  left: '50%',
                  zIndex: isFlipped ? index : totalPages - index,
                  transform: isFlipped 
                    ? 'rotateY(-180deg)' 
                    : `rotateY(0deg) translateZ(${-index * 2}px)`, // Stack effect
                  backfaceVisibility: 'hidden', // Hide back when flipped (we'll need a back face div if we want double sided)
                }}
              >
                {/* Front Face (Image + Info) */}
                <div className="absolute inset-0 bg-[#f5f5f0] flex flex-col">
                  <div className="relative flex-1 m-4 border-4 border-white shadow-inner bg-gray-100 overflow-hidden">
                    <Image
                      src={moment.photoUrl}
                      alt={moment.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  <div className="h-1/3 p-6 flex flex-col items-center text-center font-serif text-gray-800 bg-[#fdfdfa]">
                    <h2 className="text-2xl font-bold mb-2">{moment.title}</h2>
                    <p className="text-sm italic text-gray-500 mb-4">
                      {format(new Date(moment.date), 'MMMM do, yyyy')} • {moment.location}
                    </p>
                    {moment.caption && (
                      <p className="text-base leading-relaxed max-w-md line-clamp-3">
                        &ldquo;{moment.caption}&rdquo;
                      </p>
                    )}
                    
                    <div className="flex gap-2 mt-auto">
                      {moment.mood && <span className="text-xl" title="Mood">{moment.mood === 'Happy' ? '😊' : moment.mood === 'Loved' ? '🥰' : moment.mood === 'Excited' ? '🎉' : moment.mood === 'Chill' ? '😌' : moment.mood === 'Sad' ? '😔' : '😴'}</span>}
                      {moment.weather && <span className="text-sm px-2 py-1 bg-gray-200 rounded-full">{moment.weather}</span>}
                    </div>
                  </div>
                  
                  {/* Page number */}
                  <div className="absolute bottom-2 right-4 text-xs text-gray-400 font-mono">
                    {index + 1}
                  </div>
                  
                  {/* Paper texture overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper.png')]"></div>
                  
                  {/* Spine shadow */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"></div>
                </div>
              </div>
            );
          })}
          
          {/* Left Side Stack (Back of pages) - purely visual for this simple version */}
          {/* In a true 3D book, we'd render the back face of the div above with `transform: rotateY(180deg)` content */}
          
          {/* Simple instruction if empty */}
          {moments.length === 0 && (
            <div className="text-white/50">No moments to display</div>
          )}
        </div>
      </div>
      
      {/* Navigation Bar */}
      <div className="absolute bottom-8 flex items-center gap-8 z-50">
        <button 
          onClick={handlePrev}
          disabled={currentPage === 0}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all backdrop-blur-sm"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="text-white/50 font-mono">
          {currentPage + 1} / {totalPages}
        </div>
        
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages - 1}
          className="p-4 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all backdrop-blur-sm"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
