# Requirements Document

## Introduction

The **To-Do List Life Dashboard** is a single-page, client-side web application built with HTML, CSS, and Vanilla JavaScript. It serves as a personal productivity hub that displays the current time and greeting, provides a Pomodoro-style focus timer, manages a persistent to-do list, and offers quick-access links to favorite websites. All data is stored in the browser's Local Storage — no backend or setup required. The application must work as a standalone web page or browser extension in modern browsers.

---

## Glossary

- **Dashboard**: The single-page web application that hosts all four feature widgets.
- **Greeting_Widget**: The UI component that displays the current date, time, and a time-based greeting message.
- **Focus_Timer**: The UI component providing a 25-minute countdown timer with Start, Stop, and Reset controls.
- **Todo_List**: The UI component that manages a user's task collection.
- **Task**: A single to-do item containing text content and a completion state.
- **Quick_Links**: The UI component that displays user-defined shortcut buttons linking to external websites.
- **Link**: A single Quick Links entry containing a label and a URL.
- **Local_Storage**: The browser's built-in `localStorage` API used for client-side data persistence.
- **Modern_Browser**: Chrome, Firefox, Edge, or Safari in their latest stable release at time of use.

---

## Requirements

### Requirement 1: Greeting Widget — Time and Date Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the Dashboard, so that I have immediate situational awareness without checking another app.

#### Acceptance Criteria

1. WHEN the Dashboard opens, THE Greeting_Widget SHALL display the current local time in HH:MM (24-hour) format.
2. WHEN the local minute changes, THE Greeting_Widget SHALL update the displayed time to reflect the new current local time in HH:MM format.
3. THE Greeting_Widget SHALL display the current date in the format "Day, DD Month YYYY" (e.g., "Monday, 16 June 2025"), derived from the user's local clock.
4. WHEN the local time is between 00:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
5. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
6. WHEN the local time is between 18:00 and 23:59, THE Greeting_Widget SHALL display the greeting "Good Evening".

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialize with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control and the timer is not already running, THE Focus_Timer SHALL begin counting down one second per second.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the Stop control and the timer is running, THE Focus_Timer SHALL pause the countdown at the current remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically, display a visible "Session complete" indicator, and emit an audible alert that persists for at least 3 seconds.
7. THE Focus_Timer SHALL display the remaining time in MM:SS format at all times.
8. IF the user activates the Start control while the timer is already running, THEN THE Focus_Timer SHALL ignore the activation and continue counting down unchanged.
9. IF the user activates the Stop control while the timer is already paused, THEN THE Focus_Timer SHALL ignore the activation and maintain the current paused state.

---

### Requirement 3: To-Do List — Task Management

**User Story:** As a user, I want to add, edit, complete, and delete tasks in a persistent to-do list, so that I can track my work and have it available across browser sessions.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and a submission control that allows the user to add a new Task.
2. WHEN the user submits a new Task with non-empty, non-whitespace-only text between 1 and 200 characters, THE Todo_List SHALL append the Task to the task collection and display it.
3. IF the user submits an empty or whitespace-only input field, THEN THE Todo_List SHALL reject the submission and display no new Task.
4. WHEN the user activates the edit control on a Task, THE Todo_List SHALL replace the Task's displayed text with a pre-populated editable input field containing the current Task text.
5. WHEN the user confirms an edit on a Task with non-empty, non-whitespace-only text between 1 and 200 characters, THE Todo_List SHALL update the Task's displayed text to the new value.
6. IF the user confirms an edit on a Task with empty or whitespace-only text, THEN THE Todo_List SHALL reject the edit and restore the original Task text without saving.
7. WHEN the user activates the complete control on a Task, THE Todo_List SHALL toggle the Task's completion state and apply a distinct visual style (e.g., strikethrough text) to completed Tasks, which SHALL be absent on incomplete Tasks.
8. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the task collection and the display.
9. WHEN any change is made to the task collection (add, edit, complete, or delete), THE Todo_List SHALL save the updated task collection to Local_Storage.
10. WHEN the Dashboard loads and valid task data exists in Local_Storage, THE Todo_List SHALL read the task collection from Local_Storage and render all previously saved Tasks with their correct completion states.
11. WHEN the Dashboard loads and no task data exists in Local_Storage or the stored data is unreadable, THE Todo_List SHALL render an empty task list without error.

---

### Requirement 4: Quick Links — Favorite Website Shortcuts

**User Story:** As a user, I want to add and manage shortcut buttons for my favorite websites, so that I can open them with a single click from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide an "Add Link" control that, when activated, presents the user with an input for a label and an input for a URL.
2. WHEN the user submits a new Link with a non-empty label and a non-empty URL, THE Quick_Links SHALL store the Link in Local_Storage and display it as a clickable button labeled with the provided label.
3. IF the user submits a new Link with an empty label or an empty URL, THEN THE Quick_Links SHALL reject the submission, display no new Link button, and indicate to the user which field is missing.
4. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
5. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the collection, remove its button from the display, and save the updated collection to Local_Storage.
6. WHEN any change is made to the Link collection (add or delete), THE Quick_Links SHALL save the updated Link collection to Local_Storage.
7. WHEN the Dashboard loads and valid link data exists in Local_Storage, THE Quick_Links SHALL read the Link collection from Local_Storage and render all previously saved Link buttons.
8. WHEN the Dashboard loads and no link data exists in Local_Storage or the stored data is unreadable, THE Quick_Links SHALL render an empty links section without error.

---

### Requirement 5: Technical Constraints and Cross-Cutting Concerns

**User Story:** As a developer, I want the Dashboard to be built with a clean, constraint-compliant architecture, so that it is maintainable, performant, and compatible across modern browsers.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL contain exactly one CSS file located in the `css/` directory.
3. THE Dashboard SHALL contain exactly one JavaScript file located in the `js/` directory.
4. THE Dashboard SHALL use the browser Local_Storage API as the sole mechanism for data persistence.
5. THE Dashboard SHALL render without any overlapping or clipped UI elements, all interactive controls SHALL be operable, and no uncaught JavaScript errors SHALL appear in the browser console in the latest stable release of Chrome, Firefox, Edge, and Safari.
6. THE Dashboard SHALL reach an interactive state within 2 seconds of navigation start, measured from a local file system load with the browser cache cleared.
7. WHEN the user interacts with any control on the Dashboard, THE Dashboard SHALL update the visible UI state within 100 milliseconds.
