## ADDED Requirements

### Requirement: Email sign-in

The system SHALL authenticate a user by email and password and start a session.

#### Scenario: Valid credentials

- **WHEN** the user submits a registered email and the correct password
- **THEN** the system creates a session and redirects to `/account`

#### Scenario: Invalid credentials

- **WHEN** the user submits an unknown email or a wrong password
- **THEN** the system shows an error and creates no session

### Requirement: Protected routes

The system SHALL require a session before serving `/account/**`.

#### Scenario: Anonymous visitor

- **WHEN** an unauthenticated visitor requests `/account`
- **THEN** the system redirects to `/login`
