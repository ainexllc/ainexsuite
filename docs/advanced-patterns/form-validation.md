# Form Validation Patterns

Comprehensive guide to form validation in AiNex Next.js applications, covering client-side validation, real-time feedback, and user-friendly error handling.

## Overview

**What You'll Learn:**
- Client-side validation patterns
- Real-time vs submit validation
- Field-level and form-level validation
- Custom validation rules
- Async validation (unique email, etc.)
- Accessible error messages
- Validation utilities and helpers

---

## Basic Validation Pattern

### Simple Form with Validation

```typescript
// components/forms/CreateNoteForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { AlertCircle } from "lucide-react";

interface FormErrors {
  title?: string;
  content?: string;
}

export function CreateNoteForm() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function validateField(field: string, value: string): string | undefined {
    switch (field) {
      case "title":
        if (!value.trim()) {
          return "Title is required";
        }
        if (value.length > 200) {
          return "Title must be 200 characters or less";
        }
        break;

      case "content":
        if (!value.trim()) {
          return "Content is required";
        }
        if (value.length < 10) {
          return "Content must be at least 10 characters";
        }
        break;
    }
    return undefined;
  }

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));

    const value = field === "title" ? title : content;
    const error = validateField(field, value);

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }

  function validateForm(): boolean {
    const titleError = validateField("title", title);
    const contentError = validateField("content", content);

    setErrors({
      title: titleError,
      content: contentError,
    });

    setTouched({
      title: true,
      content: true,
    });

    return !titleError && !contentError;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await saveNote({ title, content });
      // Success: reset form
      setTitle("");
      setContent("");
      setErrors({});
      setTouched({});
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title field */}
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-ink-base">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => handleBlur("title")}
          className={clsx(
            "w-full rounded-xl border px-4 py-2 transition",
            errors.title && touched.title
              ? "border-red-500 focus:ring-red-200"
              : "border-outline-subtle focus:ring-primary-200"
          )}
          aria-invalid={!!(errors.title && touched.title)}
          aria-describedby={errors.title && touched.title ? "title-error" : undefined}
        />
        {errors.title && touched.title && (
          <p id="title-error" className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errors.title}
          </p>
        )}
      </div>

      {/* Content field */}
      <div className="space-y-2">
        <label htmlFor="content" className="block text-sm font-medium text-ink-base">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={() => handleBlur("content")}
          rows={6}
          className={clsx(
            "w-full rounded-xl border px-4 py-2 transition",
            errors.content && touched.content
              ? "border-red-500 focus:ring-red-200"
              : "border-outline-subtle focus:ring-primary-200"
          )}
          aria-invalid={!!(errors.content && touched.content)}
          aria-describedby={errors.content && touched.content ? "content-error" : undefined}
        />
        {errors.content && touched.content && (
          <p id="content-error" className="flex items-center gap-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {errors.content}
          </p>
        )}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="rounded-full bg-primary-500 px-6 py-2 font-semibold text-white hover:bg-primary-600"
      >
        Create Note
      </button>
    </form>
  );
}
```

---

## Validation Utilities

### Reusable Validators

```typescript
// lib/validators.ts

export const validators = {
  required: (value: string, fieldName: string = "This field") => {
    if (!value?.trim()) {
      return `${fieldName} is required`;
    }
    return undefined;
  },

  minLength: (value: string, min: number, fieldName: string = "This field") => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return undefined;
  },

  maxLength: (value: string, max: number, fieldName: string = "This field") => {
    if (value.length > max) {
      return `${fieldName} must be ${max} characters or less`;
    }
    return undefined;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return undefined;
  },

  url: (value: string) => {
    try {
      new URL(value);
      return undefined;
    } catch {
      return "Please enter a valid URL";
    }
  },

  pattern: (value: string, regex: RegExp, message: string) => {
    if (!regex.test(value)) {
      return message;
    }
    return undefined;
  },

  custom: (value: any, fn: (val: any) => boolean, message: string) => {
    if (!fn(value)) {
      return message;
    }
    return undefined;
  },
};

// Combine multiple validators
export function composeValidators(
  ...validators: Array<(value: any) => string | undefined>
) {
  return (value: any): string | undefined => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return undefined;
  };
}
```

