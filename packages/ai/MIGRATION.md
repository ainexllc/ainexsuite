# Migration Guide

Guide for migrating from existing Grok AI integration to the new unified AI system.

## Overview

The new AI package provides:
- **Multi-provider support**: Gemini (primary) with GPT-4o mini fallback
- **Usage tracking**: Persistent Firestore-based tracking with atomic operations
- **Rate limiting**: In-memory protection against abuse
- **Tier-based quotas**: Free, Basic, Pro, Enterprise tiers
- **Better error handling**: Comprehensive error types and messages

## Breaking Changes

### 1. Package Name and Imports

**Before:**
```typescript
import { useGrokAssistant } from '@ainexsuite/ai';
```

**After:**
```typescript
// For React hooks (legacy support maintained)
import { useGrokAssistant } from '@ainexsuite/ai';

// For new AI integration
import { generateAIContent } from '@ainexsuite/ai';
```

### 2. API Structure

**Before (Grok):**
```typescript
const result = await generateWithGrok(prompt);
```

**After (Unified):**
```typescript
const response = await generateAIContent(
  {
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY, // Optional
    db,
  },
  {
    userId: 'user123',
    tier: 'free',
    prompt: 'Your prompt',
  }
);

if (response.success) {
  const text = response.result?.text;
}
```

## Migration Steps

### Step 1: Update Dependencies

Ensure the AI package is updated with new dependencies:

```bash
pnpm install
pnpm --filter @ainexsuite/ai build
```

### Step 2: Add Environment Variables

Add to your `.env.local`:

```bash
# Primary provider
GEMINI_API_KEY=your-gemini-api-key

# Fallback provider (optional but recommended)
OPENAI_API_KEY=your-openai-api-key
```

### Step 3: Update API Routes

**Before:**
```typescript
// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  // Direct generation without limits
  const result = await generateWithGrok(prompt);

  return NextResponse.json({ text: result });
}
```

**After:**
```typescript
// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt, tier = 'free' } = await request.json();

  // Generation with rate limiting and usage tracking
  const response = await generateAIContent(
    {
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      db,
    },
    {
      userId: session.user.id,
      tier,
      prompt,
    }
  );

  if (!response.success) {
    return NextResponse.json(
      {
        error: response.error?.message,
        type: response.error?.type,
      },
      { status: 429 }
    );
  }

  return NextResponse.json({
    text: response.result?.text,
    usage: response.usage,
  });
}
```

### Step 4: Update React Components

**Before:**
```typescript
'use client';

import { useState } from 'react';

export function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');

  const handleGenerate = async () => {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    setResult(data.text);
  };

  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleGenerate}>Generate</button>
      <p>{result}</p>
    </div>
  );
}
```

**After:**
```typescript
'use client';

import { useState } from 'react';

export function AIGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<any>(null);

  const handleGenerate = async () => {
    setError(null);

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, tier: 'free' }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
      return;
    }

    setResult(data.text);
    setUsage(data.usage);
  };

  return (
    <div>
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <button onClick={handleGenerate}>Generate</button>

      {usage && (
        <p className="text-sm text-gray-600">
          Remaining: {usage.dailyRemaining} daily, {usage.monthlyRemaining} monthly
        </p>
      )}

      {error && <p className="text-red-600">{error}</p>}
      {result && <p>{result}</p>}
    </div>
  );
}
```

### Step 5: Setup Firestore Collection

Create the `ai_usage` collection in Firestore. This will be automatically created when the first user makes a request, but you can optionally create it manually:

```typescript
// Run once to initialize (optional)
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

async function initializeUserUsage(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.substring(0, 7);

  await setDoc(doc(db, 'ai_usage', userId), {
    userId,
    tier: 'free',
    dailyUsage: 0,
    monthlyUsage: 0,
    lastResetDaily: today,
    lastResetMonthly: currentMonth,
    updatedAt: Date.now(),
  });
}
```

### Step 6: Add Firestore Security Rules

Add to your `firestore.rules`:

```
match /ai_usage/{userId} {
  // Users can only read their own usage
  allow read: if request.auth != null && request.auth.uid == userId;

  // Only server can write (use Admin SDK)
  allow write: if false;
}
```

### Step 7: Add Firestore Indexes

Add to your `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "ai_usage",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "tier", "order": "ASCENDING" },
        { "fieldPath": "updatedAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:

```bash
firebase deploy --only firestore:indexes
```

## Gradual Migration

You can migrate gradually by keeping the old Grok integration alongside the new system:

```typescript
// Use new system for new features
import { generateAIContent } from '@ainexsuite/ai';

// Keep old system for existing features
import { useGrokAssistant } from '@ainexsuite/ai';
```

## Testing

### Test Rate Limiting

```typescript
import { checkRateLimit } from '@ainexsuite/ai';

try {
  checkRateLimit('test-user', 'free'); // 5 requests per hour
  console.log('Request allowed');
} catch (error) {
  console.log('Rate limited:', error.message);
}
```

### Test Usage Tracking

```typescript
import { getUsageStats } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';

const stats = await getUsageStats(db, 'test-user');
console.log('Daily usage:', stats.daily);
console.log('Monthly usage:', stats.monthly);
```

### Test Token Estimation

```typescript
import { estimateTokens } from '@ainexsuite/ai';

const count = estimateTokens('Your text here');
console.log('Estimated tokens:', count);
```

## Rollback Plan

If you need to rollback:

1. Revert to previous package version
2. Remove environment variables
3. Keep old Grok integration endpoints
4. Remove Firestore collection `ai_usage` (optional)

The migration is designed to be non-destructive - old hooks like `useGrokAssistant` are still available.

## Support

See the following documentation for more details:

- [README.md](./README.md) - Full package documentation
- [EXAMPLES.md](./EXAMPLES.md) - Complete code examples
- [packages/types/src/ai.ts](../types/src/ai.ts) - TypeScript types

## Common Issues

### Issue: "No API keys provided"

**Solution:** Ensure environment variables are set:
```bash
GEMINI_API_KEY=your-key
OPENAI_API_KEY=your-key
```

### Issue: "Rate limit exceeded"

**Solution:** This is expected behavior. Wait for the limit to reset or upgrade tier:
```typescript
const status = getRateLimitStatus(userId, tier);
console.log('Resets at:', status.resetAt);
```

### Issue: "Usage limit reached"

**Solution:** This is expected behavior. Wait for daily/monthly reset or upgrade tier:
```typescript
const stats = await getUsageStats(db, userId);
console.log('Resets at:', stats.daily.resetAt);
```

### Issue: Build errors with Firestore types

**Solution:** Ensure all packages are built:
```bash
pnpm --filter @ainexsuite/types build
pnpm --filter @ainexsuite/firebase build
pnpm --filter @ainexsuite/ai build
```

## Next Steps

1. Update all AI generation endpoints
2. Add usage display to user dashboard
3. Implement tier upgrade flow
4. Monitor usage statistics
5. Adjust limits based on usage patterns
6. Configure automatic fallback behavior
