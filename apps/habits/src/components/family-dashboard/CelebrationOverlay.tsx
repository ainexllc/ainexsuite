'use client';

import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CelebrationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Type of celebration */
  type: 'achievement' | 'all_done' | 'challenge_complete';
  /** Title to display */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Main emoji/icon to display */
  emoji?: string;
  /** Member name being celebrated */
  memberName?: string;
  /** Member avatar URL */
  memberPhotoURL?: string;
  /** Auto-close after duration (ms) */
  autoCloseDuration?: number;
}

// Confetti particle types
const CONFETTI_EMOJIS = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎁', '🏆', '👏'];
const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c'];

export function CelebrationOverlay({
  isOpen,
  onClose,
  type,
  title,
  subtitle,
  emoji = '🎉',
  memberName,
  memberPhotoURL,
  autoCloseDuration = 5000,
}: CelebrationOverlayProps) {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; x: number; delay: number; duration: number }[]
  >([]);
  const [showContent, setShowContent] = useState(false);

  // Generate confetti particles
  const generateParticles = useCallback(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
      x: Math.random() * 100,
      delay: Math.random() * 500,
      duration: 2000 + Math.random() * 2000,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isOpen) {
      generateParticles();
      // Delay content reveal for entrance animation
      const timer = setTimeout(() => setShowContent(true), 100);

      // Auto-close if duration is set
      if (autoCloseDuration > 0) {
        const closeTimer = setTimeout(onClose, autoCloseDuration);
        return () => {
          clearTimeout(timer);
          clearTimeout(closeTimer);
        };
      }

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen, autoCloseDuration, onClose, generateParticles]);

  if (!isOpen) return null;

  const bgGradient =
    type === 'all_done'
      ? 'from-emerald-600/95 via-green-600/95 to-teal-600/95'
      : type === 'challenge_complete'
      ? 'from-amber-600/95 via-orange-600/95 to-yellow-600/95'
      : 'from-indigo-600/95 via-purple-600/95 to-pink-600/95';

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        'bg-gradient-to-br',
        bgGradient,
        'backdrop-blur-lg transition-opacity duration-300',
        showContent ? 'opacity-100' : 'opacity-0'
      )}
      onClick={onClose}
    >
      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute text-4xl animate-confetti-fall"
            style={{
              left: `${particle.x}%`,
              top: '-50px',
              animationDelay: `${particle.delay}ms`,
              animationDuration: `${particle.duration}ms`,
            }}
          >
            {particle.emoji}
          </span>
        ))}

        {/* Floating color circles */}
        {CONFETTI_COLORS.map((color, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full opacity-30 animate-float-bubble"
            style={{
              backgroundColor: color,
              left: `${10 + i * 15}%`,
              bottom: '-50px',
              animationDelay: `${i * 300}ms`,
              animationDuration: `${3000 + i * 500}ms`,
            }}
          />
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main content */}
      <div
        className={cn(
          'relative flex flex-col items-center text-center px-8 py-12',
          'transition-all duration-500',
          showContent ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Member avatar (if celebrating a specific member) */}
        {memberPhotoURL && (
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl animate-bounce-slow relative">
              <Image
                src={memberPhotoURL}
                alt={memberName || 'Member'}
                fill
                className="object-cover"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 text-4xl animate-wiggle">
              {emoji}
            </span>
          </div>
        )}

        {/* Main emoji (if no avatar) */}
        {!memberPhotoURL && (
          <div className="text-8xl mb-6 animate-star-burst">{emoji}</div>
        )}

        {/* Member name */}
        {memberName && (
          <p className="text-xl text-white/80 font-medium mb-2">{memberName}</p>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 animate-pulse-glow">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xl text-white/90 max-w-md">{subtitle}</p>
        )}

        {/* Action hint */}
        <p className="mt-8 text-sm text-white/60 animate-pulse">
          Tap anywhere to continue
        </p>
      </div>

      {/* Star burst effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-star-shoot"
            style={{
              left: '50%',
              top: '50%',
              animationDelay: `${i * 200}ms`,
              transform: `rotate(${i * 60}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Preset celebration configs
export const CELEBRATION_PRESETS = {
  allDone: (memberName?: string) => ({
    type: 'all_done' as const,
    title: 'All Done!',
    subtitle: memberName
      ? `${memberName} completed all habits today!`
      : 'All habits completed today!',
    emoji: '🏆',
  }),
  achievement: (achievementName: string, achievementIcon: string, memberName?: string) => ({
    type: 'achievement' as const,
    title: achievementName,
    subtitle: memberName
      ? `${memberName} earned a new achievement!`
      : 'New achievement unlocked!',
    emoji: achievementIcon,
  }),
  challengeComplete: (challengeName: string, reward?: string) => ({
    type: 'challenge_complete' as const,
    title: 'Challenge Complete!',
    subtitle: reward ? `You earned: ${reward}` : `${challengeName} is done!`,
    emoji: '🎊',
  }),
};
