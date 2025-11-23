'use client';

import { Play, Pause, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { TileBase } from './tile-base';

interface TimerTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  defaultDuration?: number;
  onDurationChange?: (duration: number) => void;
}

export function TimerTile({ id = 'timer', onRemove, isDraggable = true, onDragStart, defaultDuration = 25 * 60, onDurationChange }: TimerTileProps) {
  // Timer state in seconds
  const [timeLeft, setTimeLeft] = useState(defaultDuration);
  const [initialTime, setInitialTime] = useState(defaultDuration);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Input state for editing
  const [editMinutes, setEditMinutes] = useState((defaultDuration / 60).toString());
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
      setTimeLeft(defaultDuration);
      setInitialTime(defaultDuration);
      setEditMinutes((defaultDuration / 60).toString());
  }, [defaultDuration]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                clearInterval(intervalRef.current!);
                setIsActive(false);
                // Play sound or notify here if we had that capability
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const handleSetTime = (minutes: number) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTimeLeft(seconds);
    setIsActive(false);
    setEditMinutes(minutes.toString());
    setIsEditing(false);
    if (onDurationChange) {
        onDurationChange(seconds);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for circle ring (optional visual flair)
  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return (
    <TileBase 
      id={id} 
      title="Timer" 
      onRemove={onRemove} 
      isDraggable={isDraggable}
      onDragStart={onDragStart}
      className="min-w-[200px]"
    >
      <div className="flex flex-col items-center justify-center h-full gap-2 py-1">
        
        {/* Timer Display */}
        <div className="relative group/display">
            {isEditing ? (
                <div className="flex items-center gap-1 text-3xl font-mono font-bold text-white">
                    <input 
                        type="number"
                        min="1"
                        max="999"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(e.target.value)}
                        className="w-20 bg-white/10 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-2 focus:ring-accent-500"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSetTime(parseInt(editMinutes) || 25);
                            }
                        }}
                        onBlur={() => handleSetTime(parseInt(editMinutes) || 25)}
                    />
                    <span className="text-base text-white/50">min</span>
                </div>
            ) : (
                <button 
                    onClick={() => !isActive && setIsEditing(true)}
                    className={`text-3xl font-mono font-bold tracking-wider tabular-nums transition-colors ${isActive ? 'text-accent-400' : 'text-white hover:text-white/80'}`}
                    title={isActive ? "Pause to edit" : "Click to edit time"}
                    disabled={isActive}
                >
                    {formatTime(timeLeft)}
                </button>
            )}
        </div>

        {/* Progress Bar (Mini) */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
                className="h-full bg-accent-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
             <button 
                onClick={toggleTimer}
                className={`p-2 rounded-full transition-all ${
                    isActive 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                }`}
            >
                {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button 
                onClick={resetTimer}
                className="p-2 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset"
            >
                <RotateCcw className="w-4 h-4" />
            </button>
        </div>

        {/* Quick Presets (Only show when paused/stopped for cleaner look) */}
        {!isActive && !isEditing && (
            <div className="flex gap-1.5 mt-0.5">
                {[5, 15, 25, 45].map(min => (
                    <button
                        key={min}
                        onClick={() => handleSetTime(min)}
                        className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                    >
                        {min}m
                    </button>
                ))}
            </div>
        )}

      </div>
    </TileBase>
  );
}
