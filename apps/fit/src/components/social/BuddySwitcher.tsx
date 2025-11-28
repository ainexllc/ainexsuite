'use client';

import { useState } from 'react';
import { ChevronDown, Plus, User, Dumbbell, Users } from 'lucide-react';
import { useFitStore } from '../../lib/store';
import { FitSpace } from '../../types/models';
import { useAuth } from '@ainexsuite/auth';

export function BuddySwitcher() {
  const { user } = useAuth();
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useFitStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentSpace = spaces.find((s: FitSpace) => s.id === currentSpaceId);

  const getIcon = (type: FitSpace['type']) => {
    switch (type) {
      case 'personal': return <User className="h-4 w-4" />;
      case 'buddy': return <Dumbbell className="h-4 w-4" />;
      case 'squad': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleCreateSpace = async () => {
    const name = prompt('Space Name (e.g., Gym Bros):');
    if (!name || !user) return;
    
    const type = prompt('Type (personal/buddy/squad):') as FitSpace['type'];
    if (!['personal', 'buddy', 'squad'].includes(type)) return;

    await addSpace({
      id: `fit_space_${Date.now()}`,
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
    });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-foreground/10 transition-colors w-full"
      >
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white">
          {currentSpace ? getIcon(currentSpace.type) : <User className="h-4 w-4" />}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground leading-none">
            {currentSpace?.name || 'My Workouts'}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {currentSpace?.type || 'Personal'}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full mt-2 bg-background/95 border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                Workout Spaces
              </div>
              {spaces.map((space: FitSpace) => (
                <button
                  key={space.id}
                  onClick={() => {
                    setCurrentSpace(space.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    currentSpaceId === space.id
                      ? 'bg-foreground/10 text-foreground'
                      : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                  }`}
                >
                  {getIcon(space.type)}
                  {space.name}
                </button>
              ))}
            </div>

            <div className="border-t border-border p-1">
              <button
                onClick={handleCreateSpace}
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-orange-400 hover:bg-foreground/5 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Space
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
