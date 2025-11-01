/**
 * Random utility functions for sampling and shuffling
 */

/**
 * Randomly sample n items from an array without replacement
 */
export function sampleArray<T>(array: T[], n: number): T[] {
  if (n >= array.length) return [...array];
  if (n <= 0) return [];

  const shuffled = [...array];
  let currentIndex = shuffled.length;

  // Fisher-Yates shuffle for first n elements
  while (currentIndex > shuffled.length - n) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled.slice(-n);
}

/**
 * Shuffle an array in place
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Pick a random item from an array
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}
