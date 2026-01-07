/**
 * Fire confetti burst animation
 * Uses canvas-confetti library (same as MagicUI ConfettiButton)
 */
export async function fireConfetti(options?: {
  origin?: { x: number; y: number };
  colors?: string[];
  particleCount?: number;
}) {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid SSR issues
  const confetti = (await import('canvas-confetti')).default;

  const defaults = {
    particleCount: options?.particleCount || 50,
    spread: 60,
    origin: options?.origin || { y: 0.7, x: 0.5 },
    colors: options?.colors || ['#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4'], // Teal colors for habits app
    ticks: 200,
    gravity: 1.2,
    decay: 0.94,
    startVelocity: 30,
  };

  confetti(defaults);
}

/**
 * Fire confetti burst from a specific element's position
 */
export async function fireConfettiFromElement(element: HTMLElement, options?: {
  colors?: string[];
  particleCount?: number;
}) {
  // Only run on client
  if (typeof window === 'undefined') return;

  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  await fireConfetti({
    origin: { x, y },
    colors: options?.colors,
    particleCount: options?.particleCount,
  });
}

/**
 * Fire a bigger celebration for milestones (streak achievements, all habits done, etc.)
 */
export async function fireCelebration() {
  // Only run on client
  if (typeof window === 'undefined') return;

  // Dynamic import to avoid SSR issues
  const confetti = (await import('canvas-confetti')).default;

  const duration = 500;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#14b8a6', '#2dd4bf', '#5eead4', '#fbbf24', '#f472b6'],
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#14b8a6', '#2dd4bf', '#5eead4', '#fbbf24', '#f472b6'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
