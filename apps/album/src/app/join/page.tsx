'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';
import { AinexStudiosLogo } from '@ainexsuite/ui/components';
import { useMomentsStore } from '@/lib/store';

export default function JoinSpacePage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { joinByPin } = useMomentsStore();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      const space = await joinByPin(pin); // No userId passed = guest mode
      if (space) {
        router.push(`/shared/${space.id}`);
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join space');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[120px] pointer-events-none opacity-40" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <AinexStudiosLogo size="lg" align="center" appName="ALBUM" appColor="#ec4899" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">View Shared Album</h1>
          <p className="text-white/60">Enter the 4-digit access code to view this album</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-white/70 mb-3 text-center">
                Access Code
              </label>
              <div className="flex justify-center">
                <input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val.length <= 4) setPin(val);
                  }}
                  className="w-48 text-center text-4xl font-bold tracking-[0.5em] bg-transparent border-b-2 border-white/20 text-white focus:border-pink-500 focus:outline-none py-2 transition-colors placeholder-white/10"
                  placeholder="0000"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={pin.length !== 4 || loading}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-500/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  View Album <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/40">
            Don&apos;t have a code? Ask the album owner to share it.
          </p>
        </div>
      </div>
    </div>
  );
}
