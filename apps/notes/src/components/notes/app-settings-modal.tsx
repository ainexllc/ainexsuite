"use client";

import { Settings, LayoutGrid, Calendar, Monitor, Columns } from "lucide-react";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
} from "@ainexsuite/ui";
import { usePreferences } from "@/components/providers/preferences-provider";
import type { ViewMode, MasonryColumns } from "@/lib/types/settings";

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLUMN_OPTIONS: MasonryColumns[] = [1, 2, 3, 4];

export function AppSettingsModal({ isOpen, onClose }: AppSettingsModalProps) {
  const { preferences, updatePreferences, loading } = usePreferences();

  const handleViewModeChange = (mode: ViewMode) => {
    updatePreferences({ viewMode: mode });
  };

  const handleFocusColumnsChange = (columns: MasonryColumns) => {
    updatePreferences({ focusColumns: columns });
  };

  const handleLibraryColumnsChange = (columns: MasonryColumns) => {
    updatePreferences({ libraryColumns: columns });
  };

  const handleCalendarViewChange = (view: "month" | "week") => {
    updatePreferences({ calendarView: view });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-[var(--color-primary)]" />
          <ModalTitle>Notes Settings</ModalTitle>
        </div>
      </ModalHeader>

      <ModalContent className="space-y-6">
        {/* Display Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Display
            </h3>
          </div>

          {/* Default View */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">
                Default View
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Choose your preferred workspace view
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewModeChange("masonry")}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preferences.viewMode === "masonry"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Masonry
                </button>
                <button
                  onClick={() => handleViewModeChange("calendar")}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    preferences.viewMode === "calendar"
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Calendar
                </button>
              </div>
            </div>

            {/* Calendar View (only show if calendar is selected) */}
            {preferences.viewMode === "calendar" && (
              <div className="pt-2">
                <label className="text-sm font-medium text-foreground">
                  Calendar View
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  Default calendar display mode
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCalendarViewChange("month")}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferences.calendarView === "month"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleCalendarViewChange("week")}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      preferences.calendarView === "week"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Masonry Columns Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Columns className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Masonry Columns
            </h3>
          </div>

          <div className="space-y-4">
            {/* Favorites Columns */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Favorites
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Number of columns for favorite notes
              </p>
              <div className="flex gap-2">
                {COLUMN_OPTIONS.map((col) => (
                  <button
                    key={`focus-${col}`}
                    onClick={() => handleFocusColumnsChange(col)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      preferences.focusColumns === col
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>

            {/* Library Columns */}
            <div>
              <label className="text-sm font-medium text-foreground">
                Library
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Number of columns for all notes
              </p>
              <div className="flex gap-2">
                {COLUMN_OPTIONS.map((col) => (
                  <button
                    key={`library-${col}`}
                    onClick={() => handleLibraryColumnsChange(col)}
                    disabled={loading}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      preferences.libraryColumns === col
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ModalContent>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Done
        </button>
      </ModalFooter>
    </Modal>
  );
}
