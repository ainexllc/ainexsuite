# OpenRouter Setup Guide

The Pulse app includes AI-powered background image generation using OpenRouter's image generation models.

## Getting Started

### 1. Get Your OpenRouter API Key

1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Create a new account or log in
3. Generate an API key
4. Copy the key (format: `sk-or-v1-...`)

### 2. Local Development Setup

Add your API key to `.env.local`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_API_URL=https://openrouter.ai/api/v1
```

Then restart the dev server:
```bash
npm run dev
```

### 3. Production Setup (Vercel)

Add environment variables via Vercel CLI or Dashboard:

```bash
# Via Vercel CLI
vercel env add OPENROUTER_API_KEY
vercel env add OPENROUTER_API_URL

# Enter values:
# OPENROUTER_API_KEY: sk-or-v1-...
# OPENROUTER_API_URL: https://openrouter.ai/api/v1
```

Or via [Vercel Dashboard](https://vercel.com):
1. Go to your project settings
2. Select "Environment Variables"
3. Add `OPENROUTER_API_KEY` and `OPENROUTER_API_URL`

### 4. Verify It Works

Test the image generation feature:
1. Navigate to the Pulse app
2. Click the "Customize" button (+ icon)
3. Go to the "BG" (Background) tab
4. Enter a prompt in the "AI Generator" section
5. Click "Generate Background"

## Available Models

The API uses `google/gemini-3-pro-image-preview` for image generation, which supports:
- Style descriptions (cyberpunk, watercolor, oil painting, etc.)
- Subject specifications (landscape, portrait, product, etc.)
- Detailed prompts for precise image generation

Example prompts:
- "Cyberpunk city at night with neon lights"
- "Peaceful zen garden with cherry blossoms"
- "Mountain landscape at sunset"
- "Abstract colorful waves"

## Pricing

OpenRouter models are typically cheaper than using APIs directly:
- Check current pricing at [https://openrouter.ai/models](https://openrouter.ai/models)
- Search for "Stable Diffusion" to see cost per generation
- Typical cost: $0.001-0.01 per image

## Troubleshooting

### 400 Bad Request
- Verify your API key is correct
- Check that the prompt is not empty
- Ensure `OPENROUTER_API_URL` is set correctly

### 401 Unauthorized
- Your API key may be invalid or expired
- Generate a new key at https://openrouter.ai/keys
- Re-add it to environment variables

### 500 Internal Server Error
- The `OPENROUTER_API_KEY` environment variable is not set
- For local dev: add it to `.env.local`
- For production: add it to Vercel environment variables

## Technical Details

**API Endpoint**: `POST /api/ai/generate-image`

**Request Format**:
```json
{
  "prompt": "Your image description"
}
```

**Response Format**:
```json
{
  "imageUrl": "https://..."
}
```

**Models Used**:
- `google/gemini-3-pro-image-preview` (current)

For more info on available models, visit: https://openrouter.ai/models?supported_parameters=vision
