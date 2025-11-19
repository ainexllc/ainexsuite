# UI Component Library - Usage Examples

## Installation

The components are already available in all apps via the workspace:

```json
{
  "dependencies": {
    "@ainexsuite/ui": "workspace:*"
  }
}
```

## Theme Integration

All components automatically use CSS variables from `@ainexsuite/theme`. They support both light and dark modes without any additional configuration.

## Component Examples

### Button

```tsx
import { Button } from '@ainexsuite/ui';

// Primary button (default)
<Button>Click me</Button>

// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Delete</Button>

// Button sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With click handler
<Button onClick={() => console.log('clicked')}>
  Click me
</Button>
```

### Input

```tsx
import { Input } from '@ainexsuite/ui';

// Basic input
<Input placeholder="Enter text..." />

// With value
<Input value={value} onChange={(e) => setValue(e.target.value)} />

// Error state
<Input error placeholder="This field is required" />

// Different types
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
<Input type="number" placeholder="Age" />
```

### Textarea

```tsx
import { Textarea } from '@ainexsuite/ui';

// Basic textarea
<Textarea placeholder="Enter description..." />

// With rows
<Textarea rows={5} placeholder="Long text..." />

// Error state
<Textarea error placeholder="This field is required" />

// Controlled
<Textarea
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

### FormField

```tsx
import { FormField, Input, Textarea } from '@ainexsuite/ui';

// Input with label
<FormField label="Email">
  <Input type="email" placeholder="you@example.com" />
</FormField>

// Required field
<FormField label="Name" required>
  <Input placeholder="John Doe" />
</FormField>

// With error
<FormField label="Password" error="Password must be at least 8 characters">
  <Input type="password" error />
</FormField>

// With textarea
<FormField label="Description" required>
  <Textarea rows={4} placeholder="Enter description..." />
</FormField>
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@ainexsuite/ui';

// Basic card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Simple card
<Card className="p-6">
  <h3 className="text-xl font-bold mb-4">Quick Card</h3>
  <p className="text-text-muted">Simple content without sub-components</p>
</Card>
```

## Complete Form Example

```tsx
'use client';

import { useState } from 'react';
import { Button, FormField, Input, Textarea, Card } from '@ainexsuite/ui';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!message) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit logic
    console.log({ name, email, message });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Name"
          required
          error={errors.name}
        >
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            error={!!errors.name}
          />
        </FormField>

        <FormField
          label="Email"
          required
          error={errors.email}
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={!!errors.email}
          />
        </FormField>

        <FormField
          label="Message"
          required
          error={errors.message}
        >
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message..."
            rows={5}
            error={!!errors.message}
          />
        </FormField>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Send Message
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

## Dashboard Card Example

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@ainexsuite/ui';
import { Activity, Users, TrendingUp } from 'lucide-react';

export default function DashboardStats() {
  const stats = [
    { label: 'Active Users', value: '1,234', icon: Users, change: '+12%' },
    { label: 'Total Revenue', value: '$45,678', icon: TrendingUp, change: '+23%' },
    { label: 'Activity', value: '89%', icon: Activity, change: '+5%' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-text-muted">
              <span className="text-green-500">{stat.change}</span> from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## Theme Customization

All components automatically adapt to your app's theme. The theme colors are defined in `@ainexsuite/theme` and can be customized per app.

### Workflow App Theme (Orange)
The components will use:
- Primary: Orange (`#f97316`)
- Secondary: Forest green

### Other Apps
Each app can define its own color scheme, and the components will automatically use those colors through CSS variables.

## Utility Function

The `cn()` utility is available for merging class names:

```tsx
import { cn } from '@ainexsuite/ui';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  'hover:opacity-80'
)}>
  Content
</div>
```

## Dark Mode

All components automatically support dark mode through CSS variables. No additional configuration needed!

```tsx
// Components automatically adapt to dark mode
<Button>I work in both themes!</Button>
```

## Custom Styling

You can extend component styling with the `className` prop:

```tsx
<Button className="w-full mt-4">
  Full width button
</Button>

<Card className="bg-gradient-to-br from-purple-500 to-blue-500">
  Custom gradient card
</Card>

<Input className="text-lg" />
```

---

**Note**: All components are built with accessibility in mind and include proper ARIA attributes where necessary.
