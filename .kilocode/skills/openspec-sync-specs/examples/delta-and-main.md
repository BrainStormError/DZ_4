# Worked delta-to-main merge

## Main spec before (`specs/session-management/spec.md`)

```markdown
# session-management Specification

## Purpose
Keep users signed in across requests.

## Requirements

### Requirement: Session creation
The system SHALL create a session on sign-in.

#### Scenario: First sign-in
- **WHEN** the user signs in successfully
- **THEN** the system creates a session

### Requirement: Session validation
The system SHALL validate the session on each request.

#### Scenario: Valid session
- **WHEN** the request carries a valid session
- **THEN** the system serves it
```

## Delta after

```markdown
## MODIFIED Requirements

### Requirement: Session creation
The system SHALL create a session on sign-in and rotate its token on refresh.

#### Scenario: First sign-in
- **WHEN** the user signs in successfully
- **THEN** the system creates a session

#### Scenario: Refresh
- **WHEN** the client refreshes an active session
- **THEN** the system rotates the token

## RENAMED Requirements

- FROM: `### Requirement: Session validation`
- TO: `### Requirement: Session token verification`
```

## Result — add the scenario, keep the untouched one, rename in place

```markdown
# session-management Specification

## Purpose
Keep users signed in across requests.

## Requirements

### Requirement: Session creation
The system SHALL create a session on sign-in and rotate its token on refresh.

#### Scenario: First sign-in
- **WHEN** the user signs in successfully
- **THEN** the system creates a session

#### Scenario: Refresh
- **WHEN** the client refreshes an active session
- **THEN** the system rotates the token

### Requirement: Session token verification
The system SHALL validate the session on each request.

#### Scenario: Valid session
- **WHEN** the request carries a valid session
- **THEN** the system serves it
```

## Success summary

```markdown
## Specs Synced: retire-legacy-sessions

Updated main specs:

**session-management**:
- Modified requirement: "Session creation" (added 1 scenario)
- Renamed requirement: "Session validation" -> "Session token verification"

Main specs are now updated. The change remains active - archive when implementation is complete.
```
