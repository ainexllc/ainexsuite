# Clock Feature Expansion Plan

Based on the monorepo structure and available apps, here are 3 proposed features to enhance the Clock:

## 1. "Next Up" (Calendar Integration)
**Source:** `apps/calendar` (`DayView`, `EventsService`)
- **Concept:** Show the user's next upcoming meeting or event directly under the time.
- **Detail:**
  - Fetch upcoming events using a service similar to `EventsService.getEvents`.
  - Display the title and time of the very next event.
  - **UI:** Small text below the date: "Next: Team Sync in 15m".
- **Benefit:** Adds immediate utility without leaving the clock view.

## 2. "Quick Capture" (Note/Idea Integration)
**Source:** `apps/journey` (`IdeaSparkCard`) or `apps/notes` (`NoteCard`)
- **Concept:** A discreet button or input to quickly jot down a thought or "spark."
- **Detail:**
  - Add a small "Lightbulb" icon or input field (inspired by `IdeaSparkCard`).
  - Pressing it opens a small modal or inline input to save a quick text note.
  - **UI:** Minimalist icon in the corner (opposite full-screen).
- **Benefit:** Capitalizes on "in-the-moment" thoughts when checking time.

## 3. "Focus Mode" (Todo Integration)
**Source:** `apps/todo` (`MyDayView`, `TaskList`)
- **Concept:** Display the current active task to keep the user focused.
- **Detail:**
  - Fetch the top priority task from `apps/todo`.
  - Display it in a "Focus" pill.
  - **UI:** A subtle pill `[ Focus: Finish Report ]` that can be checked off.
- **Benefit:** Turns the passive clock into an active productivity tool.

## Recommendation
I recommend starting with **Feature 1 (Next Up)** as it naturally pairs with checking the time. **Feature 3 (Focus Mode)** is a strong second choice for a "Workspace" context.

**Which of these (or combination) would you like to proceed with?**

