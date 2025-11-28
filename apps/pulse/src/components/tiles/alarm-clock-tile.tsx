'use client';

import { Bell, BellOff, Volume2, Clock, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { TileBase } from './tile-base';
import { GlassModal, GlassModalContent } from '@ainexsuite/ui';

interface AlarmClockTileProps {
  id?: string;
  onRemove?: () => void;
  isDraggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

// Available alarm sounds
const ALARM_SOUNDS = [
  { id: 'beep', name: '🔔 Beep Beep', frequency: 800 },
  { id: 'chime', name: '🎵 Chime', frequency: 600 },
  { id: 'bells', name: '🔔 Bells', frequency: 1000 },
  { id: 'gentle', name: '🌅 Gentle Wake', frequency: 400 },
  { id: 'urgent', name: '⚡ Urgent', frequency: 1200 },
];

const SNOOZE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AlarmClockTile({
  id = 'alarm-clock',
  onRemove,
  isDraggable = true,
  onDragStart
}: AlarmClockTileProps) {
  const [alarmTime, setAlarmTime] = useState('');
  const [isAlarmSet, setIsAlarmSet] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [selectedSound, setSelectedSound] = useState(ALARM_SOUNDS[0]);
  const [timeUntilAlarm, setTimeUntilAlarm] = useState('');
  const [isSnoozed, setIsSnoozed] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio context
  useEffect(() => {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    audioContextRef.current = new AudioContext();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playAlarmSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = selectedSound.frequency;
    oscillator.type = 'sine';

    // Pulsing effect
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);

    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;

    // Create pulsing pattern
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
      if (pulseCount >= 20 || !isRinging) {
        clearInterval(pulseInterval);
        return;
      }

      const time = ctx.currentTime;
      gainNode.gain.cancelScheduledValues(time);
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.linearRampToValueAtTime(0, time + 0.2);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.4);

      pulseCount++;
    }, 500);
  }, [selectedSound.frequency, isRinging]);

  // Check if alarm should ring
  useEffect(() => {
    if (!isAlarmSet || !alarmTime) return;

    const checkAlarm = () => {
      const now = new Date();
      const [hours, minutes] = alarmTime.split(':').map(Number);
      const alarmDate = new Date();
      alarmDate.setHours(hours, minutes, 0, 0);

      // If alarm time has passed today, set it for tomorrow
      if (alarmDate <= now) {
        alarmDate.setDate(alarmDate.getDate() + 1);
      }

      const timeUntil = alarmDate.getTime() - now.getTime();
      const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

      if (hoursUntil > 0) {
        setTimeUntilAlarm(`in ${hoursUntil}h ${minutesUntil}m`);
      } else if (minutesUntil > 0) {
        setTimeUntilAlarm(`in ${minutesUntil}m`);
      } else {
        setTimeUntilAlarm('soon');
      }

      // Check if it's time to ring (within 1 second)
      if (timeUntil <= 1000 && timeUntil > 0) {
        setIsRinging(true);
        playAlarmSound();
      }
    };

    checkAlarm();
    checkIntervalRef.current = setInterval(checkAlarm, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isAlarmSet, alarmTime, playAlarmSound]);

  const stopAlarmSound = () => {
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current = null;
    }
  };

  const handleSetAlarm = () => {
    if (!alarmTime) return;
    setIsAlarmSet(true);
    setIsSnoozed(false);
  };

  const handleStopAlarm = () => {
    setIsRinging(false);
    setIsAlarmSet(false);
    setIsSnoozed(false);
    stopAlarmSound();
  };

  const handleSnooze = () => {
    setIsRinging(false);
    setIsSnoozed(true);
    stopAlarmSound();

    // Calculate snooze time
    const snoozeDate = new Date(Date.now() + SNOOZE_DURATION);
    const hours = snoozeDate.getHours().toString().padStart(2, '0');
    const minutes = snoozeDate.getMinutes().toString().padStart(2, '0');
    setAlarmTime(`${hours}:${minutes}`);
    setIsAlarmSet(true);
  };

  const handleCancelAlarm = () => {
    setIsAlarmSet(false);
    setIsSnoozed(false);
    setTimeUntilAlarm('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarmSound();
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      <TileBase
        id={id}
        title="Alarm Clock"
        onRemove={onRemove}
        isDraggable={isDraggable}
        onDragStart={onDragStart}
        className="min-w-[200px]"
      >
        <div className="flex flex-col items-center justify-center h-full gap-3 py-2">

          {/* Alarm Icon with Status */}
          <div className="relative">
            {isAlarmSet ? (
              <Bell className={`w-8 h-8 ${isSnoozed ? 'text-warning' : 'text-success'}`} />
            ) : (
              <BellOff className="w-8 h-8 text-muted-foreground" />
            )}
          </div>

          {/* Time Input */}
          <div className="w-full space-y-2">
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              disabled={isAlarmSet}
              className="w-full bg-foreground/10 rounded-lg px-3 py-2 text-center text-lg font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Time Until Alarm */}
            {isAlarmSet && timeUntilAlarm && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{isSnoozed ? 'Snoozed: ' : 'Rings '}{timeUntilAlarm}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sound Selection */}
          <div className="w-full">
            <select
              value={selectedSound.id}
              onChange={(e) => {
                const sound = ALARM_SOUNDS.find(s => s.id === e.target.value);
                if (sound) setSelectedSound(sound);
              }}
              disabled={isAlarmSet}
              className="w-full bg-foreground/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ALARM_SOUNDS.map((sound) => (
                <option key={sound.id} value={sound.id}>
                  {sound.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full">
            {!isAlarmSet ? (
              <button
                onClick={handleSetAlarm}
                disabled={!alarmTime}
                className="flex-1 py-2 rounded-lg bg-success/20 text-success hover:bg-success/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Set Alarm
              </button>
            ) : (
              <button
                onClick={handleCancelAlarm}
                className="flex-1 py-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors font-medium text-sm flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          {/* Test Sound Button */}
          {!isAlarmSet && (
            <button
              onClick={() => {
                playAlarmSound();
                setTimeout(stopAlarmSound, 1000);
              }}
              className="text-xs text-muted-foreground hover:text-foreground/60 transition-colors flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" />
              Test Sound
            </button>
          )}
        </div>
      </TileBase>

      {/* Alarm Ringing Modal with GlassModal */}
      <GlassModal
        isOpen={isRinging}
        onClose={handleStopAlarm}
        variant="frosted"
        size="md"
        closeOnBackdropClick={false}
        closeOnEscape={false}
        className="bg-gradient-to-br from-destructive/20 to-warning/20 border-2 border-destructive/50"
      >
        <GlassModalContent className="relative py-8">
          {/* Pulsing Background Effect */}
          <div className="absolute inset-0 bg-destructive/10 rounded-3xl animate-pulse pointer-events-none" />

          {/* Bouncing Alarm Icon */}
          <div className="relative flex justify-center mb-6">
            <div className="animate-bounce">
              <Bell className="w-24 h-24 text-destructive drop-shadow-[0_0_20px_rgba(var(--color-destructive-rgb),0.8)]" />
            </div>
          </div>

          {/* Alarm Message */}
          <div className="relative text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Alarm!
            </h2>
            <p className="text-foreground/70 text-lg font-medium">
              {alarmTime}
            </p>
            {isSnoozed && (
              <p className="text-warning text-sm mt-2">
                (Snoozed alarm)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="relative flex flex-col gap-3">
            <button
              onClick={handleStopAlarm}
              className="w-full py-4 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold text-lg transition-all shadow-lg shadow-destructive/50 hover:scale-105 active:scale-95"
            >
              Stop Alarm
            </button>
            <button
              onClick={handleSnooze}
              className="w-full py-4 rounded-xl bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium text-lg transition-all border border-border hover:scale-105 active:scale-95"
            >
              Snooze (5 min)
            </button>
          </div>

          {/* Animated Rings */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-destructive/30 rounded-full animate-ping" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-warning/20 rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
          </div>
        </GlassModalContent>
      </GlassModal>
    </>
  );
}
