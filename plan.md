# Plan: Migrate Animated Avatar Generation from Runway to fal.ai Kling 1.0

## Overview

Replace the current Runway Gen-4 Turbo API integration with fal.ai's Kling 1.0 model for animated avatar generation. The new implementation will use **first frame and last frame** (same image) for more controlled video generation.

**User Request**: "we need to change our image to video generation, this time we want to use first frame and end/last frame (same image) using fal.ai api key 1aa542bb-313c-48ad-8bed-ccb1f20d0c33:0436c8a2e4cf071bcf8845e75c1709bd using kling 01 model"

---

## Current State (Runway API)

### API Endpoint

- **POST** `/api/animate-avatar`
  - Model: Runway Veo 3.1 (`veo3.1`)
  - Endpoint: `https://api.dev.runwayml.com/v1/image_to_video`
  - Auth: `Bearer ${RUNWAY_API_KEY}`
  - Duration: 4 seconds, 1280x720
  - Input: `promptImage` (first frame only) + `promptText`
  - Returns: `{ success, pending, operationId }`

- **GET** `/api/animate-avatar?operationId=...`
  - Endpoint: `https://api.dev.runwayml.com/v1/tasks/{taskId}`
  - Polls every 2 seconds
  - Returns: `{ success, done, videoUrl }` or `{ success, done: false, status, progress }`

### Key Files

- `apps/habits/src/app/api/animate-avatar/route.ts` (and 12+ other apps)
- `packages/ui/src/components/settings/animate-avatar-modal.tsx`
- `packages/firebase/src/animated-avatars.ts`
- `packages/auth/src/context.tsx`

### Current Workflow

```
User clicks "Animate" → Modal opens → Select action → Generate
    ↓
POST /api/animate-avatar
├─ Convert image to base64
├─ Correct aspect ratio (max 2:1)
├─ Build prompt from action
└─ Call Runway API → Returns operationId
    ↓
Poll GET /api/animate-avatar?operationId=...
├─ Every 2 seconds
└─ Returns videoUrl when done
    ↓
Save to Firebase Storage → Update Firestore
```

---

## New State (fal.ai Kling 1.0)

### API Integration

**Model Endpoint**: `fal-ai/kling-video/v1/standard/image-to-video`

**Key Features**:

- ✅ **First frame + Last frame support** (via `image_url` + `tail_image_url`)
- ✅ Duration: 5 or 10 seconds
- ✅ Built-in polling with `fal.subscribe()` method
- ✅ CFG scale for prompt adherence control
- ✅ Negative prompts support

**API Parameters**:

```typescript
{
  prompt: string;           // Video generation prompt
  image_url: string;        // First frame (user's avatar)
  tail_image_url?: string;  // Last frame (same as first for loop-like effect)
  duration?: "5" | "10";    // Video duration in seconds
  negative_prompt?: string; // Things to avoid
  cfg_scale?: number;       // 0-1, default 0.5
}
```

**Response Format**:

```typescript
{
  video: {
    url: string; // Direct MP4 URL
  }
}
```

### Authentication

- Environment variable: `FAL_KEY=1aa542bb-313c-48ad-8bed-ccb1f20d0c33:0436c8a2e4cf071bcf8845e75c1709bd`
- Uses `@fal-ai/client` npm package
- No manual polling needed (handled by SDK)

---

## Implementation Plan

### Step 1: Install fal.ai Client Library

**File**: Root `package.json`

```bash
pnpm add @fal-ai/client
```

Add to workspace packages that need it (habits app for now):

```json
{
  "dependencies": {
    "@fal-ai/client": "^1.3.0"
  }
}
```

### Step 2: Add Environment Variable

**File**: `.env`

```env
# fal.ai API Key for Kling 1.0 video generation
FAL_KEY=1aa542bb-313c-48ad-8bed-ccb1f20d0c33:0436c8a2e4cf071bcf8845e75c1709bd
```

**Also add to**:

- `.env.local` (development)
- Vercel environment variables (production)

### Step 3: Update API Route

**File**: `apps/habits/src/app/api/animate-avatar/route.ts`

#### 3a. Replace Imports and Configuration

**Before**:

```typescript
import sharp from "sharp";

const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY || "";
const RUNWAY_BASE_URL = "https://api.dev.runwayml.com/v1";
const RUNWAY_API_VERSION = "2024-11-06";
```

**After**:

```typescript
import { fal } from "@fal-ai/client";
import sharp from "sharp";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY || "",
});

const FAL_MODEL = "fal-ai/kling-video/v1/standard/image-to-video";
```

