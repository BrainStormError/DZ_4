# testing Specification

## Purpose
Provides automatic testing infrastructure: unit and integration tests for business components with mock providers, to guarantee the correctness of critical user scenarios and prevent regressions.

## Requirements

### Requirement: Test runner and environment are configured

The system MUST provide a configured Vitest with a jsdom environment, path aliases (`@/*`), a global setup file with `@testing-library/jest-dom`, and the npm scripts `test` / `test:watch`.

#### Scenario: Running the tests passes successfully
- **WHEN** `npm run test` is executed
- **THEN** Vitest starts, finds the test files `*.test.{ts,tsx}`, and runs them without configuration errors

### Requirement: Render utility with providers

The system MUST provide a `renderWithProviders(ui)` wrapper that mounts a component inside `ThemeProvider`, `AuthProvider`, `DataProvider` for isolated testing of business components.

#### Scenario: A component renders with the contexts
- **WHEN** a test calls `renderWithProviders(<WishBoard />)`
- **THEN** the component gets access to `useAuth`, `useData`, `useTheme` without the error "must be used within Provider"

### Requirement: Positive DonateDialog test — success scenario

The system MUST have a test verifying the full donation scenario: recipient → amount → message → confirmation → the appearance of the `success` step and the `addDonation` call with the correct arguments, without any address entry.

#### Scenario: Successful completion of all donation steps
- **WHEN** the user selects a recipient, enters a valid amount, an optional message, and clicks confirmation
- **THEN** the dialog moves to the `success` step, `addDonation` is called with `recipient.id` and the amount, and if there is text — `addWish` is called with the author and the recipient

### Requirement: AdminTable roles test — hiding amounts from an employee

The system MUST have a test verifying that when `AdminTable` is rendered under the `employee` role the amounts table is not displayed, and under the `admin` role it is displayed with a working "Edit" button (available only when a reason is selected).

#### Scenario: Rendering under employee hides the amounts
- **WHEN** `AuthProvider` sets the role `employee`
- **THEN** the collection table is not rendered (or shows the placeholder "Access denied")

#### Scenario: Rendering under admin shows the table and editing works
- **WHEN** `AuthProvider` sets the role `admin`
- **THEN** the amounts table is visible, the "Edit" button opens the modal, and saving is blocked until a reason is selected and a comment is entered

### Requirement: DonateDialog test — no email step

The system MUST have a test verifying that the participation dialog does not ask for an email address: the scenario proceeds from the recipient selection to the amount without any address input, and no address validation blocks the transition.

#### Scenario: The dialog has no address step
- **WHEN** a test renders `DonateDialog` with a recipient and an authorized user
- **THEN** no address input is present in the dialog, and the test reaches the amount step without entering an address

### Requirement: Registration test — a new account must complete the profile

The system MUST have a test verifying that sign-in with a Google account whose address is absent from the directory does not grant access until the registration form is completed, and that a submitted form creates a user with the `employee` role using the address confirmed by the provider.

#### Scenario: An incomplete profile does not grant access
- **WHEN** a test completes sign-in with an unknown confirmed address and leaves the birth date or the department empty
- **THEN** no user record is created and access to the application is not granted

#### Scenario: A completed profile creates an employee
- **WHEN** a test submits the registration form with a full name, a birth date, and a department
- **THEN** a user record with the `employee` role is created with the confirmed address, and the person is signed in

### Requirement: Session test — a forged session is rejected

The system MUST have a test verifying that a request carrying a session value the server did not issue, or the old client-written cookie with a bare address, is treated as unauthenticated and does not receive protected data.

#### Scenario: A modified session value is rejected
- **WHEN** a test sends a request with a modified or unsigned session value
- **THEN** the response is unauthenticated, and no protected data is returned

#### Scenario: The old cookie does not authenticate
- **WHEN** a test sends a request with the previously used client-written cookie
- **THEN** the response is unauthenticated

### Requirement: The checks run automatically on every change

The project MUST provide a continuous-integration pipeline that, on each push and each pull request, installs the dependencies, runs the linter, the type checker, and the test suite, and reports a failure when any of them fails.

#### Scenario: A pull request runs the checks

- **WHEN** a pull request is opened or updated
- **THEN** the pipeline installs the dependencies, runs the linter, the type checker, and the tests, and reports a result

#### Scenario: A failing test fails the pipeline

- **WHEN** the test suite fails
- **THEN** the pipeline reports a failure

### Requirement: Leveled logging and failure recording are covered by tests

The automated suite MUST assert the entry level and the JSON structure of an emitted entry, the routing of a warning to the standard-error stream, and that an unexpected repository or database failure produces an `error` entry naming the failed operation while the client still receives the defined failure response.

#### Scenario: The level and structure of an entry are asserted

- **WHEN** the suite runs
- **THEN** a test asserts that an entry is one line of JSON carrying the expected level, event, outcome, and timestamp

#### Scenario: A warning is routed to the error stream

- **WHEN** the suite runs
- **THEN** a test asserts that a warning-level entry is written to the standard-error stream

#### Scenario: An unexpected failure is recorded

- **WHEN** the suite runs
- **THEN** a test asserts that a failed repository or database operation produces an `error` entry and that the client still receives the defined failure response

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
