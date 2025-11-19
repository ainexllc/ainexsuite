'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter, Button, Input, FormField } from '@ainexsuite/ui';
import { useTodoStore } from '../../lib/store';
import { TaskSpace, TaskList, SpaceType } from '../../types/models';
import { User, Users, Briefcase, Save } from 'lucide-react';
import { useAuth } from '@ainexsuite/auth';

interface SpaceEditorProps {
  isOpen: boolean;
  onClose: () => void;
  editSpaceId?: string;
}

export function SpaceEditor({ isOpen, onClose, editSpaceId }: SpaceEditorProps) {
  const { user } = useAuth();
  const { spaces, addSpace, updateSpace } = useTodoStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<SpaceType>('personal');

  // Load data if editing
  useEffect(() => {
    if (isOpen && editSpaceId) {
      const space = spaces.find((s: TaskSpace) => s.id === editSpaceId);
      if (space) {
        setName(space.name);
        setType(space.type);
      }
    } else if (isOpen && !editSpaceId) {
      // Reset form for new space
      setName('');
      setType('personal');
    }
  }, [isOpen, editSpaceId, spaces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !user) {
      return;
    }

    if (editSpaceId) {
      await updateSpace(editSpaceId, {
        name,
        type,
      });
    } else {
      // Default lists for new space
      const defaultLists: TaskList[] = [
        { id: `list_${Date.now()}_1`, title: 'To Do', order: 0 },
        { id: `list_${Date.now()}_2`, title: 'In Progress', order: 1 },
        { id: `list_${Date.now()}_3`, title: 'Done', order: 2 },
      ];

      await addSpace({
        id: `todo_space_${Date.now()}`,
        name,
        type,
        members: [{
          uid: user.uid,
          displayName: user.displayName || 'Me',
          photoURL: user.photoURL || undefined,
          role: 'admin',
          joinedAt: new Date().toISOString()
        }],
        memberUids: [user.uid],
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
        lists: defaultLists,
      });
    }

    onClose();
  };

  const spaceTypes: { value: SpaceType; label: string; icon: typeof User; description: string }[] = [
    { value: 'personal', label: 'Personal', icon: User, description: 'Your private tasks and goals' },
    { value: 'family', label: 'Family', icon: Users, description: 'Share with family members' },
    { value: 'work', label: 'Work', icon: Briefcase, description: 'Team projects and tasks' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <form onSubmit={handleSubmit}>
        <ModalHeader onClose={onClose}>
          <div>
            <ModalTitle>{editSpaceId ? 'Edit Space' : 'Create New Space'}</ModalTitle>
            <ModalDescription>
              {editSpaceId ? 'Update your space details' : 'Create a new workspace to organize your tasks'}
            </ModalDescription>
          </div>
        </ModalHeader>

        <ModalContent className="space-y-6">
          <FormField label="Space Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kitchen Remodel, Q1 Marketing, Personal Goals"
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
                const Icon = spaceType.icon;
                const isSelected = type === spaceType.value;

                return (
                  <button
                    key={spaceType.value}
                    type="button"
                    onClick={() => setType(spaceType.value)}
                    className={`
                      relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-accent-500 bg-accent-500/10'
                        : 'border-outline-subtle hover:border-outline-default bg-surface-card'
                      }
                    `}
                  >
                    <Icon className={`h-6 w-6 ${isSelected ? 'text-accent-500' : 'text-ink-600'}`} />
                    <div className="text-center">
                      <div className={`text-sm font-medium ${isSelected ? 'text-accent-500' : 'text-ink-900'}`}>
                        {spaceType.label}
                      </div>
                      <div className="text-xs text-muted mt-0.5">
                        {spaceType.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-accent-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            <Save className="h-4 w-4" />
            {editSpaceId ? 'Save Changes' : 'Create Space'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
