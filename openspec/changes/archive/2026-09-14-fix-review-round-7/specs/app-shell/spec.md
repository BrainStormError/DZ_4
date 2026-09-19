## Purpose

Defines the behavior of the application shell — header, menus, and navigation — so that navigation between sections does not block the user's interaction with the application.

## ADDED Requirements

### Requirement: The header menu does not block the application during navigation

Open header menus (the theme switcher and the user menu) (MUST NOT) leave the page locked after navigation between sections. After any navigation, page scrolling and interaction with interactive elements (MUST) remain available without reloading the page.

#### Scenario: Navigation with an open menu

- **WHEN** the user opens a header menu and navigates to another page, including with the browser's "back" or "forward" buttons
- **THEN** after the navigation the page scrolls and the controls respond to clicks without a reload

#### Scenario: The lock is not preserved

- **WHEN** navigation between sections happens with an open header menu
- **THEN** the scrolling and pointer lock flag does not remain on the page after the navigation completes

### Requirement: Responsiveness during fast switching of sections

Fast switching of the top navigation sections (MUST) keep the application responsive. Scrolling and interaction with elements (MUST NOT) be blocked, and the application (MUST NOT) require a reload to restore operation.

#### Scenario: Fast switching of sections

- **WHEN** the user quickly switches between the top navigation sections
- **THEN** the application remains responsive, pages open, and scrolling and clicks are not blocked

#### Scenario: Recovery without a reload

- **WHEN** the user continues working after a series of fast navigations
- **THEN** interaction remains available without reloading the page
