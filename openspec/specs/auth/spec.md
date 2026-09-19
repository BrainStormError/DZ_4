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
