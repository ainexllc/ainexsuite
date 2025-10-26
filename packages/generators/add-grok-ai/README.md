# @ainexsuite/add-grok-ai

Grok AI Integration Agent - Add AI assistant capabilities to existing AINexSuite apps.

## Overview

This tool automatically integrates Grok 4 AI assistant into existing Next.js apps in the AINexSuite monorepo. It adds:

- ✅ Floating AI chat button
- ✅ Chat panel with streaming responses
- ✅ App-specific context integration
- ✅ Grok 4 (grok-beta) model
- ✅ Customizable system prompts

## Installation

From the monorepo root:

```bash
cd packages/generators/add-grok-ai
npm install
npm link
```

## Usage

### Basic Integration

```bash
add-grok-ai notes
```

Adds AI assistant to the notes app with default settings.

### With Custom System Prompt

```bash
add-grok-ai journal --system-prompt "You are a thoughtful journaling assistant. Help users reflect on their day and track their mood."
```

### Options

| Option | Description | Default |
|--------|-------------|---------|
| `<app-name>` | App to add AI to (must exist in `apps/`) | Required |
| `--system-prompt <prompt>` | Custom system prompt for the AI | Auto-generated |
| `--skip-install` | Skip npm install | `false` |

## What It Does

1. **Updates package.json**
   - Adds `@ainexsuite/ai` package
   - Adds `lucide-react` for icons

2. **Creates AI components**
   ```
   src/components/ai/
   ├── ai-assistant-panel.tsx
   └── system-prompt.ts (if custom prompt provided)
   ```

3. **Updates page.tsx**
   - Adds AI panel import
   - Includes `<AIAssistantPanel />` in the page

4. **Installs dependencies**
   - Runs `npm install` (unless `--skip-install`)

## Generated AI Assistant Panel

The AI assistant panel includes:

### Features
- Floating button (bottom-right corner)
- Slide-out chat panel
- Streaming message responses
- Loading indicators
- Message history
- Auto-scroll to latest message

### Customization

After generation, you can customize:

**System Prompt** (`src/components/ai/system-prompt.ts`):
```typescript
export const SYSTEM_PROMPT = `
You are the AI assistant for the ${appName} app.
You help users with:
- Feature-specific tasks
- Data organization
- Productivity tips
- Answering questions

Current user context: {{user data}}
`;
```

**UI Styling** (`ai-assistant-panel.tsx`):
- Colors and theme
- Panel size and position
- Animation effects
- Message formatting

**App Context Integration**:
```typescript
const { messages, sendMessage, loading } = useGrokAssistant("app-name", {
  context: {
    userId: user.uid,
    recentNotes: userNotes.slice(0, 5),
    preferences: userPreferences
  }
});
```

## Example: Notes App with AI

```bash
add-grok-ai notes --system-prompt "You are a note-taking assistant. Help users organize ideas, generate titles, and categorize notes."
```

**Generated files:**
```
apps/notes/
└── src/
    └── components/
        └── ai/
            ├── ai-assistant-panel.tsx
            └── system-prompt.ts
```

**Updated page.tsx**:
```tsx
import { AIAssistantPanel } from "@/components/ai/ai-assistant-panel";

export default function NotesPage() {
  return (
    <>
      <Container>
        {/* Main content */}
      </Container>

      <AIAssistantPanel />
    </>
  );
}
```

## App-Specific AI Contexts

Different apps can have different AI behaviors:

### Notes App
- Suggest titles and tags
- Organize notes by topic
- Generate summaries
- Find related notes

### Journal App
- Provide writing prompts
- Analyze mood patterns
- Suggest reflection questions
- Track emotional trends

### Todo App
- Break down large tasks
- Estimate time requirements
- Suggest priorities
- Generate task lists from goals

### Track App (Habits)
- Analyze habit streaks
- Provide motivation
- Suggest habit stacking
- Identify patterns

### Moments App (Photos)
- Generate captions
- Organize by events
- Suggest tags
- Create memory prompts

### Grow App (Learning)
- Recommend learning paths
- Generate quizzes
- Suggest resources
- Track skill progress

### Pulse App (Health)
- Analyze health trends
- Suggest correlations
- Provide insights
- Track wellness patterns

### Fit App (Fitness)
- Generate workouts
- Provide form tips
- Suggest progressions
- Track PRs and gains

## Architecture

The AI integration uses:

1. **`@ainexsuite/ai` package** - Shared AI utilities
   - `useGrokAssistant` hook
   - Streaming response handler
   - Message state management

2. **Firebase Cloud Functions** - Backend
   - `chatWithGrok` function
   - Handles API key security
   - Manages streaming responses

3. **Grok 4 (grok-beta)** - AI model
   - 128k context window
   - Excellent reasoning
   - Fast streaming responses

## Troubleshooting

### App not found

Error: `❌ App "notes" not found`

**Solution:** Ensure the app exists in `apps/` directory

### AI already integrated

Warning: `⚠️ AI assistant already exists`

**Solution:** Choose to overwrite or cancel

### Package installation fails

**Solution:** Run manually:
```bash
cd apps/<app-name>
npm install
```

### AI panel not appearing

**Check:**
1. `<AIAssistantPanel />` is in page.tsx
2. Import statement is correct
3. Component is inside a client component
4. No z-index conflicts

## Development

Test the AI assistant locally:

```bash
cd apps/<app-name>
npm run dev
```

Click the floating AI button (bottom-right) to open the chat panel.

## Contributing

When updating the AI integration:

1. Update template in `templates/ai-assistant-panel.tsx`
2. Test with multiple apps
3. Verify streaming responses work
4. Update this README

## License

MIT

---

**Created by**: AINex LLC
**Part of**: AINexSuite Productivity Suite
**Powered by**: Grok 4 by xAI
