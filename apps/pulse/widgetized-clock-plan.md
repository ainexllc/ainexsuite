# Widgetized Clock Area Plan

This plan proposes transforming the static clock area into a customizable "Smart Hub" where users can toggle widgets on/off.

## Core Concept
The `DigitalClock` component will evolve into a container that supports "micro-widgets" displayed alongside or below the time.

## Architecture

### 1. Widget Registry
Create a configuration system to manage available widgets.
- **Widgets:**
  - `CalendarWidget`: Shows next event (from `apps/calendar`).
  - `FocusWidget`: Shows top task (from `apps/todo`).
  - `SparkWidget`: Shows a random idea prompt (from `apps/journey`).
  - `WeatherWidget`: (Future) Shows local weather.
- **State:** Use `useState` or `localStorage` to persist user preferences (which widgets are active).

### 2. UI Layout
- **Default View:** Large Clock centered.
- **Widget Area:** A row or grid below the clock for active widgets.
- **Customization Mode:** A "Settings" (gear) icon that flips the card or opens a drawer to toggle widgets.

### 3. Implementation Steps

#### Step A: Create Widget Components
Extract logic from the previous plan into small, isolated components:
- `src/components/widgets/next-event.tsx`
- `src/components/widgets/focus-task.tsx`
- `src/components/widgets/idea-spark.tsx`

#### Step B: Update DigitalClock Container
- Add a "Configure" button (Gear icon).
- Add a state for `activeWidgets: string[]`.
- Render active widgets in a flex container below the date.

#### Step C: Mock Data (Phase 1)
Since we don't have direct access to live data from other apps *inside* `apps/pulse` without a shared API or package, we will use **mock data** or **simulated services** to demonstrate the functionality.
- *Note:* In a real monorepo with shared backend/firebase, we would fetch real data. For this UI prototype, we'll use simulated hooks.

## User Experience
1. User sees the standard clock.
2. User clicks "Settings" (Gear).
3. A menu appears: "Show: [x] Next Event  [ ] Focus Task  [ ] Idea Spark".
4. User checks "Next Event".
5. The clock expands slightly to show "Next: Team Sync in 15m" below the date.

## Validation
- Verify toggling widgets adds/removes them from the view.
- Verify layout remains clean (black background, white text) with multiple widgets.

**Shall I proceed with this "Widgetized" approach?**

