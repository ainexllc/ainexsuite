import { format, subDays, getDay, eachDayOfInterval, startOfWeek } from 'date-fns';
import { Habit, Completion, Member } from '../types/models';

export interface DayStats {
  dayName: string;
  count: number;
  date: string;
}

export interface MemberContribution {
  uid: string;
  displayName: string;
  photoURL?: string;
  totalCompletions: number;
  weeklyCompletions: number;
}

export function calculateWeeklyConsistency(habits: Habit[], completions: Completion[]): DayStats[] {
  const end = new Date();
  const start = subDays(end, 6); // Last 7 days
  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    // Count completions for ACTIVE habits on this day
    const count = completions.filter(c => 
      c.date === dateStr && 
      habits.some(h => h.id === c.habitId && !h.isFrozen)
    ).length;

    return {
      dayName: format(day, 'EEE'), // Mon, Tue
      count,
      date: dateStr
    };
  });
}

export function getBestDayOfWeek(completions: Completion[]): string {
  if (completions.length === 0) return 'None';

  const dayCounts = new Array(7).fill(0);
  
  completions.forEach(c => {
    const dayIndex = getDay(new Date(c.date));
    dayCounts[dayIndex]++;
  });

  const maxVal = Math.max(...dayCounts);
  if (maxVal === 0) return 'None';
  
  const bestDayIndex = dayCounts.indexOf(maxVal);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[bestDayIndex];
}

export function calculateCompletionRate(habit: Habit, completions: Completion[], days: number = 30): number {
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const end = new Date();
  const start = subDays(end, days - 1);
  
  // Simple calculation: (Completions / Days) * 100
  // Ideally, we check if the habit was scheduled for that day, but for MVP this is a good approximation of "momentum".
  const count = habitCompletions.filter(c => new Date(c.date) >= start).length;
  return Math.round((count / days) * 100);
}

export function getTeamContribution(members: Member[], completions: Completion[]): MemberContribution[] {
  const startOfCurrentWeek = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return members.map(member => {
    const userCompletions = completions.filter(c => c.userId === member.uid);
    const weeklyCount = userCompletions.filter(c => c.date >= startOfCurrentWeek).length;

    return {
      uid: member.uid,
      displayName: member.displayName,
      photoURL: member.photoURL,
      totalCompletions: userCompletions.length,
      weeklyCompletions: weeklyCount
    };
  }).sort((a, b) => b.weeklyCompletions - a.weeklyCompletions); // Sort by weekly performance
}
