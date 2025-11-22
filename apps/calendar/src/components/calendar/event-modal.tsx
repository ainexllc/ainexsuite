'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, CreateEventInput, EventType, RecurrenceFrequency } from '@/types/event';
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  Textarea
} from '@ainexsuite/ui/components';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CreateEventInput) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  initialDate?: Date;
  eventToEdit?: CalendarEvent;
}

export function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialDate,
  eventToEdit
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<EventType>('event');
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFrequency | 'none'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setTitle(eventToEdit.title);
        setDescription(eventToEdit.description || '');
        setStartTime(format(eventToEdit.startTime.toDate(), "yyyy-MM-dd'T'HH:mm"));
        setEndTime(format(eventToEdit.endTime.toDate(), "yyyy-MM-dd'T'HH:mm"));
        setType(eventToEdit.type);
        setRecurrenceFreq(eventToEdit.recurrence?.frequency || 'none');
      } else {
        // Default values for new event
        const start = initialDate || new Date();
        // Round to nearest 30 min
        start.setMinutes(Math.ceil(start.getMinutes() / 30) * 30);
        start.setSeconds(0);
        
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour later

        setTitle('');
        setDescription('');
        setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
        setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
        setType('event');
        setRecurrenceFreq('none');
      }
    }
  }, [isOpen, initialDate, eventToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        allDay: false,
        recurrence: recurrenceFreq !== 'none' ? {
          frequency: recurrenceFreq,
          interval: 1 // Default to 1 for now
        } : undefined
      });
      onClose();
    } catch (error) {
      console.error('Failed to save event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!eventToEdit || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(eventToEdit.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete event', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <ModalTitle>{eventToEdit ? 'Edit Event' : 'New Event'}</ModalTitle>
      </ModalHeader>
      
      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
              Title
            </label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
                Start
              </label>
              <Input 
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
                End
              </label>
              <Input 
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  Type
               </label>
               <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="flex h-10 w-full rounded-lg border border-outline-subtle bg-white px-3 py-2 text-sm dark:bg-surface-elevated dark:border-outline-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
               >
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                  <option value="reminder">Reminder</option>
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
                  Repeat
               </label>
               <select
                  value={recurrenceFreq}
                  onChange={(e) => setRecurrenceFreq(e.target.value as RecurrenceFrequency | 'none')}
                  className="flex h-10 w-full rounded-lg border border-outline-subtle bg-white px-3 py-2 text-sm dark:bg-surface-elevated dark:border-outline-subtle/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
               >
                  <option value="none">Does not repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
               </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-700 dark:text-ink-200">
              Description
            </label>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              rows={3}
            />
          </div>
        </ModalContent>

        <ModalFooter className="flex justify-between sm:justify-between">
          <div>
            {eventToEdit && onDelete && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="danger"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting || isSubmitting}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCancelDelete}
                      disabled={isDeleting || isSubmitting}
                    >
                      Cancel Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteClick}
                    disabled={isDeleting || isSubmitting}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
