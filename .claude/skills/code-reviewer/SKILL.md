---
name: code-reviewer
description: Review code for quality, security, performance, and consistency with team standards. Use when reviewing PRs, preparing code for review, or auditing existing code.
---

# Code Review Standards

## When to Use
- Reviewing pull requests
- Preparing your code for review
- Auditing existing code quality
- Checking for security issues
- Verifying best practices

## Review Checklist

### Correctness
- [ ] Does the code do what it claims?
- [ ] Are edge cases handled?
- [ ] Are error states handled properly?
- [ ] Is the logic correct?
- [ ] Are there any off-by-one errors?

### Security
- [ ] No secrets/API keys in code
- [ ] User input validated/sanitized
- [ ] Auth checks in place where needed
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No XSS vulnerabilities (no raw HTML insertion)
- [ ] Sensitive data not logged

### Performance
- [ ] No unnecessary re-renders
- [ ] Large lists virtualized
- [ ] Images optimized
- [ ] No N+1 queries
- [ ] Expensive operations memoized
- [ ] Bundle impact considered

### Code Quality
- [ ] Follows existing patterns
- [ ] No duplicate code
- [ ] Functions are single-purpose
- [ ] Variable names are descriptive
- [ ] No magic numbers/strings
- [ ] Complex logic has comments

### Testing
- [ ] Tests added for new functionality
- [ ] Edge cases tested
- [ ] Tests actually test behavior
- [ ] No flaky tests

### Architecture
- [ ] Follows monorepo boundaries
- [ ] Shared code in appropriate package
- [ ] No circular dependencies
- [ ] Types in correct package

## Common Issues to Flag

### Security Red Flags
```typescript
// BAD: Secret in code
const API_KEY = 'sk_live_abc123';  // Never hardcode secrets

// BAD: SQL-like injection risk
const query = `SELECT * FROM users WHERE id = ${userId}`;

// BAD: Inserting raw user content into DOM (XSS risk)
// Never use element.innerHTML with untrusted content
// Use textContent or sanitization libraries like DOMPurify

// BAD: Missing auth check
export async function GET(request: Request) {
  // No auth verification before returning data
  return Response.json(await getAllUsers());
}
```

### Performance Issues
```typescript
// BAD: Creating new objects in render
<Component style={{ margin: 10 }} />  // New object every render
<Component onClick={() => handleClick(id)} />  // New function every render

// GOOD: Memoize or move outside
const style = useMemo(() => ({ margin: 10 }), []);
const handleItemClick = useCallback((id) => handleClick(id), [handleClick]);

// BAD: Filtering in render without memo
function List({ items, filter }) {
  const filtered = items.filter(i => i.type === filter);  // Runs every render
  return filtered.map(...);
}

// GOOD: Use useMemo
const filtered = useMemo(
  () => items.filter(i => i.type === filter),
  [items, filter]
);

// BAD: Missing dependency in useEffect
useEffect(() => {
  fetchData(userId);
}, []);  // userId missing from deps

// BAD: Large list without virtualization
{items.map(item => <LargeComponent key={item.id} {...item} />)}
// If items.length > 100, consider virtualization
```

### Code Quality Issues
```typescript
// BAD: Magic numbers
if (status === 3) { ... }  // What is 3?

// GOOD: Use constants
const STATUS_COMPLETED = 3;
if (status === STATUS_COMPLETED) { ... }

// BAD: Nested ternaries
const result = a ? (b ? 'x' : 'y') : (c ? 'z' : 'w');

// GOOD: Use if/else or switch
let result;
if (a) {
  result = b ? 'x' : 'y';
} else {
  result = c ? 'z' : 'w';
}

// BAD: Too many parameters
function createUser(name, email, age, address, phone, role, dept) { ... }

// GOOD: Use an options object
function createUser(options: CreateUserOptions) { ... }

// BAD: Boolean trap
updateUser(true, false, true);  // What do these mean?

// GOOD: Use named parameters or object
updateUser({ active: true, verified: false, admin: true });
```

### React-Specific Issues
```typescript
// BAD: State update not using previous value
setCount(count + 1);  // May miss updates

// GOOD: Use functional update
setCount(prev => prev + 1);

// BAD: Object mutation
const updated = items;
updated[0].name = 'new';  // Mutates original
setItems(updated);  // Won't trigger re-render

// GOOD: Create new reference
setItems(items.map((item, i) =>
  i === 0 ? { ...item, name: 'new' } : item
));

// BAD: Conditional hooks
if (condition) {
  const [state, setState] = useState();  // Hooks must be unconditional
}

// BAD: Missing key prop
{items.map(item => <Item {...item} />)}

// GOOD: Add unique key
{items.map(item => <Item key={item.id} {...item} />)}
```

## Review Comments

### Be Constructive
```markdown
// BAD
"This is wrong."
"Why would you do it this way?"

// GOOD
"Consider using `useMemo` here to avoid recalculating on every render."
"This could be simplified by extracting to a custom hook. What do you think?"
```

### Categorize Severity
```markdown
// Blocking issues
RED **Must fix**: Security vulnerability - user input not sanitized

// Should fix
YELLOW **Should fix**: Missing error handling for network failure

// Nice to have
GREEN **Suggestion**: Could use destructuring here for cleaner code

// Questions
QUESTION: What's the expected behavior when user is offline?
```

### Provide Context
```markdown
// BAD - Vague
"Don't do this"

// GOOD - Explain why
"Using `any` here defeats the purpose of TypeScript. Consider defining
a proper interface - it'll catch bugs at compile time and improve IDE
autocomplete."
```

## PR Description Template

```markdown
## Summary
Brief description of what this PR does.

## Changes
- Added X component for Y feature
- Updated Z service to handle A case
- Fixed bug where B happened

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Tested on mobile

## Screenshots (if UI changes)
Before: [screenshot]
After: [screenshot]

## Related Issues
Fixes #123
Related to #456
```

## Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes nor adds
- `docs`: Documentation only
- `style`: Formatting, missing semicolons, etc.
- `test`: Adding or updating tests
- `chore`: Build process, deps, etc.

**Examples:**
```
feat(journal): add cover image support

- Add cover image picker to composer
- Generate AI summaries for covers
- Update entry card to display covers

Closes #234

---

fix(auth): handle expired session gracefully

Users were seeing blank screen on expired session.
Now redirects to login with message.

---

refactor(habits): extract chain logic to hook

No functional changes. Moved chain calculation
from HabitCard to useHabitChain hook.
```

## See Also
- [checklist.md](checklist.md) - Full review checklist
- [templates.md](templates.md) - PR templates
