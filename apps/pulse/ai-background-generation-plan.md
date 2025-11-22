# Plan: AI Background Generation with Gemini 3 Pro

## Goal
Enable users to generate custom background images for their Pulse workspace clock using the Google Gemini 3 Pro Image Preview model via OpenRouter.

## User Requirements
- Use OpenRouter API Key: `sk-or-v1...` (Securely stored).
- Model: `google/gemini-3-pro-image-preview`.
- Feature: Allow users to input a prompt and generate a background.
- Integration: accessible from the "Backgrounds" tab in the Customize Tray.

## Implementation Steps

### 1. Environment Setup
- Create or update `.env.local` to store the OpenRouter API Key securely.
  - `OPENROUTER_API_KEY=sk-or-v1...`
  - `OPENROUTER_API_URL=https://openrouter.ai/api/v1`

### 2. Backend API Route (`src/app/api/ai/generate-image/route.ts`)
- Create a new API endpoint to handle the image generation request securely on the server.
- **Logic**:
  - Accept `prompt` from the request body.
  - Construct the request to OpenRouter with:
    - Model: `google/gemini-3-pro-image-preview`
    - Messages: `[{ role: 'user', content: [{ type: 'text', text: prompt }] }]` (or appropriate format for multimodal generation if needed, usually standard chat format works for these models with specific instructions or just the text prompt).
    - **Crucial**: Set `modalities: ["image"]` (or `["text", "image"]`) in the request parameters to trigger image generation.
  - Extract the image data (base64 or URL) from the response.
  - Return the image data to the frontend.

### 3. Frontend UI Updates (`src/components/tiles/tile-tray.tsx`)
- **Modify Backgrounds Tab**:
  - Add a new "AI Generator" section at the top of the "Backgrounds" tab.
  - **Components**:
    - `TextArea` or `Input` for the user's prompt (e.g., "A futuristic cyberpunk city").
    - `Button` labeled "Generate" (disabled while loading).
    - `LoadingOverlay` or spinner during generation.
    - **Preview Area**: Display the generated image once available.
    - `Button` labeled "Set as Background" to apply the generated image.
    - `Button` labeled "Save to Favorites" (Optional for future, but "Set" is primary).

### 4. State Management & Persistence
- The generated image will likely be returned as a Base64 string or a temporary URL.
- When the user clicks "Set as Background":
  - Update the `backgroundImage` state in `DigitalClock`.
  - **Persistence**: The existing `ClockService` saves the `backgroundImage` string to Firestore. Base64 strings can be large, but for a single user setting, it might be acceptable for now. *Note: If Firestore document size limits become an issue, we might need to upload to Firebase Storage, but for this iteration, we will try direct string storage first.*

### 5. Verification
- Test with a sample prompt.
- Verify the image displays correctly on the clock.
- Verify the image persists after page reload (via Firestore).

## Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Next.js App Router API
- **AI**: OpenRouter (Gemini 3 Pro Image Preview)

