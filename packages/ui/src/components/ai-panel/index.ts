/**
 * AI Floating Panel Components
 *
 * A draggable, resizable AI chat panel with customizable appearance
 * and behavior for use in any app.
 *
 * @module @ainexsuite/ui/components/ai-panel
 */

export {
  AIFloatingPanel,
  BotAvatarDisplay,
  type AIFloatingPanelProps,
  type AIFloatingPanelUser,
  type AIMessage,
  type SuggestedPrompt,
  type AIContextStats,
  type BotAvatarDisplayProps,
} from "./ai-floating-panel";

export {
  ChatMarkdown,
  type ChatMarkdownProps,
} from "./chat-markdown";

export {
  usePanelDragResize,
  type PanelState,
  type UsePanelDragResizeOptions,
  type DragHandleProps,
  type ResizeHandleProps,
  type ResizeEdge,
} from "./use-panel-drag-resize";
