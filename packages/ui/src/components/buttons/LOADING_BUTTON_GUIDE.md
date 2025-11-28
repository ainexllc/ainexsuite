# LoadingButton Component Guide

Complete guide for using the LoadingButton component across AinexSuite.

## Overview

`LoadingButton` extends the standard `Button` component with built-in loading state management. It automatically shows a spinner, disables interaction, and optionally changes the button text during async operations.

## Basic Usage

```tsx
import { LoadingButton } from '@ainexsuite/ui';

function MyForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await someAsyncOperation();
    setIsSubmitting(false);
  };

  return (
    <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
      Submit
    </LoadingButton>
  );
}
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | boolean | false | Whether button is in loading state |
| `loadingText` | string | - | Text to show when loading (overrides children) |
| `spinnerPosition` | 'left' \| 'right' | 'left' | Position of spinner relative to text |
| `spinnerSize` | 'sm' \| 'md' \| 'lg' \| 'xl' | auto | Custom spinner size (auto-sized based on button size) |
| `variant` | ButtonVariant | 'primary' | Button style variant |
| `size` | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| `disabled` | boolean | false | Additional disabled state |
| ...ButtonProps | - | - | All standard button HTML attributes |

## Variants

All standard button variants are supported:

```tsx
// Primary (default)
<LoadingButton variant="primary" loading={loading}>
  Primary Action
</LoadingButton>

// Secondary
<LoadingButton variant="secondary" loading={loading}>
  Secondary Action
</LoadingButton>

// Outline
<LoadingButton variant="outline" loading={loading}>
  Outline Action
</LoadingButton>

// Ghost
<LoadingButton variant="ghost" loading={loading}>
  Ghost Action
</LoadingButton>

// Danger
<LoadingButton variant="danger" loading={loading}>
  Delete
</LoadingButton>

// Accent
<LoadingButton variant="accent" loading={loading}>
  Accent Action
</LoadingButton>
```

## Sizes

```tsx
// Small
<LoadingButton size="sm" loading={loading}>
  Small Button
</LoadingButton>

// Medium (default)
<LoadingButton size="md" loading={loading}>
  Medium Button
</LoadingButton>

// Large
<LoadingButton size="lg" loading={loading}>
  Large Button
</LoadingButton>
```

## Loading Text

Change button text during loading:

```tsx
<LoadingButton
  loading={isSaving}
  loadingText="Saving..."
>
  Save Changes
</LoadingButton>
```

When `loading={true}`, button shows:
- Spinner
- "Saving..." text
- Disabled state

When `loading={false}`, button shows:
- No spinner
- "Save Changes" text
- Normal state

## Spinner Position

```tsx
// Spinner on left (default)
<LoadingButton
  loading={loading}
  spinnerPosition="left"
>
  Continue
</LoadingButton>

// Spinner on right
<LoadingButton
  loading={loading}
  spinnerPosition="right"
>
  Next Step
