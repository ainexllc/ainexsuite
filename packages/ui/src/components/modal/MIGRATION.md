# Migration Guide - Modal Variants

Guide for migrating from app-specific modal implementations to the unified modal variants in `@ainexsuite/ui`.

## Overview

The new modal variants provide:
- Consistent glassmorphism styling across all apps
- Theme-aware accent colors
- Better TypeScript support
- Reduced code duplication
- Standardized UX patterns

## Migration Checklist

- [ ] Identify app-specific modal components
- [ ] Choose appropriate modal variant
- [ ] Update imports to use `@ainexsuite/ui`
- [ ] Add `useAppColors()` hook for accent color
- [ ] Update props to match new API
- [ ] Test modal functionality
- [ ] Remove old modal component files

---

## Journey App - FilterModal

### Before: App-Specific FilterModal

**File**: `/apps/journey/src/components/journal/filter-modal.tsx`

```tsx
import { FilterModal } from '@/components/journal/filter-modal';

export function JournalPage() {
  return (
    <FilterModal
      isOpen={isOpen}
      onClose={handleClose}
      entries={entries}
      selectedTags={selectedTags}
      onTagSelect={handleTagSelect}
      onClearAll={handleClearAll}
    />
  );
}
```

### After: Unified FilterModal

**Changes:**
1. Import from `@ainexsuite/ui`
2. Add `useAppColors()` for theme integration
3. Update props structure
4. Handle tab state locally

```tsx
import { FilterModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Tag, Activity, Users, Hash } from 'lucide-react';

export function JournalPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { accentColor } = useAppColors();

  const tabs = [
    { id: 'all', label: 'All Tags', icon: Tag, count: allTags.length },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'people', label: 'People', icon: Users },
    { id: 'other', label: 'Other', icon: Hash },
  ];

  return (
    <FilterModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Filter Entries"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onApply={handleApply}
      onReset={handleClearAll}
      accentColor={accentColor}
    >
      {/* Your filter content - same as before */}
      <TagGrid tags={filteredTags} selectedTags={selectedTags} />
    </FilterModal>
  );
}
```

**File Cleanup:**
```bash
# Remove old component
rm apps/journey/src/components/journal/filter-modal.tsx
```

---

## Notes App - ConfirmModal

### Before: App-Specific ConfirmModal

**File**: `/apps/notes/src/components/ui/confirm-modal.tsx`

```tsx
import { ConfirmModal } from '@/components/ui/confirm-modal';

export function NotesPage() {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Delete Note"
      message="Are you sure you want to delete this note?"
      confirmLabel="Delete"
      cancelLabel="Cancel"
      isProcessing={isDeleting}
      onConfirm={handleDelete}
      onCancel={() => setIsOpen(false)}
    />
  );
}
```

### After: Use ConfirmationDialog or AlertModal

**Option 1: ConfirmationDialog (for destructive actions)**

```tsx
import { ConfirmationDialog } from '@ainexsuite/ui';

export function NotesPage() {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onConfirm={handleDelete}
      title="Delete Note"
      description="Are you sure you want to delete this note? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="danger"
    />
  );
}
```

**Option 2: AlertModal (for non-destructive confirmations)**

```tsx
import { AlertModal } from '@ainexsuite/ui';

export function NotesPage() {
  return (
    <AlertModal
      isOpen={isOpen}
      onDismiss={() => setIsOpen(false)}
      type="warning"
      title="Delete Note"
      message="Are you sure you want to delete this note? This action cannot be undone."
      dismissLabel="Cancel"
    />
  );
}
```

**File Cleanup:**
```bash
# Remove old component
rm apps/notes/src/components/ui/confirm-modal.tsx
```

---

## Grow App - Generic Modal

### Before: App-Specific Modal

**File**: `/apps/grow/src/components/ui/Modal.tsx`

```tsx
import { Modal } from '@/components/ui/Modal';

export function GrowPage() {
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Goal"
      description="Create a new growth goal"
      children={<GoalForm />}
    />
  );
}
```

### After: Use FormModal or GlassModal

**Option 1: FormModal (for forms)**

```tsx
import { FormModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';

export function GrowPage() {
  const { accentColor } = useAppColors();

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Goal"
      description="Create a new growth goal"
      onSave={handleSave}
      isLoading={isSaving}
      saveLabel="Create Goal"
      accentColor={accentColor}
    >
      <GoalForm />
    </FormModal>
  );
}
```

