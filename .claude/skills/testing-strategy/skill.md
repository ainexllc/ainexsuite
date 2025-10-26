# Testing Strategy Skill

## Purpose
Establish comprehensive testing practices across all AINexSuite apps to ensure reliability, security, and performance through automated unit, integration, and end-to-end testing.

## When to Use
- Before implementing new features
- When refactoring existing code
- Before production deployments
- During code reviews
- When fixing bugs
- After architecture changes

## Testing Philosophy

### Test Pyramid Strategy

```
        /\
       /E2E\       (10%) - Critical user flows
      /------\
     /  INT   \    (30%) - API, Firebase, SSO
    /----------\
   /   UNIT     \  (60%) - Components, utilities
  /--------------\
```

**Rationale**: Fast feedback from unit tests, confidence from integration tests, reality from E2E tests.

## Testing Targets

### Coverage Goals
- **Overall**: > 80% code coverage
- **Critical paths** (auth, payments): 100%
- **Utilities and helpers**: > 90%
- **UI components**: > 70%
- **Types and configs**: Not required

### Speed Targets
- **Unit tests**: < 1 second per test file
- **Integration tests**: < 5 seconds per test
- **E2E tests**: < 30 seconds per flow
- **Full suite**: < 5 minutes

## Unit Testing

### Framework: Vitest

**Why Vitest?**
- Fast with native ESM support
- Compatible with Vite/Next.js
- Jest-compatible API
- Built-in TypeScript support

### Setup

```bash
# Install Vitest
pnpm add -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom jsdom

# Root vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
});
```

### Component Testing

```typescript
// packages/ui/src/components/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles', () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-accent-500');
  });

  it('disables when loading', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Utility Testing

```typescript
// packages/types/src/utils/format-date.test.ts
import { formatDate, formatRelativeDate } from './format-date';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});

describe('formatRelativeDate', () => {
  it('shows "today" for current date', () => {
    const today = new Date();
    expect(formatRelativeDate(today)).toBe('today');
  });

  it('shows "yesterday" for previous day', () => {
    const yesterday = new Date(Date.now() - 86400000);
    expect(formatRelativeDate(yesterday)).toBe('yesterday');
  });

  it('shows days ago for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
    expect(formatRelativeDate(threeDaysAgo)).toBe('3 days ago');
  });
});
```

### Hook Testing

```typescript
// packages/auth/src/hooks/use-auth.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './use-auth';
import { AuthProvider } from '../context/auth-context';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth', () => {
  it('provides auth state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('loading');
  });

  it('handles login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.login('test@example.com', 'password');
    await waitFor(() => {
      expect(result.current.user).toBeTruthy();
    });
  });

  it('handles logout', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await result.current.logout();
    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });
});
```

## Integration Testing

### Firebase Integration Tests

```typescript
// packages/firebase/src/services/notes.test.ts
import { connectFirestoreEmulator } from 'firebase/firestore';
import { createNote, updateNote, deleteNote, getNotes } from './notes';
import { initializeTestFirebase } from '../test-utils';

describe('Notes Service', () => {
  beforeAll(() => {
    initializeTestFirebase();
    connectFirestoreEmulator(db, 'localhost', 8080);
  });

  beforeEach(async () => {
    // Clear test data
    await clearFirestoreData();
  });

  it('creates a note', async () => {
    const noteData = {
      title: 'Test Note',
      body: 'Test content',
      ownerId: 'test-user-123'
    };

    const noteId = await createNote(noteData);
    expect(noteId).toBeTruthy();

    const notes = await getNotes('test-user-123');
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('Test Note');
  });

  it('enforces security rules', async () => {
    const noteData = {
      title: 'Test Note',
      ownerId: 'other-user'
    };

    // Should fail - wrong owner
    await expect(
      createNote(noteData, { uid: 'test-user-123' })
    ).rejects.toThrow('permission-denied');
  });

  it('handles pagination', async () => {
    // Create 25 notes
    for (let i = 0; i < 25; i++) {
      await createNote({
        title: `Note ${i}`,
        body: 'Content',
        ownerId: 'test-user-123'
      });
    }

    const firstPage = await getNotes('test-user-123', { limit: 10 });
    expect(firstPage.notes).toHaveLength(10);
    expect(firstPage.hasMore).toBe(true);

    const secondPage = await getNotes('test-user-123', {
      limit: 10,
      startAfter: firstPage.lastDoc
    });
    expect(secondPage.notes).toHaveLength(10);
  });
});
```

### API Route Testing

```typescript
// apps/notes/src/app/api/notes/route.test.ts
import { GET, POST } from './route';
import { NextRequest } from 'next/server';

