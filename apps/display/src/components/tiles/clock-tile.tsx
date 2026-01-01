'use client';

import { useState, useEffect } from 'react';
import { TileBase } from './tile-base';
import { ClockStyle } from '@/lib/clock-settings';

type TimeFormat = '12h' | '24h';

interface ClockTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  clockStyle?: ClockStyle;
  timeFormat?: TimeFormat;
}

// Flip Digit Component for flip clock style
const FlipDigit = ({ digit }: { digit: string }) => {
  const [current, setCurrent] = useState(digit);
  const [prev, setPrev] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setPrev(current);
      setCurrent(digit);
      setFlipping(true);

      const timer = setTimeout(() => {
        setFlipping(false);
        setPrev(digit);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [digit, current]);

  if (digit === ':' || digit === ' ') {
    return <div className="text-2xl md:text-4xl font-mono font-bold text-foreground/50 mx-0.5">{digit}</div>;
  }

  return (
    <div className="relative w-8 h-12 md:w-12 md:h-16 bg-[#222] rounded-lg shadow-xl mx-0.5 perspective-1000">
      {/* Static Top (Next) */}
      <div className="absolute inset-0 h-1/2 overflow-hidden rounded-t-lg bg-[#333] border-b border-background/20 z-0">
        <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-2xl md:text-4xl font-bold text-foreground">
          {current}
        </div>
      </div>

      {/* Static Bottom (Prev) */}
      <div className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-lg bg-[#282828] z-0">
        <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-2xl md:text-4xl font-bold text-foreground">
          {prev}
        </div>
      </div>

      {/* Animated Flipping Layers */}
      {flipping && (
        <>
          <div
            className="absolute inset-0 h-1/2 overflow-hidden rounded-t-lg bg-[#333] border-b border-background/20 z-20 origin-bottom animate-flip-top"
            style={{ animationDuration: '0.6s', animationFillMode: 'forwards', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <div className="absolute top-0 left-0 right-0 h-[200%] flex items-center justify-center text-2xl md:text-4xl font-bold text-foreground">
              {prev}
            </div>
          </div>
          <div
            className="absolute top-1/2 left-0 right-0 bottom-0 overflow-hidden rounded-b-lg bg-[#282828] z-20 origin-top animate-flip-bottom"
            style={{ animationDuration: '0.6s', animationFillMode: 'forwards', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
          >
            <div className="absolute -top-[100%] left-0 right-0 h-[200%] flex items-center justify-center text-2xl md:text-4xl font-bold text-foreground">
              {current}
            </div>
          </div>
        </>
      )}

      {/* Middle Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-background/40 z-30 transform -translate-y-1/2 shadow-sm" />
    </div>
  );
};

export function ClockTile({
  id = 'clock',
  onRemove,
  isDraggable = false,
  clockStyle = 'flip',
  timeFormat = '12h'
}: ClockTileProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFormattedTime = (): string => {
    if (!time) return '';
    const baseFormat = { hour12: timeFormat === '12h', hour: '2-digit' as const, minute: '2-digit' as const, second: '2-digit' as const };
    let timeStr = time.toLocaleTimeString([], baseFormat);
    if (timeFormat === '12h') {
      timeStr = timeStr.replace(/^0(\d)/, '$1');
    }
    return timeStr;
  };

  const renderClockContent = () => {
    if (!time) return null;

    // Neon Style
    if (clockStyle === 'neon') {
      return (
        <div className="relative flex flex-col items-center justify-center h-full">
          <div
            className="text-3xl md:text-5xl font-bold tracking-wider relative z-10"
            style={{
              color: '#fff',
              textShadow: `0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff`
            }}
          >
            {getFormattedTime()}
          </div>
        </div>
      );
    }

    // Flip Style
    if (clockStyle === 'flip') {
      return (
        <div className="flex items-center justify-center h-full">
          <style jsx global>{`
            @keyframes flip-top { 100% { transform: rotateX(-90deg); } }
            @keyframes flip-bottom { 100% { transform: rotateX(0deg); } }
            .animate-flip-top { animation: flip-top 0.6s ease-in forwards; }
            .animate-flip-bottom { animation: flip-bottom 0.6s ease-out forwards; }
            .perspective-1000 { perspective: 1000px; }
          `}</style>
          {getFormattedTime().split('').map((char, i) => (
            <FlipDigit key={i} digit={char} />
          ))}
        </div>
      );
    }

    // Analog Style
    if (clockStyle === 'analog') {
      const seconds = time.getSeconds();
      const minutes = time.getMinutes();
      const hours = time.getHours();
      const secondDeg = (seconds / 60) * 360;
      const minuteDeg = ((minutes * 60 + seconds) / 3600) * 360;
      const hourDeg = ((hours % 12 * 3600 + minutes * 60 + seconds) / 43200) * 360;

      return (
        <div className="flex items-center justify-center h-full">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-border bg-background/40 backdrop-blur-sm shadow-2xl flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-full h-full flex justify-center pt-2" style={{ transform: `rotate(${i * 30}deg)` }}>
                <div className={`w-1 bg-foreground/50 ${i % 3 === 0 ? 'h-3' : 'h-1.5'}`} />
              </div>
            ))}
            <div className="absolute w-1.5 bg-foreground h-8 md:h-10 rounded-full origin-bottom bottom-1/2 left-[calc(50%-3px)]" style={{ transform: `rotate(${hourDeg}deg)` }} />
            <div className="absolute w-1 bg-foreground/80 h-12 md:h-14 rounded-full origin-bottom bottom-1/2 left-[calc(50%-2px)]" style={{ transform: `rotate(${minuteDeg}deg)` }} />
            <div className="absolute w-0.5 bg-red-500 h-14 md:h-16 rounded-full origin-bottom bottom-1/2 left-[calc(50%-1px)]" style={{ transform: `rotate(${secondDeg}deg)` }} />
            <div className="absolute w-3 h-3 bg-foreground rounded-full shadow-md z-10" />
          </div>
        </div>
      );
    }

    // Minimal Style
    if (clockStyle === 'minimal') {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const displayHours = timeFormat === '12h' ? (hours % 12 || 12) : hours;
      const period = timeFormat === '12h' ? (hours >= 12 ? 'PM' : 'AM') : '';

      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-4xl md:text-6xl font-extralight tracking-widest text-foreground/90">
            {String(displayHours).padStart(2, '0')}
            <span className="animate-pulse">:</span>
            {String(minutes).padStart(2, '0')}
          </div>
          {period && <div className="text-sm font-light tracking-[0.5em] text-foreground/50 mt-1">{period}</div>}
        </div>
      );
    }

    // Binary Style
    if (clockStyle === 'binary') {
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const seconds = time.getSeconds();
      const toBinaryArray = (num: number, bits: number): boolean[] => Array.from({ length: bits }, (_, i) => Boolean((num >> (bits - 1 - i)) & 1));

      return (
        <div className="flex flex-col gap-2 p-4 bg-black/40 backdrop-blur-sm rounded-xl border border-foreground/10 h-full justify-center">
          {[{ bits: toBinaryArray(hours, 5), label: 'HRS' }, { bits: toBinaryArray(minutes, 6), label: 'MIN' }, { bits: toBinaryArray(seconds, 6), label: 'SEC' }].map(({ bits, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs font-mono text-foreground/50 w-6">{label}</span>
              <div className="flex gap-1">
                {bits.map((bit, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${bit ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-foreground/20'}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Digital Style (default)
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-3xl md:text-5xl font-mono font-bold tracking-tight drop-shadow-lg text-foreground">
          {getFormattedTime()}
        </div>
        <div className="text-xs text-foreground/50 mt-1">
          {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>
    );
  };

  return (
    <TileBase
      id={id}
      title="Clock"
      onRemove={onRemove}
      isDraggable={isDraggable}
      className="bg-black/60 backdrop-blur-md"
    >
      {renderClockContent()}
    </TileBase>
  );
}
