# Drag-and-Drop "Smart Tiles" Plan

This plan transforms the Clock Area into a "Smart Surface" where users can drag and drop "Tiles" (formerly widgets) to customize their dashboard.

## Terminology Change
- **Old:** "Widgets"
- **New:** "Tiles" or "Snap-ins" (Let's use **"Tiles"** for now).

## Core Concept
- The Clock is the "Anchor" of the surface.
- Users can find Tiles in a "Tile Tray" (hidden by default, revealed via a button).
- Users can drag a Tile from the Tray and drop it onto the Clock Area.
- **Free-form vs. Grid:** To keep it clean, we'll use a **Grid/Slot system** around the clock (Top, Bottom, Left, Right) or a **Flex-wrap flow** below the time.
  - *Recommendation:* **Grid Slots** (Top-Left, Top-Right, Bottom-Left, Bottom-Right, or Below Center) are easier to implement cleanly than true free-form canvas.

## Architecture

### 1. Tile Library
Create a set of draggable components:
- `CalendarTile`: Next meeting.
- `FocusTile`: Current task.
- `SparkTile`: Idea prompt.

### 2. The "Smart Surface" (Clock Area)
- The `DigitalClock` container becomes a **Drop Zone**.
- We will use a lightweight drag-and-drop library or standard HTML5 DnD API.
  - *Simplest Approach:* HTML5 DnD.
- **Visual Feedback:** When dragging a Tile over the Clock Area, show drop indicators (e.g., outlined boxes) where the tile can land.

### 3. The "Tile Tray"
- A button (e.g., "Customize" or "+") toggles a drawer/sidebar containing available Tiles.
- Users drag from the Tray -> Clock Area.

## Implementation Steps

#### Step A: Setup DnD Context
- Wrap the Workspace in a DnD Context (if using a library) or prepare the `DigitalClock` to handle `onDrop`.

#### Step B: Create Tile Components
- `src/components/tiles/tile-base.tsx`: Common styles (draggable, glassmorphism).
- `src/components/tiles/calendar-tile.tsx`
- `src/components/tiles/focus-tile.tsx`
- `src/components/tiles/spark-tile.tsx`

#### Step C: Update Clock Container
- Add `activeTiles` state to track which tiles are placed where.
- Implement `onDragOver` and `onDrop` handlers.
- Render drop zones when dragging.
- Render placed tiles in their assigned slots.

#### Step D: Create Tile Tray
- A UI component listing all available tiles.
- Draggable versions of the tiles.

## User Flow
1. User clicks "+" icon on the Clock.
2. A "Tile Tray" slides down/appears.
3. User drags "Next Meeting" Tile.
4. Clock Area shows 3 empty slots (Left, Right, Bottom).
5. User drops Tile into "Bottom" slot.
6. Tile snaps into place and displays data.
7. User closes Tray.

**Shall I proceed with this Drag-and-Drop Tile system?**