describe('Notes API', () => {
  it('GET returns user notes', async () => {
    const request = new NextRequest('http://localhost/api/notes', {
      headers: { 'x-user-id': 'test-user-123' }
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.notes).toBeDefined();
  });

  it('POST creates a note', async () => {
    const request = new NextRequest('http://localhost/api/notes', {
      method: 'POST',
      headers: {
        'x-user-id': 'test-user-123',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        title: 'New Note',
        body: 'Content'
      })
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.id).toBeTruthy();
  });

  it('requires authentication', async () => {
    const request = new NextRequest('http://localhost/api/notes');
    const response = await GET(request);
    expect(response.status).toBe(401);
  });
});
```

### AI Integration Testing

```typescript
// packages/ai/src/use-grok-assistant.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useGrokAssistant } from './use-grok-assistant';

// Mock Grok API
vi.mock('./api/chat', () => ({
  sendChatMessage: vi.fn((messages) =>
    Promise.resolve({ content: 'Mock AI response', role: 'assistant' })
  )
}));

describe('useGrokAssistant', () => {
  it('sends messages and receives responses', async () => {
    const { result } = renderHook(() => useGrokAssistant('notes'));

    await result.current.sendMessage('Help me organize my notes');

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2); // user + assistant
      expect(result.current.messages[1].content).toBe('Mock AI response');
    });
  });

  it('handles streaming responses', async () => {
    const { result } = renderHook(() => useGrokAssistant('notes'));

    await result.current.sendMessage('Test streaming');

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.streaming).toBe(false);
    });
  });

  it('includes app context in requests', async () => {
    const { result } = renderHook(() =>
      useGrokAssistant('notes', { userId: 'test-123' })
    );

    await result.current.sendMessage('Test');

    // Verify context was included
    expect(sendChatMessage).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ role: 'system' })
      ])
    );
  });
});
```

## End-to-End Testing

### Framework: Playwright

**Why Playwright?**
- Multi-browser support (Chromium, Firefox, WebKit)
- Auto-wait for elements
- Network interception
- Screenshot and video recording
- Parallel execution

### Setup

```bash
# Install Playwright
pnpm add -D @playwright/test

# Initialize
npx playwright install

# playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
});
```

### SSO Flow Testing

```typescript
// e2e/auth/sso-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SSO Authentication Flow', () => {
  test('login on notes app persists to journal app', async ({ browser }) => {
    // Create two contexts for two subdomains
    const context = await browser.newContext({
      baseURL: 'http://notes.ainexsuite.test'
    });

    const notesPage = await context.newPage();

    // Login on notes app
    await notesPage.goto('/login');
    await notesPage.fill('[name="email"]', 'test@example.com');
    await notesPage.fill('[name="password"]', 'testpassword');
    await notesPage.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(notesPage).toHaveURL('/');

    // Verify user is authenticated
    await expect(notesPage.locator('[data-testid="user-menu"]')).toBeVisible();

    // Navigate to journal subdomain
    await notesPage.goto('http://journal.ainexsuite.test/');

    // Should be automatically authenticated (SSO working)
    await expect(notesPage.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(notesPage).not.toHaveURL('/login');
  });

  test('logout on one app logs out all apps', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Login on notes app
    await page.goto('http://notes.ainexsuite.test/login');
    await loginUser(page, 'test@example.com', 'testpassword');

    // Navigate to todo app - should be logged in
    await page.goto('http://todo.ainexsuite.test/');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Logout from todo app
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Navigate back to notes app - should be logged out
    await page.goto('http://notes.ainexsuite.test/');
    await expect(page).toHaveURL('/login');
  });
});
```

### App-Specific E2E Tests

#### Notes App

```typescript
// e2e/notes/note-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Notes App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginUser(page, 'test@example.com', 'password');
  });

  test('creates a new note', async ({ page }) => {
    await page.click('[data-testid="new-note-btn"]');

    await page.fill('[data-testid="note-title"]', 'Test Note');
    await page.fill('[data-testid="note-body"]', 'This is test content');

    await page.click('[data-testid="save-note"]');

    // Verify note appears in list
    await expect(page.locator('text=Test Note')).toBeVisible();
  });

  test('AI assistant suggests title', async ({ page }) => {
    await page.click('[data-testid="new-note-btn"]');
    await page.fill('[data-testid="note-body"]', 'Today I learned about React hooks and how they work');

    // Open AI assistant
    await page.click('[data-testid="ai-assistant-btn"]');
    await page.fill('[data-testid="ai-input"]', 'Suggest a title for this note');
    await page.click('[data-testid="ai-send"]');

    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]').last()).toContainText('React Hooks');
  });

  test('filters notes by label', async ({ page }) => {
    // Create notes with different labels
    await createNote(page, 'Work Note', 'Work content', ['work']);
    await createNote(page, 'Personal Note', 'Personal content', ['personal']);

    // Filter by work label
    await page.click('[data-testid="filter-btn"]');
    await page.click('text=work');

    // Should only show work note
    await expect(page.locator('text=Work Note')).toBeVisible();
    await expect(page.locator('text=Personal Note')).not.toBeVisible();
  });
});
```

#### Journal App

```typescript
// e2e/journal/entry-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journal App', () => {
  test('creates daily entry with mood', async ({ page }) => {
    await page.goto('/');
    await loginUser(page, 'test@example.com', 'password');

    await page.click('[data-testid="new-entry-btn"]');

    // Select mood
    await page.click('[data-testid="mood-happy"]');

    // Write entry
    await page.fill('[data-testid="entry-content"]', 'Today was a great day!');

    await page.click('[data-testid="save-entry"]');

    // Verify entry saved
    await expect(page.locator('text=Today was a great day!')).toBeVisible();
    await expect(page.locator('[data-testid="mood-indicator"]')).toHaveClass(/happy/);
  });

  test('shows mood patterns over time', async ({ page }) => {
    await page.goto('/analytics');

    // Should show mood chart
    await expect(page.locator('[data-testid="mood-chart"]')).toBeVisible();

    // Should show streak
    await expect(page.locator('[data-testid="streak-count"]')).toContainText(/\d+ days/);
  });
});
```

#### Todo App

```typescript
// e2e/todo/task-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Todo App', () => {
  test('creates and completes a task', async ({ page }) => {
    await page.goto('/');
    await loginUser(page, 'test@example.com', 'password');

    // Create task
    await page.fill('[data-testid="new-task-input"]', 'Buy groceries');
    await page.press('[data-testid="new-task-input"]', 'Enter');

    // Task should appear
    await expect(page.locator('text=Buy groceries')).toBeVisible();

    // Complete task
    await page.click('[data-testid="task-checkbox"]');

    // Should show as completed
    await expect(page.locator('[data-testid="task-item"]')).toHaveClass(/completed/);
  });

  test('breaks down task with AI', async ({ page }) => {
    await page.goto('/');

    await page.fill('[data-testid="new-task-input"]', 'Launch product');
    await page.press('[data-testid="new-task-input"]', 'Enter');

    // Open AI assistant for task
    await page.click('[data-testid="task-ai-btn"]');
    await page.fill('[data-testid="ai-input"]', 'Break this down into subtasks');
    await page.click('[data-testid="ai-send"]');

    // AI should suggest subtasks
    await expect(page.locator('[data-testid="ai-message"]').last())
      .toContainText('subtask');
  });
});
```

### Performance Testing

```typescript
// e2e/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance Metrics', () => {
  test('meets Core Web Vitals targets', async ({ page }) => {
    await page.goto('/');

    // Measure LCP (Largest Contentful Paint)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });

    expect(lcp).toBeLessThan(2500); // < 2.5s target

    // Measure CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
      });
    });

    expect(cls).toBeLessThan(0.1); // < 0.1 target
  });

  test('loads within performance budget', async ({ page }) => {
    const response = await page.goto('/');

    // Measure page load time
    const loadTime = await page.evaluate(() =>
      performance.timing.loadEventEnd - performance.timing.navigationStart
    );

    expect(loadTime).toBeLessThan(3000); // 3s budget

    // Check bundle size
    const resources = await page.evaluate(() =>
      performance.getEntriesByType('resource')
        .filter(r => r.name.includes('.js'))
        .reduce((total, r) => total + r.transferSize, 0)
    );

    expect(resources).toBeLessThan(250 * 1024); // 250KB budget
  });
});
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      firestore:
        image: gcr.io/google.com/cloudsdktool/cloud-sdk
        options: --expose 8080

    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Start Firebase emulators
        run: |
          npm install -g firebase-tools
          firebase emulators:start --only firestore &

      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Build apps
        run: pnpm build

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Organization

### Monorepo Structure

