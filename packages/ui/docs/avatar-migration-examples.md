# Avatar Migration Examples

Specific examples for migrating existing avatar patterns in AINexSuite apps.

---

## ProfileDropdown (packages/ui)

### Current Implementation
Located: `/packages/ui/src/components/layout/profile-dropdown.tsx`

**Lines 103-116:**
```tsx
{user.photoURL ? (
  <Image
    src={user.photoURL}
    alt={user.displayName || user.email || "User"}
    width={40}
    height={40}
    className="rounded-full object-cover"
    sizes="40px"
  />
) : (
  <div className="h-10 w-10 rounded-full bg-accent-500 text-white grid place-items-center font-semibold text-sm">
    {getInitials()}
  </div>
)}
```

### Migrated Version
```tsx
import { Avatar } from "@ainexsuite/ui";

<Avatar
  src={user.photoURL}
  name={user.displayName || user.email || undefined}
  alt={user.displayName || user.email || "User"}
  size="md"
  priority
/>
```

**Benefits:**
- Removes `getInitials()` function (lines 78-90)
- Automatic fallback handling
- Consistent styling
- Proper image optimization

---

## UserMenu (apps/main)

### Current Implementation
Located: `/apps/main/src/components/user-menu.tsx`

**Lines 28-31:**
```tsx
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center text-white font-semibold">
  {user.displayName?.[0]?.toUpperCase() || 'U'}
</div>
```

### Migrated Version
```tsx
import { Avatar } from "@ainexsuite/ui";

<Avatar
  src={user.photoURL}
  name={user.displayName}
  size="sm"
/>
```

**Full component migration:**
```tsx
import { UserDisplay } from "@ainexsuite/ui";

<button
  onClick={() => setIsOpen(!isOpen)}
  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors"
>
  <UserDisplay
    user={user}
    size="sm"
    className="sm:flex hidden"
  />
  <Avatar
    src={user.photoURL}
    name={user.displayName}
    size="sm"
    className="sm:hidden"
  />
  <ChevronDown className={`h-4 w-4 text-ink-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
