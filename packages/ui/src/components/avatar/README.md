# Avatar Components

Unified avatar system for displaying user profile images, initials, and user information across all AINexSuite apps.

## Components

### Avatar

Single avatar with smart fallbacks and status indicators.

**Features:**
- Image with fallback to initials
- Initials calculated from name (first + last initial)
- Status indicator dot (online, offline, busy, away)
- Loading state with skeleton
- Multiple sizes (xs, sm, md, lg, xl, 2xl)
- Multiple shapes (circle, square, rounded)
- Accessible with proper alt text
- Smooth image loading transition

**Props:**
```typescript
interface AvatarProps {
  src?: string | null;           // Image URL
  alt?: string;                   // Alt text
  name?: string | null;           // For initials fallback
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "square" | "rounded";
  fallback?: React.ReactNode;    // Custom fallback content
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
  border?: boolean;
  loading?: boolean;
  priority?: boolean;             // Next.js Image priority
}
```

**Examples:**

```tsx
import { Avatar } from "@ainexsuite/ui";

// With image
<Avatar
  src={user.photoURL}
  name={user.displayName}
  size="md"
/>

// With initials fallback
<Avatar
  name="John Doe"
  size="lg"
  status="online"
/>

// Custom fallback
<Avatar
  fallback={<User className="h-4 w-4" />}
  size="sm"
/>

// Square with border
<Avatar
  src={user.photoURL}
  name={user.displayName}
  shape="square"
  border
  size="xl"
/>
```

---

### AvatarGroup

Stack of overlapping avatars with overflow indicator.

**Features:**
- Overlapping style with configurable spacing
- Shows +N indicator for overflow
- Supports all Avatar props
- Responsive sizing
- Optional click handler for overflow

**Props:**
```typescript
interface AvatarGroupProps {
  avatars: Array<Omit<AvatarProps, "size" | "className">>;
  max?: number;                   // Max avatars to show (default: 5)
  size?: AvatarProps["size"];
  spacing?: "tight" | "normal" | "loose";
  className?: string;
  shape?: AvatarProps["shape"];
  border?: boolean;
  onOverflowClick?: () => void;   // Click handler for +N
}
```

**Examples:**

```tsx
import { AvatarGroup } from "@ainexsuite/ui";

// Basic group
<AvatarGroup
  avatars={[
    { src: user1.photoURL, name: user1.displayName },
    { src: user2.photoURL, name: user2.displayName },
    { src: user3.photoURL, name: user3.displayName },
  ]}
  max={3}
  size="sm"
/>

// With overflow handler
<AvatarGroup
  avatars={members.map(m => ({
    src: m.photoURL,
    name: m.displayName,
    status: m.online ? "online" : "offline"
  }))}
  max={5}
  spacing="tight"
  onOverflowClick={() => setShowAllMembers(true)}
/>

// Tight spacing
<AvatarGroup
  avatars={collaborators}
  spacing="tight"
  size="xs"
  border
/>
```

---

### UserDisplay

Avatar + name/info combo for lists, dropdowns, and headers.

**Features:**
- Combines avatar with text info
- Flexible user object format
- Optional email/subtitle display
- Interactive mode with click handler
- Text alignment options
- Responsive sizing

**Props:**
```typescript
interface UserDisplayProps {
  user: {
    name?: string | null;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    avatarUrl?: string | null;
  };
  size?: "sm" | "md" | "lg";
  showEmail?: boolean;
  subtitle?: string;              // Overrides email
  shape?: AvatarProps["shape"];
  status?: AvatarProps["status"];
  className?: string;
  align?: "left" | "center";
  onClick?: () => void;
  interactive?: boolean;
}
```

**Examples:**

```tsx
import { UserDisplay } from "@ainexsuite/ui";

// Basic usage
<UserDisplay
  user={{
    name: "John Doe",
    email: "john@example.com"
  }}
  showEmail
/>

// With custom subtitle
<UserDisplay
  user={user}
  subtitle="Admin"
  size="lg"
  status="online"
/>

// Interactive
<UserDisplay
  user={currentUser}
  interactive
  onClick={() => router.push("/profile")}
/>

// In a dropdown
<div className="p-2">
  <UserDisplay
    user={user}
    showEmail
    size="md"
  />
</div>

// Team member list
{members.map(member => (
  <UserDisplay
    key={member.uid}
    user={member}
    subtitle={member.role}
    size="sm"
    onClick={() => viewProfile(member.uid)}
  />
))}
```

---

## Size Reference

