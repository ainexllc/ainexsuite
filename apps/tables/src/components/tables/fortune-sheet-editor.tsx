"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import Fortune-Sheet CSS directly for client-side rendering
import "@fortune-sheet/react/dist/index.css";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import { useAuth } from "@ainexsuite/auth";
import { tableCollectionPath } from "@/lib/firebase/collections";
import {
  toFortuneSheetData,
  fromFortuneSheetData,
} from "@/lib/utils/fortune-sheet-converter";
import type { Table } from "@/lib/types/table";
import type { Sheet } from "@fortune-sheet/core";

// Dynamic import Fortune-Sheet to avoid SSR issues
const Workbook = dynamic(
  () => import("@fortune-sheet/react").then((mod) => mod.Workbook),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface FortuneSheetEditorProps {
  table: Table;
  fullPage?: boolean;
}

export function FortuneSheetEditor({
  table,
  fullPage = false,
}: FortuneSheetEditorProps) {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // Refs for tracking changes and debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<Sheet[] | null>(null);
  const isSavingRef = useRef(false);
  const saveToFirestoreRef = useRef<((data: Sheet[]) => Promise<void>) | null>(null);

  // Convert initial data - only compute once on mount
  const initialData = useMemo(() => {
    return toFortuneSheetData(table.spreadsheet, table.title || "Sheet1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only compute once on mount

  // Client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Save to Firestore
  const saveToFirestore = useCallback(
    async (data: Sheet[]) => {
      if (!user?.uid || isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;

      try {
        const spreadsheetData = fromFortuneSheetData(data);
        const docRef = doc(db, tableCollectionPath(user.uid), table.id);

        await updateDoc(docRef, {
          spreadsheet: spreadsheetData,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Failed to save spreadsheet:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.uid, table.id] // Don't include table.spreadsheet - causes recreate loop
  );

  // Keep ref updated for unmount save
  saveToFirestoreRef.current = saveToFirestore;

  // Debounced save
  const debouncedSave = useCallback(
    (data: Sheet[]) => {
      pendingDataRef.current = data;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          saveToFirestore(pendingDataRef.current);
          pendingDataRef.current = null;
        }
      }, 500); // 500ms debounce for responsive saves
    },
    [saveToFirestore]
  );

  // Track mount state to skip initial onChange events
  const mountTimeRef = useRef(Date.now());

  // Handle Fortune-Sheet onChange - save after initial load settles
  const handleChange = useCallback(
    (data: Sheet[]) => {
      const timeSinceMount = Date.now() - mountTimeRef.current;

      // Skip onChange events in the first 1 second (initialization)
      if (timeSinceMount < 1000) {
        return;
      }

      debouncedSave(data);
    },
    [debouncedSave]
  );

  // Cleanup on unmount only - empty deps to run only on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Save pending data on unmount using ref (not callback dependency)
      if (pendingDataRef.current && !isSavingRef.current && saveToFirestoreRef.current) {
        saveToFirestoreRef.current(pendingDataRef.current);
      }
    };
  }, []);

  // Fortune-Sheet configuration
  const settings = useMemo(
    () => ({
      // Toolbar configuration
      showToolbar: true,
      showFormulaBar: true,
      showSheetTabs: false, // Single sheet for now

      // Enable all toolbar items (organized by function groups)
      toolbarItems: [
        // Undo/Redo
        "undo", "redo", "|",
        // Format painter & clear
        "format-painter", "clear-format", "|",
        // Number formatting
        "currency-format", "percentage-format", "number-decrease", "number-increase", "format", "|",
        // Font styling
        "font", "font-size", "|",
        "bold", "italic", "strike-through", "underline", "|",
        // Colors
        "font-color", "background", "|",
        // Borders & merge
        "border", "merge-cell", "|",
        // Alignment
        "horizontal-align", "vertical-align", "text-wrap", "text-rotation", "|",
        // View
        "freeze", "|",
        // Data tools
        "sort", "filter", "conditionFormat", "|",
        // Insert
        "link", "image", "comment", "|",
        // Formulas
        "quick-formula", "|",
        // Advanced
        "search",
      ],

      // Cell right-click context menu
      cellContextMenu: [
        "copy", "paste", "|",
        "insert-row", "insert-column", "|",
        "delete-row", "delete-column", "delete-cell", "|",
        "hide-row", "hide-column", "|",
        "set-row-height", "set-column-width", "|",
        "clear", "|",
        "sort", "orderAZ", "orderZA", "|",
        "filter", "|",
        "link", "image", "|",
        "cell-format",
      ],

      // Header right-click context menu
      headerContextMenu: [
        "copy", "paste", "|",
        "insert-row", "insert-column", "|",
        "delete-row", "delete-column", "|",
        "hide-row", "hide-column", "|",
        "set-row-height", "set-column-width", "|",
        "clear", "|",
        "sort", "orderAZ", "orderZA",
      ],

      // Enable features
      allowEdit: true,

      // Cell default settings
      defaultColWidth: 100,
      defaultRowHeight: 24,

      // Rows and columns
      row: 100,
      column: 26,

      // Font configuration - Verdana as default
      defaultFont: "Verdana",
      fontList: [
        { value: "Verdana", text: "Verdana" },
        { value: "Arial", text: "Arial" },
        { value: "Tahoma", text: "Tahoma" },
        { value: "Helvetica", text: "Helvetica" },
        { value: "Georgia", text: "Georgia" },
        { value: "Times New Roman", text: "Times New Roman" },
        { value: "Courier New", text: "Courier New" },
        { value: "Comic Sans MS", text: "Comic Sans MS" },
      ],
    }),
    []
  );

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Compact view for card preview
  if (!fullPage) {
    return (
      <div className="w-full h-full fortune-sheet-compact relative">
        <div className="absolute inset-0">
          <Workbook data={initialData} onChange={handleChange} {...settings} />
        </div>
      </div>
    );
  }

  // Full page view - just the spreadsheet, header is handled by parent
  return (
    <div className="w-full h-full fortune-sheet-fullpage">
      <Workbook data={initialData} onChange={handleChange} {...settings} />
    </div>
  );
}

export default FortuneSheetEditor;
