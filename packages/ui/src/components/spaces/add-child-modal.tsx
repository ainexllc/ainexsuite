'use client';

import { useState } from 'react';
import { Baby, Loader2, AlertCircle, CheckCircle, Camera, X } from 'lucide-react';
import type { ChildMember } from '@ainexsuite/types';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../modal';
import { Button } from '../buttons/button';
import { Input, FormField } from '../forms';

export interface AddChildModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Space info */
  space: {
    id: string;
    name: string;
  };
  /** Callback when child is added */
  onAddChild: (childData: {
    displayName: string;
    photoURL?: string;
    birthDate?: string;
    relationship?: string;
  }) => Promise<{ success: boolean; error?: string; childMember?: ChildMember }>;
  /** Optional existing child data for editing */
  editChild?: ChildMember;
  /** Callback for updating child */
  onUpdateChild?: (childId: string, childData: {
    displayName?: string;
    photoURL?: string;
    birthDate?: string;
    relationship?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const RELATIONSHIP_OPTIONS = [
  { value: '', label: 'Select relationship...' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'child', label: 'Child' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'niece', label: 'Niece' },
  { value: 'nephew', label: 'Nephew' },
  { value: 'other', label: 'Other' },
];

/**
 * AddChildModal - Modal for adding/editing child members in family spaces
 */
export function AddChildModal({
  isOpen,
  onClose,
  space,
  onAddChild,
  editChild,
  onUpdateChild,
}: AddChildModalProps) {
  const isEditing = !!editChild;

  const [displayName, setDisplayName] = useState(editChild?.displayName || '');
  const [photoURL, setPhotoURL] = useState(editChild?.photoURL || '');
  const [birthDate, setBirthDate] = useState(editChild?.birthDate || '');
  const [relationship, setRelationship] = useState(editChild?.relationship || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = displayName.trim();

    // Validate name
    if (!name) {
      setError('Please enter a name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const childData = {
        displayName: name,
        photoURL: photoURL.trim() || undefined,
        birthDate: birthDate || undefined,
        relationship: relationship || undefined,
      };

      let result: { success: boolean; error?: string };

      if (isEditing && onUpdateChild) {
        result = await onUpdateChild(editChild.id, childData);
      } else {
        result = await onAddChild(childData);
      }

      if (result.success) {
        setSuccess(true);
        // Close after a brief delay to show success
        setTimeout(() => {
          handleClose();
        }, 1000);
      } else {
        setError(result.error || `Failed to ${isEditing ? 'update' : 'add'} child member`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setDisplayName('');
    setPhotoURL('');
    setBirthDate('');
    setRelationship('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalHeader onClose={handleClose}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
            <Baby className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <ModalTitle>{isEditing ? 'Edit Child Member' : 'Add Child Member'}</ModalTitle>
            <ModalDescription>
              {isEditing
                ? `Update ${editChild.displayName}'s profile`
                : `Add a child member to ${space.name}`}
            </ModalDescription>
          </div>
        </div>
      </ModalHeader>

      <form onSubmit={handleSubmit}>
        <ModalContent className="space-y-4">
          {/* Info banner */}
          <div className="p-3 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm">
            Child members don&apos;t need their own account. They appear in the family space
            and can be managed by admins.
          </div>

          {/* Photo preview and URL */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {photoURL ? (
                <div className="relative">
                  <img
                    src={photoURL}
                    alt={displayName || 'Child'}
                    className="w-16 h-16 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      setPhotoURL('');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoURL('')}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-zinc-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <FormField label="Photo URL (optional)">
                <Input
                  type="url"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  disabled={isLoading || success}
                />
              </FormField>
            </div>
          </div>

          {/* Name */}
          <FormField label="Name" required>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              placeholder="Enter child's name"
              disabled={isLoading || success}
              autoFocus
            />
          </FormField>

          {/* Relationship */}
          <FormField label="Relationship (optional)">
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100"
              disabled={isLoading || success}
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Birth date */}
          <FormField label="Birth Date (optional)">
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={isLoading || success}
              max={new Date().toISOString().split('T')[0]}
            />
          </FormField>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>
                {isEditing ? 'Child member updated!' : 'Child member added!'}
              </span>
            </div>
          )}
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || success || !displayName.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                {isEditing ? 'Updated!' : 'Added!'}
              </>
            ) : (
              <>
                <Baby className="h-4 w-4" />
                {isEditing ? 'Update Child' : 'Add Child'}
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

export default AddChildModal;
