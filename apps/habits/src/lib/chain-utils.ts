import { Habit } from '@/types/models';

/**
 * Get all habits in a chain, starting from a given habit.
 */
export function getHabitChain(startHabit: Habit, allHabits: Habit[]): Habit[] {
  const chain: Habit[] = [];
  let current: Habit | undefined = startHabit;

  // Go backwards to find the start
  while (current?.chainedFrom) {
    const prev = allHabits.find(h => h.id === current!.chainedFrom);
    if (prev) {
      chain.unshift(prev);
      current = prev;
    } else {
      break;
    }
  }

  // Reset to original and go forward
  current = startHabit;
  chain.push(current);

  while (current?.chainedTo) {
    const next = allHabits.find(h => h.id === current!.chainedTo);
    if (next) {
      chain.push(next);
      current = next;
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Get the next habit in the chain after a given habit.
 */
export function getNextInChain(habit: Habit, allHabits: Habit[]): Habit | null {
  if (!habit.chainedTo) return null;
  return allHabits.find(h => h.id === habit.chainedTo) || null;
}

/**
 * Check if a habit is the start of a chain.
 */
export function isChainStart(habit: Habit): boolean {
  return !habit.chainedFrom && !!habit.chainedTo;
}

/**
 * Check if a habit is part of a chain.
 */
export function isInChain(habit: Habit): boolean {
  return !!habit.chainedFrom || !!habit.chainedTo;
}

/**
 * Get chain position label (e.g., "1 of 3")
 */
export function getChainPositionLabel(habit: Habit, allHabits: Habit[]): string | null {
  if (!isInChain(habit)) return null;

  const chain = getHabitChain(habit, allHabits);
  const position = chain.findIndex(h => h.id === habit.id) + 1;

  return `${position} of ${chain.length}`;
}

/**
 * Get habits that can be chained to (not already in a chain, not the same habit).
 */
export function getChainableHabits(habit: Habit, allHabits: Habit[]): Habit[] {
  return allHabits.filter(h =>
    h.id !== habit.id &&
    !h.chainedFrom && // Not already following another habit
    h.spaceId === habit.spaceId // Same space
  );
}