</button>
```

---

## UsersTable (apps/admin)

### Current Implementation
Located: `/apps/admin/src/components/users-table.tsx`

**Lines 149-164:**
```tsx
<div className="flex items-center gap-3">
  <div className="h-8 w-8 rounded-full bg-zinc-800 overflow-hidden border border-white/5">
    {user.photoURL ? (
      <Image className="h-full w-full object-cover" src={user.photoURL} alt={user.displayName || ''} width={32} height={32} unoptimized />
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

### Migrated Version
```tsx
import { UserDisplay } from "@ainexsuite/ui";

<UserDisplay
  user={{
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  }}
  showEmail
  size="sm"
/>
```

---

## Leaderboard (apps/fit)

### Current Implementation
Located: `/apps/fit/src/components/social/Leaderboard.tsx`

**Lines 40-42:**
```tsx
<div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white font-bold">
  {stat.displayName.slice(0, 2).toUpperCase()}
</div>
```

### Migrated Version
```tsx
import { Avatar } from "@ainexsuite/ui";

<Avatar
  name={stat.displayName}
  size="sm"
  className="bg-white/10"
/>
```

**With medal indicator:**
```tsx
<div className="relative">
  <Avatar
    name={stat.displayName}
    size="sm"
  />
  {index === 0 && (
    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
      <Medal className="h-2 w-2 text-black" />
    </div>
  )}
</div>
```

---

## SharedWorkoutFeed (apps/fit)

### Current Implementation
Located: `/apps/fit/src/components/social/SharedWorkoutFeed.tsx`

**Lines 39-41:**
```tsx
<div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white">
  {user?.displayName.slice(0, 2).toUpperCase() || <User className="h-3 w-3" />}
</div>
```

### Migrated Version
```tsx
import { Avatar } from "@ainexsuite/ui";
import { User } from "lucide-react";

<Avatar
  name={user?.displayName}
  size="xs"
  fallback={<User className="h-3 w-3" />}
/>
```

---

## TopNav Profile Button

### Pattern in Multiple Apps
Found in: `apps/notes`, `apps/journey`, `packages/ui`

**Common Pattern:**
```tsx
<button onClick={() => setIsDropdownOpen(true)}>
  {user.photoURL ? (
    <Image src={user.photoURL} alt="Profile" width={32} height={32} className="rounded-full" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-accent-500 text-white flex items-center justify-center">
      {user.displayName?.[0] || 'U'}
    </div>
  )}
</button>
```

### Migrated Version
```tsx
import { Avatar } from "@ainexsuite/ui";

<button onClick={() => setIsDropdownOpen(true)}>
  <Avatar
    src={user.photoURL}
    name={user.displayName}
    size="sm"
    status={isOnline ? "online" : undefined}
  />
</button>
```

---

## Space/Team Member Displays

### Pattern for Member Lists
Common in: `apps/grow`, `apps/pulse`, `apps/workflow`

**Current Pattern:**
```tsx
{members.map(member => (
  <div key={member.uid} className="flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white flex items-center justify-center font-semibold">
      {member.displayName.slice(0, 2).toUpperCase()}
    </div>
    <div>
      <p className="font-medium">{member.displayName}</p>
      <p className="text-sm text-ink-600">{member.email}</p>
    </div>
  </div>
))}
```

### Migrated Version
```tsx
import { UserDisplay } from "@ainexsuite/ui";

{members.map(member => (
  <UserDisplay
    key={member.uid}
    user={member}
    showEmail
    size="md"
  />
))}
```

### With Roles/Permissions
```tsx
import { UserDisplay } from "@ainexsuite/ui";

{members.map(member => (
  <UserDisplay
    key={member.uid}
    user={member}
    subtitle={member.role || member.permission}
    status={member.isOnline ? "online" : "offline"}
    interactive
    onClick={() => viewMemberProfile(member.uid)}
  />
))}
```

---

## Compact Space Members

### Pattern for Condensed Lists
**Current Pattern:**
```tsx
<div className="flex -space-x-2">
  {members.slice(0, 3).map(m => (
    <div key={m.uid} className="h-6 w-6 rounded-full border-2 border-surface-card bg-accent-500 text-white text-[10px] flex items-center justify-center">
      {m.displayName[0]}
    </div>
  ))}
  {members.length > 3 && (
    <div className="h-6 w-6 rounded-full border-2 border-surface-card bg-surface-muted text-xs">
      +{members.length - 3}
    </div>
  )}
</div>
```

### Migrated Version
```tsx
import { AvatarGroup } from "@ainexsuite/ui";

<AvatarGroup
  avatars={members}
  max={3}
  size="xs"
  spacing="tight"
/>
```

---

## Migration Checklist by App

### apps/main
- [ ] user-menu.tsx - Replace manual avatar with Avatar component

### apps/admin
- [ ] users-table.tsx - Replace user display with UserDisplay

### apps/fit
- [ ] Leaderboard.tsx - Replace manual avatars
- [ ] SharedWorkoutFeed.tsx - Replace comment avatars

### apps/grow
- [ ] MemberManager.tsx - Replace member list avatars
- [ ] TeamLeaderboard.tsx - Replace leaderboard avatars
- [ ] FamilyMemberColumn.tsx - Replace family member avatars

### apps/notes
- [ ] top-nav.tsx - Replace profile button avatar (if not using shared)

### apps/journey
- [ ] top-nav.tsx - Replace profile button avatar (if not using shared)

### packages/ui
- [ ] profile-dropdown.tsx - Consider using Avatar (already well-implemented)
- [ ] top-nav.tsx - Already using good pattern, minimal changes needed

---

## Testing After Migration

### Visual Regression Checklist
- [ ] Profile dropdowns display correctly
- [ ] User lists show proper initials/images
- [ ] Avatar groups overlap properly
- [ ] Status indicators appear in correct position
- [ ] Images load with smooth transition
- [ ] Fallback initials are correct (first + last)
- [ ] All sizes render at correct dimensions
- [ ] Border/ring styles work as expected
- [ ] Hover states work on interactive elements

### Functional Testing
- [ ] Click handlers fire correctly
- [ ] Image loading errors fallback to initials
- [ ] Status updates reflect in real-time
- [ ] Keyboard navigation works
- [ ] Screen readers announce properly
- [ ] Loading states show skeleton
- [ ] External images load (unoptimized flag)

### Performance Testing
- [ ] No layout shift on image load
- [ ] Smooth animations/transitions
- [ ] No excessive re-renders
- [ ] Image optimization working
- [ ] Bundle size impact acceptable

---

## Common Pitfalls

### 1. Missing Name Prop
**Problem:**
```tsx
<Avatar src={user.photoURL} />
```

**Fix:**
```tsx
<Avatar src={user.photoURL} name={user.displayName} />
```

### 2. Wrong Size for Context
**Problem:**
```tsx
// Too large for a comment
<Avatar name={author} size="xl" />
```

**Fix:**
```tsx
<Avatar name={author} size="sm" />
```

### 3. Manual Stacking Instead of Group
**Problem:**
```tsx
<div className="flex -space-x-2">
  {members.map(m => <Avatar key={m.uid} {...m} />)}
</div>
```

**Fix:**
```tsx
<AvatarGroup avatars={members} />
```

### 4. Redundant User Display
**Problem:**
```tsx
<Avatar src={user.photoURL} name={user.displayName} />
<div>
  <p>{user.displayName}</p>
  <p>{user.email}</p>
</div>
```

**Fix:**
```tsx
<UserDisplay user={user} showEmail />
```

---

**Created:** November 28, 2025
**Last Updated:** November 28, 2025
