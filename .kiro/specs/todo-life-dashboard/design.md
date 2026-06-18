# Design Document: To-Do List Life Dashboard

## Overview

The To-Do List Life Dashboard is a single-page, client-side web application built with HTML, CSS, and Vanilla JavaScript. It combines four independent but visually cohesive widgets on one screen: a live Greeting Widget (time/date/greeting), a Pomodoro Focus Timer, a persistent To-Do List, and a Quick Links shortcut panel. No frameworks, no build step, no network dependencies — the entire app runs from a single HTML file referencing one CSS file and one JS file. All data (tasks and links) lives in the browser's `localStorage`.

The design philosophy is progressive enhancement: the HTML is meaningful on its own, CSS layers visual polish, and JavaScript adds interactivity. Each widget is self-contained in both markup and logic, communicating only through shared `localStorage` keys and DOM state.

---

## Architecture

The application follows a **module pattern** inside a single JavaScript file. Each widget is encapsulated in its own IIFE (Immediately Invoked Function Expression) or named object, exposing only what other modules need. There is no virtual DOM or reactive framework — DOM manipulation is direct and imperative.

```
index.html
├── css/
│   └── style.css          ← single stylesheet
└── js/
    └── app.js             ← single script (module pattern)
        ├── GreetingModule
        ├── TimerModule
        ├── TodoModule
        └── QuickLinksModule
```

### Data Flow

```
┌─────────────────────────────────────────────────────┐
│                     index.html                       │
│  ┌─────────────┐  ┌──────────┐  ┌────┐  ┌────────┐ │
│  │  Greeting   │  │  Timer   │  │Todo│  │ Links  │ │
│  │  Widget     │  │  Module  │  │    │  │ Module │ │
│  └──────┬──────┘  └────┬─────┘  └─┬──┘  └───┬────┘ │
│         │              │           │         │      │
│         └──────────────┴─────┬─────┘         │      │
│                               │               │      │
│                         localStorage          │      │
│                          (todo-tasks,         │      │
│                           quick-links)        │      │
└───────────────────────────────────────────────┘
```

- The Greeting Widget reads from `Date` / `setInterval` only — no storage.
- The Timer Module uses in-memory state only (`setInterval` / `clearInterval`) — no storage.
- The Todo and QuickLinks Modules read from and write to `localStorage` on every state change.

### Rendering Strategy

All rendering is done via direct DOM manipulation (no `innerHTML` where possible — `createElement` + `appendChild` for dynamic content to avoid XSS vectors). Templates for repeated items (task rows, link buttons) are generated programmatically in JavaScript.

---

## Components and Interfaces

### 1. GreetingModule

**Responsibility**: Display the current time (HH:MM, 24-hour), current date ("Day, DD Month YYYY"), and a time-based greeting.

**Interface**:
```js
GreetingModule.init()  // called once on DOMContentLoaded
```

**Behavior**:
- Immediately renders the current time/date/greeting on `init()`.
- Starts a `setInterval` that fires every second, recomputing the time and updating the DOM if the minute has changed.
- Greeting rules: 00:00–11:59 → "Good Morning"; 12:00–17:59 → "Good Afternoon"; 18:00–23:59 → "Good Evening".

**DOM Targets** (IDs):
- `#greeting-text` — greeting string
- `#time-display` — HH:MM
- `#date-display` — "Day, DD Month YYYY"

---

### 2. TimerModule

**Responsibility**: Provide a 25:00 countdown timer with Start, Stop, Reset controls. Play an audible alert and show a "Session complete" banner when the timer hits 00:00.

**Interface**:
```js
TimerModule.init()     // bind DOM controls and set initial display
TimerModule.start()    // idempotent — ignored if already running
TimerModule.stop()     // idempotent — ignored if already paused
TimerModule.reset()    // always safe
```

**State** (in-memory only):
```js
{
  totalSeconds: 1500,   // remaining seconds (25 * 60)
  isRunning: false,
  intervalId: null
}
```

