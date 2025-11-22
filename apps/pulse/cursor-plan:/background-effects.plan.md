# Background Effects (Atmosphere) Plan

I will implement a system to overlay animated effects on top of the background image but behind the clock/tile content.

## Features

1.  **Effect Types**:
    -   **Rain**: Vertical falling rain drops (Canvas based for performance).
    -   **Snow**: Soft falling snow particles (Canvas based).
    -   **Liquid/Flow**: A smooth, slow-moving fluid gradient overlay that adds a "darkening" and "dynamic" feel (CSS based).
    -   **None**: No effect.

2.  **Persistence**:
    -   Save the selected effect in Firestore `user_settings`.

3.  **UI**:
    -   Add a new tab "Effects" (or "Atmosphere") to the `TileTray`.
    -   Allow toggling effects.

## Technical Implementation

### 1. `src/components/background-effects.tsx`
Create a component that takes `effectId` as a prop.
-   `Rain`: HTML5 Canvas animation loop.
-   `Snow`: HTML5 Canvas animation loop.
-   `Liquid`: CSS keyframe animation with `backdrop-filter` or colored gradients.

### 2. Update `src/lib/clock-settings.ts`
-   Add `backgroundEffect?: string` to `ClockSettings` interface.

### 3. Update `src/components/digital-clock.tsx`
-   Read `backgroundEffect` from settings.
-   Render `<BackgroundEffects effect={activeEffect} />` inside the main container, just before the readability overlay.
-   Pass `activeEffect` and `onSelectEffect` to `TileTray`.

### 4. Update `src/components/tiles/tile-tray.tsx`
-   Add "Effects" tab.
-   List available effects with simple preview icons or buttons.

## Verification
-   Select "Rain" -> Verify rain animation plays over background.
-   Select "Snow" -> Verify snow animation.
-   Select "Liquid" -> Verify fluid effect.
-   Refresh page -> Verify effect persists.
-   Check CPU usage (ensure canvas loops are efficient).

