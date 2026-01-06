"use client";

import { useMemo, useCallback } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import Masonry from "react-masonry-css";
import { EmptyState, ListSection } from "@ainexsuite/ui";
import { WorkflowCard } from "@/components/workflows/workflow-card";
import { useWorkflows } from "@/components/providers/workflows-provider";
import { useSelection } from "@/components/providers/selection-provider";

const SKELETON_BREAKPOINTS = { default: 2, 640: 1 };
const DEFAULT_BREAKPOINTS = { default: 2, 640: 1 };

function WorkflowsSkeleton() {
  return (
    <Masonry
      breakpointCols={SKELETON_BREAKPOINTS}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 h-[220px] rounded-2xl bg-surface-muted/80 shadow-inner animate-pulse"
        />
      ))}
    </Masonry>
  );
}

export function WorkflowBoard() {
  const {
    pinned,
    displayedOthers,
    loading,
    workflows,
    searchQuery,
    hasMore,
    isLoadingMore,
    totalCount,
    sentinelRef,
  } = useWorkflows();
  const { isSelected, isSelectMode, toggleSelection } = useSelection();

  // Helper to get time from Date
  const getTime = (date: Date | undefined) => {
    if (!date) return 0;
    return date instanceof Date ? date.getTime() : 0;
  };

  // Sort both pinned and displayedOthers by latest updated
  const sortedPinned = useMemo(() => {
    return [...pinned].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [pinned]);

  const sortedOthers = useMemo(() => {
    return [...displayedOthers].sort((a, b) => getTime(b.updatedAt) - getTime(a.updatedAt));
  }, [displayedOthers]);

  const hasWorkflows = useMemo(
    () => sortedPinned.length + sortedOthers.length > 0,
    [sortedPinned, sortedOthers]
  );

  // Callback for handling selection
  const onSelect = useCallback(
    (workflowId: string, _event: React.MouseEvent) => {
      toggleSelection(workflowId);
    },
    [toggleSelection]
  );

  return (
    <div className="space-y-1 lg:px-0 cq-board">
      {loading ? (
        <WorkflowsSkeleton />
      ) : hasWorkflows ? (
        <div className="space-y-10">
          {sortedPinned.length > 0 && (
            <ListSection title="Focus" count={sortedPinned.length}>
              <Masonry
                breakpointCols={DEFAULT_BREAKPOINTS}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {sortedPinned.map((workflow) => (
                  <div key={workflow.id} className="mb-4">
                    <WorkflowCard
                      workflow={workflow}
                      isSelectMode={isSelectMode}
                      isSelected={isSelected(workflow.id)}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </Masonry>
            </ListSection>
          )}

          {sortedOthers.length > 0 && (
            <ListSection
              title="All Workflows"
              count={sortedPinned.length > 0 ? totalCount : undefined}
            >
              <Masonry
                breakpointCols={DEFAULT_BREAKPOINTS}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {sortedOthers.map((workflow) => (
                  <div key={workflow.id} className="mb-4">
                    <WorkflowCard
                      workflow={workflow}
                      isSelectMode={isSelectMode}
                      isSelected={isSelected(workflow.id)}
                      onSelect={onSelect}
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
                  <span className="ml-2 text-sm text-muted-foreground">Loading more workflows...</span>
                </div>
              )}

              {/* End of workflows indicator */}
              {!loading && !isLoadingMore && !hasMore && totalCount > 0 && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs text-muted-foreground">
                    {totalCount} {totalCount === 1 ? "workflow" : "workflows"}
                  </span>
                </div>
              )}
            </ListSection>
          )}
        </div>
      ) : workflows.length === 0 && searchQuery.trim() ? (
        <EmptyState
          title="No workflows found"
          description="Try a different keyword or remove filters to see more workflows."
          icon={GitBranch}
          variant="default"
        />
      ) : (
        <EmptyState
          title="Workflows you create will appear here"
          description="Design visual workflows with nodes and connections. Pin important ones to keep them at the top."
          icon={GitBranch}
          variant="default"
        />
      )}
    </div>
  );
}
