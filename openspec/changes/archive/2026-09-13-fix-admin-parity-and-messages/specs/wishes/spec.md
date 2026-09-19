## REMOVED Requirements

### Requirement: An employee's congratulation creates a wish

**Reason**: The participation scenario has become unified for the administrator and the employee, so creating a wish from the participation form is no longer restricted to the `employee` role.

**Migration**: Use the requirement "A congratulation from the participation form creates a wish", which describes wish creation for both roles.

## ADDED Requirements

### Requirement: A congratulation from the participation form creates a wish

When a user congratulates a colleague through the participation form and confirms sending, the system MUST create a wish in their name on the board regardless of role — both for the employee and for the administrator. Wish creation MUST occur without disclosing the collection amount to the employee.

#### Scenario: An employee congratulates and adds an entry to the board

- **WHEN** the employee completes the congratulation scenario and confirms sending
- **THEN** a wish in the name of this employee appears on the board for the selected recipient

#### Scenario: The administrator congratulates and adds an entry to the board

- **WHEN** the administrator completes the congratulation scenario and confirms sending
- **THEN** a wish in the administrator's name appears on the board for the selected recipient

#### Scenario: The amount is not disclosed during congratulation

- **WHEN** the user confirms the congratulation
- **THEN** the collection amount is not displayed on the success screen or on the board

### Requirement: Wish editing by the administrator

The administrator MUST be able to change the text of any wish on the board to moderate bad-faith entries. The edited wish MUST be displayed immediately with the new text; the author, recipient, and creation time MUST NOT change. The editing capability MUST NOT be provided to employees.

#### Scenario: The administrator corrects the wish text

- **WHEN** the administrator changes the wish text and saves
- **THEN** the updated text is displayed on the board, while the author, recipient, and creation time remain the same

#### Scenario: The employee does not edit wishes

- **WHEN** a user with the `employee` role views the wish board
- **THEN** the edit controls are not displayed