#### 3b. Update POST Handler

**Before** (lines 140-241):

```typescript
// Calls Runway Veo 3.1 API
const response = await fetch(`${RUNWAY_BASE_URL}/image_to_video`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${RUNWAY_API_KEY}`,
    "X-Runway-Version": RUNWAY_API_VERSION,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "veo3.1",
    promptImage: [
      {
        uri: promptImageUri,
        position: "first",
      },
    ],
    promptText: promptText,
    ratio: "1280:720",
    duration: 4,
  }),
});
```

**After**:

```typescript
// Call fal.ai Kling 1.0 with first + last frame
const result = await fal.subscribe(FAL_MODEL, {
  input: {
    prompt: promptText,
    image_url: promptImageUri, // First frame
    tail_image_url: promptImageUri, // Last frame (same image for loop effect)
    duration: "5", // 5 seconds
    negative_prompt: "blur, distortion, low quality, artifacts, watermark",
    cfg_scale: 0.6, // Slightly higher adherence to prompt
  },
  logs: true,
  onQueueUpdate: (update) => {
    // Optional: could add progress tracking here
    console.log("[fal.ai] Queue update:", update.status);
  },
});

// Extract video URL from result
const videoUrl = result.data?.video?.url;

if (!videoUrl) {
  return NextResponse.json(
    { success: false, error: "No video URL in response", details: result },
    { status: 422 },
  );
}

// Convert video URL to base64 for Firebase upload
const videoResponse = await fetch(videoUrl);
if (!videoResponse.ok) {
  throw new Error(`Failed to fetch generated video: ${videoResponse.status}`);
}

const videoBlob = await videoResponse.blob();
const videoArrayBuffer = await videoBlob.arrayBuffer();
const videoBase64 = Buffer.from(videoArrayBuffer).toString("base64");
const videoDataUri = `data:video/mp4;base64,${videoBase64}`;

// Return immediately with video data (no polling needed)
return NextResponse.json({
  success: true,
  videoData: videoDataUri, // Changed from pending: true, operationId
  model: "kling-1.0",
  provider: "fal.ai",
  action: avatarAction,
});
```

#### 3c. Update/Remove GET Handler (Polling)

**Option A: Keep for backward compatibility** (return immediate response):

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("operationId") || searchParams.get("taskId");

  // Since fal.ai handles polling internally, we don't need this endpoint
  // But keeping it for backward compatibility - return "not supported"
  return NextResponse.json(
    {
      success: false,
      error: "Polling not needed with fal.ai - video is returned immediately",
    },
    { status: 400 },
  );
}
```

**Option B: Remove entirely** (breaking change, requires frontend updates)

### Step 4: Update Frontend Modal

**File**: `packages/ui/src/components/settings/animate-avatar-modal.tsx`

Since fal.ai's `subscribe()` method handles polling internally and returns the final result, we can simplify the modal:

**Changes to `handleGenerate` function** (lines 140-194):

```typescript
const handleGenerate = async () => {
  setLoading(true);
  setError(null);
  setGeneratedVideo(null);
  setProgress("Starting animation generation...");

  try {
    const result = await onGenerate(selectedAction);

    // With fal.ai, video is returned immediately (no polling)
    if (result.success && result.videoData) {
      setGeneratedVideo(result.videoData);
      setLoading(false);
      setProgress(null);
    } else if (result.pending && result.operationId) {
      // Backward compatibility: still support old polling pattern
      setProgress("Generating animation... This may take 10-30 seconds");
      await pollOperation(result.operationId);
    } else {
      throw new Error(result.error || "Failed to generate animation");
    }
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to generate animation",
    );
    setLoading(false);
    setProgress(null);
  }
};
```

### Step 5: Update Auth Context

**File**: `packages/auth/src/context.tsx`

The `generateAnimatedAvatar` function needs minimal changes since it just calls the API:

```typescript
generateAnimatedAvatar: async (action: string) => {
  try {
    const response = await fetch("/api/animate-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceImage: user.photoURL,
        action,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Failed to generate animated avatar",
      };
    }

    // With fal.ai, videoData is returned immediately
    return {
      success: true,
      videoData: data.videoData,
      // Still support old polling pattern for backward compatibility
      pending: data.pending,
      operationId: data.operationId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
};
```

The `pollAnimationStatus` function can remain for backward compatibility but won't be used with fal.ai.

### Step 6: Update Action Prompts for Kling 1.0

**File**: `apps/habits/src/app/api/animate-avatar/route.ts`

