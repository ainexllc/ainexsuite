# Plan: Pulse App UI/UX Improvements

This plan outlines improvements for the Pulse app's customization modal (Tile Tray) and the empty tile experience in the Digital Clock area.

## Goals
1.  **Improve Organization**: Restructure the customization modal for better usability and logic.
2.  **Enhance UI**: Polish the visual aesthetics of the modal and clock area.
3.  **Better Empty State**: Make empty tile slots more intuitive and actionable with a "Plus" sign.

## Phase 1: Customization Modal (Tile Tray) Overhaul [COMPLETED]

### 1.1 Restructure Navigation
The current 5 tabs (`tiles`, `layouts`, `backgrounds`, `clock`, `effects`) can be grouped for better discovery.

-   **Proposed Structure**:
    1.  **Layout & Content**:
        -   Sub-section: **Layouts** (Grid selection)
        -   Sub-section: **Widgets** (Available tiles to drag/drop)
    2.  **Appearance**:
        -   Sub-section: **Background** (Images, AI, Color)
        -   Sub-section: **Effects** (Rain, Snow, etc.)
    3.  **Clock**:
        -   Style (Digital, Analog, etc.)
        -   Format (12h/24h)

*Refined Tab List*: `Widgets`, `Layout`, `Appearance` (combines BG/Effects), `Clock`.

### 1.2 UI/UX Improvements
-   **Visual Style**:
    -   Switch to a "Glassmorphism" sidebar or floating panel with better hierarchy.
    -   Use clearer active states for selected items (accent borders/glows).
-   **Interactions**:
    -   Ensure the panel doesn't obscure the workspace too much (maybe dock to side or keep floating but compact).
    -   Add "Reset to Default" option.

## Phase 2: Empty Tile Experience [COMPLETED]

### 2.1 Visual Indicator
-   Replace the current hidden "Drop Tile" text with a visible, subtle **Plus (+)** icon in empty slots.
-   Style:
    -   Default: Low opacity white `+` icon centered.
    -   Hover: Higher opacity, subtle background glow or border highlight.

### 2.2 Interaction
-   **Click Action**: Clicking a `+` on an empty slot should:
    1.  Open the Tile Tray (if closed).
    2.  Navigate directly to the **Widgets** (Tiles) tab.
    3.  (Optional) Highlight the available widgets to indicate "pick one".

## Phase 3: General Navigation & Icons [COMPLETED]

### 3.1 "Customize" Trigger
-   Change the top-right toggle button icon from `Plus` to `Settings2`, `SlidersHorizontal`, or `Layout` to better indicate "Configuration Mode" rather than "Add".

### 3.2 Tooltips/Hints
-   Add a tooltip to the new Customize button: "Customize Dashboard".
-   Add a tooltip to the Empty Slot `+`: "Add Widget".

## Phase 4: Background Image Management [COMPLETED]

### 4.1 User-Generated Image Gallery
-   **My Images Section**: Add a dedicated section within the Background tab to show user-generated images.
-   **Image Grid**: Display generated images as a scrollable grid with thumbnails.
-   **Image Metadata**: Show generation date, prompt used, and file size for each image.

### 4.2 Image Management Actions
-   **Delete Images**: Allow users to delete unwanted generated images from Firebase Storage.
-   **Set as Background**: Quick action to apply a stored image as current background.
-   **Download**: Option to download images locally.
-   **Rename/Custom Labels**: Allow users to add custom names/tags to their images.

### 4.3 Storage Management
-   **Storage Usage**: Display current Firebase Storage usage and limits.
-   **Bulk Actions**: Select multiple images for batch deletion.
-   **Auto-cleanup**: Option to automatically delete old/unused images (with user confirmation).

### 4.4 UI Integration
-   **Seamless Flow**: After generating an image, automatically add it to the gallery.
-   **Visual Feedback**: Show upload progress and storage status.
-   **Error Handling**: Graceful handling of storage limits and network issues.

## Implementation Steps

1.  **Refactor `TileTray`**:
    -   [x] Update tab structure.
    -   [x] Combine Backgrounds and Effects into one tab (or keep adjacent).
    -   [x] Improve visual design of grid items.
2.  **Update `DigitalClock`**:
    -   [x] Modify `renderStudioLayout` and standard layout loops to render the new Empty Slot component.
    -   [x] Implement `handleEmptySlotClick` function.
    -   [x] Update the top-right toggle button icon.
3.  **Styling**:
    -   [x] Apply new styles using Tailwind CSS.
    -   [x] Verify dark mode/overlay contrast.
4.  **Background Management**:
    -   [x] Create `UserBackgrounds` component/service for image gallery.
    -   [x] Implement Firebase Storage integration for listing/deleting images.
    -   [x] Add storage usage tracking and limits.
    -   [x] Update Background tab to include "My Images" section.
    -   [x] Add bulk selection and management actions.
