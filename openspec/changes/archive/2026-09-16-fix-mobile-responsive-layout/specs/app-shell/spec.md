## ADDED Requirements

### Requirement: Mobile navigation without hidden items

Mobile navigation MUST make all sections available to the user reachable on a narrow screen. Items MUST NOT disappear behind the edge without a sign of continuation: if the items do not fit, the system MUST give a visual hint about horizontal scrolling, and the scrolling MUST be predictable.

#### Scenario: All items are reachable on a narrow screen

- **WHEN** a user with the administrator role opens the application at a width of 320px
- **THEN** all items of the mobile navigation, including "FAQ" and "Admin", are reachable

#### Scenario: Hint about the list continuing

- **WHEN** the mobile navigation items do not fit in width
- **THEN** the user sees a sign that the list continues horizontally, and scrolling moves one item at a time
