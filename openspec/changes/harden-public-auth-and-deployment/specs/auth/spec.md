## ADDED Requirements

### Requirement: Session cookies carry the transport attributes of the served scheme

Whenever the application is served over HTTPS, the session cookie and the registration ticket cookie MUST be marked `Secure` and MUST use the `__Secure-` name prefix. The decision MUST follow the scheme of the address at which the application is actually reached, and MUST NOT depend on how a configuration value is written. Both cookies MUST remain `HttpOnly` and `SameSite=Lax`.

#### Scenario: The deployed stack is reached over HTTPS

- **WHEN** a person signs in on the deployed stack over HTTPS
- **THEN** the issued cookies are `Secure`, carry the `__Secure-` prefix, and are not readable by client-side scripts

#### Scenario: The configured address disagrees with the served scheme

- **WHEN** the application is reached over HTTPS while its configured address is written with an `http` scheme or is absent
- **THEN** the cookies are still issued with the `Secure` attribute and the `__Secure-` prefix

### Requirement: The session has a bounded, documented lifetime

The session MUST expire after a bounded lifetime that is configured explicitly, and the documented lifetime MUST match the configured value. A session past that lifetime MUST NOT authenticate a user.

#### Scenario: The documented lifetime matches the configuration

- **WHEN** the configured session lifetime is compared with the value stated in the documentation
- **THEN** the two agree

#### Scenario: An expired session is rejected

- **WHEN** a request carries a session that is past its configured lifetime
- **THEN** the request is treated as unauthenticated and protected pages and data are not served

### Requirement: Identity is bound to the provider subject

When a stored record carries the provider subject identifier, sign-in MUST verify that the subject of the account that signed in matches the stored value and MUST refuse the attempt when it does not. When a stored record has no subject, the confirmed address MUST still resolve it, and the subject of that sign-in MUST be recorded on the record.

#### Scenario: A subject mismatch is refused

- **WHEN** the provider confirms an address whose stored record carries a subject different from the account that signed in
- **THEN** no session is created, and the attempt ends as a failed sign-in

#### Scenario: A record without a subject is bound on its first sign-in

- **WHEN** the provider confirms an address that resolves to a stored record with no subject
- **THEN** the person is signed in with the role stored in that record, and the subject of the account is stored on it

#### Scenario: A changed address does not create a second profile

- **WHEN** a person signs in with a subject whose stored record carries a different address
- **THEN** that record is resolved instead of a new one being created

### Requirement: Registration tickets are independently signed, bound, and single-use

The registration ticket MUST be signed with a secret distinct from the secret that signs the session, MUST remain short-lived and inaccessible to client-side scripts, and MUST be accepted only together with the sign-in that produced it. A ticket MUST be consumed by a successful registration so that it cannot be replayed, and a submitted registration MUST create at most one record even when two submissions arrive at the same time.

#### Scenario: A ticket that is absent, expired, or modified creates nothing

- **WHEN** a registration is submitted without a ticket, with a ticket past its lifetime, or with a modified ticket
- **THEN** no record is created and no access is granted

#### Scenario: A ticket signed with another key is rejected

- **WHEN** a ticket is presented that was not signed with the registration secret
- **THEN** the registration is refused and no record is created

#### Scenario: A consumed ticket cannot be replayed

- **WHEN** the same ticket is submitted a second time
- **THEN** the second submission creates no additional record

#### Scenario: Concurrent submissions create exactly one record

- **WHEN** two submissions carrying the same confirmed address arrive at the same time
- **THEN** exactly one record exists afterwards and neither request ends in an unintended internal error

### Requirement: The admission boundary is explicit and documented

The documentation of sign-in MUST state the admission boundary that the deployment actually provides: which accounts may sign in and register, what the boundary does and does not protect, and which additional measures a production deployment would require. The boundary MUST NOT be described in terms of a network perimeter that the deployed configuration does not provide.

#### Scenario: The documented boundary matches the running behaviour

- **WHEN** the sign-in documentation is read against a running deployment
- **THEN** it states that any account the provider confirms may sign in and register, and that no address domain restricts admission

#### Scenario: The measures a production deployment needs are named

- **WHEN** the deployment guidance is read
- **THEN** it names the measures a production deployment would additionally require, such as an address- or tenant-restricted admission, an invitation step, or an authenticating proxy in front of the application

### Requirement: Directory responses expose only the fields the interface displays

A response that describes employees MUST NOT include the provider subject identifier or any other internal identity value, and MUST return only the fields the interface needs to display.

#### Scenario: The employee list carries no internal identifier

- **WHEN** a client reads the employee directory
- **THEN** no provider subject identifier is present in the response

#### Scenario: Displayed fields are unaffected

- **WHEN** the interface renders a recipient or a directory entry from the response
- **THEN** the name, the address, the department, the birth date, the avatar, and the role are still available

### Requirement: State-changing requests are origin-checked

A request that changes state MUST be refused when it does not originate from the application's own public address, in addition to the existing `SameSite` cookie policy.

#### Scenario: A foreign origin is refused

- **WHEN** a state-changing request carries an origin other than the application's own address
- **THEN** the request is refused and nothing is changed

#### Scenario: The application's own requests are processed

- **WHEN** a state-changing request originates from the application itself
- **THEN** it is processed as before

### Requirement: Security events are recorded

The system MUST record a structured, timestamped entry for each security-relevant event: an accepted sign-in, a refused sign-in, a completed registration, a refused authorization on a protected endpoint, and a change of a collection amount by an administrator. An entry MUST identify the event, its outcome, and the acting account where one exists. An entry MUST NOT contain a signing secret, a session value, a registration ticket, a credential, or a password. A value taken from a request MUST NOT be able to produce an additional entry or to alter the structure of an entry.

#### Scenario: Sign-in outcomes are recorded

- **WHEN** a sign-in is accepted or refused
- **THEN** an entry is written that names the event, the outcome, and the account when it is known

#### Scenario: A completed registration is recorded

- **WHEN** a registration creates an employee record
- **THEN** an entry is written that names the registration and the created account

#### Scenario: A refused authorization is recorded

- **WHEN** a protected endpoint refuses a request for a missing role or a missing ownership of the resource
- **THEN** an entry is written that names the refusing endpoint and the acting account

#### Scenario: An administrative amount change is recorded

- **WHEN** an administrator changes a collection amount
- **THEN** an entry is written that names the administrator, the recipient, and the new amount

#### Scenario: No secret reaches an entry

- **WHEN** any recorded event is written
- **THEN** the entry contains no signing secret, session value, registration ticket, credential, or password

#### Scenario: A request value cannot forge an entry

- **WHEN** a request carries a value that contains a line break or a log-control character
- **THEN** that value is neutralised and no additional entry is produced
