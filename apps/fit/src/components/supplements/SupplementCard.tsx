'use client';

import { useState } from 'react';
import {
  Pill,
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  AlertTriangle,
  Package,
} from 'lucide-react';
import type { Supplement } from '@ainexsuite/types';
import {
  SUPPLEMENT_TIME_LABELS,
  needsRefill,
} from '@/lib/supplement-service';

interface SupplementCardProps {
  supplement: Supplement;
  onEdit?: (supplement: Supplement) => void;
  onDelete?: (supplementId: string) => void;
  onToggleActive?: (supplementId: string) => void;
  onUpdateInventory?: (supplementId: string, inventory: number) => void;
}

export function SupplementCard({
  supplement,
  onEdit,
  onDelete,
  onToggleActive,
  onUpdateInventory,
}: SupplementCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [newInventory, setNewInventory] = useState(supplement.inventory ?? 0);

  const handleSaveInventory = () => {
    if (onUpdateInventory) {
      onUpdateInventory(supplement.id, newInventory);
    }
    setShowInventory(false);
  };

  const lowStock = needsRefill(supplement);

  return (
    <div
      className={`p-4 bg-background/60 border rounded-xl backdrop-blur-xl transition-all ${
        supplement.isActive
          ? 'border-border'
          : 'border-border/50 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              supplement.isActive
                ? 'bg-[hsl(var(--app-primary))]/10'
                : 'bg-foreground/5'
            }`}
          >
            <Pill
              className={`w-5 h-5 ${
                supplement.isActive
                  ? 'text-[hsl(var(--app-primary))]'
                  : 'text-muted-foreground'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{supplement.name}</h3>
              {!supplement.isActive && (
                <span className="px-1.5 py-0.5 text-xs bg-foreground/10 text-muted-foreground rounded">
                  Inactive
                </span>
              )}
            </div>
            {supplement.brand && (
              <p className="text-sm text-muted-foreground">{supplement.brand}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-foreground/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 py-1 bg-background border border-border rounded-lg shadow-lg z-20 min-w-[140px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(supplement);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {onToggleActive && (
                  <button
                    onClick={() => {
                      onToggleActive(supplement.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                  >
                    <Power className="w-4 h-4" />
                    {supplement.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowInventory(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                >
                  <Package className="w-4 h-4" />
                  Update Stock
                </button>
                {onDelete && (
                  <button
                    onClick={() => {
                      onDelete(supplement.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-foreground/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dosage */}
      <div className="mb-3">
        <p className="text-sm text-foreground">{supplement.dosage}</p>
      </div>

      {/* Schedule */}
      <div className="flex flex-wrap gap-1 mb-3">
        {supplement.schedule.times.map((time) => (
          <span
            key={time}
            className="px-2 py-0.5 text-xs bg-foreground/10 text-muted-foreground rounded-full"
          >
            {SUPPLEMENT_TIME_LABELS[time]}
          </span>
        ))}
        <span className="px-2 py-0.5 text-xs bg-[hsl(var(--app-primary))]/10 text-[hsl(var(--app-primary))] rounded-full">
          {supplement.schedule.frequency}
        </span>
      </div>

      {/* Benefits */}
      {supplement.benefits && supplement.benefits.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            {supplement.benefits.join(' · ')}
          </p>
        </div>
      )}

      {/* Inventory */}
      {supplement.inventory !== undefined && (
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {lowStock && (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
            <span
              className={`text-sm ${
                lowStock ? 'text-amber-500 font-medium' : 'text-muted-foreground'
              }`}
            >
              {supplement.inventory} left
              {lowStock && ' - Low stock'}
            </span>
          </div>
        </div>
      )}

      {/* Inventory Editor */}
      {showInventory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl p-4 w-80">
            <h4 className="font-semibold text-foreground mb-4">Update Inventory</h4>
            <input
              type="number"
              min="0"
              value={newInventory}
              onChange={(e) => setNewInventory(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--app-primary))] mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowInventory(false)}
                className="flex-1 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveInventory}
                className="flex-1 px-4 py-2 bg-[hsl(var(--app-primary))] text-white rounded-lg hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
