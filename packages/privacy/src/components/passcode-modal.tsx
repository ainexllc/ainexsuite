'use client';

import { useState } from 'react';
import type { PasscodeModalProps } from '../types';

export function PasscodeModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  title,
  accentColor = 'var(--color-primary, #f97316)',
}: PasscodeModalProps) {
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
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-zinc-900 p-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
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
            className="w-full rounded-lg border border-border bg-foreground/5 px-4 py-3 text-center text-lg font-semibold tracking-widest text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2"
            style={{
              borderColor: passcode.length === 4 ? accentColor : undefined,
              // @ts-expect-error CSS custom property
              '--tw-ring-color': `${accentColor}80`,
            }}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-foreground/5"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passcode.length !== 4 || isSubmitting}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: accentColor,
              }}
            >
              {isSubmitting ? 'Processing...' : mode === 'setup' ? 'Set Passcode' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
