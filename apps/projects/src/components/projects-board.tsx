'use client';

import { Whiteboard } from './whiteboard/Whiteboard';

/**
 * ProjectsBoard component - Wraps the Whiteboard functionality
 * This preserves all existing whiteboard features (sticky notes, connections, etc.)
 * while allowing it to be embedded in the new workspace template
 */
export function ProjectsBoard() {
  return (
    <div className="h-full w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur overflow-hidden">
      <Whiteboard />
    </div>
  );
}
