import { db } from '@ainexsuite/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type ActionType = 'create_task' | 'log_workout' | 'create_note' | 'unknown';

export interface ActionCommand {
  raw: string;
  type: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}

export class ActionDispatcher {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Parses a natural language command and executes the corresponding action
   */
  async dispatch(command: string): Promise<{ success: boolean; message: string }> {
    const action = this.parseCommand(command);

    if (action.type === 'unknown') {
      return { success: false, message: "I'm not sure how to do that yet." };
    }

    try {
      switch (action.type) {
        case 'create_task':
          await this.createTask(action.payload);
          return { success: true, message: `Task "${action.payload.title}" created!` };
        
        case 'create_note':
          await this.createNote(action.payload);
          return { success: true, message: `Note "${action.payload.title}" created!` };
          
        case 'log_workout':
           // TODO: Implement workout logging
           return { success: true, message: "Workout logging coming soon!" };

        default:
          return { success: false, message: "Action not implemented." };
      }
    } catch (error) {
      console.error('Action dispatch failed:', error);
      return { success: false, message: "Something went wrong while performing that action." };
    }
  }

  /**
   * A simple rule-based parser. In production, this would use an LLM or NLP library.
   */
  private parseCommand(command: string): ActionCommand {
    const lower = command.toLowerCase();

    if (lower.startsWith('create task') || lower.startsWith('add task') || lower.startsWith('remind me to')) {
      // Extract title: "Create task to buy milk" -> "buy milk"
      let title = command.replace(/^(create|add) task (to|for)?/i, '').replace(/^remind me to/i, '').trim();
      
      // Basic due date detection (very simple)
      const dueDate = new Date();
      if (lower.includes('tomorrow')) {
        dueDate.setDate(dueDate.getDate() + 1);
        title = title.replace(/tomorrow/i, '').trim();
      }
      
      // Default to end of day if not specified
      dueDate.setHours(17, 0, 0, 0);

      return {
        raw: command,
        type: 'create_task',
        payload: {
          title: title || 'New Task',
          dueDate,
          completed: false
        }
      };
    }

    if (lower.startsWith('create note') || lower.startsWith('write note')) {
      const title = command.replace(/^(create|write) note (about|titled)?/i, '').trim();
      return {
        raw: command,
        type: 'create_note',
        payload: {
          title: title || 'Untitled Note',
          content: ''
        }
      };
    }

    return { raw: command, type: 'unknown', payload: {} };
  }

  private async createTask(payload: { title: string; dueDate: Date; completed: boolean }) {
    await addDoc(collection(db, 'tasks'), {
      ...payload,
      ownerId: this.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      priority: 'medium', // default
      tags: []
    });
  }

  private async createNote(payload: { title: string; content: string }) {
    await addDoc(collection(db, 'users', this.userId, 'notes'), {
      ...payload,
      ownerId: this.userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      pinned: false,
      tags: []
    });
  }
}
