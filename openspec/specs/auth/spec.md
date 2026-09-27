# auth Specification

## Purpose

Provides login for employees and administrators via corporate email and defines a single rule for validating a corporate address in all scenarios where it is requested.

## Requirements

### Requirement: Login via corporate email

The system MUST allow login only with an address that ends in `@company.com` and is present in the corporate directory. After a successful login, the system MUST store the session, and the user's role MUST be determined from the directory data.

#### Scenario: Successful employee login

- **WHEN** the user enters the address `anna.smirnova@company.com` from the directory
- **THEN** the system performs the login and opens the home page with the rights of the `employee` role

#### Scenario: Address outside the corporate domain

- **WHEN** the user enters an address that does not end in `@company.com`
- **THEN** the system rejects the login with a message about the need to use corporate email

#### Scenario: Unknown corporate address

- **WHEN** the user enters the address `unknown.user@company.com`, which is absent from the directory
- **THEN** the system rejects the login with a message that the employee was not found

### Requirement: Single rule for validating a corporate address

The system MUST apply the same corporate email validation rule in all forms where the address is requested: at login and when confirming participation in a collection. An address is considered valid only if it ends in `@company.com` and is found in the corporate directory.

#### Scenario: Consistency of validation between forms

- **WHEN** the address `unknown.user@company.com` is rejected at login as not found
- **THEN** the same address is also rejected when confirming participation in a collection, and is not accepted solely on the basis of the domain

### Requirement: Role-based access control

The system MUST hide administrative capabilities from users with the `employee` role and MUST restrict access to the administrative section to the `admin` role.

#### Scenario: Employee without administrative access

- **WHEN** a user with the `employee` role opens the administrative section directly
- **THEN** the system does not show administrative data and reports the absence of access

#### Scenario: Hidden administrative menu item

- **WHEN** a user with the `employee` role views the navigation
- **THEN** the item for going to the administrative section is not displayed

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