</LoadingButton>
```

## Common Patterns

### Form Submission

```tsx
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: '', email: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm(formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit Form
      </LoadingButton>
    </form>
  );
}
```

### Delete Confirmation

```tsx
function DeleteAction({ itemId }: { itemId: string }) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteItem(itemId);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <LoadingButton
        variant="ghost"
        onClick={() => setShowConfirm(true)}
      >
        Delete
      </LoadingButton>

      {showConfirm && (
        <Modal>
          <p>Are you sure you want to delete this item?</p>
          <div className="flex gap-3">
            <LoadingButton variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </LoadingButton>
            <LoadingButton
              variant="danger"
              loading={isDeleting}
              loadingText="Deleting..."
              onClick={handleDelete}
            >
              Delete
            </LoadingButton>
          </div>
        </Modal>
      )}
    </>
  );
}
```

### Save Changes

```tsx
function SettingsForm() {
  const [isSaving, setIsSaving] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await saveSettings();
      setHasChanges(false);
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      {/* Settings form */}

      <div className="flex justify-end gap-3">
        <LoadingButton variant="ghost" disabled={!hasChanges}>
          Cancel
        </LoadingButton>
        <LoadingButton
          variant="accent"
          loading={isSaving}
          loadingText="Saving..."
          disabled={!hasChanges}
          onClick={handleSave}
        >
          Save Changes
        </LoadingButton>
      </div>
    </div>
  );
}
```

### API Request

```tsx
function DataFetcher() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState(null);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {data ? (
        <div>{/* Display data */}</div>
      ) : (
        <LoadingButton
          loading={isLoading}
          loadingText="Loading..."
          onClick={fetchData}
        >
          Load Data
        </LoadingButton>
      )}
    </div>
  );
}
```

### Multiple Actions

Handle multiple independent async actions:

```tsx
function MultiActionPanel() {
  const [action1Loading, setAction1Loading] = React.useState(false);
  const [action2Loading, setAction2Loading] = React.useState(false);
  const [action3Loading, setAction3Loading] = React.useState(false);

  return (
    <div className="flex gap-3">
      <LoadingButton
        variant="outline"
        loading={action1Loading}
        onClick={async () => {
          setAction1Loading(true);
          await performAction1();
          setAction1Loading(false);
        }}
      >
        Action 1
      </LoadingButton>

      <LoadingButton
        variant="outline"
        loading={action2Loading}
        onClick={async () => {
          setAction2Loading(true);
          await performAction2();
          setAction2Loading(false);
        }}
      >
        Action 2
      </LoadingButton>

      <LoadingButton
        variant="outline"
        loading={action3Loading}
        onClick={async () => {
          setAction3Loading(true);
          await performAction3();
          setAction3Loading(false);
        }}
      >
        Action 3
      </LoadingButton>
    </div>
  );
}
```

## Advanced Usage

### Custom Spinner Size

Override the automatic spinner sizing:

```tsx
// Large button with medium spinner
<LoadingButton
  size="lg"
  loading={loading}
  spinnerSize="md"
>
  Custom Spinner
</LoadingButton>
```

### Disabled State

Combine loading and disabled states:

```tsx
<LoadingButton
  loading={isProcessing}
  disabled={!formValid}
>
  Submit
</LoadingButton>
```

When either `loading={true}` OR `disabled={true}`:
- Button is disabled
- Pointer events are blocked
- Opacity is reduced

### With Icons

```tsx
import { Save } from 'lucide-react';

// Icon on left, spinner replaces it when loading
<LoadingButton loading={isSaving}>
  {!isSaving && <Save className="h-4 w-4" />}
  Save
</LoadingButton>

// Icon on right
<LoadingButton loading={isSaving} spinnerPosition="right">
  Next
  {!isSaving && <ArrowRight className="h-4 w-4" />}
</LoadingButton>
```

### Async/Await Pattern

```tsx
function AsyncButton() {
  const [loading, setLoading] = React.useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await someAsyncOperation();
      // Success handling
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoadingButton loading={loading} onClick={handleClick}>
      Click Me
    </LoadingButton>
  );
}
```

### With Custom Hooks

```tsx
function useAsyncAction(asyncFn: () => Promise<void>) {
  const [loading, setLoading] = React.useState(false);

  const execute = async () => {
    setLoading(true);
    try {
      await asyncFn();
    } finally {
      setLoading(false);
    }
  };

  return { loading, execute };
}

function MyComponent() {
  const { loading, execute } = useAsyncAction(async () => {
    await someAsyncOperation();
  });

  return (
    <LoadingButton loading={loading} onClick={execute}>
      Execute
    </LoadingButton>
  );
}
```

## Best Practices

### 1. Always Handle Errors

```tsx
// ✅ Good: Proper error handling
const handleSubmit = async () => {
  setLoading(true);
  try {
    await submitData();
  } catch (error) {
    // Show error toast/message
    console.error(error);
  } finally {
    setLoading(false); // Always stop loading
  }
};

// ❌ Bad: No error handling
const handleSubmit = async () => {
  setLoading(true);
  await submitData();
  setLoading(false); // Won't run if error occurs
};
```

### 2. Use Descriptive Loading Text

```tsx
// ✅ Good: Specific and informative
<LoadingButton loadingText="Creating account...">
  Sign Up
