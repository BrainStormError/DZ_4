# data-persistence Specification

## Purpose
Provides one shared, durable source of truth for the corporate directory, wishes, collection amounts, the amount-change log, and chat messages, so that what one user enters survives reloads and restarts and is visible to the other users.

## Requirements

### Requirement: Shared durable store

The system MUST store the corporate directory, wishes, collection amounts, the amount-change log, and chat messages in a database, and NOT in per-browser or per-process memory. A value written by one user MUST be readable by the same user after a page reload and by other users, and MUST survive an application restart.

#### Scenario: A change survives a page reload

- **WHEN** a user creates a wish, sends a contribution, changes an amount, or sends a message and then reloads the page
- **THEN** the change is still present after the reload

#### Scenario: A change survives an application restart

- **WHEN** the application is restarted without deleting its data volume
- **THEN** the previously stored wishes, amounts, log entries, and messages are still present

#### Scenario: A change is visible to another user

- **WHEN** one user creates a wish or a message and another user opens the corresponding page
- **THEN** the second user sees the created value

#### Scenario: The store starts empty without seeded values

- **WHEN** the store has been initialized but not yet populated with the demo data
- **THEN** the system shows empty states instead of failing

### Requirement: Shared seed data

The system MUST be able to initialize the store for the demo from an empty state with the same directory entries, wishes, collection amounts, the amount-change log entries, and chat threads that the application previously contained as built-in sample data, so that the documented demo accounts and boards work on a fresh installation.

#### Scenario: A fresh installation supports the documented accounts

- **WHEN** the store is initialized from an empty state and the user logs in with a documented demo account
- **THEN** the login succeeds and the corresponding boards and records are shown

#### Scenario: Seeded values are not duplicated

- **WHEN** the initialization data is applied more than once to the same store
- **THEN** the records are not duplicated

### Requirement: Server-side data access

The client MUST NOT access the database directly. All reads and mutations MUST go through server endpoints that validate the input, resolve the current user, and enforce the role required for the operation.

#### Scenario: An unauthenticated request is rejected

- **WHEN** a request to read or change application data is made without a valid session
- **THEN** the server rejects it and does not return or change protected data

#### Scenario: An employee cannot perform an administrative change

- **WHEN** a user with the `employee` role sends a request reserved for the `admin` role
- **THEN** the server rejects it and no data is changed

#### Scenario: Invalid input is rejected on the server

- **WHEN** a request carries an invalid value, such as a non-positive participation amount or a missing required amount-change reason or comment
- **THEN** the server rejects it and no data is changed

#### Scenario: A combined money-and-wish submission is atomic

- **WHEN** a submission both adds an amount and creates a wish
- **THEN** either both changes are stored or neither is stored

### Requirement: Collection totals remain an aggregate

The system MUST store collection amounts as a single total per recipient. It MUST NOT store or expose how much each individual participant contributed.

#### Scenario: No per-contributor data exists

- **WHEN** any user or administrator reads collection data
- **THEN** only the aggregate amount per recipient is available, and no individual contribution records are exposed
