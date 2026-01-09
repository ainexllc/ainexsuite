"use client";

import { useMemo, useCallback } from "react";
import { FolderKanban, Loader2 } from "lucide-react";
import Masonry from "react-masonry-css";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { ProjectCard } from "@/components/projects/project-card";
import { ColumnSelector } from "@/components/projects/column-selector";
import { useProjects } from "@/components/providers/projects-provider";
import { usePreferences } from "@/components/providers/preferences-provider";
import { useSelection } from "@/components/providers/selection-provider";
import type { Project } from "@/lib/types/project";

// ============ Skeleton Component ============

const SKELETON_BREAKPOINTS = { default: 2, 640: 1 };

function ProjectCardSkeleton() {
  return (
    <div className="mb-4 h-[240px] rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/50 shadow-inner animate-pulse overflow-hidden relative flex flex-col">
      {/* Header skeleton */}
      <div className="px-4 py-2.5 border-b border-zinc-200/30 dark:border-zinc-700/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
          <div className="h-4 w-32 rounded bg-zinc-200/80 dark:bg-zinc-700/80" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 py-3 space-y-3 flex-1">
        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
          <div className="h-3 w-3/4 rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
        </div>

        {/* Status/Priority badges */}
        <div className="flex gap-1.5">
          <div className="h-5 w-16 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60" />
          <div className="h-5 w-12 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60" />
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60" />
          <div className="h-3 w-8 rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="mt-auto px-4 py-2 border-t border-zinc-200/30 dark:border-zinc-700/30 bg-zinc-100/50 dark:bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 rounded-full bg-zinc-200/60 dark:bg-zinc-700/60" />
          <div className="h-3 w-12 rounded bg-zinc-200/60 dark:bg-zinc-700/60" />
        </div>
      </div>
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <Masonry
      breakpointCols={SKELETON_BREAKPOINTS}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <ProjectCardSkeleton key={index} />
      ))}
    </Masonry>
  );
}

// ============ Props Types ============

type ProjectBoardProps = {
  /** Callback when a project is clicked to open editor */
  onProjectClick?: (project: Project) => void;
};

// ============ Main Component ============

export function ProjectBoard({ onProjectClick }: ProjectBoardProps) {
  const {
    focusProjects,
    displayedLibraryProjects,
    loading,
    projects,
    searchQuery,
    hasMore,
    isLoadingMore,
    totalCount,
    sentinelRef,
    togglePin,
  } = useProjects();
  const { preferences } = usePreferences();
  const { isSelected, selectionMode, handleSelect } = useSelection();

  // Separate breakpoints for Focus and Library sections
  const focusBreakpoints = useMemo(
    () => ({
      default: preferences.focusColumns || 2,
      640: 1,
    }),
    [preferences.focusColumns]
  );

  const libraryBreakpoints = useMemo(
    () => ({
      default: preferences.libraryColumns || 2,
      640: 1,
    }),
    [preferences.libraryColumns]
  );

  const hasProjects = useMemo(
    () => focusProjects.length + displayedLibraryProjects.length > 0,
    [focusProjects, displayedLibraryProjects]
  );

  // Get all project IDs for range selection
  const allProjectIds = useMemo(() => {
    return [...focusProjects, ...displayedLibraryProjects].map(
      (project) => project.id
    );
  }, [focusProjects, displayedLibraryProjects]);

  // Callback for handling selection
  const onSelect = useCallback(
    (projectId: string, event: React.MouseEvent) => {
      handleSelect(projectId, event, allProjectIds);
    },
    [handleSelect, allProjectIds]
  );

  // Handler for project click
  const handleProjectClick = useCallback(
    (project: Project) => {
      onProjectClick?.(project);
    },
    [onProjectClick]
  );

  // Handler for pin toggle
  const handlePinToggle = useCallback(
    async (projectId: string, isPinned: boolean) => {
      await togglePin(projectId, !isPinned);
    },
    [togglePin]
  );

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {loading ? (
        <ProjectsSkeleton />
      ) : hasProjects ? (
        <div className="space-y-10">
          {/* Focus Section - Pinned projects */}
          {focusProjects.length > 0 && (
            <ListSection
              title="Focus"
              count={focusProjects.length}
              action={<ColumnSelector section="focus" />}
            >
              <Masonry
                breakpointCols={focusBreakpoints}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {focusProjects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <ProjectCard
                      project={project}
                      onClick={() => handleProjectClick(project)}
                      onPin={() => handlePinToggle(project.id, project.pinned)}
                      selectionMode={selectionMode}
                      isSelected={isSelected(project.id)}
                      onSelect={() =>
                        onSelect(project.id, { shiftKey: false } as React.MouseEvent)
                      }
                    />
                  </div>
                ))}
              </Masonry>
            </ListSection>
          )}

          {/* Library Section - All other projects */}
          {displayedLibraryProjects.length > 0 && (
            <ListSection
              title="Projects"
              count={focusProjects.length > 0 ? totalCount : undefined}
              action={<ColumnSelector section="library" />}
            >
              <Masonry
                breakpointCols={libraryBreakpoints}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {displayedLibraryProjects.map((project) => (
                  <div key={project.id} className="mb-4">
                    <ProjectCard
                      project={project}
                      onClick={() => handleProjectClick(project)}
                      onPin={() => handlePinToggle(project.id, project.pinned)}
                      selectionMode={selectionMode}
                      isSelected={isSelected(project.id)}
                      onSelect={() =>
                        onSelect(project.id, { shiftKey: false } as React.MouseEvent)
                      }
                    />
                  </div>
                ))}
              </Masonry>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" aria-hidden="true" />

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading more projects...
                  </span>
                </div>
              )}

              {/* End of projects indicator */}
              {!loading && !isLoadingMore && !hasMore && totalCount > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground">
                    {totalCount} {totalCount === 1 ? "project" : "projects"}
                  </span>
                </div>
              )}
            </ListSection>
          )}
        </div>
      ) : projects.length === 0 && searchQuery.trim() ? (
        <EmptyState
          title="No projects found"
          description="Try a different keyword or remove filters to see more projects."
          icon={FolderKanban}
          variant="default"
        />
      ) : (
        <EmptyState
          title="Projects you create will appear here"
          description="Organize your work with projects. Track progress with tasks, set due dates, and pin important ones to Focus."
          icon={FolderKanban}
          variant="default"
        />
      )}
    </div>
  );
}
