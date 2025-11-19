'use client';

import { useEffect, useRef } from 'react';
import { createNoise2D } from 'simplex-noise';

export function CanvasWaveBackground() {
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

    const drawWaves = () => {
      // Clear canvas with dark background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const waveCount = 60;
      const centerY = canvas.height / 2;
      const amplitude = Math.min(canvas.height * 0.15, 150);
      const frequency = 0.008;

      // Draw waves
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();

        // Calculate opacity and color based on wave position
        const progress = i / waveCount;
        const brightness = Math.floor(255 - (progress * 120));
        const alpha = 0.15 + (Math.sin(progress * Math.PI) * 0.15);

        ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
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
            (Math.sin(i * 0.1 + time * 0.3) * 30);

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      time += 0.008;
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
  }, []);

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
