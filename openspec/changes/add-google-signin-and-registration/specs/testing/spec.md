## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Positive DonateDialog test — success scenario

The system MUST have a test verifying the full donation scenario: recipient → amount → message → confirmation → the appearance of the `success` step and the `addDonation` call with the correct arguments, without any address entry.

#### Scenario: Successful completion of all donation steps
- **WHEN** the user selects a recipient, enters a valid amount, an optional message, and clicks confirmation
- **THEN** the dialog moves to the `success` step, `addDonation` is called with `recipient.id` and the amount, and if there is text — `addWish` is called with the author and the recipient

## REMOVED Requirements

### Requirement: DonateDialog validation test — non-corporate email

**Reason**: The participation dialog no longer contains an email step and no longer validates an address, so a test for blocking a non-corporate address describes behavior that no longer exists.

**Migration**: Replaced by "DonateDialog test — no email step" for the dialog and by "Registration test — a new account must complete the profile" for identity, where the provider, not the person, supplies the address.
