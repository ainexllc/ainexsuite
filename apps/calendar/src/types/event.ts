import { Timestamp } from 'firebase/firestore';

export type EventType = 'event' | 'task' | 'reminder' | 'holiday';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., 1 for every day, 2 for every other day
  endDate?: Timestamp; // Optional end date for recurrence
  daysOfWeek?: number[]; // 0-6 for weekly recurrence (0 = Sunday)
}

export interface CalendarEvent {
  id: string;
  userId: string;
  spaceId?: string; // Space this event belongs to
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime: Timestamp;
  allDay: boolean;
  color?: string;
  type: EventType;
  location?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  recurrence?: RecurrenceRule;
  baseEventId?: string; // If this is an exception to a recurrence series
}

export interface CreateEventInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
  color?: string;
  type?: EventType;
  location?: string;
  spaceId?: string; // Space this event belongs to
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
}

export interface UpdateEventInput extends Partial<CreateEventInput> {
  id: string;
}