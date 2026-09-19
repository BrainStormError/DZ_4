## ADDED Requirements

### Requirement: Optional congratulation when sending funds

When sending a monetary congratulation, the user MUST be able to attach wish text or send funds without it. If text is provided, the system MUST create a wish that is shown according to the recipient's birthday rule. If text is not provided, the system MUST NOT create a wish and only adds the amount to the collection. A monetary congratulation MUST be sendable in advance, regardless of the current date.

#### Scenario: Funds with a wish

- **WHEN** the user specifies an amount and a non-empty congratulation text and confirms sending
- **THEN** the amount is added to the collection, and the wish is created and shown on the board according to the recipient's birthday rule

#### Scenario: Funds without a wish

- **WHEN** the user specifies an amount and leaves the congratulation text empty, then confirms sending
- **THEN** the amount is added to the collection, and no wish is created

#### Scenario: Result of sending without a wish

- **WHEN** the user completes sending funds without congratulation text
- **THEN** the result screen reports that the amount was added to the collection and does not claim that a congratulation was delivered

#### Scenario: Sending in advance

- **WHEN** the user sends a monetary congratulation before the recipient's birthday
- **THEN** the amount is added to the collection, and the created wish is not shown on the board until the recipient's birthday
