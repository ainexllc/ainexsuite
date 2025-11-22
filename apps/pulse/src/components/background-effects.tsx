'use client';

import { useEffect, useRef } from 'react';

export type EffectType = 'none' | 'rain' | 'heavy-rain' | 'snow' | 'heavy-snow' | 'fog' | 'christmas-lights' | 'confetti' | 'christmas-lights-snow' | 'fireflies' | 'sakura' | 'fireworks';

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
    'fireworks'
  ].includes(effect);

  // Helper to determine if we need lights
  const needsLights = ['christmas-lights', 'christmas-lights-snow'].includes(effect);

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
      } else if (effect === 'fireworks') {
        // Fireworks don't need initial particles, they spawn dynamically
        particles = [];
      }
    };

    init();

    const draw = () => {
      // Fade out effect for trails
      if (effect === 'fireworks') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
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
      else if (effect === 'fireworks') {
        // Randomly launch new fireworks
        if (Math.random() < 0.03) {
          particles.push({
            type: 'rocket',
            x: Math.random() * canvas.width,
            y: canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: -(Math.random() * 10 + 10),
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            explodeY: Math.random() * (canvas.height * 0.6) // Target height to explode
          });
        }

        // Update and draw particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];

          if (p.type === 'rocket') {
            // Rocket logic
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.vy !== undefined) p.vy += 0.1; // Gravity

            ctx.fillStyle = p.color || 'white';
            ctx.fillRect(p.x, p.y, 2, 6);

            // Explode if reached target height or starts falling
            if ((p.vy || 0) >= 0 || p.y <= (p.explodeY || 0)) {
              // Create explosion particles
              for (let j = 0; j < 50; j++) {
                const angle = (Math.PI * 2 * j) / 50;
                const speed = Math.random() * 3 + 2;
                particles.push({
                  type: 'spark',
                  x: p.x,
                  y: p.y,
                  vx: Math.cos(angle) * speed,
                  vy: Math.sin(angle) * speed,
                  color: p.color,
                  life: 100,
                  decay: Math.random() * 0.02 + 0.01
                });
              }
              particles.splice(i, 1); // Remove rocket
            }
          } else if (p.type === 'spark') {
            // Spark logic
            p.x += p.vx || 0;
            p.y += p.vy || 0;
            if (p.vy !== undefined) p.vy += 0.05; // Gravity
            if (p.vx !== undefined) p.vx *= 0.95; // Air resistance
            if (p.vy !== undefined) p.vy *= 0.95;
            if (p.life !== undefined) p.life -= 1;

            ctx.globalAlpha = Math.max(0, (p.life || 0) / 100);
            ctx.fillStyle = p.color || 'white';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            if ((p.life || 0) <= 0) {
              particles.splice(i, 1);
            }
          }
        }
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
