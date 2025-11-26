"use client";

import { useState } from "react";
import { ChevronDown, Plus, User, Users, Briefcase } from "lucide-react";
import { useSpaces } from "@/components/providers/spaces-provider";
import { SpaceEditor } from "./SpaceEditor";
import type { NoteSpace } from "@/lib/types/note";
import { clsx } from "clsx";

export function SpaceSwitcher() {
  const { spaces, currentSpaceId, setCurrentSpace } = useSpaces();
  const [isOpen, setIsOpen] = useState(false);
  const [showSpaceEditor, setShowSpaceEditor] = useState(false);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId);

  const getIcon = (type: NoteSpace["type"]) => {
    switch (type) {
      case "personal":
        return <User className="h-4 w-4" />;
      case "family":
        return <Users className="h-4 w-4" />;
      case "work":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleCreateSpace = () => {
    setIsOpen(false);
    setShowSpaceEditor(true);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-muted transition-colors w-full"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-400 flex items-center justify-center text-white">
            {currentSpace ? getIcon(currentSpace.type) : <User className="h-4 w-4" />}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-ink-900 leading-none truncate">
              {currentSpace?.name || "My Notes"}
            </p>
            <p className="text-xs text-ink-500 capitalize mt-0.5">
              {currentSpace?.type || "Personal"}
            </p>
          </div>
          <ChevronDown className={clsx(
            "h-4 w-4 text-ink-400 transition-transform",
            isOpen && "rotate-180"
          )} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 w-full mt-2 bg-surface-card border border-outline-subtle rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="p-1">
                <div className="px-3 py-2 text-xs font-semibold text-ink-400 uppercase tracking-wide">
                  Note Spaces
                </div>
                {spaces.map((space) => (
                  <button
                    key={space.id}
                    onClick={() => {
                      setCurrentSpace(space.id);
                      setIsOpen(false);
                    }}
                    className={clsx(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                      currentSpaceId === space.id
                        ? "bg-accent-500/10 text-accent-600"
                        : "text-ink-700 hover:bg-surface-muted hover:text-ink-900"
                    )}
                  >
                    <span className={clsx(
                      "h-7 w-7 rounded-md flex items-center justify-center",
                      currentSpaceId === space.id
                        ? "bg-accent-500 text-white"
                        : "bg-surface-muted text-ink-500"
                    )}>
                      {getIcon(space.type)}
                    </span>
                    <span className="flex-1 text-left truncate">{space.name}</span>
                    {currentSpaceId === space.id && (
                      <span className="h-2 w-2 rounded-full bg-accent-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t border-outline-subtle p-1">
                <button
                  onClick={handleCreateSpace}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-accent-600 hover:bg-accent-500/5 transition-colors"
                >
                  <span className="h-7 w-7 rounded-md bg-accent-500/10 flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </span>
                  Create New Space
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <SpaceEditor
        isOpen={showSpaceEditor}
        onClose={() => setShowSpaceEditor(false)}
      />
    </>
  );
}
