## MODIFIED Requirements

### Requirement: A clear participation result

After confirmation, the system MUST show a participation result that is identical for both roles: confirmation that the congratulation was sent to the recipient, since the administrator goes through the same scenario as the employee. The result screen MUST NOT differ by role and MUST NOT show the collection amount to the employee. Closing the result MUST end the participation scenario.

#### Scenario: Result for the employee

- **WHEN** the employee completes participation
- **THEN** the system shows confirmation that the congratulation was sent to the recipient

#### Scenario: Result for the administrator

- **WHEN** the administrator completes participation
- **THEN** the system shows the same confirmation that the congratulation was sent to the recipient as for the employee

## REMOVED Requirements

### Requirement: Role-based participation result

**Reason**: The participation result has become identical for both roles, so the requirement that the result screen differ by role no longer reflects the system's behavior.

**Migration**: Use the requirement "A clear participation result", which now describes a single result screen for all roles.
