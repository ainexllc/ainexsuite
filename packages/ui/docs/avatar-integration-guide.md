# Avatar Component Integration Guide

Complete guide for integrating the new Avatar components into AINexSuite apps.

## Quick Start

```tsx
import { Avatar, AvatarGroup, UserDisplay } from "@ainexsuite/ui";

// Simple avatar
<Avatar src={user.photoURL} name={user.displayName} size="md" />

// User info with avatar
<UserDisplay user={user} showEmail />

// Group of avatars
<AvatarGroup avatars={members} max={5} />
```

---

## Migration Patterns

### 1. Replace Inline Avatar Logic

**Before (ProfileDropdown pattern):**
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

### 2. Replace Manual Initials

**Before (Fit app Leaderboard):**
```tsx
<div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold">
  {stat.displayName.slice(0, 2).toUpperCase()}
</div>
```

**After:**
```tsx
<Avatar
  name={stat.displayName}
  size="sm"
/>
```

### 3. Replace User Info Sections

**Before (Admin UsersTable):**
```tsx
<div className="flex items-center gap-3">
  <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
    {user.photoURL ? (
      <Image src={user.photoURL} alt={user.displayName || ''} width={32} height={32} />
    ) : (
      <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs font-medium">
        {(user.displayName?.[0] || user.email?.[0] || '?').toUpperCase()}
      </div>
    )}
  </div>
  <div className="flex flex-col">
    <span className="text-sm font-medium text-white">{user.displayName || 'Unnamed'}</span>
    <span className="text-xs text-zinc-500">{user.email}</span>
  </div>
</div>
```

**After:**
```tsx
<UserDisplay
  user={user}
  showEmail
  size="sm"
/>
```

---

## Common Use Cases

### Profile Dropdowns

```tsx
import { Avatar } from "@ainexsuite/ui";

<button onClick={() => setDropdownOpen(true)}>
  <Avatar
    src={user.photoURL}
    name={user.displayName}
    size="sm"
    status="online"
  />
</button>
```

### Team/Space Member Lists

```tsx
import { UserDisplay } from "@ainexsuite/ui";

{members.map(member => (
  <UserDisplay
    key={member.uid}
    user={member}
    subtitle={member.role}
    status={member.isOnline ? "online" : "offline"}
    interactive
    onClick={() => viewMemberProfile(member.uid)}
  />
))}
```

### Compact Member Display

```tsx
import { AvatarGroup } from "@ainexsuite/ui";

<AvatarGroup
  avatars={space.members}
  max={4}
  size="sm"
  spacing="tight"
  onOverflowClick={() => setShowAllMembers(true)}
/>
```

### Comments/Activity Feed

```tsx
import { Avatar } from "@ainexsuite/ui";

{comments.map(comment => (
  <div className="flex gap-3">
    <Avatar
      src={comment.author.photoURL}
      name={comment.author.displayName}
      size="sm"
    />
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-sm">{comment.author.displayName}</span>
        <span className="text-xs text-ink-600">
          {formatDistanceToNow(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm mt-1">{comment.text}</p>
    </div>
  </div>
))}
```

### Leaderboards

```tsx
import { Avatar } from "@ainexsuite/ui";

{leaders.map((leader, index) => (
  <div className="flex items-center gap-4">
    <span className="text-2xl font-bold">#{index + 1}</span>
    <Avatar
      src={leader.photoURL}
      name={leader.displayName}
      size="md"
      border
    />
    <div className="flex-1">
      <p className="font-semibold">{leader.displayName}</p>
      <p className="text-sm text-ink-600">{leader.score} points</p>
    </div>
  </div>
))}
```

### Profile Pages

```tsx
import { Avatar } from "@ainexsuite/ui";

<div className="flex items-center gap-4">
  <Avatar
    src={user.photoURL}
    name={user.displayName}
    size="2xl"
    border
  />
  <div>
    <h1 className="text-3xl font-bold">{user.displayName}</h1>
    <p className="text-ink-600">{user.email}</p>
  </div>
</div>
```

---

## Component Props Reference

### Avatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | `string \| null` | - | Image URL |
| `name` | `string \| null` | - | For initials fallback |
| `alt` | `string` | - | Alt text (auto from name) |
| `size` | `xs\|sm\|md\|lg\|xl\|2xl` | `md` | Avatar size |
| `shape` | `circle\|square\|rounded` | `circle` | Avatar shape |
| `fallback` | `ReactNode` | - | Custom fallback |
| `status` | `online\|offline\|busy\|away` | - | Status indicator |
| `border` | `boolean` | `false` | Show border |
| `loading` | `boolean` | `false` | Loading skeleton |
| `className` | `string` | - | Additional classes |

### AvatarGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `avatars` | `Array<AvatarProps>` | - | Array of avatars |
| `max` | `number` | `5` | Max to show |
| `size` | Avatar size | `md` | Size for all |
| `spacing` | `tight\|normal\|loose` | `normal` | Overlap spacing |
| `border` | `boolean` | `true` | Show borders |
| `onOverflowClick` | `() => void` | - | Click handler |

### UserDisplay

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `UserObject` | - | User data |
| `size` | `sm\|md\|lg` | `md` | Component size |
| `showEmail` | `boolean` | `false` | Display email |
| `subtitle` | `string` | - | Custom subtitle |
| `status` | Status type | - | Status indicator |
| `interactive` | `boolean` | `false` | Hover effect |
| `onClick` | `() => void` | - | Click handler |
| `align` | `left\|center` | `left` | Text alignment |

---

## Size Guide

| Size | Pixels | Use Case |
|------|--------|----------|
| `xs` | 24px | Inline mentions, compact lists |
| `sm` | 32px | Comments, activity feeds, dropdowns |
| `md` | 40px | Default, most common usage |
| `lg` | 48px | Headers, featured content |
| `xl` | 64px | Profile pages, hero sections |
| `2xl` | 80px | Large profile displays |

---

## Best Practices

### 1. Always Provide Name
Even if you have an image, provide a name for the fallback:
```tsx
// Good
<Avatar src={user.photoURL} name={user.displayName} />

// Avoid
<Avatar src={user.photoURL} />
```

### 2. Use Appropriate Size
Match the size to the context:
- Comments/feeds: `sm`
- Dropdowns/lists: `sm` or `md`
- Headers: `lg`
- Profile pages: `xl` or `2xl`

### 3. Status Indicators Only for Real-Time
Only use status when you have real-time presence data:
```tsx
// Good - real-time presence
<Avatar
  src={user.photoURL}
  name={user.displayName}
  status={user.isOnline ? "online" : "offline"}
/>

// Avoid - no presence system
<Avatar src={user.photoURL} name={user.displayName} status="online" />
```

### 4. UserDisplay for Context
When name/email matters, use UserDisplay instead of Avatar:
```tsx
// Good
<UserDisplay user={member} subtitle={member.role} />

// Less optimal
<Avatar src={member.photoURL} name={member.displayName} />
<span>{member.displayName}</span>
```

### 5. AvatarGroup for Collections
Don't manually stack avatars, use AvatarGroup:
```tsx
// Good
<AvatarGroup avatars={members} max={5} />

// Avoid
<div className="flex -space-x-2">
  {members.map(m => <Avatar key={m.uid} {...m} />)}
</div>
```

---

## Styling Customization

### Custom Colors (via className)
```tsx
<Avatar
  name="John Doe"
  className="ring-2 ring-purple-500"
/>
```

### Custom Fallback Background
The fallback uses the accent color gradient by default. To customize:
```tsx
<Avatar
  fallback={
    <div className="bg-purple-500 h-full w-full flex items-center justify-center">
      <User className="h-4 w-4 text-white" />
    </div>
  }
/>
```

---

## Accessibility

All components follow accessibility best practices:

- Proper `alt` text (derived from name or explicit alt)
- ARIA labels for status indicators
- Keyboard navigation for interactive elements
- Focus indicators
- Semantic HTML

---

## Integration Checklist

When migrating to Avatar components:

- [ ] Replace inline avatar logic with `<Avatar />`
- [ ] Replace user info sections with `<UserDisplay />`
- [ ] Replace manual avatar groups with `<AvatarGroup />`
- [ ] Ensure `name` prop is always provided
- [ ] Use appropriate `size` for context
- [ ] Add `status` only if real-time presence exists
- [ ] Test image loading and fallback behavior
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Remove old avatar utility functions
- [ ] Update TypeScript types if needed

---

**Created:** November 28, 2025
**Components:** Avatar, AvatarGroup, UserDisplay
**Package:** `@ainexsuite/ui`
