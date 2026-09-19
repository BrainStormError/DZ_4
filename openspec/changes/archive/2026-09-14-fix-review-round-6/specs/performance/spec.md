## Purpose

Fixes target Core Web Vitals budgets for the application's key pages and requires checking the actual loading, responsiveness, and visual stability metrics on real controls.

## ADDED Requirements

### Requirement: Core Web Vitals budgets

The application's key pages (MUST) fit within the target Core Web Vitals budgets: LCP no more than 2.5 seconds, INP no more than 200 milliseconds, CLS no more than 0.1. The metrics (MUST) be checked on the key pages and (MUST NOT) exceed the specified values.

#### Scenario: LCP within budget

- **WHEN** the LCP of a key page is measured
- **THEN** the value does not exceed 2.5 seconds

#### Scenario: INP within budget

- **WHEN** the INP is measured during interaction with a key control of the page
- **THEN** the value does not exceed 200 milliseconds

#### Scenario: CLS within budget

- **WHEN** the CLS of a key page is measured during loading
- **THEN** the value does not exceed 0.1

### Requirement: Fonts do not block the first render

Font loading (MUST NOT) block the first render. External blocking requests for font stylesheets (MUST) be eliminated in favor of a loading method that does not delay the display of text and does not cause a noticeable layout shift when the font is substituted.

#### Scenario: Text is displayed without waiting for external fonts

- **WHEN** the page loads on a slow connection
- **THEN** the display of text does not wait for an external blocking font request

#### Scenario: Font substitution does not shift the layout

- **WHEN** the browser applies the loaded font instead of the fallback
- **THEN** the position of the text and blocks does not shift noticeably

### Requirement: Server-side content on the first render

The application (MUST) serve server-side markup with meaningful content on the first render, rather than an empty document waiting for client-side hydration and reading of local storage. Restoring the theme and session (MUST NOT) cause the main page content to disappear before hydration.

#### Scenario: The first render contains content

- **WHEN** the browser receives the page HTML before client-side JavaScript runs
- **THEN** the document contains the main page content rather than an empty tree

#### Scenario: Restoring the theme and session does not hide the page

- **WHEN** the theme and an active session are stored in local storage
- **THEN** the main content remains visible throughout the restoration, without going through a completely empty screen
