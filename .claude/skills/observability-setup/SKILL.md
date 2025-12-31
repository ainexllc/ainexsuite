---
name: observability-setup
description: Set up structured logging, metrics, and monitoring dashboards. Use when adding logging, setting up alerts, debugging production issues, or implementing analytics.
---

# Logging & Monitoring

## When to Use

- Adding logging to new features
- Debugging production issues
- Setting up error tracking
- Implementing analytics events
- Creating monitoring dashboards

## Quick Reference

### Structured Logging Pattern

```typescript
// lib/logger.ts
type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };

  // Development: pretty print
  if (process.env.NODE_ENV === "development") {
    const color = { debug: "36", info: "32", warn: "33", error: "31" }[level];
    console.log(
      `\x1b[${color}m[${level.toUpperCase()}]\x1b[0m`,
      message,
      context || "",
    );
    return;
  }

  // Production: JSON for log aggregation
  console[level](JSON.stringify(entry));
}

export const logger = {
  debug: (msg: string, ctx?: LogContext) => log("debug", msg, ctx),
  info: (msg: string, ctx?: LogContext) => log("info", msg, ctx),
  warn: (msg: string, ctx?: LogContext) => log("warn", msg, ctx),
  error: (msg: string, ctx?: LogContext) => log("error", msg, ctx),
};

// Usage
logger.info("Entry created", { userId: user.uid, entryId: entry.id });
logger.error("Failed to save", { error: err.message, stack: err.stack });
```

### Log Levels Guide

| Level   | When to Use                  | Example                                         |
| ------- | ---------------------------- | ----------------------------------------------- |
| `debug` | Development only, verbose    | `debug('Rendering component', { props })`       |
| `info`  | Normal operations            | `info('User logged in', { userId })`            |
| `warn`  | Potential issues             | `warn('Rate limit approaching', { remaining })` |
| `error` | Failures that need attention | `error('Payment failed', { error })`            |

### Firebase Analytics Events

```typescript
// lib/analytics.ts
import { getAnalytics, logEvent } from "firebase/analytics";

const analytics = typeof window !== "undefined" ? getAnalytics() : null;

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
) {
  if (!analytics) return;

  logEvent(analytics, name, params);

  // Also log to console in dev
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", name, params);
  }
}

// Standard events
export const Events = {
  // User actions
  signUp: () => trackEvent("sign_up"),
  login: () => trackEvent("login"),

  // Feature usage
  createEntry: (type: string) => trackEvent("create_entry", { type }),
  useFilter: (filter: string) => trackEvent("use_filter", { filter }),

  // Engagement
  viewPage: (page: string) => trackEvent("page_view", { page }),
  completeTutorial: () => trackEvent("tutorial_complete"),
};
```

### API Route Logging

```typescript
// app/api/entries/route.ts
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const userId = await getUserId(request);
    logger.info("API request started", {
      requestId,
      method: "POST",
      path: "/api/entries",
      userId,
    });

    const entry = await createEntry(userId, data);

    logger.info("API request completed", {
      requestId,
      duration: Date.now() - startTime,
      status: 201,
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    logger.error("API request failed", {
      requestId,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed" } },
      { status: 500 },
    );
  }
}
```

### Performance Monitoring

```typescript
// lib/performance.ts
export function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();

  return fn().finally(() => {
    const duration = performance.now() - start;

    if (duration > 1000) {
      logger.warn(`Slow operation: ${name}`, {
        duration: Math.round(duration),
      });
    } else if (process.env.NODE_ENV === "development") {
      logger.debug(`${name} completed`, { duration: Math.round(duration) });
    }
  });
}

// Usage
const entries = await measureAsync("fetchEntries", () =>
  getEntriesForUser(userId),
);
```

### Error Tracking Setup

```typescript
// lib/error-tracking.ts
// For Sentry or similar service

export function initErrorTracking() {
  if (process.env.NODE_ENV !== "production") return;

  // Sentry.init({
  //   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  //   environment: process.env.NODE_ENV,
  //   tracesSampleRate: 0.1,
  // });
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  logger.error(error.message, {
    stack: error.stack,
    ...context,
  });

  // Sentry.captureException(error, { extra: context });
}

export function setUser(userId: string) {
  // Sentry.setUser({ id: userId });
}
```

## Monitoring Checklist

### What to Log

- [ ] User authentication events
- [ ] CRUD operations on important data
- [ ] API request/response times
- [ ] Errors with stack traces
- [ ] Feature usage for analytics

### What NOT to Log

- [ ] Passwords or tokens
- [ ] Full credit card numbers
- [ ] Personal health information
- [ ] Private message content
- [ ] Session tokens

### Alerts to Set Up

- [ ] Error rate > 1% of requests
- [ ] Response time > 2 seconds
- [ ] Failed login attempts > 5/minute
- [ ] Database query time > 500ms
- [ ] Memory usage > 80%

## Quick Debug Commands

```bash
# View Vercel logs
vercel logs --follow

# View Firebase function logs
firebase functions:log --only functionName

# Search logs for errors
vercel logs | grep -i error
```

## See Also

- [patterns.md](patterns.md) - Advanced logging patterns
- [dashboards.md](dashboards.md) - Monitoring dashboard setup
