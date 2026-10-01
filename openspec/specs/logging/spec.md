# logging Specification

## Purpose
Defines leveled, structured application logging: how each entry is shaped and leveled, how entries are routed between output streams, and how unexpected failures are recorded where they occur.

## Requirements

### Requirement: Log entries are leveled and structured

Every record the application emits MUST be a single JSON object occupying one line and MUST carry a level, an event name, an outcome, and a timestamp. The level MUST be one of `info`, `warn`, or `error`. The remaining fields of the entry MUST preserve the existing redaction of secret-named fields and the existing neutralisation of line breaks and control characters taken from a request.

#### Scenario: An entry carries its level and event

- **WHEN** a recordable event is emitted
- **THEN** exactly one line is written, it parses as a single JSON object, and it contains the level, the event name, the outcome, and the timestamp

#### Scenario: A request value cannot restructure an entry

- **WHEN** an emitted context value contains a line break or a control character
- **THEN** the value is neutralised and no additional entry is produced

### Requirement: The level follows the recorded outcome

The level of an entry MUST be derived from the outcome it records. An accepted sign-in, a created registration, and a successful amount change MUST be recorded as `info`; a refused sign-in, a refused authorization, and an attempt to register an already-registered address MUST be recorded as `warn`; an unexpected failure MUST be recorded as `error`.

#### Scenario: An accepted outcome is informational

- **WHEN** a sign-in is accepted, a registration is created, or an amount change succeeds
- **THEN** the emitted entry carries the `info` level

#### Scenario: A refused outcome is a warning

- **WHEN** a sign-in or an authorization is refused, or an already-registered address is submitted
- **THEN** the emitted entry carries the `warn` level

### Requirement: Entries are routed by severity

An entry at the `warn` or `error` level MUST be written to the standard-error stream, and an entry at the `info` level MUST be written to the standard-output stream, so that the two severities can be handled differently by the host's log collection.

#### Scenario: A warning is separated from informational entries

- **WHEN** an entry at the `warn` level is emitted while an entry at the `info` level is also emitted
- **THEN** the warning is written to the standard-error stream and the informational entry to the standard-output stream

### Requirement: Unexpected failures are recorded at their source

When a repository or database operation fails while a request is being handled, the application MUST emit a single `error` entry naming the failed operation and the event, before the failure response is returned. Emitting the entry MUST NOT change the response the client receives and MUST NOT expose a signing secret, a session value, a registration ticket, a credential, or a password.

#### Scenario: A database failure produces an error entry

- **WHEN** a request triggers a repository or database operation that fails unexpectedly
- **THEN** an `error` entry naming the failed operation is written, and the client still receives the defined failure response

#### Scenario: A failure entry carries no secret

- **WHEN** an `error` entry is written for a failed operation
- **THEN** the entry contains no signing secret, session value, registration ticket, credential, or password
