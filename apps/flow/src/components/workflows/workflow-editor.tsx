"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import { useAuth } from "@ainexsuite/auth";
import { WorkflowCanvasWithId } from "@/components/workflow-canvas/WorkflowCanvasWithId";
import { WORKFLOW_COLLECTIONS } from "@/lib/firebase/collections";
import type { Workflow } from "@/lib/types/workflow";

// Helper to safely convert Firestore timestamp to Date
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function toOptionalDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return null;
}

interface WorkflowEditorProps {
  workflowId: string;
}

export function WorkflowEditor({ workflowId }: WorkflowEditorProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Subscribe to workflow document
  useEffect(() => {
    if (!user?.uid || !workflowId) return;

    const workflowRef = doc(db, WORKFLOW_COLLECTIONS.workflows(user.uid), workflowId);

    const unsubscribe = onSnapshot(
      workflowRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const workflowData: Workflow = {
            id: snapshot.id,
            ownerId: data.ownerId,
            spaceId: data.spaceId,
            title: data.title || "Untitled Workflow",
            description: data.description,
            nodes: data.nodes || [],
            edges: data.edges || [],
            viewport: data.viewport || { x: 0, y: 0, zoom: 1 },
            edgeType: data.edgeType || "smoothstep",
            arrowType: data.arrowType || "end",
            lineStyle: data.lineStyle || "solid",
            thumbnail: data.thumbnail,
            nodeCount: data.nodeCount || 0,
            color: data.color || "default",
            pinned: data.pinned || false,
            archived: data.archived || false,
            labelIds: data.labelIds || [],
            reminderAt: toOptionalDate(data.reminderAt),
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
            deletedAt: toOptionalDate(data.deletedAt),
            sharedWith: data.sharedWith || [],
            sharedWithUserIds: data.sharedWithUserIds || [],
          };
          setWorkflow(workflowData);
          setTitle(workflowData.title);
        } else {
          // Workflow not found, redirect back
          router.push("/workspace");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading workflow:", error);
        setLoading(false);
        router.push("/workspace");
      }
    );

    return () => unsubscribe();
  }, [user?.uid, workflowId, router]);

  // Update title in Firestore (debounced)
  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      setTitle(newTitle);
      if (!user?.uid || !workflowId) return;

      setIsSaving(true);
      try {
        const workflowRef = doc(db, WORKFLOW_COLLECTIONS.workflows(user.uid), workflowId);
        await updateDoc(workflowRef, {
          title: newTitle.trim() || "Untitled Workflow",
          updatedAt: serverTimestamp(),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to update title:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [user?.uid, workflowId]
  );

  // Debounce title updates
  useEffect(() => {
    if (!workflow || title === workflow.title) return;

    const timeoutId = setTimeout(() => {
      handleTitleChange(title);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, workflow, handleTitleChange]);

  const handleBack = useCallback(() => {
    router.push("/workspace");
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Workflow not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] w-full">
      {/* Workflow Canvas - Full space */}
      <WorkflowCanvasWithId workflowId={workflowId} />

      {/* Floating Controls Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Left: Back button + Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleBack}
            className={clsx(
              "h-9 w-9 rounded-lg flex items-center justify-center",
              "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm",
              "border border-zinc-200 dark:border-zinc-700",
              "text-muted-foreground hover:text-foreground",
              "shadow-sm hover:shadow transition-all"
            )}
            title="Back to workflows"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className={clsx(
            "flex items-center gap-2 px-3 h-9 rounded-lg",
            "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm",
            "border border-zinc-200 dark:border-zinc-700",
            "shadow-sm"
          )}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Workflow"
              className={clsx(
                "bg-transparent text-sm font-medium w-48",
                "placeholder:text-muted-foreground",
                "focus:outline-none"
              )}
            />
          </div>
        </div>

        {/* Right: Save Status */}
        {(isSaving || lastSaved) && (
          <div className={clsx(
            "flex items-center gap-2 px-3 h-9 rounded-lg text-xs pointer-events-auto",
            "bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm",
            "border border-zinc-200 dark:border-zinc-700",
            "shadow-sm text-muted-foreground"
          )}>
            {isSaving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
