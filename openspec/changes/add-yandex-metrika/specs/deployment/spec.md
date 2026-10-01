## MODIFIED Requirements

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