```
ainexsuite/
├── packages/
│   ├── ui/
│   │   ├── src/
│   │   ├── __tests__/        # Unit tests
│   │   └── vitest.config.ts
│   ├── firebase/
│   │   ├── src/
│   │   ├── __tests__/        # Integration tests
│   │   └── vitest.config.ts
│   └── ai/
│       ├── src/
│       ├── __tests__/
│       └── vitest.config.ts
├── apps/
│   ├── notes/
│   │   ├── src/
│   │   ├── __tests__/        # App-specific tests
│   │   └── e2e/              # E2E tests
│   └── journal/
│       ├── src/
│       ├── __tests__/
│       └── e2e/
├── e2e/
│   ├── auth/                 # Cross-app auth tests
│   ├── performance/          # Performance tests
│   └── shared/               # Shared utilities
└── test/
    ├── setup.ts              # Global test setup
    ├── mocks/                # Shared mocks
    └── fixtures/             # Test data
```

## Testing Utilities

### Test Helpers

```typescript
// test/helpers/auth.ts
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

export async function createTestUser(overrides = {}) {
  return {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    ...overrides
  };
}
```

```typescript
// test/helpers/firebase.ts
export async function clearFirestoreData() {
  const collections = ['notes', 'journal_entries', 'todos', 'habits'];

  for (const collection of collections) {
    const snapshot = await getDocs(collection(db, collection));
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
}

export function mockFirebaseAuth() {
  return {
    currentUser: createTestUser(),
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn()
  };
}
```

### Mock Data Factories

```typescript
// test/factories/note.ts
export function createMockNote(overrides = {}) {
  return {
    id: `note-${Date.now()}`,
    ownerId: 'test-user-123',
    title: 'Test Note',
    body: 'Test content',
    color: 'default',
    pattern: 'none',
    labels: [],
    pinned: false,
    archived: false,
    deleted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}

export function createMockNotes(count: number) {
  return Array.from({ length: count }, (_, i) =>
    createMockNote({ title: `Note ${i + 1}` })
  );
}
```

## App-Specific Testing Strategies

### Notes App
- **Unit**: Note creation, editing, deletion
- **Integration**: Firestore queries, label management
- **E2E**: Full note lifecycle, AI title generation

### Journal App
- **Unit**: Mood tracking, entry formatting
- **Integration**: Streak calculation, analytics
- **E2E**: Daily entry flow, mood visualization

### Todo App
- **Unit**: Task completion, priority sorting
- **Integration**: Project organization, due dates
- **E2E**: Task creation with AI breakdown

### Track App (Habits)
- **Unit**: Streak calculation, completion tracking
- **Integration**: Multi-day data queries
- **E2E**: Habit creation and daily check-in

### Moments App (Photos)
- **Unit**: Image validation, caption generation
- **Integration**: Firebase Storage upload
- **E2E**: Photo upload and gallery view

### Grow App (Learning)
- **Unit**: Progress calculation, quiz generation
- **Integration**: Learning path creation
- **E2E**: Complete learning session

### Pulse App (Health)
- **Unit**: Metric calculations, trend analysis
- **Integration**: Time-series data queries
- **E2E**: Metric logging and visualization

### Fit App (Fitness)
- **Unit**: PR tracking, workout validation
- **Integration**: Exercise library queries
- **E2E**: Workout logging and progress tracking

## Pre-Deployment Checklist

- [ ] All unit tests passing (> 80% coverage)
- [ ] All integration tests passing
- [ ] E2E tests passing for critical flows
- [ ] Performance budgets met
- [ ] No console errors or warnings
- [ ] SSO working across all subdomains
- [ ] AI assistants responding correctly
- [ ] Firebase security rules tested
- [ ] Mobile responsive tests passing
- [ ] Accessibility tests passing

## Continuous Monitoring

### Production Testing

```typescript
// e2e/smoke/production.spec.ts
import { test, expect } from '@playwright/test';

const PRODUCTION_APPS = [
  'https://www.ainexsuite.com',
  'https://notes.ainexsuite.com',
  'https://journal.ainexsuite.com',
  // ... all apps
];

test.describe('Production Smoke Tests', () => {
  for (const url of PRODUCTION_APPS) {
    test(`${url} is accessible`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);

      // Check for critical error messages
      const errorText = await page.textContent('body');
      expect(errorText).not.toContain('Application error');
      expect(errorText).not.toContain('500');
    });
  }
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Firebase Testing Guide](https://firebase.google.com/docs/rules/unit-tests)

---

**Remember**: Tests are documentation. Write tests that explain how your code should work.
