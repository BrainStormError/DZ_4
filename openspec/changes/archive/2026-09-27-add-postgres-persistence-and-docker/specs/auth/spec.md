## ADDED Requirements

### Requirement: Directory resolved from the persistent store

The corporate directory used for login and for resolving the session MUST come from the shared persistent store rather than from data compiled into the application. The validation rule (the address MUST end in `@company.com` and MUST exist in the directory) and the resulting error messages MUST remain unchanged.

#### Scenario: A stored employee logs in

- **WHEN** the user enters an address that exists in the stored directory
- **THEN** the login succeeds and the user's role is taken from the stored record

#### Scenario: An unknown address is still rejected

- **WHEN** the user enters `unknown.user@company.com`, which is absent from the directory
- **THEN** the login is rejected with the same "employee not found" message as before

#### Scenario: The session is resolved against the store

- **WHEN** a request carries the session cookie
- **THEN** the server resolves the stored employee record and its role from the directory before sending the markup

#### Scenario: A stored employee removed from the directory ends the session

- **WHEN** the cookie names an address that is no longer present in the directory
- **THEN** the session is treated as invalid and the protected pages are not served
