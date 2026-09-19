## MODIFIED Requirements

### Requirement: Gift sending status

The admin panel (MUST) show a gift status for each employee: "Not sent", "Sent", or "Declined". For employees without a decline, the administrator (MUST) be able to change the status manually between "Not sent" and "Sent", and the change (MUST) be immediately reflected in the table. For an employee who declined the gift, the status (MUST) be displayed as "Declined" and (MUST NOT) change manually.

#### Scenario: Default status

- **WHEN** the administrator opens the table and the gift has not yet been marked for an employee
- **THEN** the status "Not sent" is displayed for this employee

#### Scenario: The administrator marks the gift as sent

- **WHEN** the administrator manually changes an employee's status to "Sent"
- **THEN** "Sent" is displayed for this employee in the table

#### Scenario: The administrator clears the status

- **WHEN** the administrator manually returns an employee's status to "Not sent"
- **THEN** "Not sent" is displayed for this employee in the table

#### Scenario: A decline is reflected as a separate status

- **WHEN** an employee has declined the gift
- **THEN** the status "Declined" is displayed for this employee in the table

#### Scenario: The decline status does not change manually

- **WHEN** the administrator views the row of an employee who declined the gift
- **THEN** the status-change controls for this employee are unavailable, and the status remains "Declined"
