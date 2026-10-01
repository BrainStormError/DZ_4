# auth Specification

## Purpose

Provides sign-in for employees and administrators through Google OAuth 2.0, binds an identity to the provider subject, and defines how an unknown confirmed address is routed to registration.

## Requirements

### Requirement: Role-based access control

The system MUST hide administrative capabilities from users with the `employee` role and MUST restrict access to the administrative section to the `admin` role.

#### Scenario: Employee without administrative access

- **WHEN** a user with the `employee` role opens the administrative section directly
- **THEN** the system does not show administrative data and reports the absence of access

#### Scenario: Hidden administrative menu item

- **WHEN** a user with the `employee` role views the navigation
- **THEN** the item for going to the administrative section is not displayed

### Requirement: Directory resolved from the persistent store

The directory used for sign-in and for resolving the session MUST come from the shared persistent store rather than from data compiled into the application. The session MUST be resolved against the stored record before the markup is sent, and the role used for access decisions MUST be taken from that record.

#### Scenario: A stored employee logs in

- **WHEN** Google confirms an address that exists in the stored directory
- **THEN** the sign-in succeeds and the role is taken from the stored record

#### Scenario: An unknown address is still rejected

- **WHEN** Google confirms an address that is absent from the stored directory
- **THEN** no session is created and the person is routed to registration, where access is granted only after the profile is completed

#### Scenario: The session is resolved against the store

- **WHEN** a request carries a valid session
- **THEN** the server resolves the stored employee record and its role from the directory before sending the markup

#### Scenario: A stored employee removed from the directory ends the session

- **WHEN** the session names an address that is no longer present in the directory
- **THEN** the session is treated as invalid and the protected pages are not served

### Requirement: Sign-in with a Google account

The system MUST authenticate a user through Google OAuth 2.0, and, when the demo sign-in is enabled by configuration, additionally through the documented demo sign-in for the documented test addresses. The user's identity MUST be the email address that Google confirms for the account; apart from the documented test addresses in demo mode, the system MUST NOT accept a manually entered address as proof of identity and MUST NOT ask for a password. Any Google account MUST be allowed to attempt sign-in: admission is open by design and is described by the documented admission boundary of the deployment, and no address domain restricts access. When the confirmed address is present in the stored directory, the person MUST be signed in with the role stored in that record. When the confirmed address is absent, the person MUST be routed to registration instead of being rejected.

#### Scenario: A known account signs in

- **WHEN** Google confirms an address that is present in the stored directory
- **THEN** the system signs the person in with the role from the stored record and opens the application

#### Scenario: An unknown confirmed address starts registration

- **WHEN** Google confirms an address that is absent from the stored directory
- **THEN** the system starts the registration flow and does not grant access to the application

#### Scenario: An address that is not confirmed

- **WHEN** Google does not return a confirmed email address for the account
- **THEN** the system rejects the attempt and does not start a session

### Requirement: Registration of a new employee

When the confirmed Google address is absent from the directory, the system MUST require a registration form before granting any access. The form MUST require a full name, a birth date, and a department, and MUST NOT be submittable while any of them is missing. The full name MUST be prefilled from the confirmed Google profile and MAY be corrected by the person; the birth date and the department MUST be provided by the person. The email address MUST be the one confirmed by Google and MUST NOT be editable in the form. The stored record MUST be created only when the form is submitted completely, and the person MUST receive the `employee` role. Registration MUST NOT be able to produce an administrator.

#### Scenario: An incomplete form grants nothing

- **WHEN** the person submits the registration form with a missing full name, birth date, or department
- **THEN** the system does not create a user record and does not grant access

#### Scenario: A completed form creates an employee

- **WHEN** the person submits the form with all required fields filled in
- **THEN** the system creates a user record with the `employee` role, stores the confirmed address, and signs the person in

#### Scenario: The email cannot be replaced during registration

- **WHEN** the registration form is displayed
- **THEN** the address is taken from the confirmed Google account, is not editable, and cannot be replaced with another address

#### Scenario: Registration cannot create an administrator

- **WHEN** any person completes registration
- **THEN** the created record has the `employee` role, and the administrative capability is not granted

### Requirement: The session is issued by the server and cannot be forged

The session MUST be established by the server after a successful Google sign-in and MUST be carried in a cookie that is signed by the server and marked to be inaccessible to client-side scripts. The value MUST NOT be readable or writable through the browser's scripting interfaces. A session value that is absent, modified, or not signed by the server MUST NOT authenticate a user. The session MUST be cleared when the person signs out. The cookie that was previously written by client-side code and carried a bare address MUST NOT authenticate a user.

#### Scenario: Scripts cannot read the session

- **WHEN** client-side code inspects the cookies available to it
- **THEN** the session value is not readable, and the session cannot be changed from the client

#### Scenario: A tampered session is rejected

- **WHEN** a request carries a session value that the server did not issue or that has been modified
- **THEN** the request is treated as unauthenticated, and protected pages and data are not served

#### Scenario: Signing out clears the session

- **WHEN** the person signs out
- **THEN** the session is cleared by the server and the protected pages are no longer served

#### Scenario: The previously used cookie does not authenticate

- **WHEN** a request carries the old client-written cookie with a bare address
- **THEN** the request is treated as unauthenticated

### Requirement: Demo sign-in with documented test accounts

When the demo sign-in is enabled, the system MUST offer a demo sign-in on the sign-in screen, placed above the Google control, together with a visible label identifying it as test data and naming the documented test addresses. The demo sign-in MUST accept only the documented test addresses; any other address MUST be refused with a defined error and MUST NOT create a session, and the general directory email-entry path MUST NOT be restored. The sign-in MUST resolve the person against the stored directory and MUST take the role from that stored record, so the employee test address signs in as an employee and the administrator test address signs in as an administrator. The demo sign-in MUST NOT create a record, MUST NOT change a role, and MUST NOT grant access to a person absent from the directory. The resulting session MUST be the same server-issued session used by the other sign-in path. When the demo sign-in is enabled, Google sign-in MUST remain available on the same screen.

#### Scenario: The employee test address signs in

- **WHEN** the reviewer submits the documented employee test address while the demo sign-in is enabled
- **THEN** the system signs the person in with the role stored for that record and opens the application

#### Scenario: The administrator test address signs in

- **WHEN** the reviewer submits the documented administrator test address while the demo sign-in is enabled
- **THEN** the system signs the person in as an administrator, and the administrative section is accessible

#### Scenario: An address outside the documented set is refused

- **WHEN** the reviewer submits an address that is not one of the documented test addresses, including a stored employee address
- **THEN** the system refuses the attempt with a defined error, does not create a session, and does not start registration

#### Scenario: The demo session is the server-issued session

- **WHEN** the demo sign-in succeeds
- **THEN** the session is the same signed, script-inaccessible session used by the Google sign-in, and the role is read from the stored record on each request

#### Scenario: Google remains available in demo mode

- **WHEN** the demo sign-in is enabled and the reviewer views the sign-in screen
- **THEN** both the demo control and the Google control are offered

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
