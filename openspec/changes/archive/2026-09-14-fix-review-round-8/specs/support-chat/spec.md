## ADDED Requirements

### Requirement: Accessibility of the administrator reply field

The administrator reply field in a conversation thread MUST remain visible and usable for input with any number of employee requests, including in the desktop layout when the request list is long.

#### Scenario: Many requests on desktop

- **WHEN** the administrator opens a conversation, and the employee list contains so many threads that it does not fit in the chat area
- **THEN** the "Reply to employee..." field is visible and available for input, without being clipped past the bottom edge

#### Scenario: The request list scrolls independently

- **WHEN** the request list is long
- **THEN** the list scrolls within its own area, and the reply field stays in place and remains available
