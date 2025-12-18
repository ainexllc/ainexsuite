'use client';

import { useEffect, useRef } from 'react';

export type EffectType = 'none' | 'rain' | 'heavy-rain' | 'snow' | 'heavy-snow' | 'fog' | 'christmas-lights' | 'confetti' | 'christmas-lights-snow' | 'fireflies' | 'sakura' | 'autumn-leaves' | 'christmas';

interface BackgroundEffectsProps {
  effect: EffectType;
}

interface Particle {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  speed?: number;
  speedX?: number;
  speedY?: number;
  radius?: number;
  length?: number;
  opacity?: number;
  color?: string;
  rotation?: number;
  rotationSpeed?: number;
  life?: number;
  decay?: number;
  dx?: number;
  dy?: number;
  pulseSpeed?: number;
  type?: 'rocket' | 'spark';
  explodeY?: number;
}

export function BackgroundEffects({ effect }: BackgroundEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper to determine if we need canvas
  const needsCanvas = [
    'rain',
    'heavy-rain',
    'snow',
    'heavy-snow',
    'fog',
    'confetti',
    'christmas-lights-snow',
    'fireflies',
    'sakura',
    'autumn-leaves',
    'christmas'
  ].includes(effect);

  // Helper to determine if we need lights
  const needsLights = ['christmas-lights', 'christmas-lights-snow', 'christmas'].includes(effect);

  // Canvas Animation Loop
  useEffect(() => {
    if (!needsCanvas) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    // Initialize effect-specific particles/state
    const init = () => {
      particles = [];
      time = 0;

      if (effect === 'rain' || effect === 'heavy-rain') {
        const particleCount = effect === 'heavy-rain' ? 400 : 100;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 15 + (effect === 'heavy-rain' ? 20 : 10),
            length: Math.random() * 20 + (effect === 'heavy-rain' ? 20 : 10),
            opacity: Math.random() * 0.5 + (effect === 'heavy-rain' ? 0.3 : 0.1)
          });
        }
      } else if (effect === 'snow' || effect === 'heavy-snow' || effect === 'christmas-lights-snow') {
        const particleCount = effect === 'heavy-snow' ? 250 : 50;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 2 + (effect === 'heavy-snow' ? 3 : 1),
            radius: Math.random() * 2 + (effect === 'heavy-snow' ? 2 : 2),
            opacity: Math.random() * 0.5 + (effect === 'heavy-snow' ? 0.4 : 0.1)
          });
        }
      } else if (effect === 'confetti') {
        const colors = ['#FFC107', '#4CAF50', '#2196F3', '#E91E63', '#9C27B0', '#00BCD4'];
        for (let i = 0; i < 150; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 5
          });
        }
      } else if (effect === 'fog') {
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 300 + 150,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.1,
            opacity: Math.random() * 0.3 + 0.1
          });
        }
      } else if (effect === 'fireflies') {
        for (let i = 0; i < 50; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            opacity: Math.random(),
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            pulseSpeed: Math.random() * 0.05 + 0.01
          });
        }
      } else if (effect === 'sakura') {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 2,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 1 - 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.4 + 0.6
          });
        }
      } else if (effect === 'autumn-leaves') {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 3,
            speedY: Math.random() * 1.5 + 0.8,
            speedX: Math.random() * 1 - 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 3,
            opacity: Math.random() * 0.4 + 0.6,
            color: ['#FF6B35', '#F7931E', '#FDC830', '#C1272D', '#8B4513'][Math.floor(Math.random() * 5)] // Fall colors
          });
        }
      } else if (effect === 'christmas') {
        // Snowflakes - beautiful 6-pointed crystalline shapes
        for (let i = 0; i < 60; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 4 + 2,
            speedY: Math.random() * 1.5 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 1,
            opacity: Math.random() * 0.5 + 0.5,
            type: 'rocket' as const, // Using 'rocket' to mark snowflakes
            color: '#FFFFFF'
          });
        }
        // Twinkling stars in background
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            opacity: Math.random(),
            pulseSpeed: Math.random() * 0.03 + 0.01,
            type: 'spark' as const, // Using 'spark' to mark stars
            color: ['#FFD700', '#FFFFFF', '#FFF8DC', '#FFFACD'][Math.floor(Math.random() * 4)]
          });
        }
        // Christmas ornaments floating down
        const ornamentColors = ['#E53935', '#43A047', '#1E88E5', '#FFD700', '#9C27B0', '#FF7043'];
        for (let i = 0; i < 15; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 6 + 4,
            speedY: Math.random() * 0.8 + 0.3,
            speedX: (Math.random() - 0.5) * 0.3,
            rotation: 0,
            rotationSpeed: 0,
            opacity: Math.random() * 0.3 + 0.7,
            color: ornamentColors[Math.floor(Math.random() * ornamentColors.length)]
          });
        }
      }
    };

    init();

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      time += 0.01;

      if (effect === 'rain' || effect === 'heavy-rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        particles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + (p.length || 10));
          ctx.stroke();
          p.y += p.speed || 5;
          if (p.y > canvas.height) {
            p.y = -(p.length || 10);
            p.x = Math.random() * canvas.width;
          }
        });
      } 
      else if (effect === 'snow' || effect === 'heavy-snow' || effect === 'christmas-lights-snow') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();
          p.y += p.speed || 1;
          p.x += Math.sin(time + (p.radius || 2)) * 0.5; // Add some horizontal drift
          
          if (p.y > canvas.height) {
            p.y = -(p.radius || 2);
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });
      }
      else if (effect === 'confetti') {
        particles.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
          ctx.fillStyle = p.color || 'white';
          ctx.fillRect(-(p.radius || 4), -(p.radius || 4), (p.radius || 4) * 2, (p.radius || 4) * 2); // Square confetti
          ctx.restore();

          p.y += p.speedY || 2;
          p.x += (p.speedX || 0) + Math.sin(time * 2) * 0.5; // Sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 2);

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });
      }
      else if (effect === 'fog') {
        particles.forEach(p => {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius || 150);
            gradient.addColorStop(0, `rgba(200, 210, 230, ${p.opacity || 0.1})`);
            gradient.addColorStop(1, 'rgba(200, 210, 230, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius || 150, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.dx || 0;
            p.y += p.dy || 0;

            // Wrap around screen
            if (p.x < -(p.radius || 150)) p.x = canvas.width + (p.radius || 150);
            if (p.x > canvas.width + (p.radius || 150)) p.x = -(p.radius || 150);
            if (p.y < -(p.radius || 150)) p.y = canvas.height + (p.radius || 150);
            if (p.y > canvas.height + (p.radius || 150)) p.y = -(p.radius || 150);
        });
      }
      else if (effect === 'fireflies') {
        particles.forEach(p => {
          // Pulsing opacity
          const alpha = 0.5 + Math.sin(time * 3 + (p.opacity || 0) * 10) * 0.5;
          
          ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Gentle wandering
          p.x += (p.speedX || 0) + Math.sin(time + (p.opacity || 0)) * 0.2;
          p.y += (p.speedY || 0) + Math.cos(time + (p.opacity || 0)) * 0.2;
          
          // Wrap
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        });
      }
      else if (effect === 'sakura') {
        particles.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
          // Pink petal color
          ctx.fillStyle = `rgba(255, 183, 178, ${p.opacity || 0.5})`;

          // Draw petal shape (simple oval for now)
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius || 3, (p.radius || 3) * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          p.y += p.speedY || 1;
          p.x += (p.speedX || 0) + Math.sin(time + (p.rotation || 0)) * 0.5; // Sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 1);

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });
      }
      else if (effect === 'autumn-leaves') {
        particles.forEach(p => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
          // Autumn leaf colors
          ctx.fillStyle = p.color || '#FF6B35';

          // Draw leaf shape (oval with pointed tip)
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius || 4, (p.radius || 4) * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          p.y += p.speedY || 1;
          p.x += (p.speedX || 0) + Math.sin(time * 2 + (p.rotation || 0)) * 0.8; // More sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 1.5);

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });
      }
      else if (effect === 'christmas') {
        particles.forEach(p => {
          if (p.type === 'rocket') {
            // Draw beautiful 6-pointed snowflake
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(((p.rotation || 0) * Math.PI) / 180);

            const r = p.radius || 3;
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity || 0.8})`;
            ctx.lineWidth = 1;
            ctx.lineCap = 'round';

            // Draw 6 main branches with smaller side branches
            for (let i = 0; i < 6; i++) {
              ctx.save();
              ctx.rotate((i * Math.PI) / 3);

              // Main branch
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(0, -r);
              ctx.stroke();

              // Side branches
              ctx.beginPath();
              ctx.moveTo(0, -r * 0.4);
              ctx.lineTo(-r * 0.25, -r * 0.6);
              ctx.moveTo(0, -r * 0.4);
              ctx.lineTo(r * 0.25, -r * 0.6);
              ctx.moveTo(0, -r * 0.7);
              ctx.lineTo(-r * 0.2, -r * 0.85);
              ctx.moveTo(0, -r * 0.7);
              ctx.lineTo(r * 0.2, -r * 0.85);
              ctx.stroke();

              ctx.restore();
            }

            // Add sparkle at center
            ctx.fillStyle = `rgba(255, 255, 255, ${(p.opacity || 0.8) * 0.6})`;
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // Update position with gentle floating
            p.y += p.speedY || 1;
            p.x += (p.speedX || 0) + Math.sin(time * 1.5 + (p.rotation || 0) * 0.1) * 0.3;
            p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0.5);

            if (p.y > canvas.height + 10) {
              p.y = -10;
              p.x = Math.random() * canvas.width;
            }
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
          }
          else if (p.type === 'spark') {
            // Draw twinkling star
            const twinkle = 0.4 + Math.sin(time * 4 + (p.opacity || 0) * 20) * 0.6;
            const r = (p.radius || 1.5) * (0.8 + twinkle * 0.4);

            // Star glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
            gradient.addColorStop(0, `rgba(255, 215, 0, ${twinkle * 0.5})`);
            gradient.addColorStop(0.5, `rgba(255, 215, 0, ${twinkle * 0.2})`);
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
            ctx.fill();

            // Star core with 4-point sparkle
            ctx.fillStyle = p.color || '#FFD700';
            ctx.save();
            ctx.translate(p.x, p.y);

            // Horizontal and vertical rays
            ctx.beginPath();
            ctx.moveTo(-r * 1.5, 0);
            ctx.lineTo(0, -r * 0.3);
            ctx.lineTo(r * 1.5, 0);
            ctx.lineTo(0, r * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, -r * 1.5);
            ctx.lineTo(-r * 0.3, 0);
            ctx.lineTo(0, r * 1.5);
            ctx.lineTo(r * 0.3, 0);
            ctx.closePath();
            ctx.fill();

            // Center dot
            ctx.beginPath();
            ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
          else {
            // Draw Christmas ornament (bauble)
            const r = p.radius || 5;

            // Ornament glow
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 1.5);
            glow.addColorStop(0, `${p.color}40`);
            glow.addColorStop(1, `${p.color}00`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r * 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Main ornament body with gradient
            const gradient = ctx.createRadialGradient(
              p.x - r * 0.3, p.y - r * 0.3, 0,
              p.x, p.y, r
            );
            gradient.addColorStop(0, `${p.color}FF`);
            gradient.addColorStop(0.7, p.color || '#E53935');
            gradient.addColorStop(1, `${p.color}99`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
            ctx.fill();

            // Shine highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x - r * 0.3, p.y - r * 0.3, r * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Cap/top of ornament
            ctx.fillStyle = '#C0C0C0';
            ctx.beginPath();
            ctx.arc(p.x, p.y - r, r * 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Update position
            p.y += p.speedY || 0.5;
            p.x += (p.speedX || 0) + Math.sin(time + (p.opacity || 0) * 5) * 0.2;

            if (p.y > canvas.height + r * 2) {
              p.y = -r * 2;
              p.x = Math.random() * canvas.width;
            }
            if (p.x > canvas.width) p.x = 0;
            if (p.x < 0) p.x = canvas.width;
          }
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [effect, needsCanvas]);

  // Render Christmas Lights logic
  const renderLights = () => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-yellow-400', 'bg-blue-500'];
    const bulbs = [];
    const bulbCountX = 20;
    const bulbCountY = 10;

    // Top Edge
    for (let i = 0; i < bulbCountX; i++) {
        bulbs.push({
            top: '-6px',
            left: `${(i / bulbCountX) * 100}%`,
            color: colors[i % colors.length],
            delay: `${Math.random() * 2}s`
        });
    }
    // Bottom Edge
    for (let i = 0; i < bulbCountX; i++) {
        bulbs.push({
            bottom: '-6px',
            left: `${(i / bulbCountX) * 100}%`,
            color: colors[(i + 1) % colors.length],
            delay: `${Math.random() * 2}s`
        });
    }
    // Left Edge
    for (let i = 0; i < bulbCountY; i++) {
        bulbs.push({
            left: '-6px',
            top: `${(i / bulbCountY) * 100}%`,
            color: colors[(i + 2) % colors.length],
            delay: `${Math.random() * 2}s`
        });
    }
    // Right Edge
    for (let i = 0; i < bulbCountY; i++) {
        bulbs.push({
            right: '-6px',
            top: `${(i / bulbCountY) * 100}%`,
            color: colors[(i + 3) % colors.length],
            delay: `${Math.random() * 2}s`
        });
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
            {bulbs.map((bulb, index) => (
                <div
                    key={index}
                    className={`absolute w-3 h-3 rounded-full shadow-md animate-pulse ${bulb.color}`}
                    style={{
                        top: bulb.top,
                        left: bulb.left,
                        right: bulb.right,
                        bottom: bulb.bottom,
                        animationDuration: '2s',
                        animationDelay: bulb.delay,
                        boxShadow: `0 0 8px currentColor`
                    }}
                />
            ))}
        </div>
    );
  };

  if (effect === 'none') return null;

  return (
    <>
      {needsCanvas && (
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
        />
      )}
      {needsLights && renderLights()}
    </>
  );
}
