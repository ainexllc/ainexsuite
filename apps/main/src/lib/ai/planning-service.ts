import { db } from '@ainexsuite/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { parseDate } from '@ainexsuite/date-detection';
import type { Note, NoteColor, NotePriority, ChecklistItem } from './notes-service';
import { getNote } from './notes-service';

// ============================================
// TYPES
// ============================================

export type RecurringType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface DeadlineResult {
  noteId: string;
  itemId?: string;
  deadlineDate: Date;
  message: string;
  isNaturalLanguage: boolean;
  originalInput: string;
}

export interface UpcomingDeadline {
  noteId: string;
  noteTitle: string;
  itemId?: string;
  itemText?: string;
  dueDate: Date;
  isOverdue: boolean;
  priority: NotePriority | null;
  daysUntilDue: number;
  type: 'note' | 'checklist_item';
}

export interface DeadlinesResult {
  deadlines: UpcomingDeadline[];
  summary: {
    total: number;
    overdue: number;
    dueToday: number;
    dueThisWeek: number;
    highPriority: number;
  };
}

export interface ReminderResult {
  noteId: string;
  reminderId: string;
  reminderSet: Date;
  nextReminder: Date;
  recurring: RecurringType;
  message: string;
}

export interface Reminder {
  id: string;
  noteId: string;
  userId: string;
  reminderTime: Date;
  recurring: RecurringType;
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  nextReminder: Date;
}

// ============================================
// HELPERS
// ============================================

function mapNoteDoc(docSnapshot: { id: string; data: () => Record<string, unknown> }): Note {
  const data = docSnapshot.data();
  return {
    id: docSnapshot.id,
    ownerId: (data.ownerId as string) || '',
    spaceId: (data.spaceId as string) || 'personal',
    title: (data.title as string) || '',
    body: (data.body as string) || '',
    type: (data.type as 'text' | 'checklist') || 'text',
    checklist: (data.checklist as ChecklistItem[]) || [],
    color: (data.color as NoteColor) || 'default',
    pinned: (data.pinned as boolean) || false,
    archived: (data.archived as boolean) || false,
    priority: (data.priority as NotePriority) || null,
    labelIds: (data.labelIds as string[]) || [],
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    deletedAt: (data.deletedAt as Timestamp)?.toDate() || null,
  };
}

/**
 * Parse a deadline string which can be an ISO date or natural language
 */
function parseDeadlineInput(input: string): { date: Date | null; isNaturalLanguage: boolean } {
  // First try ISO date format
  const isoDate = new Date(input);
  if (!isNaN(isoDate.getTime()) && input.match(/^\d{4}-\d{2}-\d{2}/)) {
    return { date: isoDate, isNaturalLanguage: false };
  }

  // Try natural language parsing using chrono-node via date-detection
  const parsedDate = parseDate(input);
  if (parsedDate) {
    return { date: parsedDate, isNaturalLanguage: true };
  }

  // Fallback: Try simple relative date parsing
  const simpleParsed = parseSimpleRelativeDate(input);
  if (simpleParsed) {
    return { date: simpleParsed, isNaturalLanguage: true };
  }

  return { date: null, isNaturalLanguage: false };
}

/**
 * Simple fallback parser for common relative date expressions
 */
function parseSimpleRelativeDate(input: string): Date | null {
  const lowerInput = input.toLowerCase().trim();
  const now = new Date();

  // Today
  if (lowerInput === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  }

  // Tomorrow
  if (lowerInput === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59, 59);
  }

  // Next week
  if (lowerInput === 'next week') {
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 23, 59, 59);
  }

  // In X days
  const inDaysMatch = lowerInput.match(/^in\s+(\d+)\s+days?$/);
  if (inDaysMatch) {
    const days = parseInt(inDaysMatch[1], 10);
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    return new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), 23, 59, 59);
  }

  // In X weeks
  const inWeeksMatch = lowerInput.match(/^in\s+(\d+)\s+weeks?$/);
  if (inWeeksMatch) {
    const weeks = parseInt(inWeeksMatch[1], 10);
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + weeks * 7);
    return new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), 23, 59, 59);
  }

  // Next [day of week]
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const nextDayMatch = lowerInput.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
  if (nextDayMatch) {
    const targetDay = dayNames.indexOf(nextDayMatch[1]);
    const currentDay = now.getDay();
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) daysUntilTarget += 7;
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysUntilTarget);
    return new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), 23, 59, 59);
  }

  // End of week (Friday)
  if (lowerInput === 'end of week' || lowerInput === 'eow') {
    const currentDay = now.getDay();
    const daysUntilFriday = (5 - currentDay + 7) % 7 || 7;
    const friday = new Date(now);
    friday.setDate(friday.getDate() + daysUntilFriday);
    return new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), 23, 59, 59);
  }

  // End of month
  if (lowerInput === 'end of month' || lowerInput === 'eom') {
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  return null;
}