**Behavior**:
- On `start()`: if `isRunning` is `true`, do nothing. Otherwise, start a 1-second interval that decrements `totalSeconds`, updates the display, and calls `_onComplete()` when `totalSeconds === 0`.
- On `stop()`: if `!isRunning`, do nothing. Otherwise, `clearInterval` and set `isRunning = false`.
- On `reset()`: `clearInterval`, restore `totalSeconds = 1500`, `isRunning = false`, hide the completion banner.
- `_onComplete()`: `clearInterval`, set `isRunning = false`, show `#timer-complete-banner`, play a 3-second audio tone via the Web Audio API (`AudioContext`).

**DOM Targets**:
- `#timer-display` — MM:SS
- `#btn-start`, `#btn-stop`, `#btn-reset`
- `#timer-complete-banner`

---

### 3. TodoModule

**Responsibility**: Manage a collection of `Task` objects — add, edit, toggle completion, delete — and persist to `localStorage`.

**Interface**:
```js
TodoModule.init()             // load from localStorage and render
TodoModule.addTask(text)      // validate and append
TodoModule.editTask(id, text) // validate and update
TodoModule.toggleTask(id)     // flip completed state
TodoModule.deleteTask(id)     // remove from collection
```

**State** (in-memory + localStorage):
```js
tasks: Task[]   // see Data Models
```

**Behavior**:
- On `init()`: read `localStorage.getItem('todo-tasks')`, `JSON.parse` into `tasks[]`, fall back to `[]` on error. Render all tasks.
- On every mutation: call `_save()` → `localStorage.setItem('todo-tasks', JSON.stringify(tasks))`, then `_render()`.
- Validation: text must be non-empty after `.trim()` and ≤ 200 characters.
- Edit mode: replaces the task text `<span>` with a pre-populated `<input>`, confirms on Enter or a "Save" button click, cancels on Escape (restoring original text).

**DOM Targets**:
- `#todo-input` — text input
- `#btn-add-task` — submit button
- `#todo-list` — container `<ul>` for task items

---

### 4. QuickLinksModule

**Responsibility**: Manage a collection of `Link` objects — add, open, delete — and persist to `localStorage`.

**Interface**:
```js
QuickLinksModule.init()              // load from localStorage and render
QuickLinksModule.addLink(label, url) // validate and append
QuickLinksModule.deleteLink(id)      // remove from collection
```

**State** (in-memory + localStorage):
```js
links: Link[]   // see Data Models
```

**Behavior**:
- On `init()`: read `localStorage.getItem('quick-links')`, `JSON.parse` into `links[]`, fall back to `[]` on error. Render all links.
- On every mutation: call `_save()` → `localStorage.setItem('quick-links', JSON.stringify(links))`, then `_render()`.
- Validation: both `label` and `url` must be non-empty after `.trim()`. Missing fields trigger inline error messages next to their respective inputs.
- Link buttons open via `window.open(url, '_blank')`.
- Add Link form is shown/hidden via a toggle button (`#btn-add-link`).

**DOM Targets**:
- `#links-container` — container for rendered link buttons
- `#add-link-form` — form with `#link-label-input` and `#link-url-input`
- `#btn-add-link` — toggle form visibility
- `#btn-submit-link` — submit the form

---

## Data Models

### Task

```js
{
  id: string,          // crypto.randomUUID() or Date.now().toString()
  text: string,        // 1–200 chars, trimmed
  completed: boolean   // default: false
}
```

**localStorage key**: `"todo-tasks"`
**Stored as**: `JSON.stringify(Task[])`

### Link

```js
{
  id: string,    // crypto.randomUUID() or Date.now().toString()
  label: string, // non-empty, trimmed
  url: string    // non-empty, trimmed
}
```

**localStorage key**: `"quick-links"`
**Stored as**: `JSON.stringify(Link[])`

### Timer State

Timer state is **not persisted** — it resets to 25:00 on every page load by design.

### Storage Schema Version

