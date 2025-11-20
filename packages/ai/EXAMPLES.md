# AI Integration Examples

Complete examples showing how to integrate AI features into AinexSuite apps.

## Table of Contents

- [Next.js API Route](#nextjs-api-route)
- [React Component](#react-component)
- [Server Actions (Next.js 15)](#server-actions-nextjs-15)
- [Admin Dashboard](#admin-dashboard)
- [Batch Processing](#batch-processing)

## Next.js API Route

### Basic AI Generation Endpoint

```typescript
// app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateAIContent } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { prompt, tier = 'free' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate content
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
          retryAfter: response.error?.retryAfter,
        },
        { status: 429 }
      );
    }

    return NextResponse.json({
      text: response.result?.text,
      provider: response.result?.provider,
      model: response.result?.model,
      tokens: {
        input: response.result?.inputTokens,
        output: response.result?.outputTokens,
      },
      usage: response.usage,
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Streaming AI Generation

```typescript
// app/api/ai/stream/route.ts
import { NextRequest } from 'next/server';
import { generateContentStream } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';
import { getServerSession } from 'next-auth';
import { checkRateLimit } from '@ainexsuite/ai';
import { checkUsageLimit, incrementUsage } from '@ainexsuite/ai';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { prompt, tier = 'free' } = await request.json();

  try {
    // Pre-flight checks
    checkRateLimit(session.user.id, tier);
    await checkUsageLimit(db, session.user.id, tier);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await generateContentStream(
            prompt,
            tier,
            process.env.GEMINI_API_KEY!,
            (chunk) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            }
          );

          // Increment usage after successful generation
          await incrementUsage(db, session.user.id, tier);

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

## React Component

### AI Text Generator Component

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@ainexsuite/ui';
import { RateLimitError, UsageLimitError } from '@ainexsuite/types';

export function AITextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    dailyRemaining: number;
    monthlyRemaining: number;
  } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tier: 'free' }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate content');
        return;
      }

      setResult(data.text);
      setUsage(data.usage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={4}
          placeholder="Enter your prompt..."
        />
      </div>

      {usage && (
        <div className="text-sm text-gray-600">
          Remaining: {usage.dailyRemaining} daily, {usage.monthlyRemaining} monthly
        </div>
      )}

      <Button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? 'Generating...' : 'Generate'}
      </Button>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
```

### Streaming AI Component

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@ainexsuite/ui';

export function AIStreamingGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [streaming, setStreaming] = useState(false);

  const handleStream = async () => {
    setStreaming(true);
    setResult('');

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setStreaming(false);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                setResult((prev) => prev + parsed.chunk);
              } else if (parsed.error) {
                console.error('Streaming error:', parsed.error);
                setStreaming(false);
                return;
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-3 border rounded-lg"
        rows={4}
        placeholder="Enter your prompt..."
      />

      <Button onClick={handleStream} disabled={streaming || !prompt}>
        {streaming ? 'Streaming...' : 'Generate with Streaming'}
      </Button>

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
```

## Server Actions (Next.js 15)

```typescript
'use server';

import { generateAIContent, checkAIAvailability } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';
import { getServerSession } from 'next-auth';

export async function generateText(prompt: string, tier: 'free' | 'basic' | 'pro') {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

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
    throw new Error(response.error?.message || 'Generation failed');
  }

  return {
    text: response.result?.text,
    usage: response.usage,
  };
}

export async function checkQuota(tier: 'free' | 'basic' | 'pro') {
  const session = await getServerSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return checkAIAvailability(
    { db },
    { userId: session.user.id, tier }
  );
}
```

## Admin Dashboard

### Usage Statistics Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getUsageStats } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';

export function UserUsageStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getUsageStats(db, userId);
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!stats) return <div>No usage data</div>;

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="font-semibold mb-2">Tier: {stats.tier}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Daily Usage</h4>
            <p className="text-2xl font-bold">
              {stats.daily.used} / {stats.daily.limit}
            </p>
            <p className="text-sm text-gray-500">
              Remaining: {stats.daily.remaining}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Monthly Usage</h4>
            <p className="text-2xl font-bold">
              {stats.monthly.used} / {stats.monthly.limit}
            </p>
            <p className="text-sm text-gray-500">
              Remaining: {stats.monthly.remaining}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Batch Processing

### Process Multiple Prompts

```typescript
import { generateAIContentBatch } from '@ainexsuite/ai';
import { db } from '@ainexsuite/firebase';

async function processPrompts(userId: string, prompts: string[]) {
  const requests = prompts.map((prompt) => ({
    userId,
    tier: 'pro' as const,
    prompt,
  }));

  const responses = await generateAIContentBatch(
    {
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      db,
    },
    requests,
    {
      maxConcurrent: 5,
      retryOnRateLimit: true,
      retryDelay: 5000,
    }
  );

  return responses.map((response, index) => ({
    prompt: prompts[index],
    success: response.success,
    text: response.result?.text,
    error: response.error?.message,
  }));
}
```

## Environment Setup

```bash
# .env.local
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key # Optional fallback
```

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@ainexsuite/ai": ["../../packages/ai/src"],
      "@ainexsuite/types": ["../../packages/types/src"],
      "@ainexsuite/firebase": ["../../packages/firebase/src"]
    }
  }
}
```
