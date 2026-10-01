## ADDED Requirements

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
