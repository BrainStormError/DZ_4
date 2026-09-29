## ADDED Requirements

### Requirement: Sign-in with a Google account

The system MUST authenticate a user only through Google OAuth 2.0. The user's identity MUST be the email address that Google confirms for the account; the system MUST NOT accept a manually entered address as proof of identity and MUST NOT ask for a password. Any Google account MUST be allowed to attempt sign-in, because the corporate network is the perimeter and no address domain restricts access. When the confirmed address is present in the stored directory, the person MUST be signed in with the role stored in that record. When the confirmed address is absent, the person MUST be routed to registration instead of being rejected.

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Login via corporate email

**Reason**: Sign-in is performed through a Google account instead of a manually typed corporate address, so the corporate-domain requirement and the directory-as-allowlist rejection no longer describe the behavior.

**Migration**: Use the "Sign-in with a Google account" requirement. A person whose confirmed address is absent from the directory is routed to registration instead of being rejected.

### Requirement: Single rule for validating a corporate address

**Reason**: No form asks for a corporate address any more: sign-in takes the address from Google, and the participation dialog no longer asks for an address, so there is no shared address-validation rule to apply.

**Migration**: The sender of a participation is the authorized user, as stated by the `donations` capability; nothing needs to be entered or validated in a form.
