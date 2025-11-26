'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface GridLine {
  y: number;
  opacity: number;
  speed: number;
}

export function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const gridLinesRef = useRef<GridLine[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
      initGridLines();
    };

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000);

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -Math.random() * 0.5 - 0.2, // Float upward
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          color: Math.random() > 0.7 ? '#d946ef' : '#06b6d4', // Cyan or Magenta
        });
      }
    };

    // Initialize perspective grid lines
    const initGridLines = () => {
      gridLinesRef.current = [];
      for (let i = 0; i < 15; i++) {
        gridLinesRef.current.push({
          y: (canvas.height / 15) * i,
          opacity: 0.1 + (i / 15) * 0.3,
          speed: 0.5 + (i / 15) * 1.5,
        });
      }
    };

    // Draw perspective grid
    const drawGrid = () => {
      const centerX = canvas.width / 2;
      const horizon = canvas.height * 0.3;

      // Vertical lines converging to horizon
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;

      for (let i = -20; i <= 20; i++) {
        const bottomX = centerX + i * 80;
        ctx.beginPath();
        ctx.moveTo(bottomX, canvas.height);
        ctx.lineTo(centerX, horizon);
        ctx.stroke();
      }

      // Horizontal lines with perspective
      gridLinesRef.current.forEach((line, index) => {
        const progress = index / gridLinesRef.current.length;
        const y = horizon + (canvas.height - horizon) * progress;
        const width = canvas.width * (0.2 + progress * 0.8);
        const startX = (canvas.width - width) / 2;

        ctx.strokeStyle = `rgba(6, 182, 212, ${line.opacity * 0.5})`;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + width, y);
        ctx.stroke();
      });
    };

    // Draw particles
    const drawParticles = () => {
      particlesRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('rgb', 'rgba').replace('#06b6d4', 'rgba(6, 182, 212').replace('#d946ef', 'rgba(217, 70, 239');

        // Create glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        gradient.addColorStop(0, particle.color === '#06b6d4'
          ? `rgba(6, 182, 212, ${particle.opacity})`
          : `rgba(217, 70, 239, ${particle.opacity})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          particle.x - particle.size * 3,
          particle.y - particle.size * 3,
          particle.size * 6,
          particle.size * 6
        );

        // Draw core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
      });
    };

    // Update particles
    const updateParticles = () => {
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;

        // Subtle opacity flicker
        particle.opacity += (Math.random() - 0.5) * 0.02;
        particle.opacity = Math.max(0.1, Math.min(0.7, particle.opacity));
      });
    };

    // Draw vignette
    const drawVignette = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7
      );
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.7, 'transparent');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Draw ambient glow orbs
    const drawAmbientGlow = (time: number) => {
      // Top-left cyan glow
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2 + Math.sin(time * 0.0005) * 50,
        canvas.height * 0.3 + Math.cos(time * 0.0003) * 30,
        0,
        canvas.width * 0.2,
        canvas.height * 0.3,
        400
      );
      gradient1.addColorStop(0, 'rgba(6, 182, 212, 0.08)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bottom-right magenta glow
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8 + Math.cos(time * 0.0004) * 40,
        canvas.height * 0.7 + Math.sin(time * 0.0006) * 30,
        0,
        canvas.width * 0.8,
        canvas.height * 0.7,
        350
      );
      gradient2.addColorStop(0, 'rgba(168, 85, 247, 0.06)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Animation loop
    const animate = (time: number) => {
      // Clear with dark background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw layers
      drawAmbientGlow(time);
      drawGrid();
      drawParticles();
      updateParticles();
      drawVignette();

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: '#0a0a0f' }}
    />
  );
}
