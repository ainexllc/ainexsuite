'use client';

import { useEffect, useRef } from 'react';

export type EffectType = 'none' | 'rain' | 'heavy-rain' | 'snow' | 'heavy-snow' | 'fog' | 'ice' | 'christmas-lights' | 'confetti' | 'christmas-lights-snow' | 'fireflies' | 'sakura' | 'fireworks' | 'bubbles' | 'autumn-leaves' | 'meteors' | 'plasma';

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
  type?: 'rocket' | 'spark' | 'meteor' | 'tail' | 'bolt';
  explodeY?: number;
  angle?: number;
  wobble?: number; // For bubbles
  wobbleSpeed?: number; // For bubbles
  segments?: {x: number, y: number}[]; // For plasma
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
    'fireworks',
    'bubbles',
    'autumn-leaves',
    'ice'
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
    let lastTime = performance.now();
    
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
      lastTime = performance.now();

      if (effect === 'rain' || effect === 'heavy-rain') {
        const particleCount = effect === 'heavy-rain' ? 400 : 100;
        for (let i = 0; i < particleCount; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: Math.random() * 15 + (effect === 'heavy-rain' ? 25 : 15),
            length: Math.random() * 20 + (effect === 'heavy-rain' ? 35 : 25),
            opacity: Math.random() * 0.5 + (effect === 'heavy-rain' ? 0.4 : 0.2)
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
            dx: Math.random() * 0.5 + 0.2, // Slow positive drift
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
            radius: Math.random() * 5 + 5,
            speedY: Math.random() * 1 + 0.5,
            speedX: Math.random() * 1 - 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.4 + 0.6
          });
        }
      } else if (effect === 'bubbles') {
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 15 + 5,
                speedY: Math.random() * 1 + 0.5,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.05 + 0.02,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
      } else if (effect === 'autumn-leaves') {
        const colors = ['#e63946', '#f4a261', '#e76f51', '#d4a373', '#a98467'];
        for (let i = 0; i < 60; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 8 + 8,
            speedY: Math.random() * 1 + 1,
            speedX: (Math.random() - 0.5) * 1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.3 + 0.6
          });
        }
      } else if (effect === 'ice') {
          // Generate static frost patches
          for (let i = 0; i < 20; i++) {
              particles.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  radius: Math.random() * 100 + 50,
                  rotation: Math.random() * 360,
                  opacity: Math.random() * 0.2 + 0.1
              });
          }
          // Add dynamic rain/melt drops
          for (let i = 0; i < 50; i++) {
              particles.push({
                  type: 'spark', // Reusing spark type for melt drops
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  speed: Math.random() * 2 + 0.5,
                  length: Math.random() * 10 + 5,
                  opacity: Math.random() * 0.3 + 0.1
              });
          }
      } else if (effect === 'fireworks') {
        // Dynamic spawning
        particles = [];
      }
    };

    init();

    const draw = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (deltaTime > 0.1) { // Prevent large jumps if tab inactive
          lastTime = currentTime;
          animationFrameId = requestAnimationFrame(draw);
          return;
      }
      
      // Normalize speed to 60FPS target
      const fpsCorrection = deltaTime * 60;

      // Fade out effect for trails
      if (effect === 'fireworks') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      time += 0.01 * fpsCorrection;

      if (effect === 'rain' || effect === 'heavy-rain') {
        ctx.strokeStyle = 'rgba(174, 194, 224, 0.5)';
        ctx.lineWidth = effect === 'heavy-rain' ? 3 : 2;
        ctx.lineCap = 'round';
        particles.forEach(p => {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + (p.length || 10));
          ctx.stroke();
          p.y += (p.speed || 5) * fpsCorrection;
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
          p.y += (p.speed || 1) * fpsCorrection;
          p.x += Math.sin(time + (p.radius || 2)) * 0.5 * fpsCorrection; // Add some horizontal drift
          
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

          p.y += (p.speedY || 2) * fpsCorrection;
          p.x += ((p.speedX || 0) + Math.sin(time * 2) * 0.5) * fpsCorrection; // Sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 2) * fpsCorrection;

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

            p.x += (p.dx || 0) * fpsCorrection;
            p.y += (p.dy || 0) * fpsCorrection;

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
          p.x += ((p.speedX || 0) + Math.sin(time + (p.opacity || 0)) * 0.2) * fpsCorrection;
          p.y += ((p.speedY || 0) + Math.cos(time + (p.opacity || 0)) * 0.2) * fpsCorrection;
          
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
          
          const r = p.radius || 5;

          // Soft gradient for more realistic petal look
          const gradient = ctx.createRadialGradient(-r*0.2, -r*0.2, 0, 0, 0, r * 1.5);
          gradient.addColorStop(0, `rgba(255, 235, 240, ${p.opacity || 0.8})`); // Pale center
          gradient.addColorStop(1, `rgba(255, 160, 180, ${p.opacity || 0.6})`); // Pink edges
          ctx.fillStyle = gradient;
          
          // Detailed petal shape with notch
          ctx.beginPath();
          ctx.moveTo(0, r); // Bottom point
          
          // Left side curve
          ctx.bezierCurveTo(
            -r * 1.2, r * 0.4, 
            -r * 1.2, -r * 0.8, 
            0, -r * 0.6 // Top notch center
          );
          
          // Right side curve
          ctx.bezierCurveTo(
            r * 1.2, -r * 0.8, 
            r * 1.2, r * 0.4, 
            0, r // Back to bottom
          );
          
          ctx.fill();
          
          // Subtle center vein
          ctx.strokeStyle = `rgba(200, 100, 120, ${(p.opacity || 0.5) * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, r * 0.8);
          ctx.quadraticCurveTo(r * 0.1, 0, 0, -r * 0.3);
          ctx.stroke();
          
          ctx.restore();

          p.y += (p.speedY || 1) * fpsCorrection;
          p.x += ((p.speedX || 0) + Math.sin(time + (p.rotation || 0)) * 0.5) * fpsCorrection; // Sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 1) * fpsCorrection;

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
          ctx.fillStyle = p.color || '#e76f51';
          ctx.globalAlpha = p.opacity || 0.8;
          
          // Draw leaf shape
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius || 12, (p.radius || 12) * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Leaf vein (optional detail)
          ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-(p.radius || 12), 0);
          ctx.lineTo((p.radius || 12), 0);
          ctx.stroke();

          ctx.restore();

          p.y += (p.speedY || 1) * fpsCorrection;
          p.x += ((p.speedX || 0) + Math.sin(time + (p.rotation || 0)) * 0.8) * fpsCorrection; // Sway
          p.rotation = (p.rotation || 0) + (p.rotationSpeed || 1) * fpsCorrection;

          if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width) p.x = 0;
          if (p.x < 0) p.x = canvas.width;
        });
      }
      else if (effect === 'bubbles') {
        particles.forEach(p => {
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity || 0.2})`;
            ctx.lineWidth = 1.5;
            
            // Calculate wobbly x position
            const wobbleX = p.x + Math.sin(time + (p.wobble || 0)) * 20;
            
            ctx.beginPath();
            ctx.arc(wobbleX, p.y, p.radius || 10, 0, Math.PI * 2);
            ctx.stroke();
            
            // Add a little shine
            ctx.beginPath();
            ctx.arc(wobbleX - (p.radius || 10)*0.3, p.y - (p.radius || 10)*0.3, (p.radius || 10)*0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${(p.opacity || 0.2) * 2})`;
            ctx.fill();

            p.y -= (p.speedY || 1) * fpsCorrection;
            p.wobble = (p.wobble || 0) + (p.wobbleSpeed || 0.05) * fpsCorrection;

            if (p.y < -(p.radius || 10)) {
                p.y = canvas.height + (p.radius || 10);
                p.x = Math.random() * canvas.width;
            }
        });
      }
      else if (effect === 'meteors') {
          // Randomly spawn meteors - adjusted prob for fps
          if (Math.random() < 0.05 * fpsCorrection) {
              const angle = Math.PI / 4; // 45 degrees
              // Spawn either from top or left
              let startX, startY;
              if (Math.random() > 0.5) {
                  startX = Math.random() * canvas.width;
                  startY = -50;
              } else {
                  startX = -50;
                  startY = Math.random() * canvas.height / 2; // Only upper half
              }

              particles.push({
                  type: 'meteor',
                  x: startX,
                  y: startY,
                  vx: Math.cos(angle) * 15,
                  vy: Math.sin(angle) * 15,
                  length: Math.random() * 100 + 50,
                  life: 100,
                  opacity: 1
              });
          }

          for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              
              if (p.type === 'meteor') {
                  p.x += (p.vx || 0) * fpsCorrection;
                  p.y += (p.vy || 0) * fpsCorrection;
                  p.life = (p.life || 100) - 2 * fpsCorrection;
                  
                  // Fade out near end of life
                  const alpha = Math.min(1, (p.life || 0) / 20);
                  
                  const gradient = ctx.createLinearGradient(p.x, p.y, p.x - (p.vx || 0)*10, p.y - (p.vy || 0)*10);
                  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                  gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

                  ctx.strokeStyle = gradient;
                  ctx.lineWidth = 2;
                  ctx.lineCap = 'round';
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p.x - (p.vx || 0) * (p.length || 10) / 15, p.y - (p.vy || 0) * (p.length || 10) / 15);
                  ctx.stroke();
                  
                  if ((p.life || 0) <= 0 || p.x > canvas.width + 100 || p.y > canvas.height + 100) {
                      particles.splice(i, 1);
                  }
              }
          }
      }
      else if (effect === 'plasma') {
          // Randomly spawn lightning/plasma bolts
          if (Math.random() < 0.1 * fpsCorrection) {
              const startX = Math.random() * canvas.width;
              const startY = Math.random() * canvas.height;

              // Generate jagged path
              const segments = [{x: startX, y: startY}];
              let currX = startX;
              let currY = startY;

              for(let j=0; j<10; j++) {
                  currX += (Math.random() - 0.5) * 100;
                  currY += (Math.random() - 0.5) * 100;
                  segments.push({x: currX, y: currY});
              }

              particles.push({
                  type: 'bolt',
                  x: startX,
                  y: startY,
                  segments: segments,
                  life: 10,
                  color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)` // Cyan to Blue
              });
          }

          for (let i = particles.length - 1; i >= 0; i--) {
              const p = particles[i];
              
              p.life = (p.life || 0) - 1 * fpsCorrection;
              const alpha = (p.life || 0) / 10;

              ctx.strokeStyle = p.color || 'cyan';
              ctx.lineWidth = 2;
              ctx.shadowBlur = 15;
              ctx.shadowColor = p.color || 'cyan';
              ctx.globalAlpha = alpha;
              
              ctx.beginPath();
              if (p.segments && p.segments.length > 0) {
                  ctx.moveTo(p.segments[0].x, p.segments[0].y);
                  for(let j=1; j<p.segments.length; j++) {
                      ctx.lineTo(p.segments[j].x, p.segments[j].y);
                  }
              }
              ctx.stroke();
              
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;

              if ((p.life || 0) <= 0) {
                  particles.splice(i, 1);
              }
          }
      }
      else if (effect === 'ice') {
          // Draw icy vignette/border
          const gradient = ctx.createRadialGradient(
              canvas.width / 2, canvas.height / 2, canvas.height / 3,
              canvas.width / 2, canvas.height / 2, canvas.height
          );
          gradient.addColorStop(0, 'rgba(200, 230, 255, 0)');
          gradient.addColorStop(1, 'rgba(180, 220, 255, 0.4)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw frost crystals
          particles.forEach(p => {
              if (p.type === 'spark') {
                  // Draw melting drops
                  ctx.strokeStyle = `rgba(200, 230, 255, ${p.opacity || 0.3})`;
                  ctx.lineWidth = 1.5;
                  ctx.lineCap = 'round';
                  ctx.beginPath();
                  ctx.moveTo(p.x, p.y);
                  ctx.lineTo(p.x, p.y + (p.length || 10));
                  ctx.stroke();

                  p.y += (p.speed || 1) * fpsCorrection;
                  if (p.y > canvas.height) {
                      p.y = -(p.length || 10);
                      p.x = Math.random() * canvas.width;
                  }
                  return;
              }

              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate(((p.rotation || 0) * Math.PI) / 180);
              
              ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity || 0.1})`;
              ctx.lineWidth = 2;
              ctx.beginPath();
              
              // Draw a snowflake/frost-like pattern
              for(let i = 0; i < 6; i++) {
                  ctx.moveTo(0, 0);
                  ctx.lineTo(0, -(p.radius || 50));
                  // Branches
                  ctx.moveTo(0, -(p.radius || 50) * 0.4);
                  ctx.lineTo((p.radius || 50) * 0.2, -(p.radius || 50) * 0.6);
                  ctx.moveTo(0, -(p.radius || 50) * 0.4);
                  ctx.lineTo(-(p.radius || 50) * 0.2, -(p.radius || 50) * 0.6);
                  
                  ctx.rotate(Math.PI / 3);
              }
              ctx.stroke();
              ctx.restore();
          });

          // Rain sliding down (Ice Melt) effect removed (handled by particles now)
      }
      else if (effect === 'fireworks') {
        // Randomly launch new fireworks
        if (Math.random() < 0.03 * fpsCorrection) {
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
            p.x += (p.vx || 0) * fpsCorrection;
            p.y += (p.vy || 0) * fpsCorrection;
            if (p.vy !== undefined) p.vy += 0.1 * fpsCorrection; // Gravity

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
            p.x += (p.vx || 0) * fpsCorrection;
            p.y += (p.vy || 0) * fpsCorrection;
            if (p.vy !== undefined) p.vy += 0.05 * fpsCorrection; // Gravity
            if (p.vx !== undefined) p.vx *= 0.95; // Air resistance (exponential decay ok to leave per-frame for simplicity, or approximate)
            if (p.vy !== undefined) p.vy *= 0.95;
            if (p.life !== undefined) p.life -= 1 * fpsCorrection;

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
