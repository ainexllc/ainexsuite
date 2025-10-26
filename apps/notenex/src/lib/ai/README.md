# Grok AI Integration Library

This library provides seamless integration with xAI's Grok API (using the `grok-beta` model) for your Next.js application.

## Features

- **Full Grok API Support**: Complete integration with xAI's Grok API
- **Streaming & Non-Streaming**: Support for both streaming and regular responses
- **Helper Functions**: Pre-built functions for common AI tasks
- **Type-Safe**: Full TypeScript support with comprehensive types
- **Easy to Use**: Simple, intuitive API with sensible defaults
- **Production Ready**: Error handling, singleton pattern, environment validation

## Setup

### 1. Environment Configuration

The Grok API key is already configured in your `.env.local`:

```env
XAI_API_KEY=your-api-key-here
```

### 2. Import and Use

```typescript
import { getGrokClient, generateText, summarizeText } from '@/lib/ai';
```

## Usage Examples

### Basic Chat

```typescript
import { getGrokClient } from '@/lib/ai';

const client = getGrokClient();

// Simple question
const answer = await client.ask("What is artificial intelligence?");

// With system prompt
const answer = await client.ask(
  "Explain quantum computing",
  "You are a physics professor explaining complex topics to students."
);
```

### Streaming Responses

```typescript
import { getGrokClient } from '@/lib/ai';

const client = getGrokClient();

for await (const chunk of client.createStreamingCompletion({
  messages: [
    { role: "user", content: "Write a short story about AI" }
  ]
})) {
  process.stdout.write(chunk);
}
```

### Advanced Conversation

```typescript
import { getGrokClient, type GrokMessage } from '@/lib/ai';

const client = getGrokClient();

const messages: GrokMessage[] = [
  { role: "system", content: "You are a helpful coding assistant." },
  { role: "user", content: "How do I sort an array in JavaScript?" },
  { role: "assistant", content: "You can use the .sort() method..." },
  { role: "user", content: "Can you show me an example?" }
];

const response = await client.createCompletion({
  messages,
  temperature: 0.7,
  maxTokens: 500
});

console.log(response.choices[0].message.content);
```

## Helper Functions

### Text Summarization

```typescript
import { summarizeText } from '@/lib/ai';

const summary = await summarizeText({
  text: longArticle,
  maxLength: 200,
  style: "bullet-points" // or "brief" or "detailed"
});
```

### Content Enhancement

```typescript
import { enhanceContent } from '@/lib/ai';

const improved = await enhanceContent({
  text: draftText,
  task: "improve", // or "simplify", "expand", "rewrite"
  tone: "professional" // or "casual", "friendly", "formal"
});
```

### Question Answering

```typescript
import { answerQuestion } from '@/lib/ai';

const answer = await answerQuestion({
  question: "What are the key features?",
  context: documentText,
  conversationHistory: previousMessages // optional
});
```

### Generate Suggestions

```typescript
import { generateSuggestions } from '@/lib/ai';

const suggestions = await generateSuggestions(
  "User wants to improve productivity",
  5
);
// Returns: ["suggestion1", "suggestion2", ...]
```

### Sentiment Analysis

```typescript
import { analyzeSentiment } from '@/lib/ai';

const result = await analyzeSentiment("I love this product!");
// Returns: { sentiment: "positive", confidence: 0.95, explanation: "..." }
```

### Extract Key Information

```typescript
import { extractKeyInfo } from '@/lib/ai';

const keywords = await extractKeyInfo(text, "keywords");
const entities = await extractKeyInfo(text, "entities");
const dates = await extractKeyInfo(text, "dates");
```

### Translation

```typescript
import { translateText } from '@/lib/ai';

const translated = await translateText(
  "Hello, how are you?",
  "Spanish"
);
```

### Grammar Check

```typescript
import { checkGrammar } from '@/lib/ai';

const result = await checkGrammar("I has went to the store");
// Returns: {
//   correctedText: "I have gone to the store",
//   corrections: [{ original: "has went", corrected: "have gone", ... }]
// }
```

### Creative Content Generation

```typescript
import { generateCreativeContent } from '@/lib/ai';

const story = await generateCreativeContent(
  "A robot learning to love",
  "story"
);

const poem = await generateCreativeContent(
  "The beauty of nature",
  "poem"
);

const code = await generateCreativeContent(
  "A function to validate email addresses",
  "code"
);
```

## API Routes

Pre-built API routes are available for client-side use:

### Chat Endpoint

```typescript
// POST /api/ai/chat
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "Hello!" }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.message);
```

### Summarize Endpoint

```typescript
// POST /api/ai/summarize
const response = await fetch('/api/ai/summarize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: longText,
    style: "brief"
  })
});

const { summary } = await response.json();
```

### Enhance Endpoint

```typescript
// POST /api/ai/enhance
const response = await fetch('/api/ai/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: draftText,
    task: "improve",
    tone: "professional"
  })
});

const { enhanced } = await response.json();
```

### Suggestions Endpoint

```typescript
// POST /api/ai/suggestions
const response = await fetch('/api/ai/suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    context: "User needs help with task management",
    count: 5
  })
});

const { suggestions } = await response.json();
```

## Model Configuration

The library uses the **`grok-beta`** model by default, which provides:
- Fast response times
- High-quality outputs
- Cost-effective pricing
- Excellent for general-purpose tasks

### Customizing Parameters

```typescript
const response = await client.createCompletion({
  messages: [...],
  temperature: 0.7,        // Creativity (0-2)
  maxTokens: 1000,         // Response length
  topP: 1,                 // Nucleus sampling
  frequencyPenalty: 0,     // Reduce repetition
  presencePenalty: 0       // Encourage new topics
});
```

## Error Handling

All functions include comprehensive error handling:

```typescript
try {
  const result = await generateText({ prompt: "..." });
} catch (error) {
  if (error instanceof Error) {
    console.error('AI Error:', error.message);
  }
}
```

## Best Practices

1. **Use System Prompts**: Guide the AI's behavior and expertise
2. **Set Appropriate Temperatures**: Lower (0.3-0.7) for factual, higher (0.7-1.5) for creative
3. **Manage Token Limits**: Balance response quality with cost
4. **Handle Errors Gracefully**: Always wrap AI calls in try-catch
5. **Cache Results**: Store frequently requested responses
6. **Rate Limiting**: Implement rate limits for public endpoints
7. **Monitor Usage**: Track token usage and costs

## Architecture

```
src/lib/ai/
├── index.ts           # Main exports
├── grok-client.ts     # Core Grok API client
├── helpers.ts         # Helper functions
└── README.md          # This file

src/app/api/ai/
├── chat/route.ts      # Chat endpoint
├── summarize/route.ts # Summarization endpoint
├── enhance/route.ts   # Content enhancement endpoint
└── suggestions/route.ts # Suggestions endpoint
```

## License

This library is part of your application and uses xAI's Grok API under their terms of service.
