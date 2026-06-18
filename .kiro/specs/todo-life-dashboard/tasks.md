# Implementation Plan: To-Do List Life Dashboard

## Overview

Build the single-page productivity dashboard incrementally from the ground up:
scaffold the HTML structure, add the stylesheet, then implement each JavaScript module
(`GreetingModule`, `TimerModule`, `TodoModule`, `QuickLinksModule`) inside `js/app.js`
using the module pattern. Each module is fully self-contained — DOM bindings, state
management, and `localStorage` persistence are wired up module-by-module. Property-based
tests validate universal correctness invariants; unit tests cover concrete examples.

---

## Tasks

- [x] 1. Scaffold project structure and HTML skeleton
  - Create `index.html` with semantic HTML5 boilerplate (`<!DOCTYPE html>`, `<html lang>`, `<head>`, `<body>`)
  - Link `css/style.css` (stylesheet) and `js/app.js` (module script, `type="module"` optional but scoped with IIFE pattern)
  - Create the four widget sections with correct IDs: `#greeting-widget`, `#timer-widget`, `#todo-widget`, `#quick-links-widget`
  - Add all required DOM targets for all modules: `#greeting-text`, `#time-display`, `#date-display`, `#timer-display`, `#btn-start`, `#btn-stop`, `#btn-reset`, `#timer-complete-banner`, `#todo-input`, `#btn-add-task`, `#todo-list`, `#links-container`, `#add-link-form`, `#link-label-input`, `#link-url-input`, `#btn-add-link`, `#btn-submit-link`
  - Create `css/style.css` as an empty file and `js/app.js` as an empty file
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 2. Implement base CSS layout and visual styles
  - Write layout rules in `css/style.css`: responsive grid or flexbox arranging the four widgets on one screen without overlap or clipping
  - Add typography, color palette, spacing, and widget card styles
  - Style completed task items with strikethrough (`.task-completed` class)
  - Style `#timer-complete-banner` as hidden by default (`display: none`) with a prominent completion visual
  - Ensure all interactive controls are visually accessible and operable
  - _Requirements: 3.7, 2.6, 5.5_

- [x] 3. Implement `GreetingModule` in `js/app.js`
  - [-] 3.1 Write the `GreetingModule` IIFE with `init()` method
    - Implement `_formatTime(date)` → `"HH:MM"` (zero-padded, 24-hour)
    - Implement `_formatDate(date)` → `"Day, DD Month YYYY"` using locale-aware arrays or `Intl.DateTimeFormat`
    - Implement `_getGreeting(hours)` → `"Good Morning"` (0–11), `"Good Afternoon"` (12–17), `"Good Evening"` (18–23)
    - On `init()`: render immediately, then start a `setInterval` (1 s) that re-renders only when the minute changes
    - Update `#greeting-text`, `#time-display`, `#date-display`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_


- [ ] 4. Implement `TimerModule` in `js/app.js`
  - [-] 4.1 Write the `TimerModule` IIFE with `init()`, `start()`, `stop()`, `reset()`, and `_onComplete()` methods
    - Initialise in-memory state: `{ totalSeconds: 1500, isRunning: false, intervalId: null }`
    - Implement `_formatTimer(seconds)` → `"MM:SS"` (zero-padded)
    - `start()`: idempotent guard (`if isRunning return`); start 1-second interval decrementing `totalSeconds`, update `#timer-display`, call `_onComplete()` when `totalSeconds === 0`
    - `stop()`: idempotent guard; `clearInterval`, `isRunning = false`
    - `reset()`: `clearInterval`, restore `totalSeconds = 1500`, `isRunning = false`, hide `#timer-complete-banner`, update display
    - `_onComplete()`: `clearInterval`, `isRunning = false`, show `#timer-complete-banner`, play 3-second tone via Web Audio API (`AudioContext`), handle `AudioContext` unavailability silently
    - Bind `#btn-start`, `#btn-stop`, `#btn-reset` click handlers in `init()`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9_


