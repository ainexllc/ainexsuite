'use client';

import { Calendar, Clock, User, MoreVertical, Edit2, Trash2, CheckCircle, XCircle, Timer } from 'lucide-react';
import { useState } from 'react';
import type { Appointment, AppointmentStatus } from '@ainexsuite/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
}

const statusConfig: Record<AppointmentStatus, { label: string; color: string; icon: typeof Timer }> = {
  scheduled: {
    label: 'Scheduled',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Timer,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle,
  },
  rescheduled: {
    label: 'Rescheduled',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Calendar,
  },
  missed: {
    label: 'Missed',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: XCircle,
  },
};

const typeLabels: Record<string, string> = {
  checkup: 'Check-up',
  followup: 'Follow-up',
  specialist: 'Specialist',
  lab: 'Lab Work',
  imaging: 'Imaging',
  therapy: 'Therapy',
  dental: 'Dental',
  vision: 'Vision',
  other: 'Other',
};

export function AppointmentCard({ appointment, onEdit, onDelete, onStatusChange }: AppointmentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const status = statusConfig[appointment.status];
  const StatusIcon = status.icon;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isUpcoming = new Date(appointment.date) >= new Date(new Date().toDateString());
  const isPast = new Date(appointment.date) < new Date(new Date().toDateString());

  return (
    <div className={`p-4 bg-surface-elevated border border-outline-subtle rounded-xl ${isPast && appointment.status === 'scheduled' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-ink-900">{appointment.reason}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            <span className="text-sm text-ink-500">
              {typeLabels[appointment.type] || appointment.type}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-surface-subtle transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-ink-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 py-1 bg-surface-elevated border border-outline-subtle rounded-lg shadow-lg z-20 min-w-[140px]">
                {appointment.status === 'scheduled' && onStatusChange && (
                  <>
                    <button
                      onClick={() => {
                        onStatusChange(appointment.id, 'completed');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-surface-subtle"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                    <button
                      onClick={() => {
                        onStatusChange(appointment.id, 'cancelled');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-subtle"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(appointment);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-subtle"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(appointment.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-surface-subtle"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Calendar className="w-4 h-4 text-ink-400" />
          {formatDate(appointment.date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-600">
          <Clock className="w-4 h-4 text-ink-400" />
          {formatTime(appointment.time)}
        </div>
      </div>

      {/* Provider */}
      <div className="flex items-center gap-2 text-sm text-ink-600">
        <User className="w-4 h-4 text-ink-400" />
        {appointment.provider}
      </div>

      {/* Notes */}
      {appointment.notes && (
        <p className="mt-3 text-sm text-ink-500 italic border-t border-outline-subtle pt-2">
          {appointment.notes}
        </p>
      )}

      {/* Upcoming reminder */}
      {isUpcoming && appointment.status === 'scheduled' && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Coming up{' '}
            {new Date(appointment.date).toDateString() === new Date().toDateString()
              ? 'today'
              : `in ${Math.ceil((new Date(appointment.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`}
          </p>
        </div>
      )}
    </div>
  );
}
