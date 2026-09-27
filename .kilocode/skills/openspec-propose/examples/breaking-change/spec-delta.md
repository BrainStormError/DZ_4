## MODIFIED Requirements

### Requirement: Session creation

The system SHALL issue a signed session token that rotates on each refresh.

#### Scenario: First sign-in

- **WHEN** the user signs in successfully
- **THEN** the system issues a signed token

#### Scenario: Refresh

- **WHEN** the client refreshes an active session
- **THEN** the system rotates the token and invalidates the previous one

## REMOVED Requirements

### Requirement: Legacy session cookie

## RENAMED Requirements

- FROM: `### Requirement: Session validation`
- TO: `### Requirement: Session token verification`
