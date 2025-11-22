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
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';
import { CalendarEvent, CreateEventInput, UpdateEventInput } from '@/types/event';
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';

const COLLECTION_NAME = 'calendar_events';

export const EventsService = {
  /**
   * Get all events for a user, including expanding recurring events.
   * Note: In a production app, you'd pass a start/end range to getEvents to limit expansion.
   * For this prototype, we'll fetch all and expand within a reasonable window (e.g., +/- 1 year from now, or just expanding all).
   */
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    const eventsRef = collection(db, 'users', userId, COLLECTION_NAME);
    const q = query(eventsRef, orderBy('startTime', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const baseEvents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CalendarEvent));

    // Expand recurring events
    const allEvents: CalendarEvent[] = [];
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
    const eventsRef = collection(db, 'users', userId, COLLECTION_NAME);
    
    const docData: Record<string, unknown> = {
      ...event,
      userId,
      startTime: Timestamp.fromDate(event.startTime),
      endTime: Timestamp.fromDate(event.endTime),
      allDay: event.allDay || false,
      type: event.type || 'event',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (event.recurrence) {
      docData.recurrence = {
        ...event.recurrence,
        endDate: event.recurrence.endDate ? Timestamp.fromDate(event.recurrence.endDate) : null
      };
    }

    const docRef = await addDoc(eventsRef, docData);
    return docRef.id;
  },

  async updateEvent(userId: string, event: UpdateEventInput): Promise<void> {
    const eventRef = doc(db, 'users', userId, COLLECTION_NAME, event.id);
    
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
    const eventRef = doc(db, 'users', userId, COLLECTION_NAME, realId);
    await deleteDoc(eventRef);
  }
};