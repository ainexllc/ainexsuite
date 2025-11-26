'use client';

import { useState, useEffect } from 'react';
import { User, Users, Briefcase, Heart, Folder, Dumbbell, Save } from 'lucide-react';
import type { SpaceType } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';

/**
 * Configuration for a space type option in the editor
 */
export interface SpaceTypeOption {
  value: SpaceType;
  label: string;
  description: string;
}

export interface SpaceEditorProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when user submits the form */
  onSubmit: (data: { name: string; type: SpaceType }) => void | Promise<void>;
  /** Initial values for editing an existing space */
  initialValues?: { name: string; type: SpaceType };
  /** Whether we're editing an existing space */
  isEditing?: boolean;
  /** Available space types (default: personal, family, work) */
  spaceTypes?: SpaceTypeOption[];
  /** Title for the modal */
  title?: string;
  /** Description for the modal */
  description?: string;
}

const DEFAULT_SPACE_TYPES: SpaceTypeOption[] = [
  { value: 'personal', label: 'Personal', description: 'Your private space' },
  { value: 'family', label: 'Family', description: 'Share with family members' },
  { value: 'work', label: 'Work', description: 'Team projects and collaboration' },
];

const SPACE_TYPE_ICONS: Record<SpaceType, typeof User> = {
  personal: User,
  family: Users,
  work: Briefcase,
  couple: Heart,
  buddy: Dumbbell,
  squad: Users,
  project: Folder,
};

/**
 * Shared SpaceEditor component for creating/editing spaces.
 *
 * Usage:
 * ```tsx
 * <SpaceEditor
 *   isOpen={showEditor}
 *   onClose={() => setShowEditor(false)}
 *   onSubmit={async ({ name, type }) => {
 *     await createSpace({ name, type });
 *   }}
 * />
 * ```
 */
export function SpaceEditor({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  isEditing = false,
  spaceTypes = DEFAULT_SPACE_TYPES,
  title,
  description,
}: SpaceEditorProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset/load form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setName(initialValues.name);
        setType(initialValues.type);
      } else {
        setName('');
        setType('personal');
      }
    }
  }, [isOpen, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), type });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = title || (isEditing ? 'Edit Space' : 'Create New Space');
  const modalDescription = description || (isEditing
    ? 'Update your space details'
    : 'Create a new space to organize your content');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          <div>
            <ModalTitle>{modalTitle}</ModalTitle>
            <ModalDescription>{modalDescription}</ModalDescription>
          </div>
        </ModalHeader>

        <ModalContent className="space-y-6">
          <FormField label="Space Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Home Projects, Work Team, Family"
              autoFocus
              required
            />
          </FormField>

          <div>
            <label className="block text-sm font-medium text-ink-900 mb-3">
              Space Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {spaceTypes.map((spaceType) => {
                const Icon = SPACE_TYPE_ICONS[spaceType.value] || User;
                const isSelected = type === spaceType.value;

                return (
                  <button
                    key={spaceType.value}
                    type="button"
                    onClick={() => setType(spaceType.value)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                        : 'border-outline-subtle hover:border-outline-default bg-surface-card'
                      }
                    `}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-[var(--color-primary)]' : 'text-ink-600'}`} />
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-ink-900'}`}>
                        {spaceType.label}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {spaceType.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || isSubmitting}>
            <Save className="h-4 w-4" />
            {isEditing ? 'Save Changes' : 'Create Space'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default SpaceEditor;
