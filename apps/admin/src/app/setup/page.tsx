'use client';

import { useState } from 'react';
import { useAuth } from '@ainexsuite/auth';
import { db } from '@ainexsuite/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react';

export default function SetupPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [otherUid, setOtherUid] = useState('');
  const [otherStatus, setOtherStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSetAdmin = async (uid: string, setStatusFn: typeof setStatus) => {
    if (!uid) {
      setError('No UID provided');
      setStatusFn('error');
      return;
    }

    setStatusFn('loading');
    try {
      await setDoc(doc(db, 'users', uid), { role: 'admin' }, { merge: true });
      setStatusFn('success');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set admin role');
      setStatusFn('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-orange-500/10">
            <ShieldCheck className="h-10 w-10 text-orange-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Setup</h1>

        {user ? (
          <>
            <p className="text-zinc-400 text-sm mb-6 text-center">
              Logged in as: <span className="text-white">{user.email}</span>
              <br />
              <span className="text-zinc-500 text-xs">UID: {user.uid}</span>
            </p>

            {status === 'success' ? (
              <div className="flex items-center justify-center gap-2 text-green-400 mb-6">
                <CheckCircle2 className="h-5 w-5" />
                <span>You are now an admin!</span>
              </div>
            ) : (
              <button
                onClick={() => handleSetAdmin(user.uid, setStatus)}
                disabled={status === 'loading'}
                className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mb-6"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Make Me Admin'
                )}
              </button>
            )}

            {/* Add other admin */}
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-400">Add another admin</span>
              </div>
              <input
                type="text"
                value={otherUid}
                onChange={(e) => setOtherUid(e.target.value)}
                placeholder="Enter UID"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm mb-3 focus:outline-none focus:border-orange-500"
              />
              {otherStatus === 'success' ? (
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm">Admin added!</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSetAdmin(otherUid, setOtherStatus)}
                  disabled={otherStatus === 'loading' || !otherUid}
                  className="w-full py-2 px-4 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {otherStatus === 'loading' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Add Admin'
                  )}
                </button>
              )}
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
            )}
          </>
        ) : (
          <p className="text-zinc-400 text-center">Please log in first.</p>
        )}
      </div>
    </div>
  );
}
