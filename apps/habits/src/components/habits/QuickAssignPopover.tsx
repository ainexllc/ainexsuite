'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Check, Users, UserPlus } from 'lucide-react';
import type { Member } from '@/types/models';
import { cn } from '@/lib/utils';

interface QuickAssignPopoverProps {
  habitId: string;
  currentAssigneeIds: string[];
  members: Member[];
  onAssign: (habitId: string, assigneeIds: string[]) => void;
  trigger?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function QuickAssignPopover({
  habitId,
  currentAssigneeIds,
  members,
  onAssign,
  trigger,
  position = 'bottom',
}: QuickAssignPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(currentAssigneeIds));
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setSelectedIds(new Set(currentAssigneeIds));
  }, [currentAssigneeIds]);

  const handleClose = useCallback(() => {
    // Save changes on close if changed
    const currentSet = new Set(currentAssigneeIds);
    const hasChanges =
      selectedIds.size !== currentSet.size ||
      [...selectedIds].some(id => !currentSet.has(id));

    if (hasChanges) {
      onAssign(habitId, Array.from(selectedIds));
    }
    setIsOpen(false);
  }, [currentAssigneeIds, selectedIds, habitId, onAssign]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  const toggleMember = (memberId: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(memberId)) {
      newSet.delete(memberId);
    } else {
      newSet.add(memberId);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(members.map(m => m.uid)));
  };

  const clearAll = () => {
    setSelectedIds(new Set());
  };

  // Group members by age group (adults first, then children)
  const groupedMembers = {
    adults: members.filter(m => m.ageGroup === 'adult' || !m.ageGroup),
    children: members.filter(m => m.ageGroup === 'child'),
  };

  const hasGroups = groupedMembers.children.length > 0;

  // Position classes
  const positionClasses: Record<string, string> = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            'text-zinc-400 hover:text-zinc-600 dark:hover:text-white',
            'hover:bg-zinc-100 dark:hover:bg-white/10',
            isOpen && 'bg-zinc-100 dark:bg-white/10 text-indigo-500'
          )}
          title="Assign members"
        >
          <UserPlus className="h-4 w-4" />
        </button>
      )}

      {/* Popover */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden',
            'animate-in fade-in zoom-in-95 duration-150',
            positionClasses[position]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                Assign to
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={selectAll}
                className="px-2 py-0.5 text-xs font-medium text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded transition-colors"
              >
                All
              </button>
              <button
                onClick={clearAll}
                className="px-2 py-0.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Member List */}
          <div className="max-h-64 overflow-y-auto p-2">
            {members.length === 0 ? (
              <div className="text-center py-4 text-sm text-zinc-500">
                No members in this space
              </div>
            ) : hasGroups ? (
              <>
                {/* Adults Section */}
                {groupedMembers.adults.length > 0 && (
                  <MemberGroup
                    label="Adults"
                    members={groupedMembers.adults}
                    selectedIds={selectedIds}
                    onToggle={toggleMember}
                  />
                )}
                {/* Children Section */}
                {groupedMembers.children.length > 0 && (
                  <MemberGroup
                    label="Children"
                    members={groupedMembers.children}
                    selectedIds={selectedIds}
                    onToggle={toggleMember}
                  />
                )}
              </>
            ) : (
              <div className="space-y-0.5">
                {members.map((member) => (
                  <MemberRow
                    key={member.uid}
                    member={member}
                    isSelected={selectedIds.has(member.uid)}
                    onToggle={() => toggleMember(member.uid)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer with count */}
          <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
            <span className="text-xs text-zinc-500">
              {selectedIds.size} of {members.length} assigned
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Member group section
interface MemberGroupProps {
  label: string;
  members: Member[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

function MemberGroup({ label, members, selectedIds, onToggle }: MemberGroupProps) {
  return (
    <div className="mb-2 last:mb-0">
      <div className="px-2 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="space-y-0.5">
        {members.map((member) => (
          <MemberRow
            key={member.uid}
            member={member}
            isSelected={selectedIds.has(member.uid)}
            onToggle={() => onToggle(member.uid)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual member row
interface MemberRowProps {
  member: Member;
  isSelected: boolean;
  onToggle: () => void;
}

function MemberRow({ member, isSelected, onToggle }: MemberRowProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
        isSelected
          ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden',
          isSelected
            ? 'bg-indigo-500 text-white'
            : 'bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-200'
        )}
      >
        {member.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoURL}
            alt={member.displayName}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          member.displayName.slice(0, 2).toUpperCase()
        )}
      </div>

      {/* Name */}
      <span className="flex-1 text-left truncate">{member.displayName}</span>

      {/* Checkbox */}
      <div
        className={cn(
          'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
          isSelected
            ? 'bg-indigo-500 border-indigo-500'
            : 'border-zinc-300 dark:border-zinc-500'
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

// Export AssigneeBadges for use in HabitCard
interface AssigneeBadgesProps {
  assigneeIds: string[];
  members: Member[];
  maxVisible?: number;
  size?: 'sm' | 'md';
  onBadgeClick?: (memberId: string) => void;
}

export function AssigneeBadges({
  assigneeIds,
  members,
  maxVisible = 3,
  size = 'sm',
  onBadgeClick,
}: AssigneeBadgesProps) {
  const assignedMembers = members.filter(m => assigneeIds.includes(m.uid));
  const visibleMembers = assignedMembers.slice(0, maxVisible);
  const overflow = assignedMembers.length - maxVisible;

  const sizeClasses = {
    sm: 'h-5 w-5 text-[10px]',
    md: 'h-6 w-6 text-xs',
  };

  if (assignedMembers.length === 0) return null;

  return (
    <div className="flex items-center -space-x-1.5">
      {visibleMembers.map((member) => (
        <button
          key={member.uid}
          onClick={(e) => {
            e.stopPropagation();
            onBadgeClick?.(member.uid);
          }}
          className={cn(
            'rounded-full ring-2 ring-white dark:ring-zinc-800 flex items-center justify-center font-medium bg-zinc-200 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-200 hover:scale-110 transition-transform',
            sizeClasses[size]
          )}
          title={member.displayName}
        >
          {member.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photoURL}
              alt={member.displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            member.displayName.slice(0, 1).toUpperCase()
          )}
        </button>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            'rounded-full ring-2 ring-white dark:ring-zinc-800 flex items-center justify-center font-medium bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
            sizeClasses[size]
          )}
          title={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
