"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { clsx } from "clsx";
import type { Note } from "@/lib/types/note";
import { useNotes } from "@/components/providers/notes-provider";

type ResizableNoteProps = {
  note: Note;
  children: React.ReactNode;
  viewMode?: "masonry" | "list";
};

type ResizeDirection = "nw" | "ne" | "sw" | "se";

const MAX_WIDTH = 500;
const MAX_HEIGHT = 1000;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

export function ResizableNote({ note, children, viewMode = "masonry" }: ResizableNoteProps) {
  const { updateNote } = useNotes();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [dimensions, setDimensions] = useState({
    width: note.width || MIN_WIDTH,
    height: note.height || MIN_HEIGHT,
  });

  const startPosRef = useRef({ x: 0, y: 0 });
  const startDimensionsRef = useRef({ width: 0, height: 0 });

  // Disable resizing in list view mode
  if (viewMode === "list") {
    return <>{children}</>;
  }

  const handleMouseDown = useCallback((direction: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startDimensionsRef.current = { ...dimensions };
  }, [dimensions]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !resizeDirection) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;

    let newWidth = startDimensionsRef.current.width;
    let newHeight = startDimensionsRef.current.height;

    // Calculate new dimensions based on resize direction
    switch (resizeDirection) {
      case "se": // Bottom-right
        newWidth = startDimensionsRef.current.width + deltaX;
        newHeight = startDimensionsRef.current.height + deltaY;
        break;
      case "sw": // Bottom-left
        newWidth = startDimensionsRef.current.width - deltaX;
        newHeight = startDimensionsRef.current.height + deltaY;
        break;
      case "ne": // Top-right
        newWidth = startDimensionsRef.current.width + deltaX;
        newHeight = startDimensionsRef.current.height - deltaY;
        break;
      case "nw": // Top-left
        newWidth = startDimensionsRef.current.width - deltaX;
        newHeight = startDimensionsRef.current.height - deltaY;
        break;
    }

    // Enforce constraints
    newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
    newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight));

    setDimensions({ width: newWidth, height: newHeight });
  }, [isResizing, resizeDirection]);

  const handleMouseUp = useCallback(async () => {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeDirection(null);

    // Save the new dimensions to the database
    if (dimensions.width !== note.width || dimensions.height !== note.height) {
      await updateNote(note.id, {
        width: dimensions.width,
        height: dimensions.height,
      });
    }
  }, [isResizing, dimensions, note.id, note.width, note.height, updateNote]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = getCursorForDirection(resizeDirection);
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp, resizeDirection]);

  const getCursorForDirection = (direction: ResizeDirection | null): string => {
    switch (direction) {
      case "nw": return "nw-resize";
      case "ne": return "ne-resize";
      case "sw": return "sw-resize";
      case "se": return "se-resize";
      default: return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      <div className="h-full w-full overflow-hidden">
        {children}
      </div>

      {/* Corner resize handles */}
      <div
        className={clsx(
          "absolute -left-1 -top-1 h-3 w-3 cursor-nw-resize rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100",
          isResizing && resizeDirection === "nw" && "opacity-100"
        )}
        onMouseDown={(e) => handleMouseDown("nw", e)}
        aria-label="Resize from top-left corner"
      />
      <div
        className={clsx(
          "absolute -right-1 -top-1 h-3 w-3 cursor-ne-resize rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100",
          isResizing && resizeDirection === "ne" && "opacity-100"
        )}
        onMouseDown={(e) => handleMouseDown("ne", e)}
        aria-label="Resize from top-right corner"
      />
      <div
        className={clsx(
          "absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100",
          isResizing && resizeDirection === "sw" && "opacity-100"
        )}
        onMouseDown={(e) => handleMouseDown("sw", e)}
        aria-label="Resize from bottom-left corner"
      />
      <div
        className={clsx(
          "absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100",
          isResizing && resizeDirection === "se" && "opacity-100"
        )}
        onMouseDown={(e) => handleMouseDown("se", e)}
        aria-label="Resize from bottom-right corner"
      />
    </div>
  );
}
