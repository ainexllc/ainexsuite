'use client';

import { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

export type BackgroundVariant = 'gentle' | 'energetic' | 'structured' | 'organic';

interface CanvasWaveBackgroundProps {
  baseColor?: string; // Hex color
  variant?: BackgroundVariant;
}

export function CanvasWaveBackground({ 
  baseColor = '#ffffff', 
  variant = 'gentle' 
}: CanvasWaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();

    const noise = createNoise2D();
    let time = 0;
    let animationId: number;

    // Parse hex color to RGB for manipulation
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const drawWaves = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Variant parameters
      let waveCount = 60;
      let amplitude = Math.min(canvas.height * 0.15, 150);
      let frequency = 0.008;
      let speed = 0.008;
      let verticalSpread = 30;
      let lineAlpha = 0.15;

      if (variant === 'energetic') {
        waveCount = 80;
        amplitude = 200;
        frequency = 0.015;
        speed = 0.02; // Faster
        verticalSpread = 50;
        lineAlpha = 0.2;
      } else if (variant === 'structured') {
        waveCount = 40;
        amplitude = 100;
        frequency = 0.004; // Smoother, flatter
        speed = 0.005; // Slower
        verticalSpread = 10; // Tighter
        lineAlpha = 0.1;
      } else if (variant === 'organic') {
        waveCount = 70;
        amplitude = 180;
        frequency = 0.01;
        speed = 0.006; // Slow but swirly
        verticalSpread = 40;
        lineAlpha = 0.18;
      }

      const centerY = canvas.height / 2;

      // Draw waves
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();

        // Calculate opacity and color based on wave position
        const progress = i / waveCount;
        
        // If baseColor is white/grey (default), use brightness trick. 
        // If colored, use tinting.
        const isGrayscale = r > 200 && g > 200 && b > 200;
        
        let strokeR = r;
        let strokeG = g;
        let strokeB = b;

        if (isGrayscale) {
           const brightness = Math.floor(255 - (progress * 120));
           strokeR = strokeG = strokeB = brightness;
        } else {
           // Tint variation for depth
           const tintFactor = 1 - (progress * 0.5);
           strokeR = Math.floor(r * tintFactor);
           strokeG = Math.floor(g * tintFactor);
           strokeB = Math.floor(b * tintFactor);
        }

        const alpha = lineAlpha + (Math.sin(progress * Math.PI) * 0.15);

        ctx.strokeStyle = `rgba(${strokeR}, ${strokeG}, ${strokeB}, ${alpha})`;
        ctx.lineWidth = 2 + (Math.sin(progress * Math.PI) * 1.5);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw wave path
        for (let x = 0; x <= canvas.width; x += 3) {
          // Create flowing wave motion with multiple noise layers
          const noiseValue = noise(
            x * frequency + i * 0.05,
            time * 0.3 + i * 0.02
          );

          const sineWave = Math.sin(
            x * 0.003 + time * 0.5 + i * 0.15
          );

          const secondaryNoise = noise(
            x * frequency * 0.5,
            time * 0.2 + i * 0.03
          ) * 0.5;

          // Combine multiple wave patterns
          const y = centerY +
            (noiseValue * amplitude) +
            (sineWave * amplitude * 0.4) +
            (secondaryNoise * amplitude * 0.3) +
            (Math.sin(i * 0.1 + time * 0.3) * verticalSpread);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      time += speed;
      animationId = requestAnimationFrame(drawWaves);
    };

    drawWaves();

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [baseColor, variant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.4,
        mixBlendMode: 'screen',
      }}
    />
  );
}