| Size | Avatar | Use Case |
|------|--------|----------|
| xs   | 24px   | Inline mentions, compact lists |
| sm   | 32px   | Comments, activity feeds |
| md   | 40px   | Default, dropdowns, lists |
| lg   | 48px   | Headers, featured users |
| xl   | 64px   | Profile pages |
| 2xl  | 80px   | Hero sections, large profiles |

---

## Shape Reference

| Shape | Class | Use Case |
|-------|-------|----------|
| circle | rounded-full | Default, most common |
| square | rounded-none | Logos, app icons |
| rounded | rounded-xl | Modern, softer look |

---

## Status Colors

| Status | Color | Use Case |
|--------|-------|----------|
| online | Green (#10b981) | Active users |
| offline | Gray (#9ca3af) | Inactive |
| busy | Red (#ef4444) | Do not disturb |
| away | Yellow (#eab308) | Away from keyboard |

---

## Integration Examples

### Profile Dropdown

```tsx
import { Avatar } from "@ainexsuite/ui";

<button onClick={() => setOpen(true)}>
  <Avatar
    src={user.photoURL}
    name={user.displayName}
    size="sm"
    status="online"
  />
</button>
```

### Comments/Activity Feed

```tsx
import { UserDisplay } from "@ainexsuite/ui";

{comments.map(comment => (
  <div key={comment.id} className="flex gap-3">
    <UserDisplay
      user={comment.author}
      size="sm"
      subtitle={formatDistanceToNow(comment.createdAt)}
    />
    <p>{comment.text}</p>
  </div>
))}
```

### Team/Space Members

```tsx
import { AvatarGroup, UserDisplay } from "@ainexsuite/ui";

// Compact view
<AvatarGroup
  avatars={space.members}
  max={4}
  size="sm"
  onOverflowClick={() => setShowMembers(true)}
/>

// Detailed list
{space.members.map(member => (
  <UserDisplay
    key={member.uid}
    user={member}
    subtitle={member.role}
    status={member.isOnline ? "online" : "offline"}
    interactive
    onClick={() => viewMember(member.uid)}
  />
))}
```

### Leaderboard

```tsx
import { Avatar } from "@ainexsuite/ui";

{leaders.map((leader, index) => (
  <div className="flex items-center gap-3">
    <span className="text-lg font-bold">#{index + 1}</span>
    <Avatar
      src={leader.photoURL}
      name={leader.displayName}
      size="md"
      border
    />
    <div>
      <p className="font-semibold">{leader.displayName}</p>
      <p className="text-sm text-ink-600">{leader.score} points</p>
    </div>
  </div>
))}
```

---

## Accessibility

All avatar components follow accessibility best practices:

- Proper `alt` text derived from name or explicit alt prop
- ARIA labels for status indicators
- Keyboard navigation support for interactive components
- Semantic HTML with appropriate roles
- Focus indicators for interactive elements

---

## Migration Guide

### From ProfileDropdown pattern

**Before:**
```tsx
{user.photoURL ? (
  <Image
    src={user.photoURL}
    alt={user.displayName || "User"}
    width={40}
    height={40}
    className="rounded-full"
  />
) : (
  <div className="h-10 w-10 rounded-full bg-accent-500 text-white">
    {getInitials()}
  </div>
)}
```

**After:**
```tsx
<Avatar
  src={user.photoURL}
  name={user.displayName}
  size="md"
/>
```

### From inline avatar patterns

**Before:**
```tsx
<div className="h-8 w-8 rounded-full bg-white/10">
  {user.displayName.slice(0, 2).toUpperCase()}
</div>
```

**After:**
```tsx
<Avatar
  name={user.displayName}
  size="sm"
/>
```

---

## Design Tokens

Avatar components use the following design tokens:

- **Sizes:** `avatarSizes` from `@ainexsuite/ui/config/tokens`
- **Variants:** `avatarVariants` from `@ainexsuite/ui/config/component-variants`
- **Colors:** CSS custom properties for theme consistency
- **Spacing:** Standard spacing scale for gaps and padding
- **Transitions:** `transitions.base` for smooth state changes

---

## Best Practices

1. **Always provide name** - Ensures good fallback experience
2. **Use appropriate size** - Match context (list vs header vs profile)
3. **Status indicators** - Only for real-time presence features
4. **AvatarGroup for collections** - Better than custom stacking
5. **UserDisplay for context** - When name/email matters
6. **Border for overlaps** - Improves readability in groups
7. **Interactive mode** - Use for clickable user elements
8. **Loading state** - Show skeleton while data loads

---

**Created:** November 28, 2025
**Part of:** AINexSuite Unified Design System
