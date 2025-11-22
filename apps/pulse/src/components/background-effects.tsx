'use client';

import { useEffect, useRef } from 'react';

export type EffectType = 'none' | 'rain' | 'snow' | 'liquid' | 'dim';

interface BackgroundEffectsProps {
  effect: EffectType;
}

export function BackgroundEffects({ effect }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rain & Snow Animation Loop
  useEffect(() => {
    if (effect !== 'rain' && effect !== 'snow') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: Array<{ x: number; y: number; speed: number; length: number; opacity: number }> = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Init particles
    const particleCount = effect === 'rain' ? 100 : 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: effect === 'rain' ? Math.random() * 15 + 10 : Math.random() * 2 + 1,
        length: effect === 'rain' ? Math.random() * 20 + 10 : Math.random() * 2 + 2,
        opacity: Math.random() * 0.5 + 0.1
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = effect === 'rain' ? 'rgba(174, 194, 224, 0.5)' : 'rgba(255, 255, 255, 0.8)';
      ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';

      particles.forEach(p => {
        if (effect === 'rain') {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + p.length);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.length / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        p.y += p.speed;
        if (p.y > canvas.height) {
          p.y = -p.length;
          p.x = Math.random() * canvas.width;
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect]);

  if (effect === 'none') return null;

  if (effect === 'liquid') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-900/30 via-transparent to-purple-900/30 animate-pulse" />
        <div className="absolute -inset-[100%] top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)] animate-[spin_20s_linear_infinite]" />
      </div>
    );
  }

  if (effect === 'dim') {
    return <div className="absolute inset-0 bg-black/40 pointer-events-none z-0 transition-opacity duration-1000" />;
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