Both keys store plain arrays (no schema version wrapper). If `JSON.parse` throws or the result is not an array, the module silently defaults to `[]` to satisfy Requirement 3.11 and 4.8.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting maps every minute of the day to exactly one greeting

*For any* local time (0–1439 minutes since midnight), the greeting function SHALL return exactly one of "Good Morning", "Good Afternoon", or "Good Evening" with no overlaps or gaps.

**Validates: Requirements 1.4, 1.5, 1.6**

---

### Property 2: Time display round-trip

*For any* `Date` object, formatting it to HH:MM and then parsing it back SHALL yield the same hours and minutes as the original `Date`.

**Validates: Requirements 1.1, 1.2**

---

### Property 3: Task addition grows the list and persists

*For any* non-empty, non-whitespace-only task text of 1–200 characters, adding it to the Todo_List SHALL increase the task collection length by exactly one and the new task SHALL be retrievable from `localStorage`.

**Validates: Requirements 3.2, 3.9**

---

### Property 4: Whitespace and empty text is always rejected

*For any* string composed entirely of whitespace characters (or the empty string), submitting it as a new task or as an edited task SHALL leave the task collection unchanged.

**Validates: Requirements 3.3, 3.6**

---

### Property 5: Edit preserves identity

*For any* existing task and any valid replacement text, after editing, the task collection SHALL contain exactly the same number of tasks, the edited task SHALL have the new text, and all other tasks SHALL be unchanged.

**Validates: Requirements 3.5**

---

### Property 6: Toggle completion is an involution

*For any* task, toggling its completion state twice SHALL return the task to its original completion state.

**Validates: Requirements 3.7**

---

### Property 7: Task deletion shrinks the list

*For any* task collection with at least one task, deleting a task SHALL decrease the collection length by exactly one and the deleted task SHALL no longer be present.

**Validates: Requirements 3.8, 3.9**

---

### Property 8: localStorage round-trip preserves all task fields

*For any* array of `Task` objects, serializing to `localStorage` and then deserializing SHALL produce an array equal in length and content (id, text, completed) to the original.

**Validates: Requirements 3.9, 3.10**

---

### Property 9: localStorage round-trip preserves all link fields

*For any* array of `Link` objects, serializing to `localStorage` and then deserializing SHALL produce an array equal in length and content (id, label, url) to the original.

**Validates: Requirements 4.6, 4.7**

---

### Property 10: Link addition grows the collection and persists

*For any* non-empty label and non-empty URL, adding a link SHALL increase the link collection length by exactly one and the new link SHALL be retrievable from `localStorage`.

**Validates: Requirements 4.2, 4.6**

---

### Property 11: Link deletion shrinks the collection

*For any* link collection with at least one link, deleting a link SHALL decrease the collection length by exactly one and the deleted link SHALL no longer be present.

**Validates: Requirements 4.5, 4.6**

---

### Property 12: Timer display always shows valid MM:SS

*For any* remaining seconds in the range [0, 1500], the timer formatting function SHALL produce a string matching the pattern `MM:SS` where MM ∈ [00, 25] and SS ∈ [00, 59].

**Validates: Requirements 2.7**

---

### Property 13: Timer countdown is monotonically decreasing

*For any* running timer, each successive displayed value SHALL be less than or equal to the previous value (the timer never counts up or skips backwards).

**Validates: Requirements 2.2, 2.3**

---

## Error Handling

| Scenario | Handling |
|---|---|
| `localStorage` corrupted / non-array JSON | `try/catch` around `JSON.parse`; default to `[]` silently |
| `localStorage` quota exceeded on write | `try/catch` around `setItem`; display a non-blocking console warning (no data loss from in-memory state) |
| `AudioContext` unavailable (e.g., no user gesture yet) | Attempt `AudioContext.resume()` before playing; if still blocked, silently omit audio (visual indicator still shows) |
| `crypto.randomUUID` unavailable (very old browsers) | Fall back to `Date.now().toString() + Math.random()` for ID generation |
| Empty / invalid task text on add or edit | Inline validation message near the input field; no change to collection |
| Empty label or URL on link add | Inline error next to the specific missing field (Requirement 4.3) |
| Timer Start pressed while running | Silently ignored — no duplicate intervals created |
| Timer Stop pressed while paused | Silently ignored |

