## ADDED Requirements

### Requirement: Outbound access to the identity provider

The deployed stack MUST be able to reach the Google sign-in endpoints over HTTPS, and the address Google returns the user to MUST be the address at which the application is actually reachable from the corporate network. When this access or the callback address is wrong, the application MUST report a failed sign-in instead of appearing to hang or silently granting no session.

#### Scenario: Sign-in reaches the provider

- **WHEN** a user starts sign-in on the deployed stack
- **THEN** the browser is sent to Google, and on return the application establishes the session

#### Scenario: The callback address is wrong

- **WHEN** the callback address does not match the address at which the application is reachable
- **THEN** sign-in fails with a reported error rather than leaving the user without an explanation

## MODIFIED Requirements

### Requirement: Environment-based configuration

The system MUST read deployment configuration, including the database connection and credentials, the identity-provider credentials, and the secret used to sign the session, from environment variables, and MUST document the required variables. No credentials MUST be hardcoded in the images or configuration files tracked in the repository.

#### Scenario: Configuration comes from the environment

- **WHEN** the stack is started with the documented environment variables
- **THEN** the application and the database use those values to connect, and the application uses the documented identity-provider credentials and session secret

#### Scenario: Missing required configuration fails clearly

- **WHEN** the required database connection configuration is absent
- **THEN** the application does not silently fall back to built-in data and reports the failure

#### Scenario: Missing identity-provider configuration fails clearly

- **WHEN** the identity-provider credentials or the session secret are absent
- **THEN** the application reports the failure instead of starting sign-in that cannot succeed

#### Scenario: An example environment file exists

- **WHEN** a developer needs to configure the stack
- **THEN** a committed example environment file lists the required variables, including the identity-provider credentials and the session secret, without real secrets

### Requirement: Database initialization and persistence

The system MUST initialize the database schema and seed data automatically when the database starts on an empty data volume, and MUST keep the data on a persistent volume across restarts and redeployments.

#### Scenario: First start initializes the database

- **WHEN** the database starts on an empty data volume
- **THEN** the schema and the demo seed data are applied automatically

#### Scenario: Restart preserves data

- **WHEN** the stack is stopped and started again without removing the data volume
- **THEN** the previously stored data is still present

#### Scenario: Schema changes are not applied automatically

- **WHEN** the schema files change after the data volume already exists
- **THEN** the changes are NOT applied automatically, and the documented procedure for changing the schema is required

#### Scenario: A new user column on an existing volume

- **WHEN** the user record gains an additional stored field and the data volume already exists
- **THEN** the field is applied with the documented manual procedure, the existing records remain readable, and further sign-ins continue to work
