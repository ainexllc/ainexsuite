"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import { AISidebar } from "./ai-sidebar";
import { clsx } from "clsx";
import { doc, onSnapshot, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@ainexsuite/firebase";
import { useAuth } from "@ainexsuite/auth";
import { RichTextEditor, type RichTextEditorRef } from "@/components/editor";
import { docCollectionPath } from "@/lib/firebase/collections";
import type { Doc, DocDoc } from "@/lib/types/doc";

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

interface FullPageDocEditorProps {
  docId: string;
}

export function FullPageDocEditor({ docId }: FullPageDocEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const editorRef = useRef<RichTextEditorRef>(null);

  const [document, setDocument] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  // Track if we're syncing from Firestore to prevent loops
  const isSyncingRef = useRef(false);
  const pendingUpdateRef = useRef<{ title?: string; body?: string } | null>(null);

  // Subscribe to document
  useEffect(() => {
    if (!user?.uid || !docId) return;

    const docRef = doc(db, docCollectionPath(user.uid), docId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as DocDoc;
          const docData: Doc = {
            id: snapshot.id,
            ownerId: data.ownerId,
            spaceId: data.spaceId,
            title: data.title || "",
            body: data.body || "",
            type: data.type || "text",
            checklist: data.checklist || [],
            color: data.color || "default",
            pattern: data.pattern,
            backgroundImage: data.backgroundImage,
            backgroundOverlay: data.backgroundOverlay,
            coverImage: data.coverImage,
            pinned: data.pinned || false,
            priority: data.priority,
            archived: data.archived || false,
            labelIds: data.labelIds || [],
            reminderAt: toOptionalDate(data.reminderAt),
            reminderId: data.reminderId,
            docDate: toOptionalDate(data.docDate),
            createdAt: toDate(data.createdAt),
            updatedAt: toDate(data.updatedAt),
            deletedAt: toOptionalDate(data.deletedAt),
            attachments: data.attachments || [],
            sharedWith: (data.sharedWith || []).map((c) => ({
              ...c,
              invitedAt: toDate(c.invitedAt),
            })),
            sharedWithUserIds: data.sharedWithUserIds || [],
            width: data.width,
            height: data.height,
          };
          setDocument(docData);

          // Only update local state if we're not in the middle of syncing
          if (!isSyncingRef.current) {
            setTitle(docData.title);
            setBody(docData.body);
          }
        } else {
          // Document not found, redirect back
          router.push("/workspace");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading document:", error);
        setLoading(false);
        router.push("/workspace");
      }
    );

    return () => unsubscribe();
  }, [user?.uid, docId, router]);

  // Save changes to Firestore
  const saveChanges = useCallback(
    async (updates: { title?: string; body?: string }) => {
      if (!user?.uid || !docId) return;

      setIsSaving(true);
      isSyncingRef.current = true;

      try {
        const docRef = doc(db, docCollectionPath(user.uid), docId);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save document:", error);
      } finally {
        setIsSaving(false);
        isSyncingRef.current = false;
      }
    },
    [user?.uid, docId]
  );

  // Debounced title save
  useEffect(() => {
    if (!document || title === document.title) return;

    const timeoutId = setTimeout(() => {
      saveChanges({ title: title.trim() || "Untitled Document" });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, document, saveChanges]);

  // Handle body changes from editor
  const handleBodyChange = useCallback(
    (html: string) => {
      setBody(html);

      // Queue the update
      pendingUpdateRef.current = { body: html };
    },
    []
  );

  // Debounced body save
  useEffect(() => {
    if (!document || body === document.body) return;

    const timeoutId = setTimeout(() => {
      if (pendingUpdateRef.current) {
        saveChanges(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [body, document, saveChanges]);

  const handleBack = useCallback(() => {
    router.push("/workspace");
  }, [router]);

  if (loading) {
    return (
      <div className="fixed inset-0 top-16 z-40 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="fixed inset-0 top-16 z-40 flex flex-col items-center justify-center gap-4 bg-background">
        <p className="text-muted-foreground">Document not found</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to workspace
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 z-40 flex flex-col bg-background">
      {/* Editor Header */}
      <div className="flex-none px-4 py-2 flex items-center gap-4 border-b border-border bg-background">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-foreground/5 transition-colors"
          title="Back to workspace"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Document"
          className={clsx(
            "flex-1 min-w-0 h-10 px-3 py-2 text-lg font-semibold",
            "bg-transparent hover:bg-foreground/5 focus:bg-foreground/5",
            "border border-transparent hover:border-border focus:border-border",
            "rounded-lg outline-none transition-colors",
            "placeholder:text-muted-foreground/50"
          )}
        />

        {/* Save status */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span>Saved</span>
            </>
          ) : null}
        </div>

        {/* AI Assistant toggle */}
        <button
          onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
          className={clsx(
            "flex items-center justify-center h-9 w-9 rounded-lg transition-colors",
            aiSidebarOpen
              ? "bg-primary/10 text-primary"
              : "hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
          )}
          title="AI Assistant"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>

      {/* Main content area with optional sidebar */}
      <div className="flex-1 min-h-0 flex">
        {/* Editor area */}
        <div className="flex-1 min-h-0 overflow-auto">
          <RichTextEditor
            ref={editorRef}
            content={body}
            onChange={handleBodyChange}
            placeholder="Start writing your document..."
            showToolbar={true}
            autofocus={true}
            minHeight="100%"
            className="h-full prose-lg"
            editorClassName={clsx(
              "min-h-full",
              "prose prose-neutral dark:prose-invert max-w-none",
              "prose-headings:font-semibold",
              "prose-p:leading-relaxed",
              "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
              "focus:outline-none"
            )}
          />
        </div>

        {/* AI Sidebar */}
        <AISidebar
          isOpen={aiSidebarOpen}
          onClose={() => setAiSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
