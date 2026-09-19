## Purpose

Provides login for employees and administrators by corporate email and defines a unified corporate address validation rule for all scenarios where it is requested.

## ADDED Requirements

### Requirement: Login by corporate email

The system MUST allow login only with an address that ends with `@company.com` and is present in the corporate directory. After a successful login, the system MUST save the session, and the user's role MUST be determined from the directory data.

#### Scenario: Successful employee login

- **WHEN** the user enters the address `anna.smirnova@company.com` from the directory
- **THEN** the system logs in and opens the home page with `employee` role permissions

#### Scenario: Address outside the corporate domain

- **WHEN** the user enters an address that does not end with `@company.com`
- **THEN** the system rejects the login with a message that a corporate email must be used

#### Scenario: Unknown corporate address

- **WHEN** the user enters the address `unknown.user@company.com`, which is absent from the directory
- **THEN** the system rejects the login with a message that the employee was not found

### Requirement: Unified corporate address validation rule

The system MUST apply the same corporate email validation rule in all forms where the address is requested: at login and when confirming participation in the collection. An address is considered valid only if it ends with `@company.com` and is found in the corporate directory.

#### Scenario: Validation consistency between forms

- **WHEN** the address `unknown.user@company.com` is rejected at login as not found
- **THEN** the same address is rejected when confirming participation in the collection as well, rather than being accepted based only on the domain

### Requirement: Role-based access control

The system MUST hide administrative capabilities from users with the `employee` role and MUST restrict access to the administrative section to the `admin` role.

#### Scenario: Employee without administrative access

- **WHEN** a user with the `employee` role opens the administrative section directly
- **THEN** the system does not show administrative data and reports the absence of access

#### Scenario: Hidden administrative menu item

- **WHEN** a user with the `employee` role views the navigation
- **THEN** the navigation item to the administrative section is not displayed