**Usage:**
```typescript
import { validators, composeValidators } from "@/lib/validators";

const validateTitle = composeValidators(
  (val) => validators.required(val, "Title"),
  (val) => validators.maxLength(val, 200, "Title")
);

const validateEmail = composeValidators(
  (val) => validators.required(val, "Email"),
  validators.email
);

const error = validateTitle(title);
```

---

## Form Hook Pattern

### Custom useForm Hook

```typescript
// hooks/useForm.ts
import { useState, useCallback, ChangeEvent } from "react";

interface UseFormOptions<T> {
  initialValues: T;
  validate: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: keyof T) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      const validationErrors = validate(values);
      setErrors(validationErrors);
    },
    [values, validate]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched(allTouched);

      // Validate
      const validationErrors = validate(values);
      setErrors(validationErrors);

      // Check if form is valid
      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      // Submit
      setSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
```

**Usage:**
```typescript
interface NoteFormValues {
  title: string;
  content: string;
  tags: string;
}

export function NoteForm() {
  const form = useForm<NoteFormValues>({
    initialValues: {
      title: "",
      content: "",
      tags: "",
    },
    validate: (values) => {
      const errors: Partial<Record<keyof NoteFormValues, string>> = {};

      if (!values.title.trim()) {
        errors.title = "Title is required";
      }

      if (!values.content.trim()) {
        errors.content = "Content is required";
      }

      return errors;
    },
    onSubmit: async (values) => {
      await saveNote(values);
      form.reset();
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        value={form.values.title}
        onChange={form.handleChange("title")}
        onBlur={form.handleBlur("title")}
      />
      {form.errors.title && form.touched.title && (
        <span>{form.errors.title}</span>
      )}

      <button type="submit" disabled={form.submitting}>
        {form.submitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

---

## Real-Time Validation

### Validate on Change

```typescript
// components/EmailInput.tsx
"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

export function EmailInput() {
  const [email, setEmail] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  function validateEmail(value: string) {
    if (!value) {
      setIsValid(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValid(emailRegex.test(value));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  }

  return (
    <div className="relative">
      <input
        type="email"
        value={email}
        onChange={handleChange}
        placeholder="you@example.com"
        className={clsx(
          "w-full rounded-xl border px-4 py-2 pr-10 transition",
          isValid === true && "border-green-500",
          isValid === false && "border-red-500"
        )}
      />

      {/* Validation icon */}
      {isValid !== null && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <Check className="h-5 w-5 text-green-600" />
          ) : (
            <X className="h-5 w-5 text-red-600" />
          )}
        </div>
      )}
    </div>
  );
}
```

### Debounced Validation

```typescript
// hooks/useDebouncedValidation.ts
import { useState, useEffect } from "react";

export function useDebouncedValidation(
  value: string,
  validator: (val: string) => string | undefined,
  delay: number = 500
): string | undefined {
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const validationError = validator(value);
      setError(validationError);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, validator, delay]);

  return error;
}
```

**Usage:**
```typescript
function validateUsername(username: string) {
  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return "Username can only contain letters, numbers, and underscores";
  }
  return undefined;
}

