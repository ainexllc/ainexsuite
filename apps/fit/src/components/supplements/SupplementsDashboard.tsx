'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pill, Calendar, Package, AlertTriangle } from 'lucide-react';
import { Modal } from '@ainexsuite/ui';
import { useAuth } from '@ainexsuite/auth';
import type { Supplement } from '@ainexsuite/types';
import { SupplementCard } from './SupplementCard';
import { SupplementEditor } from './SupplementEditor';
import { DailyTracker } from './DailyTracker';
import {
  subscribeToSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
  toggleSupplementActive,
  updateInventory,
  getSupplementsNeedingRefill,
} from '@/lib/supplement-service';

type TabType = 'today' | 'all' | 'inventory';

export function SupplementsDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);

  // Subscribe to supplements
  useEffect(() => {
    if (!user?.uid) {
      setSupplements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToSupplements(user.uid, (data) => {
      setSupplements(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleCreateSupplement = useCallback(async (data: Parameters<typeof createSupplement>[0]) => {
    await createSupplement(data);
    setShowEditor(false);
  }, []);

  const handleUpdateSupplement = useCallback(async (data: Parameters<typeof createSupplement>[0]) => {
    if (!editingSupplement) return;
    await updateSupplement(editingSupplement.id, data);
    setShowEditor(false);
    setEditingSupplement(null);
  }, [editingSupplement]);

  const handleDeleteSupplement = useCallback(async (supplementId: string) => {
    if (confirm('Are you sure you want to delete this supplement?')) {
      await deleteSupplement(supplementId);
    }
  }, []);

  const handleToggleActive = useCallback(async (supplementId: string) => {
    await toggleSupplementActive(supplementId);
  }, []);

  const handleUpdateInventory = useCallback(async (supplementId: string, inventory: number) => {
    await updateInventory(supplementId, inventory);
  }, []);

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setShowEditor(true);
  };

  const lowStockSupplements = getSupplementsNeedingRefill(supplements);
  const activeSupplements = supplements.filter((s) => s.isActive);
  const inactiveSupplements = supplements.filter((s) => !s.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--app-primary))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Supplements</h2>
          <p className="text-sm text-muted-foreground">
            Track your daily supplement intake and inventory
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSupplement(null);
            setShowEditor(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Supplement
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockSupplements.length > 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">
              Low Stock Alert
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {lowStockSupplements.map((s) => s.name).join(', ')}{' '}
              {lowStockSupplements.length === 1 ? 'needs' : 'need'} refill
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-foreground/5 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'today'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Today
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Pill className="w-4 h-4" />
          All ({supplements.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4" />
          Inventory
          {lowStockSupplements.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
      </div>

      {/* Today Tab - Daily Tracker */}
      {activeTab === 'today' && <DailyTracker />}

      {/* All Supplements Tab */}
      {activeTab === 'all' && (
        <>
          {supplements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
              <Pill className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Supplements Added
              </h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your supplements and daily intake
              </p>
              <button
                onClick={() => {
                  setEditingSupplement(null);
                  setShowEditor(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Supplement
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Supplements */}
              {activeSupplements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Active ({activeSupplements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeSupplements.map((supplement) => (
                      <SupplementCard
                        key={supplement.id}
                        supplement={supplement}
                        onEdit={handleEdit}
                        onDelete={handleDeleteSupplement}
                        onToggleActive={handleToggleActive}
                        onUpdateInventory={handleUpdateInventory}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Supplements */}
              {inactiveSupplements.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Inactive ({inactiveSupplements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inactiveSupplements.map((supplement) => (
                      <SupplementCard
                        key={supplement.id}
                        supplement={supplement}
                        onEdit={handleEdit}
                        onDelete={handleDeleteSupplement}
                        onToggleActive={handleToggleActive}
                        onUpdateInventory={handleUpdateInventory}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {supplements.filter((s) => s.inventory !== undefined).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl">
              <Package className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Inventory Tracked
              </h3>
              <p className="text-muted-foreground">
                Add inventory counts to your supplements to track stock levels
              </p>
            </div>
          ) : (
            <div className="bg-background/60 border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Supplement
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Current Stock
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Alert At
                    </th>
                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {supplements
                    .filter((s) => s.inventory !== undefined)
                    .sort((a, b) => (a.inventory ?? 0) - (b.inventory ?? 0))
                    .map((supplement) => {
                      const lowStock =
                        supplement.lowStockThreshold !== undefined &&
                        (supplement.inventory ?? 0) <= supplement.lowStockThreshold;
                      return (
                        <tr
                          key={supplement.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Pill
                                className={`w-4 h-4 ${
                                  supplement.isActive
                                    ? 'text-[hsl(var(--app-primary))]'
                                    : 'text-muted-foreground'
                                }`}
                              />
                              <div>
                                <span className="font-medium text-foreground">
                                  {supplement.name}
                                </span>
                                {supplement.brand && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({supplement.brand})
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`font-medium ${
                                lowStock ? 'text-amber-500' : 'text-foreground'
                              }`}
                            >
                              {supplement.inventory}
                            </span>
                          </td>
                          <td className="p-4 text-center text-muted-foreground">
                            {supplement.lowStockThreshold ?? '-'}
                          </td>
                          <td className="p-4 text-center">
                            {lowStock ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingSupplement(null);
        }}
      >
        <h2 className="text-xl font-bold text-foreground mb-4">
          {editingSupplement ? 'Edit Supplement' : 'Add Supplement'}
        </h2>
        <SupplementEditor
          initialSupplement={editingSupplement || undefined}
          onSave={editingSupplement ? handleUpdateSupplement : handleCreateSupplement}
          onCancel={() => {
            setShowEditor(false);
            setEditingSupplement(null);
          }}
        />
      </Modal>
    </div>
  );
}
