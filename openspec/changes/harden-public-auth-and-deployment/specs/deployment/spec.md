## MODIFIED Requirements

### Requirement: Single-host stack of application and database

The system MUST provide a single container configuration that runs the application and the database together on one host, with the application depending on a healthy database before it starts. The application MUST NOT be reachable except through the TLS endpoint that terminates traffic in front of it: its port MUST be bound to the loopback interface or to the stack's internal network, and no plain-HTTP origin of the application MUST be reachable from outside the host.

#### Scenario: Starting the whole stack

- **WHEN** the user starts the stack with the documented command
- **THEN** the database and the application both start, with the application waiting until the database is healthy

#### Scenario: The application reaches the database by service name

- **WHEN** the application container connects to the database
- **THEN** it connects through the stack's internal network configuration rather than a hardcoded host address

#### Scenario: The application port is not reachable from outside

- **WHEN** a request is made from outside the host to the application's port on the public address of the server
- **THEN** the connection is refused, and the application is reachable only through its HTTPS address

#### Scenario: The application keeps serving the TLS endpoint

- **WHEN** the TLS endpoint forwards a request to the application after the port was restricted
- **THEN** the application answers normally

### Requirement: Environment-based configuration

The system MUST read deployment configuration, including the database connection and credentials, from environment variables, and MUST document the required variables. No credentials MUST be hardcoded in the images or configuration files tracked in the repository. The configuration that is actually deployed MUST pass every documented variable to the application, so that a documented variable is either present in the running application or reported as missing; a placeholder value shipped in the example file MUST NOT be usable as a real secret.

#### Scenario: Configuration comes from the environment

- **WHEN** the stack is started with the documented environment variables
- **THEN** the application and the database use those values to connect

#### Scenario: Missing required configuration fails clearly

- **WHEN** the required database connection configuration is absent
- **THEN** the application does not silently fall back to built-in data and reports the failure

#### Scenario: An example environment file exists

- **WHEN** a developer needs to configure the stack
- **THEN** a committed example environment file lists the required variables without real secrets

#### Scenario: Every documented variable reaches the application

- **WHEN** the stack is started with the documented environment file on the host
- **THEN** every documented variable is present in the environment of the running application, and a variable the application needs is not silently empty

#### Scenario: A placeholder secret is refused

- **WHEN** a signing secret is unset or left at the value taken from the example file
- **THEN** the application reports the misconfiguration instead of issuing sessions signed with a known value

## ADDED Requirements

### Requirement: Stable HTTPS address with the provider configured

The deployment MUST expose the application at a stable HTTPS address that does not change between restarts, MUST terminate TLS in front of the application, and MUST document the provider-side configuration that this address requires: the exact redirect address and the consent configuration that allows a person who was not registered in advance to complete sign-in.

#### Scenario: The address survives a restart

- **WHEN** the stack and the TLS endpoint are restarted
- **THEN** the public address of the application is unchanged and sign-in continues to work without any reconfiguration

#### Scenario: The redirect address is documented exactly

- **WHEN** the deployment documentation is followed from a clean state
- **THEN** it names the exact redirect address to register with the provider

#### Scenario: An unknown person can be admitted by the provider

- **WHEN** the provider console is configured as documented
- **THEN** an account that was not pre-registered in the console can complete sign-in

### Requirement: Security response headers

Responses of the application MUST carry `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, and a `Content-Security-Policy` that prevents the application from being framed. The policy MUST still allow the application's own inline bootstrap script to run.

#### Scenario: The headers are present

- **WHEN** a response of the application is inspected
- **THEN** the headers above are present

#### Scenario: The policy allows the bootstrap and blocks framing

- **WHEN** a page is loaded with the policy applied while it is embedded by another site
- **THEN** the inline bootstrap script runs without a policy violation, and the page cannot be framed

### Requirement: The deployed configuration matches the repository

The configuration deployed on the host MUST correspond to the version tracked in the repository, and the deployment procedure MUST include a check that detects a divergence before the stack is started.

#### Scenario: A stale deployed configuration is detected

- **WHEN** the configuration on the host differs from the version in the repository
- **THEN** the documented check reports the difference before the stack is started

### Requirement: The production build enforces the linter

The system MUST fail its production build when the linter reports an error. The build configuration MUST NOT suppress lint findings, so a lint failure cannot be shipped unnoticed.

#### Scenario: A lint error fails the build

- **WHEN** the linter reports an error and the production build runs
- **THEN** the build fails and no production artifact is produced

#### Scenario: A clean tree builds

- **WHEN** the linter reports no error and the production build runs
- **THEN** the build succeeds
