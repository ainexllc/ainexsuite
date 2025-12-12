import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  getDocs, 
  Timestamp, 
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/types/event';
import { addDays, addWeeks, addMonths, addYears, isBefore, parseISO } from 'date-fns';

const EVENTS_COLLECTION = 'calendar_events';
const TASKS_COLLECTION = 'tasks';

// Minimal interface for the Todo Task structure stored in Firestore
interface TaskDoc {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string; // ISO string
  assigneeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export const EventsService = {
  /**
   * Get all events for a user, including expanding recurring events and fetching assigned tasks.
   */
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    // 1. Fetch Calendar Events
    const eventsRef = collection(db, 'users', userId, EVENTS_COLLECTION);
    const eventsQuery = query(eventsRef, orderBy('startTime', 'asc'));
    
    // 2. Fetch Assigned Tasks
    const tasksRef = collection(db, TASKS_COLLECTION);
    // Note: We only fetch tasks assigned to the user that are not 'done' (optional, but good for calendar)
    // For now, we fetch all assigned tasks to show completed ones too if needed
    const tasksQuery = query(
      tasksRef, 
      where('assigneeIds', 'array-contains', userId)
    );

    const [eventsSnapshot, tasksSnapshot] = await Promise.all([
      getDocs(eventsQuery),
      getDocs(tasksQuery)
    ]);

    const baseEvents = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));

    // Process Tasks into Events
    const taskEvents: CalendarEvent[] = tasksSnapshot.docs
      .map(doc => {
        const data = doc.data() as TaskDoc;
        return { ...data, id: doc.id };
      })
      .filter(task => task.dueDate) // Only tasks with due dates
      .map(task => {
        // Safely parse the ISO string
        let startDate: Date;
        try {
          startDate = parseISO(task.dueDate!);
        } catch (e) {
          console.error(`Invalid date for task ${task.id}`, e);
          return null;
        }

        return {
          id: `task_${task.id}`, // Prefix to distinguish and ensure uniqueness
          userId,
          title: task.title,
          description: task.description,
          startTime: Timestamp.fromDate(startDate),
          // Default task duration to 1 hour for calendar visualization
          endTime: Timestamp.fromDate(new Date(startDate.getTime() + 60 * 60 * 1000)),
          allDay: false,
          type: 'task',
          color: '#10b981', // Emerald-500
          createdAt: task.createdAt ? Timestamp.fromDate(parseISO(task.createdAt)) : Timestamp.now(),
          updatedAt: task.updatedAt ? Timestamp.fromDate(parseISO(task.updatedAt)) : Timestamp.now(),
          // Store original task ID for potential linking back
          baseEventId: task.id 
        } as CalendarEvent;
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Expand recurring events
    const allEvents: CalendarEvent[] = [...taskEvents];
    const expansionEnd = addYears(new Date(), 1); // Expand up to 1 year in future

    for (const event of baseEvents) {
      if (!event.recurrence) {
        allEvents.push(event);
        continue;
      }

      // It's a recurring event, generate instances
      allEvents.push(event); // Add the base instance

      const { frequency, interval, endDate } = event.recurrence;
      const recurrenceEnd = endDate ? endDate.toDate() : expansionEnd;
      const actualEnd = isBefore(recurrenceEnd, expansionEnd) ? recurrenceEnd : expansionEnd;

      let currentStart = event.startTime.toDate();
      let currentEnd = event.endTime.toDate();
      let count = 0;
      const maxInstances = 365; // Safety limit

      while (count < maxInstances) {
        // Calculate next instance date
        if (frequency === 'daily') {
          currentStart = addDays(currentStart, interval);
          currentEnd = addDays(currentEnd, interval);
        } else if (frequency === 'weekly') {
          currentStart = addWeeks(currentStart, interval);
          currentEnd = addWeeks(currentEnd, interval);
        } else if (frequency === 'monthly') {
          currentStart = addMonths(currentStart, interval);
          currentEnd = addMonths(currentEnd, interval);
        } else if (frequency === 'yearly') {
          currentStart = addYears(currentStart, interval);
          currentEnd = addYears(currentEnd, interval);
        }

        if (isBefore(actualEnd, currentStart)) break;

        // Create instance
        // We generate a synthetic ID for the instance
        const instanceId = `${event.id}_${currentStart.getTime()}`;
        
        allEvents.push({
          ...event,
          id: instanceId,
          startTime: Timestamp.fromDate(currentStart),
          endTime: Timestamp.fromDate(currentEnd),
          baseEventId: event.id,
          // Clear recurrence on instances to prevent double expansion if logic changes
          recurrence: undefined 
        });

        count++;
      }
    }

    return allEvents;
  },

  async addEvent(userId: string, event: CreateEventInput): Promise<string> {
    const eventsRef = collection(db, 'users', userId, EVENTS_COLLECTION);

    const docData: Record<string, unknown> = {
      userId,
      title: event.title,
      description: event.description || '',
      startTime: Timestamp.fromDate(event.startTime),
      endTime: Timestamp.fromDate(event.endTime),
      allDay: event.allDay || false,
      type: event.type || 'event',
      color: event.color || '#3b82f6',
      location: event.location || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (event.recurrence) {
      docData.recurrence = {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval,
        endDate: event.recurrence.endDate ? Timestamp.fromDate(event.recurrence.endDate) : null
      };
    }

    const docRef = await addDoc(eventsRef, docData);
    return docRef.id;
  },

  async updateEvent(userId: string, event: UpdateEventInput): Promise<void> {
    const eventRef = doc(db, 'users', userId, EVENTS_COLLECTION, event.id);
    
    const updateData: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };

    if (event.title) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.startTime) updateData.startTime = Timestamp.fromDate(event.startTime);
    if (event.endTime) updateData.endTime = Timestamp.fromDate(event.endTime);
    if (event.allDay !== undefined) updateData.allDay = event.allDay;
    if (event.color) updateData.color = event.color;
    if (event.type) updateData.type = event.type;
    if (event.location !== undefined) updateData.location = event.location;
    
    if (event.recurrence) {
      updateData.recurrence = {
        ...event.recurrence,
        endDate: event.recurrence.endDate ? Timestamp.fromDate(event.recurrence.endDate) : null
      };
    }

    await updateDoc(eventRef, updateData);
  },

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    // If deleting an instance (contains '_'), we technically should handle exceptions.
    // For MVP, we only allow deleting the MAIN event.
    // Ideally, the UI passes the baseEventId if it's an instance.
    
    const realId = eventId.split('_')[0]; 
    const eventRef = doc(db, 'users', userId, EVENTS_COLLECTION, realId);
    await deleteDoc(eventRef);
  }
};