## ADDED Requirements

### Requirement: No protected requests before a session exists

The application MUST NOT request protected data while no session exists. The sign-in page MUST NOT trigger requests that the server answers as unauthenticated, so that opening the sign-in page does not produce authentication errors in the browser console. Protected data MUST be requested once after a session exists.

#### Scenario: The sign-in page does not request protected data

- **WHEN** an unauthenticated user opens the sign-in page
- **THEN** no request for protected data is issued, and no unauthenticated response is produced

#### Scenario: Data is requested after sign-in

- **WHEN** the user signs in and the application opens
- **THEN** the protected data is requested once and is displayed
