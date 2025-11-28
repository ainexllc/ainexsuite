# Modal Components

Unified modal system with specialized variants for common use cases. All modals use glassmorphism styling and support theme-aware accent colors.

## Components

### Base Modals

- **Modal** - Standard modal component with basic structure
- **GlassModal** - Enhanced modal with glassmorphism styling (base for variants)

### Specialized Variants

#### FilterModal

A modal for filtering content with tab support.

**Features:**
- Tab navigation for filter categories
- Reset and Apply action buttons
- Tab icons and count badges
- Theme-aware accent colors

**Usage:**
```tsx
import { FilterModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Tag, Activity } from 'lucide-react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const { accentColor } = useAppColors();

  const tabs = [
    { id: 'all', label: 'All', icon: Tag, count: 10 },
    { id: 'activities', label: 'Activities', icon: Activity, count: 5 },
  ];

  return (
    <FilterModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Filter Entries"
      description="Select filters to narrow down your results"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onApply={() => {
        // Apply filters logic
        console.log('Filters applied:', selectedFilters);
      }}
      onReset={() => setSelectedFilters([])}
      disableReset={selectedFilters.length === 0}
      accentColor={accentColor}
    >
      {/* Your filter content */}
      <div className="space-y-4">
        {/* Filter checkboxes, inputs, etc. */}
      </div>
    </FilterModal>
  );
}
```

**Props:**
- `isOpen` - Whether modal is open
- `onClose` - Close callback
- `title` - Modal title (default: "Filters")
- `description` - Optional description text
- `tabs` - Array of tab configurations
- `activeTab` - Currently active tab ID
- `onTabChange` - Tab change callback
- `onApply` - Apply button callback
- `onReset` - Reset button callback
- `applyLabel` - Apply button text (default: "Apply Filters")
- `resetLabel` - Reset button text (default: "Reset")
- `disableReset` - Disable reset button
- `accentColor` - Theme accent color (default: "#6366f1")

---

#### FormModal

A modal for create/edit forms with save and cancel actions.

**Features:**
- Save and Cancel buttons
- Loading state with spinner
- Async save handler support
- Prevents closing during save

**Usage:**
```tsx
import { FormModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';
import { Input, Textarea } from '@ainexsuite/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { accentColor } = useAppColors();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save logic
      await saveEntry();
      setIsOpen(false); // Close on success
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Create Entry"
      description="Fill in the details below"
      onSave={handleSave}
      isLoading={isSaving}
      saveLabel="Create"
      accentColor={accentColor}
    >
      <form className="space-y-4">
        <Input label="Title" />
        <Textarea label="Content" rows={6} />
      </form>
    </FormModal>
  );
}
```

**Props:**
- `isOpen` - Whether modal is open
- `onClose` - Close callback
- `title` - Modal title (required)
- `description` - Optional description text
- `onSave` - Save button callback (can be async)
- `onCancel` - Cancel button callback (defaults to onClose)
- `isLoading` - External loading state
- `disableSave` - Disable save button
- `saveLabel` - Save button text (default: "Save")
- `cancelLabel` - Cancel button text (default: "Cancel")
- `accentColor` - Theme accent color (default: "#6366f1")
- `size` - Modal size: "sm" | "md" | "lg" | "xl" | "full"

---

#### AlertModal

A modal for informational alerts with icon and dismiss action.

**Features:**
- Type-based icons and colors (info, warning, success, error)
- Single dismiss button
- Custom icon support
- Centered content layout

**Usage:**
```tsx
import { AlertModal } from '@ainexsuite/ui';

function MyComponent() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <>
      {/* Success Alert */}
      <AlertModal
        isOpen={showSuccess}
        onDismiss={() => setShowSuccess(false)}
        type="success"
        title="Entry Created"
        message="Your journal entry has been saved successfully."
      />

      {/* Error Alert with custom content */}
      <AlertModal
        isOpen={showError}
        onDismiss={() => setShowError(false)}
        type="error"
        title="Connection Failed"
        message={
          <div>
            <p>Unable to connect to the server.</p>
            <p className="text-sm mt-2">
              Please check your internet connection and try again.
            </p>
          </div>
        }
      />
    </>
  );
}
```

**Props:**
- `isOpen` - Whether modal is open
- `onDismiss` - Dismiss callback
- `title` - Alert title (required)
- `message` - Alert message (string or React node)
- `type` - Alert type: "info" | "warning" | "success" | "error" (default: "info")
- `dismissLabel` - Dismiss button text (default: "OK")
- `icon` - Custom icon component (overrides type icon)
- `size` - Modal size: "sm" | "md" | "lg" (default: "sm")

**Alert Types:**

| Type | Icon | Color |
|------|------|-------|
| `info` | Info | Blue (#3b82f6) |
| `warning` | AlertTriangle | Amber (#f59e0b) |
| `success` | CheckCircle | Green (#22c55e) |
| `error` | XCircle | Red (#ef4444) |

---

## Theme Integration

All modal variants support the `accentColor` prop for theme-aware styling. Use the `useAppColors` hook from `@ainexsuite/theme` to get the app's accent color:

```tsx
import { useAppColors } from '@ainexsuite/theme';

function MyComponent() {
  const { accentColor } = useAppColors();

  return (
    <FilterModal
      // ... other props
      accentColor={accentColor}
    />
  );
}
```

**App Accent Colors:**
- Journey: `#f97316` (Orange)
- Notes: `#3b82f6` (Blue)
- Main: Dynamic based on app switcher

---

## Best Practices

1. **Use the right variant:**
   - `FilterModal` - For filtering and searching with multiple categories
   - `FormModal` - For create/edit operations
   - `AlertModal` - For notifications and confirmations
   - `ConfirmationDialog` - For destructive actions requiring confirmation

2. **Provide accent colors:**
   ```tsx
   const { accentColor } = useAppColors();
   <FormModal accentColor={accentColor} />
   ```

3. **Handle async operations:**
   ```tsx
   const handleSave = async () => {
     try {
       await saveData();
       onClose(); // Close on success
     } catch (error) {
       // Show error, keep modal open
     }
   };
   ```

4. **Disable actions when needed:**
   ```tsx
   <FilterModal
     disableReset={selectedFilters.length === 0}
   />

   <FormModal
     disableSave={!isValid || isSaving}
   />
   ```

5. **Use proper alert types:**
   - `info` - General information
   - `warning` - Cautionary messages
   - `success` - Successful operations
   - `error` - Error messages

---

## Migration from App-Specific Modals

### From Journey FilterModal

**Before:**
```tsx
import { FilterModal } from '@/components/journal/filter-modal';
```

**After:**
```tsx
import { FilterModal } from '@ainexsuite/ui';
import { useAppColors } from '@ainexsuite/theme';

const { accentColor } = useAppColors();
<FilterModal accentColor={accentColor} />
```

### From Notes ConfirmModal

**Before:**
```tsx
import { ConfirmModal } from '@/components/ui/confirm-modal';
```

**After:**
```tsx
import { AlertModal } from '@ainexsuite/ui';
// or
import { ConfirmationDialog } from '@ainexsuite/ui';
```

---

## Related Components

- **Modal** - Base modal component
- **GlassModal** - Glassmorphism modal (base for variants)
- **ConfirmationDialog** - Confirmation dialog for destructive actions
