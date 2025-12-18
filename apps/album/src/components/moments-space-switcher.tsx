'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Hash } from 'lucide-react';
import { useMomentsStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function MomentsSpaceSwitcher({ userId }: { userId: string }) {
  const { spaces, currentSpaceId, setCurrentSpace, addSpace } = useMomentsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const currentSpace = spaces.find(s => s.id === currentSpaceId);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsCreating(true);
    try {
      await addSpace(userId, newName, 'family', newPin || undefined);
      setNewName('');
      setNewPin('');
      setShowCreate(false);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="relative z-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors"
      >
        <span className="text-lg font-bold text-text-primary">
          {currentSpace ? currentSpace.name : 'My Personal Moments'}
        </span>
        <ChevronDown className="h-4 w-4 text-text-muted" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-72 bg-surface-elevated border border-outline-subtle rounded-xl shadow-floating z-30 overflow-hidden">
            <div className="p-1 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setCurrentSpace(''); // Empty string = personal
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                  !currentSpaceId ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-surface-hover"
                )}
              >
                <span>Personal Gallery</span>
                {!currentSpaceId && <div className="h-2 w-2 rounded-full bg-primary" />}
              </button>

              {spaces.length > 0 && <div className="my-1 border-t border-outline-subtle" />}
              
              {spaces.map(space => (
                <button
                  key={space.id}
                  onClick={() => {
                    setCurrentSpace(space.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                    currentSpaceId === space.id ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-surface-hover"
                  )}
                >
                  <span className="truncate">{space.name}</span>
                  {currentSpaceId === space.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </button>
              ))}
            </div>

            <div className="border-t border-outline-subtle p-2 bg-surface-base/50">
              {!showCreate ? (
                <button
                  onClick={() => setShowCreate(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create New Space
                </button>
              ) : (
                <form onSubmit={handleCreate} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Space Name (e.g. Family 2025)"
                    className="w-full px-3 py-1.5 rounded bg-surface-base border border-outline-subtle text-sm text-text-primary focus:border-primary focus:outline-none"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="4-Digit PIN (Optional)"
                    maxLength={4}
                    pattern="[0-9]*"
                    className="w-full px-3 py-1.5 rounded bg-surface-base border border-outline-subtle text-sm text-text-primary focus:border-primary focus:outline-none"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!newName || isCreating}
                      className="flex-1 bg-primary text-white text-xs font-medium py-1.5 rounded hover:brightness-90 disabled:opacity-50"
                    >
                      {isCreating ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="px-3 text-text-muted text-xs hover:text-text-primary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {currentSpace && currentSpace.accessCode && (
              <div className="border-t border-outline-subtle px-3 py-2 bg-surface-base/50 flex items-center justify-between text-xs text-text-muted">
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3 w-3" />
                  PIN: <span className="font-mono font-bold text-text-primary">{currentSpace.accessCode}</span>
                </div>
                <button 
                  className="hover:text-primary"
                  onClick={() => {
                     // Copy link logic could go here
                     const url = `${window.location.origin}/join`;
                     navigator.clipboard.writeText(`Go to ${url} and enter PIN: ${currentSpace.accessCode}`);
                     alert('Invite copied to clipboard!');
                  }}
                >
                  Copy Invite
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