Kling 1.0 may benefit from slightly different prompt wording. Update `ACTION_PROMPTS`:

**Before**:

```typescript
const ACTION_PROMPTS: Record<AvatarAction, string> = {
  wave: "The person raises their right hand and waves it side to side in a friendly hello gesture, then lowers hand back to starting position.",
  // ... other actions
};
```

**After** (optimize for Kling 1.0 with first+last frame):

```typescript
const ACTION_PROMPTS: Record<AvatarAction, string> = {
  wave: "A person energetically waves their hand side to side with a warm smile, moving smoothly from neutral to waving and back.",
  wink: "A person playfully winks with their right eye while maintaining a friendly smile.",
  thumbsup:
    "A person raises their hand showing an enthusiastic thumbs up gesture.",
  peace: "A person displays a V peace sign with a cool, confident smile.",
  dance: "A person bobs their head and sways their body rhythmically to music.",
  laugh:
    "A person laughs joyfully with natural facial expressions and shoulder movement.",
  nod: "A person nods their head up and down in agreement with a friendly expression.",
  blowkiss:
    "A person brings their hand to their lips and blows a sweet kiss forward.",
  shrug:
    "A person performs a casual shrug with raised shoulders and open palms.",
  clap: "A person claps their hands together enthusiastically with joy.",
  salute: "A person performs a crisp military salute with confidence.",
  flex: "A person flexes both arms proudly showing strength.",
};
```

**Negative prompt** (consistent across all):

```typescript
const NEGATIVE_PROMPT =
  "blur, distortion, low quality, artifacts, watermark, static image, no movement, frozen";
```

### Step 7: Replicate Across All Apps

The following apps need the same `apps/*/src/app/api/animate-avatar/route.ts` updates:

- ✅ habits
- main
- notes
- journal
- todo
- health
- album
- fit
- projects
- workflow
- calendar
- display

**Strategy**:

1. Update habits app first (test thoroughly)
2. Copy the working implementation to all other apps
3. Ensure `.env` has `FAL_KEY` in all deployment environments

### Step 8: Update Firebase Storage Metadata

**File**: `packages/firebase/src/animated-avatars.ts`

Update metadata to reflect new provider:

```typescript
const metadata = {
  contentType: "video/mp4",
  customMetadata: {
    userId,
    action,
    generatedAt: new Date().toISOString(),
    provider: "fal.ai", // Changed from 'runway'
    model: "kling-1.0", // Changed from 'veo3.1'
    optimized: optimized ? "true" : "false",
  },
};
```

---

## Migration Strategy

### Phase 1: Development Environment (30 min)

1. Add `@fal-ai/client` package
2. Add `FAL_KEY` to `.env.local`
3. Update `apps/habits/src/app/api/animate-avatar/route.ts`
4. Test in habits app locally
5. Verify video generation works end-to-end

### Phase 2: Frontend Compatibility (15 min)

6. Update modal to handle immediate response (no polling)
7. Keep backward compatibility with old polling pattern
8. Test in browser with hard refresh

### Phase 3: Replicate to All Apps (30 min)

9. Copy working route to all 12+ apps
10. Verify each app has identical implementation
11. Test spot-check in 2-3 different apps

### Phase 4: Production Deployment (15 min)

12. Add `FAL_KEY` to Vercel environment variables
13. Deploy to staging
14. Test on staging
15. Deploy to production
16. Monitor for errors

**Total estimated time**: ~1.5 hours

---

## Key Differences: Runway vs fal.ai

| Feature          | Runway Veo 3.1        | fal.ai Kling 1.0          |
| ---------------- | --------------------- | ------------------------- |
| **First frame**  | ✅ Via `promptImage`  | ✅ Via `image_url`        |
| **Last frame**   | ❌ Not supported      | ✅ Via `tail_image_url`   |
| **Duration**     | 4 seconds fixed       | 5 or 10 seconds           |
| **Aspect ratio** | 1280x720 fixed        | Determined by input image |
| **Polling**      | Manual (GET endpoint) | Built-in via SDK          |
| **Response**     | Async (operationId)   | Immediate (videoData)     |
| **Setup**        | API key               | API key + npm package     |
| **Cost**         | Variable              | Variable                  |

---

## Advantages of fal.ai Kling 1.0

1. **First + Last Frame Control**: Using same image ensures smooth loop
2. **Simpler Integration**: No manual polling loop needed
3. **Better SDK**: `@fal-ai/client` handles retries, status updates
4. **Flexible Duration**: Can choose 5s or 10s
5. **Negative Prompts**: Better control over unwanted artifacts
6. **CFG Scale**: Fine-tune prompt adherence

