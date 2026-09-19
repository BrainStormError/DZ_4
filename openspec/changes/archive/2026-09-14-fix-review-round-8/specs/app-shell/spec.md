## ADDED Requirements

### Requirement: Modal dialogs do not block the application during navigation

Modal dialogs (participation, amount change, wish change) MUST NOT leave the page blocked after navigating between sections. After navigation, page scrolling and interaction with interactive elements MUST remain available without a reload.

#### Scenario: Navigation with an open dialog

- **WHEN** the user navigates to another page, including with the browser's "back" or "forward" buttons, while a modal dialog is open
- **THEN** after navigation the page scrolls and controls respond to clicks without a reload

#### Scenario: The lock is not retained

- **WHEN** navigation between sections occurs while a modal dialog is open
- **THEN** the scroll and pointer lock flag does not remain on the page after navigation completes
