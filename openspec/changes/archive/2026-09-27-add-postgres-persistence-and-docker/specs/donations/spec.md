## ADDED Requirements

### Requirement: Collection amounts and the change log are durable and shared

Participation amounts, administrator amount changes with their reason and comment, gift status, and the resulting change-log entries MUST be stored in the shared persistent store. They MUST remain correct after a page reload and after an application restart, and administrative changes MUST be visible to the administrator on any device.

#### Scenario: A participation amount survives a reload

- **WHEN** a participant adds an amount and the collection data is reloaded
- **THEN** the recipient's total includes that amount

#### Scenario: An administrative amount change is durable

- **WHEN** the administrator saves a new amount with a reason and a comment and the data is reloaded
- **THEN** the new amount is shown and the change-log entry with the previous and new values is present

#### Scenario: Gift status is durable

- **WHEN** the administrator marks a recipient's gift as sent or not sent and the data is reloaded
- **THEN** the gift status is unchanged

#### Scenario: A declined gift stays zero

- **WHEN** an amount change with the "refund (gift declined)" reason has been stored and the data is reloaded
- **THEN** the recipient's amount remains zero and further amount changes remain unavailable

#### Scenario: Concurrent participation does not lose an amount

- **WHEN** two contributions to the same recipient are stored
- **THEN** the recipient's total includes both amounts

#### Scenario: Amounts stay an aggregate

- **WHEN** the collection data is read after contributions
- **THEN** only the total per recipient is available, and no per-contributor breakdown is exposed
