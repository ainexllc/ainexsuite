'use client';

import { useEffect, useState, useRef } from 'react';
import { Clock, Maximize2, Minimize2 } from 'lucide-react';

export function DigitalClock() {
  const [time, setTime] = useState<Date | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const toggleFullScreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling full screen:', err);
    }
  };

  if (!time) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div 
      ref={containerRef}
      className={`w-full bg-black text-white border border-outline-subtle shadow-sm flex flex-col items-center justify-center relative group transition-all duration-300 ${
        isFullScreen 
          ? 'fixed inset-0 z-50 h-screen w-screen rounded-none border-none' 
          : 'p-8 rounded-2xl mb-8'
      }`}
    >
      <button
        onClick={toggleFullScreen}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100 z-10"
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
      >
        {isFullScreen ? (
          <Minimize2 className="w-5 h-5" />
        ) : (
          <Maximize2 className="w-5 h-5" />
        )}
      </button>
      
      <div className={`flex flex-col items-center justify-center ${isFullScreen ? 'scale-150' : ''} transition-transform duration-300`}>
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm uppercase tracking-wider font-medium">Current Time</span>
        </div>
        <div className="text-6xl font-mono font-bold tracking-tight">
          {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div className="text-gray-400 mt-2 font-medium">
          {time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
}
