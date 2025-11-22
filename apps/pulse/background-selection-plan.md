# Background Image Selection Plan

I will add a feature to allow users to customize the clock background with images.

## 1. Asset Management
Since I cannot directly save the attached images, I will use **remote URLs (Unsplash)** as placeholders that match the user's request:
- **Puppies:** `https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?q=80&w=2070&auto=format&fit=crop`
- **Cats:** `https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop`
- **Space:** `https://images.unsplash.com/photo-1534796636912-3b95b3ab5980?q=80&w=2072&auto=format&fit=crop`

## 2. UI Updates

### `DigitalClock.tsx`
- Add state `backgroundImage: string | null`.
- If `backgroundImage` is set:
  - Apply it as a `style={{ backgroundImage: ... }}` to the container.
  - Add a black overlay (`bg-black/50`) to ensure text and tiles remain readable.
- If not set, keep the default `bg-black`.

### `TileTray.tsx` -> `CustomizeTray.tsx`
- Rename `TileTray` to `CustomizeTray` (or keep name but expand content).
- Add tabs or sections:
  - **"Tiles"**: The existing list of draggable tiles.
  - **"Backgrounds"**: A grid of clickable image thumbnails.
- Clicking a thumbnail updates the `DigitalClock` state (passed via prop).

## 3. Implementation Steps
1.  Update `TileTray` to accept `onSelectBackground` prop.
2.  Add the image list to `TileTray`.
3.  Update `DigitalClock` to handle the selected background.

**Shall I proceed with this plan?**