**Option 2: GlassModal (for custom content)**

```tsx
import {
  GlassModal,
  GlassModalHeader,
  GlassModalTitle,
  GlassModalContent
} from '@ainexsuite/ui';

export function GrowPage() {
  return (
    <GlassModal isOpen={isOpen} onClose={handleClose} variant="frosted">
      <GlassModalHeader onClose={handleClose}>
        <GlassModalTitle>Add Goal</GlassModalTitle>
      </GlassModalHeader>
      <GlassModalContent>
        <GoalForm />
      </GlassModalContent>
    </GlassModal>
  );
}
```

**File Cleanup:**
```bash
# Remove old component if no other usage
rm apps/grow/src/components/ui/Modal.tsx
```

---

## Common Patterns

### Pattern 1: Success/Error Feedback

**Before:**
```tsx
// Custom alert components
{showSuccess && <SuccessToast />}
{showError && <ErrorToast />}
```

**After:**
```tsx
import { AlertModal } from '@ainexsuite/ui';

const [alert, setAlert] = useState<{
  type: 'success' | 'error';
  title: string;
  message: string;
} | null>(null);

<AlertModal
  isOpen={!!alert}
  onDismiss={() => setAlert(null)}
  type={alert?.type || 'info'}
  title={alert?.title || ''}
  message={alert?.message || ''}
/>
```

### Pattern 2: Form with Validation

**Before:**
```tsx
// Manual modal + form + buttons
<Modal>
  <form onSubmit={handleSubmit}>
    {/* fields */}
    <button disabled={!isValid}>Save</button>
  </form>
</Modal>
```

**After:**
```tsx
import { FormModal } from '@ainexsuite/ui';

<FormModal
  onSave={handleSave}
  disableSave={!isValid}
  isLoading={isSaving}
>
  <form>{/* fields */}</form>
</FormModal>
```

### Pattern 3: Filtered Lists

**Before:**
```tsx
// Custom filter UI
<Modal>
  <Tabs />
  <FilterContent />
  <ApplyButton />
</Modal>
```

**After:**
```tsx
import { FilterModal } from '@ainexsuite/ui';

<FilterModal
  tabs={filterTabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  onApply={applyFilters}
  onReset={clearFilters}
>
  <FilterContent />
</FilterModal>
```

---

## Testing After Migration

### Visual Testing
- [ ] Modal opens with correct glassmorphism styling
- [ ] Accent color matches app theme
- [ ] Dark mode works correctly
- [ ] Responsive layout on mobile
- [ ] Animations are smooth

### Functional Testing
- [ ] ESC key closes modal (when appropriate)
- [ ] Backdrop click closes modal (when appropriate)
- [ ] Form submission works correctly
- [ ] Loading states prevent duplicate submissions
- [ ] Reset/Clear buttons work as expected
- [ ] Tab navigation works correctly (FilterModal)

### Accessibility Testing
- [ ] Focus trap works correctly
- [ ] Screen reader announces modal correctly
- [ ] Keyboard navigation works
- [ ] ARIA attributes are present

---

## Rollback Plan

If issues arise, you can temporarily keep both implementations:

```tsx
// Use old implementation temporarily
import { FilterModal as OldFilterModal } from '@/components/journal/filter-modal';

// New implementation
import { FilterModal as NewFilterModal } from '@ainexsuite/ui';

// Switch based on feature flag
const FilterModalComponent = useFeatureFlag('new-modals')
  ? NewFilterModal
  : OldFilterModal;
```

---

## Benefits After Migration

1. **Consistency**: Same modal UX across all apps
2. **Maintainability**: One source of truth for modal patterns
3. **Theme Integration**: Automatic accent color support
4. **Type Safety**: Better TypeScript support
5. **Accessibility**: Built-in a11y features
6. **Documentation**: Comprehensive docs and examples
7. **Less Code**: Reduced duplication across apps

---

## Need Help?

Refer to:
- `packages/ui/src/components/modal/README.md` - Component documentation
- `packages/ui/src/components/modal/EXAMPLES.md` - Usage examples
- Design system docs: `/docs/DESIGN_SYSTEM.md`
