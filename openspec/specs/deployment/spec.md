# deployment Specification

## Purpose
Defines how the application and its database are packaged and run together as a resource-limited container stack on a small single-host server, including where the application image is built and how the database is initialized and configured.

## Requirements

### Requirement: Application image is built outside the target server

The application container image MUST be buildable off the target server and delivered to it as an image, so that the memory-intensive production build never runs on the small host. The target server MUST only need to run the already-built stack.

#### Scenario: The server does not build the application

- **WHEN** the stack is deployed on the small host
- **THEN** no production build of the application runs on that host, and the process only starts prebuilt containers

#### Scenario: A build made elsewhere runs unchanged

- **WHEN** the image is built on another machine and delivered to the host
- **THEN** the application starts from that image and serves the application

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

### Requirement: Resource limits for a 1 GB host

The database and the application MUST each be constrained by a memory limit, and the database MUST be configured with settings appropriate for a low-memory host, so that the combined runtime fits within the host's memory budget.

#### Scenario: The stack fits the host budget

- **WHEN** the running stack is inspected on the host
- **THEN** the total memory used by the containers stays within the documented budget for the host

#### Scenario: The database starts with tuned settings

- **WHEN** the database container starts
- **THEN** it applies the low-memory configuration, including reduced buffer, cache, and connection limits

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

### Requirement: Environment-based configuration

The system MUST read deployment configuration, including the database connection and credentials, from environment variables, and MUST document the required variables. No credentials MUST be hardcoded in the images or configuration files tracked in the repository. The configuration that is actually deployed MUST pass every documented variable to the application, so that a documented variable is either present in the running application or reported as missing; a placeholder value shipped in the example file MUST NOT be usable as a real secret.

#### Scenario: Configuration comes from the environment

- **WHEN** the stack is started with the documented environment variables
- **THEN** the application and the database use those values to connect

#### Scenario: Missing required configuration fails clearly

- **WHEN** the required database connection configuration is absent
- **THEN** the application does not silently fall back to built-in data and reports the failure

#### Scenario: Missing identity-provider configuration fails clearly

- **WHEN** the identity-provider credentials or the session secret are absent
- **THEN** the application reports the failure instead of starting sign-in that cannot succeed

#### Scenario: An example environment file exists

- **WHEN** a developer needs to configure the stack
- **THEN** a committed example environment file lists the required variables without real secrets

#### Scenario: Every documented variable reaches the application

- **WHEN** the stack is started with the documented environment file on the host
- **THEN** every documented variable is present in the environment of the running application, and a variable the application needs is not silently empty

#### Scenario: A placeholder secret is refused

- **WHEN** a signing secret is unset or left at the value taken from the example file
- **THEN** the application reports the misconfiguration instead of issuing sessions signed with a known value

### Requirement: Outbound access to the identity provider

The deployed stack MUST be able to reach the Google sign-in endpoints over HTTPS, and the address Google returns the user to MUST be the address at which the application is actually reachable from the corporate network. When this access or the callback address is wrong, the application MUST report a failed sign-in instead of appearing to hang or silently granting no session.

#### Scenario: Sign-in reaches the provider

- **WHEN** a user starts sign-in on the deployed stack
- **THEN** the browser is sent to Google, and on return the application establishes the session

#### Scenario: The callback address is wrong

- **WHEN** the callback address does not match the address at which the application is reachable
- **THEN** sign-in fails with a reported error rather than leaving the user without an explanation

### Requirement: Merging into the main branch deploys the change automatically

Once the checks pass for a change merged into the main branch, the pipeline MUST build the application image, deliver it to the host, and restart the stack without manual intervention. The image MUST be built in the pipeline rather than on the host, consistent with the requirement that the host only runs a prebuilt image.

#### Scenario: A green merge reaches the host

- **WHEN** a change is merged into the main branch and its checks pass
- **THEN** the image is built, delivered to the host, and the running stack is updated to the delivered image

#### Scenario: A failing check blocks the deployment

- **WHEN** a change merged into the main branch fails its checks
- **THEN** no image is delivered and the running stack is left unchanged

### Requirement: Automated delivery preserves host state

Automated delivery MUST NOT overwrite the host's environment file, MUST NOT discard or recreate the database data volume, and MUST NOT run a schema migration automatically. The configuration tracked in the repository MUST remain the source of truth for the stack definition and the database initialization files, while secret values stay only on the host.

#### Scenario: The host environment file is preserved

- **WHEN** the pipeline delivers a new image to the host
- **THEN** the host's environment file is not overwritten and the running application still uses the host's configured values

#### Scenario: The data volume survives a deployment

- **WHEN** a deployment restarts the stack
- **THEN** the previously stored data is still present and no schema change is applied automatically

### Requirement: A previous version remains available for rollback

The delivery MUST retain the previously running image under a distinguishable reference, so that a deployment can be reverted to the preceding version without rebuilding it.

#### Scenario: The previous image can be run again

- **WHEN** the delivered version must be reverted
- **THEN** the previous image is still available on the host and can be run again without rebuilding it

### Requirement: Demo sign-in is controlled by configuration

Whether the demo sign-in is offered MUST be decided by a documented environment setting rather than by the code alone. When the setting enables the demo sign-in, the sign-in screen MUST offer it and the server MUST accept the documented test addresses. When the setting does not enable it, the sign-in screen MUST NOT render the demo control or its test-data hint, and the server MUST refuse the demo sign-in so that the strict Google-only sign-in remains available through configuration alone. The setting MUST be documented among the deployment variables, and enabling it MUST NOT remove or disable Google sign-in.

#### Scenario: The demo deployment enables demo sign-in

- **WHEN** the application starts with the demo setting enabled
- **THEN** the sign-in screen offers the demo sign-in above Google, and the documented test addresses can sign in

#### Scenario: The strict configuration stays Google-only

- **WHEN** the application starts without the demo setting enabled
- **THEN** the sign-in screen offers only Google, and a demo sign-in attempt is refused by the server

#### Scenario: Google is unaffected by the setting

- **WHEN** the demo setting is enabled
- **THEN** Google sign-in continues to work and is offered on the same screen

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

Responses of the application MUST carry `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, and a `Content-Security-Policy` that prevents the application from being framed. The policy MUST still allow the application's own inline bootstrap script to run, and MUST permit outbound connections to the Yandex Metrika endpoints so the analytics counter can send its data.

#### Scenario: The headers are present

- **WHEN** a response of the application is inspected
- **THEN** the headers above are present

#### Scenario: The policy allows the bootstrap and blocks framing

- **WHEN** a page is loaded with the policy applied while it is embedded by another site
- **THEN** the inline bootstrap script runs without a policy violation, and the page cannot be framed

#### Scenario: The policy allows analytics data to be sent

- **WHEN** a page is loaded with the policy applied and the analytics counter sends data to Yandex Metrika
- **THEN** the request to the Metrika endpoints is not blocked by the policy, and the page still cannot be framed

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
