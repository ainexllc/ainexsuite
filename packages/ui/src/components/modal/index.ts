/**
 * Modal Components
 *
 * Unified modal system with specialized variants for common use cases.
 * All modals use glassmorphism styling and support theme-aware accent colors.
 */

// Filter Modal - For filtering content with tabs
export {
  FilterModal,
  type FilterModalProps,
  type FilterTab,
} from "./filter-modal";

// Form Modal - For create/edit forms
export {
  FormModal,
  type FormModalProps,
} from "./form-modal";

// Alert Modal - For informational alerts
export {
  AlertModal,
  type AlertModalProps,
  type AlertType,
} from "./alert-modal";