- [ ] 5. Checkpoint — Ensure Greeting and Timer modules pass all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement `TodoModule` in `js/app.js`
  - [~] 6.1 Write `TodoModule` IIFE with data helpers and `localStorage` persistence
    - Implement `_generateId()` using `crypto.randomUUID()` with `Date.now() + Math.random()` fallback
    - Implement `_save()` → `localStorage.setItem('todo-tasks', JSON.stringify(tasks))` inside `try/catch`
    - Implement `_load()` → `JSON.parse(localStorage.getItem('todo-tasks'))` with `try/catch`, validate array, default to `[]`
    - _Requirements: 3.9, 3.10, 3.11, 5.4_


  - [~] 6.3 Implement `TodoModule.addTask(text)` with validation
    - Validate: `text.trim().length > 0` AND `text.trim().length <= 200`; show inline error on rejection
    - Create `Task` object `{ id, text: text.trim(), completed: false }`, push to `tasks[]`, call `_save()` then `_render()`
    - Clear and refocus `#todo-input` on success
    - _Requirements: 3.1, 3.2, 3.3_


  - [~] 6.6 Implement `TodoModule.editTask(id, text)` — edit mode UI
    - On edit activation: replace task text `<span>` with a pre-populated `<input>` containing current text
    - Confirm on Enter key or "Save" button click: validate text (same rules as add), update task, call `_save()` then `_render()`
    - Cancel on Escape key: restore original text, no state change
    - _Requirements: 3.4, 3.5, 3.6_


  - [~] 6.8 Implement `TodoModule.toggleTask(id)` and `TodoModule.deleteTask(id)`
    - `toggleTask`: flip `task.completed`, call `_save()` then `_render()`; apply/remove `.task-completed` CSS class
    - `deleteTask`: `tasks = tasks.filter(t => t.id !== id)`, call `_save()` then `_render()`
    - _Requirements: 3.7, 3.8, 3.9_


  - [~] 6.11 Implement `TodoModule._render()` and wire up `init()`
    - `_render()`: clear `#todo-list`, rebuild `<li>` elements for each task using `createElement` + `appendChild` (no `innerHTML`)
    - Each `<li>` contains: complete toggle (checkbox or button), text `<span>`, edit button, delete button
    - Apply `.task-completed` to completed tasks
    - `init()`: call `_load()`, populate `tasks[]`, call `_render()`, bind `#btn-add-task` click and `#todo-input` Enter key
    - _Requirements: 3.1, 3.2, 3.7, 3.10, 3.11, 5.5_

- [ ] 7. Checkpoint — Ensure TodoModule passes all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement `QuickLinksModule` in `js/app.js`
  - [~] 8.1 Write `QuickLinksModule` IIFE with data helpers and `localStorage` persistence
    - Implement `_generateId()` (same pattern as TodoModule)
    - Implement `_save()` → `localStorage.setItem('quick-links', JSON.stringify(links))` inside `try/catch`
    - Implement `_load()` → `JSON.parse` with `try/catch`, validate array, default to `[]`
    - _Requirements: 4.6, 4.7, 4.8, 5.4_


  - [~] 8.3 Implement `QuickLinksModule.addLink(label, url)` with validation
    - Validate both fields non-empty after `.trim()`; show inline field-specific error on rejection (indicate which field is missing)
    - Create `Link` object `{ id, label: label.trim(), url: url.trim() }`, push to `links[]`, call `_save()` then `_render()`
    - Clear form inputs and hide `#add-link-form` on success
    - _Requirements: 4.1, 4.2, 4.3_


  - [~] 8.5 Implement `QuickLinksModule.deleteLink(id)` and link button click behavior
    - Link buttons: `window.open(url, '_blank')` on click
    - `deleteLink`: `links = links.filter(l => l.id !== id)`, call `_save()` then `_render()`
    - _Requirements: 4.4, 4.5, 4.6_


  - [~] 8.7 Implement `QuickLinksModule._render()`, toggle form, and wire up `init()`
    - `_render()`: clear `#links-container`, rebuild link buttons using `createElement` + `appendChild`
    - Each button has a visible label and a delete control; clicking the button area opens the URL
    - `#btn-add-link` click toggles visibility of `#add-link-form`
    - `#btn-submit-link` click calls `addLink` with current input values
    - `init()`: call `_load()`, populate `links[]`, call `_render()`, bind all controls
    - _Requirements: 4.1, 4.2, 4.4, 4.7, 4.8, 5.5_

- [ ] 9. Checkpoint — Ensure QuickLinksModule passes all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Wire all modules together and bootstrap `app.js`
  - [~] 10.1 Add `DOMContentLoaded` bootstrap block at the bottom of `js/app.js`
    - Call `GreetingModule.init()`, `TimerModule.init()`, `TodoModule.init()`, `QuickLinksModule.init()` in sequence
    - Verify no uncaught errors appear in the browser console on page load
    - _Requirements: 5.1, 5.5, 5.6_


- [ ] 11. Final checkpoint — Ensure all tests pass and UI is complete
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify the page renders without overlapping or clipped elements and all controls are operable.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Property tests require [fast-check](https://fast-check.io/) (loadable via CDN or npm) and [Vitest](https://vitest.dev/) as the test runner
- Each property test should run a minimum of 100 iterations with randomly generated inputs
- Tag each property test: `// Feature: todo-life-dashboard, Property N: <property_text>`
- All dynamic DOM construction uses `createElement` + `appendChild` (never bare `innerHTML`) to prevent XSS vectors
- `localStorage` writes are always wrapped in `try/catch`; quota errors log a console warning without losing in-memory state
- `AudioContext` failures (no user gesture) are handled silently — the visual "Session complete" banner is always shown
- ID generation uses `crypto.randomUUID()` with a `Date.now() + Math.random()` fallback for older browsers

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["3.1", "4.1", "6.1", "8.1"] },
    { "id": 1, "tasks": ["3.2", "3.3", "4.2", "4.3", "6.2", "6.3", "8.2", "8.3"] },
    { "id": 2, "tasks": ["6.4", "6.5", "6.6", "8.4", "8.5"] },
    { "id": 3, "tasks": ["6.7", "6.8", "8.6", "8.7"] },
    { "id": 4, "tasks": ["6.9", "6.10", "6.11"] },
    { "id": 5, "tasks": ["10.1"] },
    { "id": 6, "tasks": ["10.2"] }
  ]
}
```