/**
 * Calculate the next reminder date based on recurring type
 */
function calculateNextReminder(baseDate: Date, recurring: RecurringType): Date {
  const next = new Date(baseDate);

  switch (recurring) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'none':
    default:
      // Non-recurring, next reminder is the same as the base date
      break;
  }

  return next;
}

/**
 * Format a date for display in messages
 */
function formatDateForMessage(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'tomorrow';
  if (diffDays === -1) return 'yesterday';

  if (diffDays > 0 && diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Set a deadline on a note or a specific checklist item
 * @param userId - The user ID
 * @param noteId - The note ID
 * @param itemId - Optional checklist item ID (if setting deadline on specific item)
 * @param deadline - ISO date string or natural language (e.g., "next Friday", "in 3 days")
 */
export async function setDeadline(
  userId: string,
  noteId: string,
  itemId: string | null,
  deadline: string
): Promise<DeadlineResult> {
  // Parse the deadline
  const { date: deadlineDate, isNaturalLanguage } = parseDeadlineInput(deadline);

  if (!deadlineDate) {
    throw new Error(
      `Could not parse deadline "${deadline}". Try formats like "2024-03-15", "next Friday", "in 3 days", or "tomorrow".`
    );
  }

  // Get the note
  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error(`Note not found with ID: ${noteId}`);
  }

  const noteRef = doc(db, 'users', userId, 'notes', noteId);

  if (itemId) {
    // Set deadline on a specific checklist item
    const itemIndex = note.checklist.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error(`Checklist item not found with ID: ${itemId}`);
    }

    const updatedChecklist = [...note.checklist];
    updatedChecklist[itemIndex] = {
      ...updatedChecklist[itemIndex],
      dueDate: deadlineDate.toISOString().split('T')[0], // Store as YYYY-MM-DD
    };

    await updateDoc(noteRef, {
      checklist: updatedChecklist,
      updatedAt: serverTimestamp(),
    });

    return {
      noteId,
      itemId,
      deadlineDate,
      message: `Deadline set for "${updatedChecklist[itemIndex].text}" to ${formatDateForMessage(deadlineDate)}`,
      isNaturalLanguage,
      originalInput: deadline,
    };
  } else {
    // Set deadline on the note itself (stored in a custom field)
    await updateDoc(noteRef, {
      deadline: Timestamp.fromDate(deadlineDate),
      updatedAt: serverTimestamp(),
    });

    return {
      noteId,
      deadlineDate,
      message: `Deadline set for "${note.title}" to ${formatDateForMessage(deadlineDate)}`,
      isNaturalLanguage,
      originalInput: deadline,
    };
  }
}

/**
 * Get all upcoming deadlines for a user
 * @param userId - The user ID
 * @param spaceId - Optional space ID to filter
 * @param days - Number of days to look ahead (default 7)
 * @param includeOverdue - Whether to include overdue items (default true)
 */