</LoadingButton>

// ❌ Bad: Generic
<LoadingButton loadingText="Loading...">
  Sign Up
</LoadingButton>
```

### 3. Disable During Loading

The component automatically disables during loading, but you can add additional conditions:

```tsx
// ✅ Good: Additional validation
<LoadingButton
  loading={isSubmitting}
  disabled={!isFormValid}
>
  Submit
</LoadingButton>

// ❌ Redundant: Loading already disables
<LoadingButton
  loading={isSubmitting}
  disabled={isSubmitting} // Redundant
>
  Submit
</LoadingButton>
```

### 4. Match Button Variant to Action

```tsx
// ✅ Good: Appropriate variants
<LoadingButton variant="danger" loading={isDeleting}>
  Delete
</LoadingButton>

<LoadingButton variant="accent" loading={isSaving}>
  Save
</LoadingButton>

<LoadingButton variant="ghost" onClick={handleCancel}>
  Cancel
</LoadingButton>
```

### 5. Provide User Feedback

```tsx
import { toast } from '@ainexsuite/ui';

const handleSave = async () => {
  setLoading(true);
  try {
    await saveData();
    toast.success('Changes saved successfully!');
  } catch (error) {
    toast.error('Failed to save changes. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## Migration from Regular Button

### Before
```tsx
function OldButton() {
  const [loading, setLoading] = React.useState(false);

  return (
    <Button disabled={loading} onClick={handleClick}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        'Submit'
      )}
    </Button>
  );
}
```

### After
```tsx
function NewButton() {
  const [loading, setLoading] = React.useState(false);

  return (
    <LoadingButton
      loading={loading}
      loadingText="Loading..."
      onClick={handleClick}
    >
      Submit
    </LoadingButton>
  );
}
```

## Accessibility

The component automatically handles accessibility:

- ✅ `aria-busy` attribute set when loading
- ✅ Disabled state prevents interaction
- ✅ Focus management maintained
- ✅ Screen reader announces loading state

```tsx
// Rendered HTML when loading
<button
  disabled
  aria-busy="true"
  class="..."
>
  <div role="status" aria-busy="true" aria-label="Loading">
    {/* Spinner */}
  </div>
  Loading...
</button>
```

## TypeScript Support

```tsx
import { LoadingButton, type LoadingButtonProps } from '@ainexsuite/ui';

// Type-safe props
const buttonProps: LoadingButtonProps = {
  loading: true,
  loadingText: 'Processing...',
  variant: 'accent',
  size: 'lg',
};

// Extend props
interface CustomButtonProps extends LoadingButtonProps {
  customProp?: string;
}

function CustomButton({ customProp, ...props }: CustomButtonProps) {
  return <LoadingButton {...props} />;
}
```

## Troubleshooting

### Loading state not updating

```tsx
// ✅ Ensure state is properly managed
const [loading, setLoading] = React.useState(false);

const handleClick = async () => {
  setLoading(true);
  try {
    await asyncOperation();
  } finally {
    setLoading(false); // Must be in finally
  }
};
```

### Spinner color doesn't match

The spinner color is automatically set to white for most variants. For custom styling:

```tsx
<LoadingButton
  loading={loading}
  className="custom-button-class"
>
  Custom Button
</LoadingButton>
```

### Button remains disabled after error

```tsx
// ✅ Use finally to ensure loading state resets
const handleClick = async () => {
  setLoading(true);
  try {
    await asyncOperation();
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false); // Always runs
  }
};
```

## Performance Considerations

1. **State Management**: Use local state for simple cases, global state for complex flows
2. **Debouncing**: For rapid clicks, consider debouncing the onClick handler
3. **Optimistic Updates**: Show loading state immediately, don't wait for state updates

```tsx
// Optimistic update example
const handleClick = async () => {
  setLoading(true); // Immediate feedback

  try {
    const result = await asyncOperation();
    // Update UI with result
  } catch (error) {
    // Revert optimistic update
  } finally {
    setLoading(false);
  }
};
```
