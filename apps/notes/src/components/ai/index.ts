// AI Assistant components for Notes app

export { AIFloatingPanel } from './ai-floating-panel';
export type { AIFloatingPanelProps, AIFloatingPanelUser } from './ai-floating-panel';
export { usePanelDragResize } from './use-panel-drag-resize';
export type { PanelState, UsePanelDragResizeOptions } from './use-panel-drag-resize';
export { useNotesAI } from './use-notes-ai';
export type {
  InsightsPanelMode,
  AIAction,
  ActivityItem,
  UseNotesAIOptions,
  UseNotesAIReturn,
} from './use-notes-ai';
export {
  NOTES_SYSTEM_PROMPT,
  SUGGESTED_PROMPTS,
} from './notes-ai-prompts';
export type { SuggestedPrompt } from './notes-ai-prompts';
