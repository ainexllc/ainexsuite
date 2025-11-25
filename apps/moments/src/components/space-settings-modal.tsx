'use client';

import { useState } from 'react';
import { X, Hash, Save, Copy, Loader2 } from 'lucide-react';
import { useMomentsStore } from '@/lib/store';
import type { Space } from '@ainexsuite/types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

interface SpaceSettingsModalProps {
  space: Space;
  onClose: () => void;
}

export function SpaceSettingsModal({ space, onClose }: SpaceSettingsModalProps) {
  const { fetchSpaces } = useMomentsStore();
  const [pin, setPin] = useState(space.accessCode || '');
  const [name, setName] = useState(space.name);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'moments_spaces', space.id), {
        name,
        accessCode: pin || null,
        updatedAt: Date.now()
      });
      await fetchSpaces(space.ownerId);
      onClose();
    } catch (error) {
      console.error('Failed to update space:', error);
    } finally {
      setSaving(false);
    }
  };

  const joinLink = typeof window !== 'undefined' ? `${window.location.origin}/join` : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-surface-elevated rounded-xl shadow-2xl border border-outline-subtle overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-outline-subtle">
          <h2 className="text-lg font-semibold text-text-primary">Space Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded-lg text-text-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">Space Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-base border border-outline-subtle rounded-lg text-text-primary focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-2">
              Quick Access PIN (4 Digits)
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                maxLength={4}
                pattern="[0-9]*"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-10 pr-3 py-2 bg-surface-base border border-outline-subtle rounded-lg text-text-primary font-mono tracking-widest focus:border-primary focus:outline-none"
                placeholder="0000"
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              Share this PIN along with the join link to give guests access.
            </p>
          </div>

          {space.accessCode && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Invite Link</h3>
              <div className="flex gap-2">
                <code className="flex-1 bg-surface-base border border-outline-subtle rounded px-2 py-1 text-xs text-text-muted truncate">
                  {joinLink}
                </code>
                <button
                  onClick={() => {
                     const text = `View our album "${space.name}" at ${joinLink} using PIN: ${space.accessCode}`;
                     navigator.clipboard.writeText(text);
                     alert('Invite copied!');
                  }}
                  className="p-1 hover:bg-surface-hover rounded text-primary"
                  title="Copy Invite"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-subtle bg-surface-base/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text-primary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
