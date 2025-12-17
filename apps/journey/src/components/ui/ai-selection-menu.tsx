'use client';

import { useState, useEffect, useRef } from 'react';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  Scissors,
  Lightbulb,
  Plus,
  Pencil,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { auth } from '@ainexsuite/firebase';
import { DOMSerializer } from '@tiptap/pm/model';

interface AISelectionMenuProps {
  editor: Editor;
}

type AIStyle = 'clarity' | 'concise' | 'reflection' | 'expand' | 'continue';

interface AIAction {
  id: AIStyle;
  label: string;
  icon: React.ElementType;
  description: string;
}

const AI_ACTIONS: AIAction[] = [
  { id: 'clarity', label: 'Improve', icon: Sparkles, description: 'Polish clarity' },
  { id: 'concise', label: 'Shorten', icon: Scissors, description: 'Make concise' },
  { id: 'reflection', label: 'Insights', icon: Lightbulb, description: 'Find meaning' },
  { id: 'expand', label: 'Expand', icon: Plus, description: 'Elaborate more' },
  { id: 'continue', label: 'Continue', icon: Pencil, description: 'Keep writing' },
];

const getSelectionHtml = (editor: Editor): string | null => {
  if (!editor) return null;
  const { state } = editor;
  const { from, to, empty } = state.selection;
  if (empty || from === to) {
    return null;
  }

  const slice = state.selection.content();
  const serializer = DOMSerializer.fromSchema(state.schema);
  const domFragment = serializer.serializeFragment(slice.content);
  const container = document.createElement('div');
  container.appendChild(domFragment);
  return container.innerHTML.trim() || null;
};

export function AISelectionMenu({ editor }: AISelectionMenuProps) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<AIStyle | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when selection changes
  useEffect(() => {
    const updatePosition = () => {
      const { state, view } = editor;
      const { from, to, empty } = state.selection;

      // Only show for text selections, not node selections (like images)
      if (empty || from === to || editor.isActive('image')) {
        setPosition(null);
        setHasSelection(false);
        return;
      }

      setHasSelection(true);

      // Get selection coordinates
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Position above the selection, centered
      setPosition({
        top: start.top - 50,
        left: (start.left + end.left) / 2,
      });
    };

    editor.on('selectionUpdate', updatePosition);
    editor.on('transaction', updatePosition);

    updatePosition();

    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('transaction', updatePosition);
    };
  }, [editor]);

  const handleAIAction = async (style: AIStyle) => {
    if (isLoading) return;

    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Get selected text or full content
    const selectionHtml = getSelectionHtml(editor);
    const contentToEnhance = selectionHtml || editor.getHTML();

    if (!contentToEnhance.trim()) return;

    setIsLoading(true);
    setLoadingAction(style);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ai/enhance-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ style, content: contentToEnhance }),
      });

      const data = await response.json();
      if (!response.ok || !data?.content) {
        throw new Error(data?.error ?? 'Failed to enhance content');
      }

      // Replace selection or insert at cursor
      if (selectionHtml) {
        // Replace selected text
        editor.chain().focus().insertContent(data.content).run();
      } else {
        // Replace entire content for 'continue', otherwise replace all
        if (style === 'continue') {
          editor.chain().focus().insertContent(data.content).run();
        } else {
          editor.commands.setContent(data.content);
        }
      }
    } catch (error) {
      console.error('AI enhancement failed:', error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleClose = () => {
    // Collapse selection to end
    const { to } = editor.state.selection;
    editor.chain().focus().setTextSelection(to).run();
  };

  // Don't render if no selection or not mounted
  if (!hasSelection || !position || !mounted) {
    return null;
  }

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center gap-0.5 p-1.5 rounded-xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 shadow-2xl"
      style={{
        top: Math.max(10, position.top),
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {AI_ACTIONS.map((action) => {
        const Icon = action.icon;
        const isActionLoading = loadingAction === action.id;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => handleAIAction(action.id)}
            disabled={isLoading}
            title={action.description}
            className={cn(
              'p-1.5 rounded-md transition-colors flex items-center gap-1',
              'text-white/70 hover:bg-white/10 hover:text-white',
              isLoading && 'opacity-50 cursor-not-allowed',
              isActionLoading && 'bg-orange-500/20 text-orange-400'
            )}
          >
            {isActionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Icon className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">{action.label}</span>
          </button>
        );
      })}

      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        title="Close"
        className="p-1.5 rounded-md transition-colors text-white/50 hover:bg-white/10 hover:text-white border-l border-white/10 ml-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return createPortal(menu, document.body);
}
