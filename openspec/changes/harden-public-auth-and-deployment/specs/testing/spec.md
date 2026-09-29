## ADDED Requirements

### Requirement: Security behaviours are covered by tests

The automated suite MUST cover the boundary behaviours this change introduces: the transport attributes of the session cookie, the refusal of a forged or expired registration ticket, the refusal of a subject mismatch, the absence of collected amounts and journal internals from an employee's responses, the bounded participation amount, the refusal of an ineligible recipient, the recorded security events, and the defined response to a malformed thread identifier.

#### Scenario: Session cookie attributes are asserted

- **WHEN** the suite runs
- **THEN** a test asserts that the session cookie is issued with the attributes and the bounded lifetime the specifications require

#### Scenario: A forged or expired ticket creates nothing

- **WHEN** the suite runs
- **THEN** a test asserts that a ticket which is unsigned, signed with another key, expired, or already consumed creates no record and grants no access

#### Scenario: A subject mismatch is refused

- **WHEN** the suite runs
- **THEN** a test asserts that a confirmed address whose stored record carries a different subject is not signed in

#### Scenario: An employee's responses carry no amounts or journal internals

- **WHEN** the suite runs
- **THEN** a test asserts that the data an employee receives contains neither a collected amount nor a journal entry with an administrator identity, an amount, or a comment

#### Scenario: An out-of-range amount is refused without an internal error

- **WHEN** the suite runs
- **THEN** a test asserts that an amount above the documented maximum is refused with a validation error and leaves the collection unchanged

#### Scenario: An ineligible recipient is refused

- **WHEN** the suite runs
- **THEN** a test asserts that a participation naming the caller, a recipient whose birthday has already occurred this year, or a recipient who declined the gift is refused and changes no stored total

#### Scenario: Security events are recorded without secrets

- **WHEN** the suite runs
- **THEN** a test asserts that a security-relevant event produces an entry naming the event and the outcome, that no entry contains a signing secret, session value, ticket, or credential, and that a request value with a line break cannot produce a second entry

#### Scenario: A malformed thread identifier yields a client-error response

- **WHEN** the suite runs
- **THEN** a test asserts that a malformed thread identifier is answered with a documented client-error response rather than an internal error