---

## Risks & Mitigations

**Risk 1: Breaking existing implementations**

- **Mitigation**: Keep backward compatibility in modal for polling pattern
- **Test**: Thoroughly test in habits app before replicating

**Risk 2: Video quality differences**

- **Mitigation**: Test with sample avatars, adjust prompts if needed
- **Fallback**: Can adjust `cfg_scale` or negative prompts

**Risk 3: API rate limits or costs**

- **Mitigation**: Monitor usage in first week
- **Fallback**: Can switch back to Runway if needed (keep old code commented)

**Risk 4: Different aspect ratios**

- **Mitigation**: Test with various avatar sizes
- **Fallback**: Pre-process images to consistent aspect ratio if needed

---

## Testing Checklist

### Local Testing

- [ ] Install `@fal-ai/client` package
- [ ] Add `FAL_KEY` to `.env.local`
- [ ] Generate video with "wave" action
- [ ] Generate video with "wink" action
- [ ] Verify video loops smoothly (first frame = last frame)
- [ ] Check video quality
- [ ] Verify Firebase upload works
- [ ] Test in Family Dashboard display

### Integration Testing

- [ ] Modal opens correctly
- [ ] All 12 actions work
- [ ] Progress feedback shows
- [ ] Success notification appears
- [ ] Avatar appears in workspace header
- [ ] Video plays correctly in AnimatedAvatarPlayer

### Cross-App Testing

- [ ] Test in main app
- [ ] Test in habits app
- [ ] Test in notes app
- [ ] Verify all apps use same route implementation

### Production Testing

- [ ] Deploy to Vercel staging
- [ ] Test with real users
- [ ] Monitor error rates
- [ ] Check video generation times
- [ ] Verify cost per generation

---

## Rollback Plan

If fal.ai doesn't work as expected:

1. Keep old Runway code in comments
2. Revert environment variable to `RUNWAY_API_KEY`
3. Restore old route implementation
4. Deploy previous version
5. Remove `@fal-ai/client` dependency

**Rollback time**: ~15 minutes

---

## Success Criteria

- ✅ Video generation works in all 12+ apps
- ✅ Videos loop smoothly (first frame = last frame)
- ✅ Generation time < 30 seconds
- ✅ Quality comparable to or better than Runway
- ✅ No breaking changes for end users
- ✅ Firebase storage integration unchanged
- ✅ Cost per video acceptable

---

## Critical Files

### Files to Modify

1. **Root `package.json`** - Add `@fal-ai/client`
2. **`.env`** - Add `FAL_KEY`
3. **`apps/habits/src/app/api/animate-avatar/route.ts`** - Replace Runway with fal.ai
4. **`apps/main/src/app/api/animate-avatar/route.ts`** - Same as habits
5. **`apps/notes/src/app/api/animate-avatar/route.ts`** - Same as habits
6. **`apps/journal/src/app/api/animate-avatar/route.ts`** - Same as habits
7. **`apps/todo/src/app/api/animate-avatar/route.ts`** - Same as habits
8. **`apps/health/src/app/api/animate-avatar/route.ts`** - Same as habits
9. **`apps/album/src/app/api/animate-avatar/route.ts`** - Same as habits
10. **`apps/fit/src/app/api/animate-avatar/route.ts`** - Same as habits
11. **`apps/projects/src/app/api/animate-avatar/route.ts`** - Same as habits
12. **`apps/workflow/src/app/api/animate-avatar/route.ts`** - Same as habits
13. **`apps/calendar/src/app/api/animate-avatar/route.ts`** - Same as habits
14. **`apps/display/src/app/api/animate-avatar/route.ts`** - Same as habits

### Files to Update (Minor)

15. **`packages/ui/src/components/settings/animate-avatar-modal.tsx`** - Handle immediate response
16. **`packages/firebase/src/animated-avatars.ts`** - Update metadata
17. **`packages/auth/src/context.tsx`** - Minor response handling updates

### Configuration Files

18. **Vercel Environment Variables** - Add `FAL_KEY` to production

---

## Sources

- [Kling 1.0 Image to Video API Documentation](https://fal.ai/models/fal-ai/kling-video/v1/standard/image-to-video/api)
- [fal.ai Developer Guide](https://docs.fal.ai/model-apis/guides/generate-videos-from-image/)
- [@fal-ai/client NPM Package](https://www.npmjs.com/package/@fal-ai/client)
