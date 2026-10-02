# app-shell Specification

## Purpose

Defines the behavior of the application shell — the header, the menu, and the navigation — so that switching between sections does not block the user's interaction with the application.

## Requirements

### Requirement: The header menu does not block the application during navigation

Open header menus (the theme toggle and the user menu) MUST NOT leave the page locked after switching between sections. After any navigation, page scrolling and interaction with interactive elements MUST remain available without reloading the page.

#### Scenario: Navigation with an open menu

- **WHEN** the user opens a header menu and navigates to another page, including with the browser's "back" or "forward" buttons
- **THEN** after the navigation the page scrolls, and the controls respond to clicks without a reload

#### Scenario: The lock is not retained

- **WHEN** navigation between sections occurs with an open header menu
- **THEN** the scroll- and pointer-lock flag does not remain on the page after the navigation completes

### Requirement: Responsiveness during rapid section switching

Rapid switching between the top navigation sections MUST keep the application responsive. Scrolling and interaction with elements MUST NOT be blocked, and the application MUST NOT require a reload to restore operation.

#### Scenario: Rapid section switching

- **WHEN** the user rapidly switches between the top navigation sections
- **THEN** the application remains responsive, pages open, and scrolling and clicks are not blocked

#### Scenario: Recovery without a reload

- **WHEN** the user continues working after a series of rapid navigations
- **THEN** interaction remains available without reloading the page

### Requirement: Modal dialogs do not block the application during navigation

Modal dialogs (participation, amount change, wish change) MUST NOT leave the page locked after switching between sections. After navigation, page scrolling and interaction with interactive elements MUST remain available without a reload.

#### Scenario: Navigation with an open dialog

- **WHEN** the user navigates to another page, including with the browser's "back" or "forward" buttons, while a modal dialog is open
- **THEN** after the navigation the page scrolls, and the controls respond to clicks without a reload

#### Scenario: The lock is not retained

- **WHEN** navigation between sections occurs with an open modal dialog
- **THEN** the scroll- and pointer-lock flag does not remain on the page after the navigation completes

### Requirement: Mobile navigation without hidden items

Mobile navigation MUST make all sections available to the user reachable on a narrow screen. Items MUST NOT disappear beyond the edge without an indication of continuation: if the items do not fit, the system MUST give a visual hint about horizontal scrolling, and scrolling MUST be predictable.

#### Scenario: All items are reachable on a narrow screen

- **WHEN** a user with the administrator role opens the application at a width of 320px
- **THEN** all mobile navigation items, including "FAQ" and "Admin", are reachable

#### Scenario: Hint about the list continuing

- **WHEN** the mobile navigation items do not fit in width
- **THEN** the user sees an indication that the list continues horizontally, and scrolling is performed one item at a time

### Requirement: Immediate feedback when switching sections

The application shell MUST acknowledge a section switch as soon as the user activates a header navigation item: the activated item MUST become visually selected and a loading placeholder MUST appear in the content area, without waiting for the target route to finish loading. The shell (header, menus, footer) MUST remain mounted and interactive, and the placeholder MUST NOT block scrolling or interaction, nor require a page reload.

#### Scenario: The selected item updates immediately

- **WHEN** the user activates a header navigation item
- **THEN** that item becomes selected in the same interaction, before the target section content appears

#### Scenario: A loading placeholder appears while the section loads

- **WHEN** the target section has not finished loading
- **THEN** a loading placeholder is visible in the content area in place of the previous section

#### Scenario: The shell stays interactive during the switch

- **WHEN** a section is loading
- **THEN** scrolling and clicks on the header and menus still work, and no reload is required

#### Scenario: Back and forward stay consistent

- **WHEN** the user navigates with the browser back or forward buttons
- **THEN** the selected item and the content area match the resulting URL
