/**
 * Hints System Components
 *
 * First-time user guidance system with dismissable tooltips.
 * Supports multiple storage adapters (localStorage, Firestore, etc.)
 *
 * @module @ainexsuite/ui/components/hints
 */

export {
  HintsProvider,
  useHints,
  createLocalStorageAdapter,
  type HintConfig,
  type HintPlacement,
  type HintsStorageAdapter,
} from "./hints-provider";

export { Hint, type HintProps } from "./hint";