export function UsernameField() {
  const [username, setUsername] = useState("");
  const error = useDebouncedValidation(username, validateUsername, 500);

  return (
    <div>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}
```

---

## Async Validation

### Check Unique Email

```typescript
// hooks/useAsyncValidation.ts
import { useState, useEffect } from "react";

interface AsyncValidationResult {
  isValidating: boolean;
  error: string | undefined;
}

export function useAsyncValidation(
  value: string,
  asyncValidator: (val: string) => Promise<string | undefined>,
  delay: number = 500
): AsyncValidationResult {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!value) {
      setError(undefined);
      return;
    }

    setIsValidating(true);
    const timeout = setTimeout(async () => {
      try {
        const validationError = await asyncValidator(value);
        setError(validationError);
      } catch (err) {
        setError("Validation failed");
      } finally {
        setIsValidating(false);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, asyncValidator, delay]);

  return { isValidating, error };
}
```

**Usage:**
```typescript
async function checkEmailUnique(email: string): Promise<string | undefined> {
  const response = await fetch(`/api/check-email?email=${email}`);
  const data = await response.json();

  if (data.exists) {
    return "This email is already registered";
  }

  return undefined;
}

export function SignupForm() {
  const [email, setEmail] = useState("");
  const { isValidating, error } = useAsyncValidation(email, checkEmailUnique, 800);

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {isValidating && (
        <span className="text-ink-muted">Checking availability...</span>
      )}

      {!isValidating && error && (
        <span className="text-red-600">{error}</span>
      )}
    </div>
  );
}
```

---

## Field-Level Components

### FormField Wrapper

```typescript
// components/forms/FormField.tsx
import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { clsx } from "clsx";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  touched?: boolean;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  touched,
  required,
  hint,
  children,
}: FormFieldProps) {
  const showError = error && touched;

  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-ink-base"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {children}

      {hint && !showError && (
        <p className="text-xs text-ink-muted">{hint}</p>
      )}

      {showError && (
        <p className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

**Usage:**
```typescript
<FormField
  label="Email"
  htmlFor="email"
  error={errors.email}
  touched={touched.email}
  required
  hint="We'll never share your email"
>
  <input
    id="email"
    type="email"
    value={values.email}
    onChange={handleChange("email")}
    onBlur={handleBlur("email")}
    className={clsx(
      "w-full rounded-xl border px-4 py-2",
      errors.email && touched.email && "border-red-500"
    )}
  />
</FormField>
```

---

## Password Validation

### Password Strength Indicator

```typescript
// components/PasswordStrengthIndicator.tsx
import { useMemo } from "react";
import { clsx } from "clsx";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
  const strength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return score;
  }, [password]);

  const levels = [
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-500" },
    { label: "Good", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-green-500" },
    { label: "Very Strong", color: "bg-green-600" },
  ];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {levels.map((level, index) => (
          <div
            key={index}
            className={clsx(
              "h-1 flex-1 rounded-full transition",
              index < strength ? level.color : "bg-surface-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-ink-muted">
        Password strength: {levels[Math.max(0, strength - 1)]?.label || "Too weak"}
      </p>
    </div>
  );
}
```

---

## Form Validation Checklist

- ✅ Validate on blur for better UX
- ✅ Show errors only after field is touched
- ✅ Provide clear, specific error messages
- ✅ Use visual indicators (colors, icons)
- ✅ Disable submit button during submission
- ✅ Mark required fields visually
- ✅ Validate email format
- ✅ Check password strength
- ✅ Handle async validation (unique checks)
- ✅ Accessible error messages (aria-invalid, aria-describedby)
- ✅ Debounce real-time validation
- ✅ Clear errors when input changes
- ✅ Reset form after successful submission

---

## Best Practices

1. **Progressive Disclosure**: Show errors after blur, not on every keystroke
2. **Clear Messages**: "Email is required" vs "Invalid input"
3. **Inline Errors**: Show errors next to fields, not just at top
4. **Visual Feedback**: Red borders, error icons, success checkmarks
5. **Accessibility**: Use ARIA attributes for screen readers
6. **Debounce**: Don't validate on every keystroke for expensive checks
7. **Client + Server**: Always validate on server, even if client validates
8. **User-Friendly**: Guide users to fix errors, don't just reject

---

## Related Documentation

- [Error Handling →](./error-handling.md)
- [Hooks Patterns →](./hooks-patterns.md)
- [Accessibility →](./accessibility.md)
