# Plan: Enhanced Workspace Layouts & Tile Sizes

## Objective
Expand the "Smart Surface" to support multiple layout configurations and variable tile sizes, giving users more control over their workspace organization.

## 1. Layout System Architecture

Instead of a fixed 3-slot grid, we will introduce a **Layout Configuration System**.

### Data Model Updates
Update `ClockSettings` in Firestore/State to include:
- `layoutId`: string (e.g., `'classic'`, `'dashboard'`, `'focus'`)
- `tiles`: Map<string, string> (Mapping generic `slotId` -> `tileId`)

### Layout Definitions
We will define a registry of layouts. Each layout will specify:
- **Name & Icon**: For the selection UI.
- **Grid Structure**: Tailwind CSS grid classes (e.g., `grid-cols-3`, `grid-cols-4`).
- **Slots**: Array of slot definitions, where each slot has:
  - `id`: Unique identifier (e.g., `slot-1`, `main-slot`).
  - `className`: Spanning classes (e.g., `col-span-2`, `row-span-2`) to define size.

## 2. Proposed Layouts

1.  **Classic (Current)**
    - **Structure**: Clock centered top. 3 equal slots at bottom.
    - **Use Case**: Minimalist, quick glance.

2.  **Dashboard (Grid)**
    - **Structure**: Clock top. 2 rows of 3 slots (6 total) below.
    - **Use Case**: Power user, weather + calendar + stocks + todos visible at once.

3.  **Focus (Hero)**
    - **Structure**: Clock top. 1 Large "Hero" slot (spans 2 cols) + 2 stacked small slots.
    - **Use Case**: Deep work (large Calendar or Tasks view).

4.  **Sidecar**
    - **Structure**: Clock takes up left half. Right half is a 2x2 grid of tiles.
    - **Use Case**: Time-centric with utilities on the side.

## 3. Component Updates

### `DigitalClock.tsx`
- Replace hardcoded `['bottom-left', ...]` map with dynamic rendering based on `activeLayout.slots`.
- Apply dynamic grid classes to the container.

### `TileTray.tsx`
- Add a **"Layouts"** tab.
- Render visual previews of the grid structures.
- Handle switching layouts (attempt to map existing tiles to new slots where possible).

### `TileBase.tsx` & Specific Tiles
- Ensure all tiles are responsive.
- A "Weather" tile in a small slot might show just icon + temp. In a large slot, it shows a 5-day forecast.
- We can pass a `variant` prop (`small` | `large`) based on the slot definition.

## 4. Implementation Steps

1.  **Define Layout Configs**: Create `src/lib/layouts.ts` with the definitions.
2.  **Update Persistence**: Add `layoutId` to `ClockService`.
3.  **Update UI**: Modify `DigitalClock` to render generic slots.
4.  **Add Layout Picker**: Update `TileTray` to allow switching.
5.  **Responsive Tiles**: Update tile components to handle different aspect ratios if needed.

## 5. Migration Strategy
- Default existing users to `'classic'` layout.
- Map old slot names (`bottom-left` etc.) to new generic IDs (`slot-1`, `slot-2`, `slot-3`) if we standardizing naming, or keep mapped aliases.