export async function getUpcomingDeadlines(
  userId: string,
  spaceId?: string,
  days: number = 7,
  includeOverdue: boolean = true
): Promise<DeadlinesResult> {
  const notesRef = collection(db, 'users', userId, 'notes');

  let q;
  if (spaceId) {
    q = query(
      notesRef,
      where('spaceId', '==', spaceId),
      orderBy('updatedAt', 'desc'),
      limit(200)
    );
  } else {
    q = query(notesRef, orderBy('updatedAt', 'desc'), limit(200));
  }

  const snapshot = await getDocs(q);
  const notes = snapshot.docs
    .map((docSnapshot) => mapNoteDoc({ id: docSnapshot.id, data: () => docSnapshot.data() }))
    .filter((note) => !note.deletedAt && !note.archived);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const futureLimit = new Date(today);
  futureLimit.setDate(futureLimit.getDate() + days);

  const deadlines: UpcomingDeadline[] = [];

  for (const note of notes) {
    // Check note-level deadline
    const noteData = snapshot.docs.find((d) => d.id === note.id)?.data();
    const noteDeadline = (noteData?.deadline as Timestamp)?.toDate();

    if (noteDeadline) {
      const isOverdue = noteDeadline < today;
      const daysUntilDue = Math.ceil(
        (noteDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (
        (noteDeadline <= futureLimit || (includeOverdue && isOverdue)) &&
        (!isOverdue || includeOverdue)
      ) {
        deadlines.push({
          noteId: note.id,
          noteTitle: note.title,
          dueDate: noteDeadline,
          isOverdue,
          priority: note.priority,
          daysUntilDue,
          type: 'note',
        });
      }
    }

    // Check checklist item deadlines
    if (note.type === 'checklist') {
      for (const item of note.checklist) {
        if (item.dueDate && !item.completed) {
          const itemDueDate = new Date(item.dueDate);
          const isOverdue = itemDueDate < today;
          const daysUntilDue = Math.ceil(
            (itemDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (
            (itemDueDate <= futureLimit || (includeOverdue && isOverdue)) &&
            (!isOverdue || includeOverdue)
          ) {
            deadlines.push({
              noteId: note.id,
              noteTitle: note.title,
              itemId: item.id,
              itemText: item.text,
              dueDate: itemDueDate,
              isOverdue,
              priority: item.priority || null,
              daysUntilDue,
              type: 'checklist_item',
            });
          }
        }
      }
    }
  }

  // Sort by due date (overdue first, then by date)
  deadlines.sort((a, b) => {
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  // Calculate summary
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const summary = {
    total: deadlines.length,
    overdue: deadlines.filter((d) => d.isOverdue).length,
    dueToday: deadlines.filter((d) => d.daysUntilDue === 0).length,
    dueThisWeek: deadlines.filter((d) => d.daysUntilDue > 0 && d.daysUntilDue <= 7).length,
    highPriority: deadlines.filter((d) => d.priority === 'high').length,
  };

  return { deadlines, summary };
}

/**
 * Create a reminder for a note
 * @param userId - The user ID
 * @param noteId - The note ID to remind about
 * @param reminderTime - When to remind (ISO date or natural language)
 * @param recurring - Recurring type: 'none', 'daily', 'weekly', 'monthly'
 */
export async function createReminder(
  userId: string,
  noteId: string,
  reminderTime: string,
  recurring: RecurringType = 'none'
): Promise<ReminderResult> {
  // Parse the reminder time
  const { date: reminderDate } = parseDeadlineInput(reminderTime);

  if (!reminderDate) {
    throw new Error(
      `Could not parse reminder time "${reminderTime}". Try formats like "2024-03-15 9:00", "tomorrow at 9am", or "in 2 hours".`
    );
  }

  // Verify the note exists
  const note = await getNote(userId, noteId);
  if (!note) {
    throw new Error(`Note not found with ID: ${noteId}`);
  }

  // If reminder is in the past for non-recurring, adjust to next occurrence
  const now = new Date();
  let actualReminderDate = reminderDate;

  if (reminderDate < now && recurring !== 'none') {
    // Calculate next occurrence
    actualReminderDate = calculateNextReminder(now, recurring);
  } else if (reminderDate < now) {
    throw new Error('Cannot create a reminder in the past. Please choose a future time.');
  }

  // Create the reminder document
  const reminderId = generateId();
  const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);

  const reminderData: Omit<Reminder, 'id'> = {
    noteId,
    userId,
    reminderTime: actualReminderDate,
    recurring,
    isActive: true,
    createdAt: new Date(),
    nextReminder: actualReminderDate,
  };

  await setDoc(reminderRef, {
    ...reminderData,
    reminderTime: Timestamp.fromDate(actualReminderDate),
    createdAt: serverTimestamp(),
    nextReminder: Timestamp.fromDate(actualReminderDate),
  });

  // Build message
  let message = `Reminder set for "${note.title}" ${formatDateForMessage(actualReminderDate)}`;

  if (reminderDate.getHours() !== 23 || reminderDate.getMinutes() !== 59) {
    message += ` at ${reminderDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }

  if (recurring !== 'none') {
    message += ` (repeats ${recurring})`;
  }

  return {
    noteId,
    reminderId,
    reminderSet: actualReminderDate,
    nextReminder: actualReminderDate,
    recurring,
    message,
  };
}

/**
 * List all active reminders for a user
 * @param userId - The user ID
 * @param noteId - Optional note ID to filter reminders for a specific note
 */
export async function listReminders(
  userId: string,
  noteId?: string
): Promise<Reminder[]> {
  const remindersRef = collection(db, 'users', userId, 'reminders');

  let q;
  if (noteId) {
    q = query(
      remindersRef,
      where('noteId', '==', noteId),
      where('isActive', '==', true),
      orderBy('nextReminder', 'asc')
    );
  } else {
    q = query(
      remindersRef,
      where('isActive', '==', true),
      orderBy('nextReminder', 'asc')
    );
  }

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      noteId: data.noteId as string,
      userId: data.userId as string,
      reminderTime: (data.reminderTime as Timestamp).toDate(),
      recurring: data.recurring as RecurringType,
      isActive: data.isActive as boolean,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      lastTriggered: (data.lastTriggered as Timestamp)?.toDate(),
      nextReminder: (data.nextReminder as Timestamp).toDate(),
    };
  });
}

/**
 * Cancel/delete a reminder
 * @param userId - The user ID
 * @param reminderId - The reminder ID to cancel
 */
export async function cancelReminder(
  userId: string,
  reminderId: string
): Promise<{ success: boolean; message: string }> {
  const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);
  const reminderSnap = await getDoc(reminderRef);

  if (!reminderSnap.exists()) {
    throw new Error(`Reminder not found with ID: ${reminderId}`);
  }

  await updateDoc(reminderRef, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });

  return {
    success: true,
    message: 'Reminder cancelled successfully',
  };
}

/**
 * Update a reminder's next occurrence (used when a recurring reminder triggers)
 * @param userId - The user ID
 * @param reminderId - The reminder ID
 */
export async function triggerReminder(
  userId: string,
  reminderId: string
): Promise<Reminder | null> {
  const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);
  const reminderSnap = await getDoc(reminderRef);

  if (!reminderSnap.exists()) {
    return null;
  }

  const data = reminderSnap.data();
  const recurring = data.recurring as RecurringType;

  if (recurring === 'none') {
    // Non-recurring reminder - deactivate it
    await updateDoc(reminderRef, {
      isActive: false,
      lastTriggered: serverTimestamp(),
    });

    return {
      id: reminderId,
      noteId: data.noteId as string,
      userId: data.userId as string,
      reminderTime: (data.reminderTime as Timestamp).toDate(),
      recurring,
      isActive: false,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      lastTriggered: new Date(),
      nextReminder: (data.nextReminder as Timestamp).toDate(),
    };
  }

  // Recurring reminder - calculate next occurrence
  const currentReminder = (data.nextReminder as Timestamp).toDate();
  const nextReminder = calculateNextReminder(currentReminder, recurring);

  await updateDoc(reminderRef, {
    nextReminder: Timestamp.fromDate(nextReminder),
    lastTriggered: serverTimestamp(),
  });

  return {
    id: reminderId,
    noteId: data.noteId as string,
    userId: data.userId as string,
    reminderTime: (data.reminderTime as Timestamp).toDate(),
    recurring,
    isActive: true,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    lastTriggered: new Date(),
    nextReminder,
  };
}

/**
 * Get a summary of all planning items (deadlines and reminders)
 * @param userId - The user ID
 * @param spaceId - Optional space ID
 */
export async function getPlanningOverview(
  userId: string,
  spaceId?: string
): Promise<{
  deadlines: DeadlinesResult;
  reminders: Reminder[];
  summary: string;
}> {
  const [deadlinesResult, reminders] = await Promise.all([
    getUpcomingDeadlines(userId, spaceId, 14, true),
    listReminders(userId),
  ]);

  // Build summary
  const summaryParts: string[] = [];

  if (deadlinesResult.summary.overdue > 0) {
    summaryParts.push(`${deadlinesResult.summary.overdue} overdue`);
  }
  if (deadlinesResult.summary.dueToday > 0) {
    summaryParts.push(`${deadlinesResult.summary.dueToday} due today`);
  }
  if (deadlinesResult.summary.dueThisWeek > 0) {
    summaryParts.push(`${deadlinesResult.summary.dueThisWeek} due this week`);
  }

  const upcomingReminders = reminders.filter((r) => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return r.nextReminder <= weekFromNow;
  }).length;

  if (upcomingReminders > 0) {
    summaryParts.push(`${upcomingReminders} reminder${upcomingReminders > 1 ? 's' : ''} coming up`);
  }

  const summary = summaryParts.length > 0
    ? `You have ${summaryParts.join(', ')}.`
    : 'No upcoming deadlines or reminders.';

  return {
    deadlines: deadlinesResult,
    reminders,
    summary,
  };
}