---

## Testing Strategy

### Approach

Because this is a pure client-side, zero-dependency application built with Vanilla JavaScript, the core logic (data validation, serialization, timer arithmetic, greeting logic) is straightforwardly testable with property-based testing using a lightweight library.

**Recommended PBT library**: [fast-check](https://fast-check.io/) — works in any browser or Node.js environment without a build step when loaded via CDN for tests.

**Test runner**: [Vitest](https://vitest.dev/) (Node-compatible, zero config) for running property tests in CI.

### Unit Tests (example-based)

Focus on concrete, deterministic scenarios:

- Greeting function returns "Good Morning" for 00:00, "Good Afternoon" for 12:00, "Good Evening" for 18:00.
- Timer display formats `0` → `"00:00"`, `1500` → `"25:00"`, `90` → `"01:30"`.
- Adding a task with exactly 200 characters is accepted; 201 characters is rejected.
- Submitting an add-link form with only a label (no URL) shows the correct error field indicator.
- Loading from a completely empty `localStorage` renders an empty list without error.
- Loading from a `localStorage` value of `"not json"` renders an empty list without error.

### Property-Based Tests

Each property test runs a **minimum of 100 iterations** with randomly generated inputs.

Tag format applied to each test: `// Feature: todo-life-dashboard, Property N: <property_text>`

| Property | Generator | Assertion |
|---|---|---|
| **P1** Greeting covers all minutes | `fc.integer({ min: 0, max: 1439 })` | Result is one of the three strings; ranges are mutually exclusive |
| **P2** Time format round-trip | `fc.date()` | `parseHHMM(formatHHMM(date))` equals `{ h, m }` from original date |
| **P3** Task add grows list | `fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0)` | `tasks.length` increases by 1; `localStorage` contains new task |
| **P4** Whitespace rejected | `fc.stringOf(fc.constantFrom(' ', '\t', '\n', '\r'))` | `tasks.length` unchanged; edit restores original |
| **P5** Edit preserves identity | `fc.tuple(tasks, fc.string(...))` | Same count, edited task has new text, others unchanged |
| **P6** Toggle is involution | `fc.boolean()` (initial state) | `toggle(toggle(state)) === state` |
| **P7** Delete shrinks list | Non-empty `Task[]` + random index | `tasks.length` decreases by 1; deleted id absent |
| **P8** Task localStorage round-trip | `fc.array(taskArbitrary)` | `JSON.parse(JSON.stringify(tasks))` deep-equals original |
| **P9** Link localStorage round-trip | `fc.array(linkArbitrary)` | `JSON.parse(JSON.stringify(links))` deep-equals original |
| **P10** Link add grows collection | Valid `{label, url}` | `links.length` increases by 1; new link in `localStorage` |
| **P11** Link delete shrinks collection | Non-empty `Link[]` + random id | `links.length` decreases by 1; deleted id absent |
| **P12** Timer MM:SS format | `fc.integer({ min: 0, max: 1500 })` | Output matches `/^\d{2}:\d{2}$/` and values are in range |
| **P13** Timer monotone | Sequence of tick calls | Each successive value ≤ previous |

### Integration / Smoke Tests

- **Smoke**: Page loads without uncaught console errors in Chrome and Firefox.
- **Integration**: Full add → edit → complete → delete cycle on a task leaves `localStorage` in the expected state.
- **Integration**: Full add → click → delete cycle on a link leaves `localStorage` in the expected state.
- **Integration**: Timer completes 25-minute countdown (or a 3-second test countdown), shows the banner, and audio context is activated.

### Cross-browser Compatibility

Manual verification in Chrome, Firefox, Edge, and Safari at their latest stable releases (as per Requirement 5.5). Automated headless runs use Playwright with Chromium.
