/**
 * Checklist Components
 *
 * Shared components for checklist/task list functionality used by
 * Notes (checklists) and Todo (subtasks).
 *
 * @module @ainexsuite/ui/components/checklist
 */

export {
  AnimatedCheckbox,
  type AnimatedCheckboxProps,
} from "./animated-checkbox";

export {
  ChecklistItemRow,
  type ChecklistItemRowProps,
} from "./checklist-item-row";

export {
  // Utility functions
  findParentIndex,
  findChildrenIndices,
  getSubtreeIndices,
  getChildrenCompletionStats,
  canIndent,
  canUnindent,
  // Constants
  MAX_INDENT_LEVEL,
  INDENT_WIDTH,
} from "./checklist-utils";
