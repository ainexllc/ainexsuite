# @ainexsuite/ai

Comprehensive AI integration package for AinexSuite with Gemini (primary), OpenAI GPT-4o mini (fallback), and Grok support.

## Features

- **Multi-Provider Support**: Gemini (primary) with automatic fallback to GPT-4o mini
- **Usage Tracking**: Firestore-based atomic usage tracking with daily/monthly limits
- **Rate Limiting**: In-memory rate limiting to prevent abuse
- **Tier-Based Quotas**: Free, Basic, Pro, and Enterprise tiers with different limits
- **Token Estimation**: Accurate token counting for cost management
- **Prompt Validation**: Input validation and sanitization
- **Error Handling**: Comprehensive error handling with retry logic
- **Streaming Support**: Real-time text generation

## Installation

This package is part of the AinexSuite monorepo. Install dependencies:

```bash
pnpm install
```

## Quick Start

### Basic Usage (Recommended)

```typescript
import { generateAIContent } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';

const response = await generateAIContent(
  {
    geminiApiKey: process.env.GEMINI_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY, // Optional fallback
    db,
  },
  {
    userId: 'user123',
    tier: 'free',
    prompt: 'Write a short poem about coding',
  }
);

if (response.success) {
  console.log('Generated text:', response.result.text);
  console.log('Tokens used:', response.result.inputTokens + response.result.outputTokens);
  console.log('Remaining queries:', response.usage);
} else {
  console.error('Error:', response.error);
}
```

### Direct Generation (Advanced)

```typescript
import { generateContent } from '@ainexsuite/ai';

const result = await generateContent(
  'Explain quantum computing',
  'pro',
  process.env.GEMINI_API_KEY
);

console.log(result.text);
console.log(`Provider: ${result.provider}, Model: ${result.model}`);
```

## Tier Limits

| Tier       | Daily Queries | Monthly Queries | Queries/Hour | Max Prompt Length |
|------------|---------------|-----------------|--------------|-------------------|
| Free       | 10            | 100             | 5            | 2,000 chars       |
| Basic      | 50            | 1,000           | 20           | 5,000 chars       |
| Pro        | 200           | 5,000           | 50           | 10,000 chars      |
| Enterprise | 1,000         | 25,000          | 200          | 50,000 chars      |

## Usage Tracking

### Check Usage Limits

```typescript
import { checkUsageLimit } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';

try {
  const usage = await checkUsageLimit(db, 'user123', 'free');
  console.log('Daily remaining:', usage.dailyRemaining);
  console.log('Monthly remaining:', usage.monthlyRemaining);
} catch (error) {
  if (error instanceof UsageLimitError) {
    console.error('Limit exceeded:', error.message);
    console.log('Resets at:', error.resetAt);
  }
}
```

### Increment Usage

```typescript
import { incrementUsage } from '@ainexsuite/ai';

// Atomically increment usage counters
const updatedUsage = await incrementUsage(db, 'user123', 'free');
console.log('New remaining count:', updatedUsage.remaining);
```

### Get Usage Statistics

```typescript
import { getUsageStats } from '@ainexsuite/ai';

const stats = await getUsageStats(db, 'user123');
console.log('Tier:', stats.tier);
console.log('Daily:', stats.daily);
console.log('Monthly:', stats.monthly);
```

## Rate Limiting

### Check Rate Limit

```typescript
import { checkRateLimit } from '@ainexsuite/ai';

try {
  checkRateLimit('user123', 'free'); // 5 requests per hour for free tier
  // Proceed with request
} catch (error) {
  if (error instanceof RateLimitError) {
    console.error('Rate limited:', error.message);
    console.log('Retry after:', error.retryAfter, 'seconds');
  }
}
```

### Get Rate Limit Status

```typescript
import { getRateLimitStatus } from '@ainexsuite/ai';

const status = getRateLimitStatus('user123', 'free');
console.log('Used:', status.used);
console.log('Remaining:', status.remaining);
console.log('Resets at:', status.resetAt);
```

## Streaming Generation

For real-time UI updates:

```typescript
import { generateContentStream } from '@ainexsuite/ai';

const result = await generateContentStream(
  'Write a story',
  'pro',
  process.env.GEMINI_API_KEY,
  (chunk) => {
    // Called for each chunk of text
    console.log('Chunk:', chunk);
    // Update UI progressively
  }
);

console.log('Final text:', result.text);
```

## Batch Processing

Process multiple prompts efficiently:

```typescript
import { generateAIContentBatch } from '@ainexsuite/ai';

const responses = await generateAIContentBatch(
  {
    geminiApiKey: process.env.GEMINI_API_KEY,
    db,
  },
  [
    { userId: 'user1', tier: 'pro', prompt: 'Prompt 1' },
    { userId: 'user1', tier: 'pro', prompt: 'Prompt 2' },
    { userId: 'user1', tier: 'pro', prompt: 'Prompt 3' },
  ],
  {
    maxConcurrent: 3,
    retryOnRateLimit: true,
    retryDelay: 5000,
  }
);

responses.forEach((response, index) => {
  if (response.success) {
    console.log(`Response ${index}:`, response.result.text);
  } else {
    console.error(`Error ${index}:`, response.error);
  }
});
```

