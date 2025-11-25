'use client';

import { useState } from 'react';
import { ChevronDown, Plus, User, Users, Heart, Settings } from 'lucide-react';
import { useGrowStore } from '../../lib/store';
import { Space } from '../../types/models';
import { SpaceCreatorModal } from './SpaceCreatorModal';

export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useGrowStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreatorModal, setShowCreatorModal] = useState(false);

  const currentSpace = spaces.find((s: Space) => s.id === currentSpaceId);

  const getIcon = (type: Space['type']) => {
    switch (type) {
      case 'personal': return <User className="h-4 w-4" />;
      case 'couple': return <Heart className="h-4 w-4" />;
      case 'squad': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handleCreateSpace = () => {
    setIsOpen(false);
    setShowCreatorModal(true);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-surface-hover transition-colors w-full min-w-[200px] max-w-[300px]"
      >
        <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white flex-shrink-0">
          {currentSpace ? getIcon(currentSpace.type) : <User className="h-4 w-4" />}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-ink-900 leading-none truncate">
            {currentSpace?.name || 'My Growth'}
          </p>
          <p className="text-xs text-ink-500 capitalize truncate">
            {currentSpace?.type || 'Personal'}
          </p>
        </div>
        <ChevronDown className="h-4 w-4 text-ink-500 flex-shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 min-w-full w-max max-w-sm mt-2 bg-surface-elevated border border-outline-subtle rounded-xl shadow-floating z-50 overflow-hidden">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-ink-400 uppercase">
                My Spaces
              </div>
              {spaces.map((space: Space) => (
                <button
                  key={space.id}
                  onClick={() => {
                    setCurrentSpace(space.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm transition-colors ${
                    currentSpaceId === space.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-ink-600 hover:bg-surface-hover hover:text-ink-900'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {getIcon(space.type)}
                  </div>
                  <span className="truncate">{space.name}</span>
                </button>
              ))}
            </div>
            
            <div className="border-t border-outline-subtle p-1">
              <button
                onClick={handleCreateSpace}
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-primary hover:bg-surface-hover transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create New Space
              </button>
              <button
                className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-sm text-ink-500 hover:bg-surface-hover hover:text-ink-900 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Manage Spaces
              </button>
            </div>
          </div>
        </>
      )}

      {/* Space Creator Modal */}
      <SpaceCreatorModal
        isOpen={showCreatorModal}
        onClose={() => setShowCreatorModal(false)}
      />
    </div>
  );
}
