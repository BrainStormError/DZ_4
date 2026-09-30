## ADDED Requirements

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