## Pre-flight Checks

Check availability before making expensive requests:

```typescript
import { checkAIAvailability } from '@ainexsuite/ai';

const check = await checkAIAvailability(
  { db },
  { userId: 'user123', tier: 'free' }
);

if (check.available) {
  console.log('Ready to generate!');
  console.log('Usage:', check.usage);
  // Show generate button
} else {
  console.warn('Not available:', check.reason);
  // Show upgrade prompt or wait message
}
```

## Utility Functions

### Token Estimation

```typescript
import { estimateTokens } from '@ainexsuite/ai';

const tokenCount = estimateTokens('Your text here');
console.log('Estimated tokens:', tokenCount);
```

### Prompt Validation

```typescript
import { validatePrompt } from '@ainexsuite/ai';

try {
  validatePrompt('Your prompt', 'free');
  // Prompt is valid
} catch (error) {
  console.error('Invalid prompt:', error.message);
}
```

### Prompt Sanitization

```typescript
import { sanitizePrompt } from '@ainexsuite/ai';

const clean = sanitizePrompt('  Too    many    spaces\n\n\n\n');
console.log(clean); // "Too many spaces\n\n"
```

## Error Handling

```typescript
import {
  generateAIContent,
  RateLimitError,
  UsageLimitError,
} from '@ainexsuite/ai';

const response = await generateAIContent(config, options);

if (!response.success) {
  switch (response.error?.type) {
    case 'rate_limit':
      console.error('Rate limited:', response.error.message);
      console.log('Retry after:', response.error.retryAfter);
      break;

    case 'usage_limit':
      console.error('Usage limit:', response.error.message);
      console.log('Resets at:', response.error.resetAt);
      break;

    case 'validation':
      console.error('Validation failed:', response.error.message);
      break;

    case 'generation':
      console.error('Generation failed:', response.error.message);
      break;

    default:
      console.error('Unknown error:', response.error.message);
  }
}
```

## Firestore Schema

The package uses the `ai_usage` collection:

```typescript
interface AIUsageRecord {
  userId: string;
  tier: AITier;
  dailyUsage: number;
  monthlyUsage: number;
  lastResetDaily: string; // YYYY-MM-DD
  lastResetMonthly: string; // YYYY-MM
  updatedAt: number; // Unix timestamp
}
```

### Firestore Indexes

Required indexes for optimal performance:

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

## Environment Variables

```bash
# Required for Gemini
GEMINI_API_KEY=your-gemini-api-key

# Optional for GPT-4o mini fallback
OPENAI_API_KEY=your-openai-api-key
```

## Best Practices

1. **Always use the unified `generateAIContent` function** - It handles all checks automatically
2. **Implement pre-flight checks** - Show users their remaining quota before generation
3. **Handle errors gracefully** - Provide clear user feedback for limits and failures
4. **Use batch processing** - For multiple prompts, use `generateAIContentBatch`
5. **Monitor usage** - Track usage statistics to optimize tier assignments
6. **Sanitize user input** - Always validate and sanitize prompts
7. **Configure fallback** - Provide both Gemini and OpenAI keys for reliability

## API Reference

### Core Functions

- `generateAIContent(config, options)` - Unified AI generation with all checks
- `generateContent(prompt, tier, geminiKey, openaiKey?)` - Direct generation
- `generateContentStream(prompt, tier, apiKey, onChunk)` - Streaming generation

### Usage Tracking

- `checkUsageLimit(db, userId, tier)` - Check limits without incrementing
- `incrementUsage(db, userId, tier)` - Atomically increment usage
- `getUsageStatus(db, userId, tier)` - Get current usage status
- `getUsageStats(db, userId)` - Detailed usage statistics

### Rate Limiting

- `checkRateLimit(userId, tier)` - Check and enforce rate limits
- `getRateLimitStatus(userId, tier)` - Get rate limit status
- `canMakeRequest(userId, tier)` - Pre-check without recording

### Utilities

- `estimateTokens(text)` - Estimate token count
- `validatePrompt(prompt, tier)` - Validate prompt
- `sanitizePrompt(prompt)` - Clean prompt text
- `getUsageLimits(tier)` - Get limits for tier

## TypeScript Types

```typescript
import type {
  AITier,
  AIProvider,
  AIGenerationResult,
  AIUsageLimits,
  AIUsageRecord,
  AIUsageCheck,
  RateLimitError,
  UsageLimitError,
} from '@ainexsuite/types';
```

## License

Part of AinexSuite monorepo.
