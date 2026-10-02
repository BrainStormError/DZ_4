## MODIFIED Requirements

### Requirement: Server content on first render

The application MUST send server markup with meaningful content on the first render, rather than an empty document waiting for client-side hydration and reading of local storage. The session MUST be known to the server before the page markup is sent, so that the content does not depend on the moment client JavaScript executes. Theme and session restoration MUST NOT cause the main page content to disappear before hydration.

#### Scenario: The first render contains content

- **WHEN** the browser receives the page HTML before client JavaScript execution
- **THEN** the document contains the main page content, not an empty tree

#### Scenario: Theme and session restoration does not hide the page

- **WHEN** the user has a saved theme and an active login
- **THEN** the main content remains visible throughout restoration, without passing through a completely empty screen

#### Scenario: The largest text block arrives from the server

- **WHEN** the LCP of the key page is measured before hydration
- **THEN** the largest text block is already present in the sent markup and its rendering does not wait for client JavaScript

#### Scenario: The session is known before the markup is sent

- **WHEN** the browser requests a page with an active session
- **THEN** the server markup contains the content of that page, not a placeholder replaced after hydration
