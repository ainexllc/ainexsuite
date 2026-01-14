/**
 * Fire confetti celebration for completed checklists
 * Uses canvas-confetti library
 */
export async function fireCelebration() {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid SSR issues
  const confetti = (await import('canvas-confetti')).default;

  const duration = 600;
  const end = Date.now() + duration;

  // Amber/gold colors for notes app
  const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#d97706'];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}

/**
 * Fire a smaller confetti burst from a specific position
 */
export async function fireConfettiFromElement(element: HTMLElement) {
  if (typeof window === 'undefined') return;

  const confetti = (await import('canvas-confetti')).default;
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 40,
    spread: 60,
    origin: { x, y },
    colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#d97706'],
    ticks: 150,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 25,
  });
}
