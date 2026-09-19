## Purpose

Provides an automated testing infrastructure: unit and integration tests for business components with mock providers, to guarantee the correctness of critical user scenarios and prevent regressions.

## ADDED Requirements

### Requirement: Test runner and environment are configured

The system MUST provide a configured Vitest with a jsdom environment, path aliases (`@/*`), a global setup file with `@testing-library/jest-dom`, and the npm scripts `test` / `test:watch`.

#### Scenario: Running the tests succeeds
- **WHEN** `npm run test` is executed
- **THEN** Vitest starts, finds the `*.test.{ts,tsx}` test files, and runs them without configuration errors

### Requirement: Render utility with providers

The system MUST provide a `renderWithProviders(ui)` wrapper that mounts a component inside `ThemeProvider`, `AuthProvider`, `DataProvider` for isolated testing of business components.

#### Scenario: A component renders with contexts
- **WHEN** a test calls `renderWithProviders(<WishBoard />)`
- **THEN** the component gets access to `useAuth`, `useData`, `useTheme` without the "must be used within Provider" error

### Requirement: DonateDialog positive test — successful scenario

The system MUST have a test that verifies the complete donation scenario: entering a corporate email → amount → message → confirmation → the appearance of the `success` step and the call to `addDonation` with the correct arguments.

#### Scenario: Successfully passing all donation steps
- **WHEN** the user enters an `@company.com` email, a valid amount, an optional message, and clicks confirmation
- **THEN** the dialog moves to the `success` step, `addDonation` is called with `recipient.id` and the amount, and if there is text, `addWish` is called with the author and the recipient

### Requirement: DonateDialog validation test — non-corporate email

The system MUST have a test that verifies the blocking of the transition to the next step when a non-corporate email (`user@gmail.com`) is entered, with an inline error displayed.

#### Scenario: Blocking at the email step with an invalid email
- **WHEN** the user enters `user@gmail.com` and clicks "Continue"
- **THEN** an `Alert` with the error text is displayed, the "Continue" button does not move to the `amount` step, `addDonation` is not called

### Requirement: AdminTable roles test — hiding amounts from an employee

The system MUST have a test that verifies that when `AdminTable` is rendered under the `employee` role, the amounts table is not displayed, and under the `admin` role it is displayed with a working "Edit" button (available only when a reason is selected).

#### Scenario: Rendering under employee hides the amounts
- **WHEN** `AuthProvider` sets the `employee` role
- **THEN** the collections table does not render (or shows the placeholder "Access denied")

#### Scenario: Rendering under admin shows the table and editing works
- **WHEN** `AuthProvider` sets the `admin` role
- **THEN** the amounts table is visible, the "Edit" button opens the modal, saving is blocked until a reason is selected and a comment is entered
