## ADDED Requirements

### Requirement: Readiness endpoint reports database availability

The application MUST expose an unauthenticated readiness endpoint that reports whether the application can currently reach its database. The endpoint MUST answer with an HTTP 200 success response only when a live database check succeeds, and MUST answer with an HTTP 503 service-unavailable response when that check fails. The endpoint MUST NOT require a signed-in user, and its answer MUST reflect the database state at the time of the request rather than a result produced when the application was built. The endpoint MUST NOT disclose database connection details or error internals in its response.

#### Scenario: Ready while the database is reachable

- **WHEN** an external service requests the readiness endpoint while the database is reachable
- **THEN** the application answers with HTTP 200

#### Scenario: Not ready while the database is unreachable

- **WHEN** an external service requests the readiness endpoint while the database cannot be reached
- **THEN** the application answers with HTTP 503 and reveals no database connection details or error internals

#### Scenario: No sign-in is required

- **WHEN** a request reaches the readiness endpoint without a session
- **THEN** the application answers with the readiness result instead of an authentication refusal

#### Scenario: The answer reflects the current state

- **WHEN** the database becomes unreachable after the application has started
- **THEN** a subsequent request to the readiness endpoint reports not ready rather than a previously computed success
