'use client';

import { useEffect } from 'react';
import { useGrowStore } from '@/lib/store';
import { ICON_BUNDLES } from '@/lib/bundles';
import { Button } from '@ainexsuite/ui';
import { ShoppingCart, CheckCircle, Star } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';

export default function StorePage() {
  const { ownedBundles, loadOwnedBundles } = useGrowStore();

  useEffect(() => {
    loadOwnedBundles();
  }, [loadOwnedBundles]);

  const owned = ICON_BUNDLES.filter(b => ownedBundles.includes(b.id));

  const handleBuy = async (bundleId: string) => {
    try {
      await useGrowStore.getState().purchaseBundle(bundleId);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Purchase failed');
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full mb-4">
          <ShoppingCart className="h-5 w-5" />
          <h1 className="text-2xl font-bold">Icon Store</h1>
        </div>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          Unlock premium icon bundles to make your habits more personal and fun.
        </p>
      </div>

      {/* Owned Bundles */}
      {owned.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            Owned Bundles ({owned.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {owned.map((bundle) => (
              <div key={bundle.id} className="group bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-200/50 rounded-2xl p-6 hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{bundle.description}</p>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {bundle.icons.slice(0,5).map((icon, i) => (
                    <DynamicIcon key={i} name={icon} className="text-2xl" />
                  ))}
                  {bundle.icons.length > 5 && (
                    <div className="col-span-5 text-center text-zinc-500 text-sm font-medium">+{bundle.icons.length - 5} more</div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <Star className="h-4 w-4 fill-current" />
                  Owned
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Available Bundles */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Available Bundles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ICON_BUNDLES.filter(b => !ownedBundles.includes(b.id)).map((bundle) => (
            <div key={bundle.id} className="group bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <h3 className="text-xl font-bold mb-2">{bundle.name}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">{bundle.description}</p>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {bundle.icons.slice(0,5).map((icon, i) => (
                    <DynamicIcon key={i} name={icon} className="text-2xl" />
                  ))}
                  {bundle.icons.length > 5 && (
                    <div className="col-span-5 text-center text-zinc-500 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 rounded p-2">+{bundle.icons.length - 5} icons</div>
                  )}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-zinc-900 dark:text-white">${bundle.price}</span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">One-time purchase</span>
                </div>
                <Button
                  onClick={() => handleBuy(bundle.id)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Buy Bundle
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
