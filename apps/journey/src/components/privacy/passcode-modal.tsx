'use client';

import { useState } from 'react';

interface PasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passcode: string) => Promise<boolean>;
  mode: 'setup' | 'verify';
  title: string;
}

export function PasscodeModal({ isOpen, onClose, onSubmit, mode, title }: PasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await onSubmit(passcode);
      if (success) {
        setPasscode('');
        onClose();
      } else {
        setError(mode === 'setup' ? 'Failed to set up passcode' : 'Incorrect passcode');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/60">
          {mode === 'setup'
            ? 'Create a 4-digit passcode to protect your private entries'
            : 'Enter your passcode to unlock private entries'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter 4-digit code"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-lg font-semibold tracking-widest text-white placeholder-white/40 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50"
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passcode.length !== 4 || isSubmitting}
              className="flex-1 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#ff8a3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : mode === 'setup' ? 'Set Passcode' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
