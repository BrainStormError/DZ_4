## ADDED Requirements

### Requirement: Wishes are durable and shared

A wish created through the wish form or through a monetary congratulation, and any text edited by the administrator, MUST be stored in the shared persistent store. The wish MUST remain available after a page reload and after an application restart, and MUST be visible to users other than the author, subject to the existing birthday display rule.

#### Scenario: A created wish survives a reload

- **WHEN** a user creates a wish and reloads the board page
- **THEN** the wish is still displayed according to the birthday display rule

#### Scenario: A wish is visible to another user

- **WHEN** one user creates a wish and another user opens the board
- **THEN** the second user sees the wish

#### Scenario: An administrator edit is durable

- **WHEN** the administrator edits the text of a wish and the board is reloaded
- **THEN** the edited text is displayed, and the author, recipient, and creation time are unchanged

#### Scenario: A created wish is attributed to a stored author

- **WHEN** a wish is created
- **THEN** the stored wish references the creating user and the recipient from the directory, and the board still shows the author's real name with the corporate nickname
