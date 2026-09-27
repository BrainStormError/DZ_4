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

The system MUST provide a single container configuration that runs the application and the database together on one host, with the application depending on a healthy database before it starts.

#### Scenario: Starting the whole stack

- **WHEN** the user starts the stack with the documented command
- **THEN** the database and the application both start, with the application waiting until the database is healthy

#### Scenario: The application reaches the database by service name

- **WHEN** the application container connects to the database
- **THEN** it connects through the stack's internal network configuration rather than a hardcoded host address

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

### Requirement: Environment-based configuration

The system MUST read deployment configuration, including the database connection and credentials, from environment variables, and MUST document the required variables. No credentials MUST be hardcoded in the images or configuration files tracked in the repository.

#### Scenario: Configuration comes from the environment

- **WHEN** the stack is started with the documented environment variables
- **THEN** the application and the database use those values to connect

#### Scenario: Missing required configuration fails clearly

- **WHEN** the required database connection configuration is absent
- **THEN** the application does not silently fall back to built-in data and reports the failure

#### Scenario: An example environment file exists

- **WHEN** a developer needs to configure the stack
- **THEN** a committed example environment file lists the required variables without real secrets
