"use client";

import { useCallback, useState } from "react";
import { clsx } from "clsx";
import {
  Check,
  Droplets,
  GaugeCircle,
  LayoutGrid,
  List,
  Calendar,
  Scale,
  Target,
  Loader2,
  Shield,
} from "lucide-react";
import type { UserPreference, ViewMode, WeightUnit, WaterUnit } from "@/lib/types/settings";

type SettingsPanelProps = {
  preferences: UserPreference;
  isLoading: boolean;
  onUpdate: (
    updates: Partial<Omit<UserPreference, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>;
  onClose: () => void;
};

type SaveState = "idle" | "saving" | "saved" | "error";

const VIEW_OPTIONS: Array<{ id: ViewMode; label: string; icon: typeof List }> = [
  { id: "list", label: "List", icon: List },
  { id: "masonry", label: "Masonry", icon: LayoutGrid },
  { id: "calendar", label: "Calendar", icon: Calendar },
];

const WEIGHT_UNIT_OPTIONS: Array<{ id: WeightUnit; label: string }> = [
  { id: "kg", label: "Kilograms (kg)" },
  { id: "lbs", label: "Pounds (lbs)" },
];

const WATER_UNIT_OPTIONS: Array<{ id: WaterUnit; label: string; description: string }> = [
  { id: "glasses", label: "Glasses", description: "~250ml per glass" },
  { id: "ml", label: "Milliliters", description: "Metric unit" },
  { id: "oz", label: "Fluid Ounces", description: "US customary" },
];

export function SettingsPanel({ preferences, isLoading, onUpdate, onClose: _onClose }: SettingsPanelProps) {
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [pendingField, setPendingField] = useState<string | null>(null);
  const [waterGoal, setWaterGoal] = useState(preferences.dailyWaterGoal ?? 8);
  const [targetWeight, setTargetWeight] = useState(preferences.targetWeight ?? "");

  // Handle view mode change
  const handleViewModeChange = useCallback(
    async (viewMode: ViewMode) => {
      setPendingField("viewMode");
      try {
        await onUpdate({ viewMode });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      } finally {
        setPendingField(null);
      }
    },
    [onUpdate]
  );

  // Handle weight unit change
  const handleWeightUnitChange = useCallback(
    async (weightUnit: WeightUnit) => {
      setPendingField("weightUnit");
      try {
        await onUpdate({ weightUnit });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      } finally {
        setPendingField(null);
      }
    },
    [onUpdate]
  );

  // Handle water unit change
  const handleWaterUnitChange = useCallback(
    async (waterUnit: WaterUnit) => {
      setPendingField("waterUnit");
      try {
        await onUpdate({ waterUnit });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      } finally {
        setPendingField(null);
      }
    },
    [onUpdate]
  );

  // Handle goals toggle
  const handleShowGoalsChange = useCallback(
    async (showGoals: boolean) => {
      setPendingField("showGoals");
      try {
        await onUpdate({ showGoals });
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 1500);
      } catch {
        setSaveState("error");
      } finally {
        setPendingField(null);
      }
    },
    [onUpdate]
  );

  // Handle water goal save
  const handleWaterGoalSave = useCallback(async () => {
    setPendingField("waterGoal");
    try {
      await onUpdate({ dailyWaterGoal: waterGoal });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    } finally {
      setPendingField(null);
    }
  }, [waterGoal, onUpdate]);

  // Handle target weight save
  const handleTargetWeightSave = useCallback(async () => {
    setPendingField("targetWeight");
    try {
      const value = targetWeight === "" ? null : Number(targetWeight);
      await onUpdate({ targetWeight: value });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    } finally {
      setPendingField(null);
    }
  }, [targetWeight, onUpdate]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="space-y-1 mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600">
          <Shield className="h-3.5 w-3.5" />
          Health Settings
        </div>
        <h2 className="text-lg font-semibold text-foreground">App preferences</h2>
        <p className="text-sm text-muted-foreground">
          Customize how your health data is displayed and tracked.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="space-y-6 pb-10">
          {/* Default View Mode */}
          <section className="space-y-4 rounded-3xl border border-border bg-muted/30 p-5">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Default view</h3>
              <p className="text-xs text-muted-foreground">
                Choose how your health check-ins are displayed by default.
              </p>
            </div>
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = preferences.viewMode === id;
                const isPending = pendingField === "viewMode";
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleViewModeChange(id)}
                    disabled={isLoading || isPending}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Unit Preferences */}
          <section className="space-y-4 rounded-3xl border border-border bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <GaugeCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Units</h3>
                <p className="text-xs text-muted-foreground">
                  Set your preferred measurement units.
                </p>
              </div>
            </div>

            {/* Weight Unit */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                Weight
              </label>
              <div className="flex gap-2">
                {WEIGHT_UNIT_OPTIONS.map(({ id, label }) => {
                  const isActive = (preferences.weightUnit ?? "kg") === id;
                  const isPending = pendingField === "weightUnit";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleWeightUnitChange(id)}
                      disabled={isLoading || isPending}
                      className={clsx(
                        "flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-all",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Water Unit */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                Water
              </label>
              <div className="grid grid-cols-3 gap-2">
                {WATER_UNIT_OPTIONS.map(({ id, label, description }) => {
                  const isActive = (preferences.waterUnit ?? "glasses") === id;
                  const isPending = pendingField === "waterUnit";
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleWaterUnitChange(id)}
                      disabled={isLoading || isPending}
                      className={clsx(
                        "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all",
                        isActive
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-[10px] text-muted-foreground">{description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Goals */}
          <section className="space-y-4 rounded-3xl border border-border bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-500/10 text-blue-600">
                <Target className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Goals</h3>
                <p className="text-xs text-muted-foreground">
                  Set targets to help you stay on track.
                </p>
              </div>
            </div>

            {/* Show Goals Toggle */}
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Display goals on dashboard</p>
                <p className="text-xs text-muted-foreground">Show progress towards your targets</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.showGoals ?? true}
                onClick={() => handleShowGoalsChange(!(preferences.showGoals ?? true))}
                disabled={isLoading || pendingField === "showGoals"}
                className={clsx(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                  (preferences.showGoals ?? true) ? "bg-primary" : "bg-muted",
                  (isLoading || pendingField === "showGoals") && "opacity-50 cursor-not-allowed"
                )}
              >
                <span
                  className={clsx(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                    (preferences.showGoals ?? true) ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Daily Water Goal */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Droplets className="h-3.5 w-3.5" />
                Daily water goal ({preferences.waterUnit ?? "glasses"})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={waterGoal}
                  onChange={(e) => setWaterGoal(Number(e.target.value))}
                  min={1}
                  max={50}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleWaterGoalSave}
                  disabled={isLoading || pendingField === "waterGoal" || waterGoal === preferences.dailyWaterGoal}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingField === "waterGoal" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveState === "saved" && pendingField === null ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                  Save
                </button>
              </div>
            </div>

            {/* Target Weight */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Scale className="h-3.5 w-3.5" />
                Target weight ({preferences.weightUnit ?? "kg"})
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="Optional"
                  step="0.1"
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleTargetWeightSave}
                  disabled={
                    isLoading ||
                    pendingField === "targetWeight" ||
                    (targetWeight === "" ? null : Number(targetWeight)) === preferences.targetWeight
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingField === "targetWeight" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saveState === "saved" && pendingField === null ? (
                    <Check className="h-4 w-4" />
                  ) : null}
                  Save
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty if you don&apos;t want to track a weight goal.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
