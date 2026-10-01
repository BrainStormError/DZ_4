## MODIFIED Requirements

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

## ADDED Requirements

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
