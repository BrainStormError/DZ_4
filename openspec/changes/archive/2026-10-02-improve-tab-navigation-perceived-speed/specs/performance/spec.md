## ADDED Requirements

### Requirement: Responsive feedback when switching sections

Section switching MUST present its feedback without waiting for the target route's server response, and that feedback MUST NOT cause layout shift. Activating a header navigation item MUST stay within the INP budget, and replacing the loading placeholder with the section content MUST stay within the CLS budget defined for the key pages.

#### Scenario: Feedback does not wait for the route

- **WHEN** the user activates a header navigation item
- **THEN** the loading feedback is displayed before the target route's response arrives

#### Scenario: The placeholder replacement does not shift the layout

- **WHEN** the loading placeholder is replaced by the section content
- **THEN** the CLS of the transition does not exceed 0.1

#### Scenario: Activating a header item stays responsive

- **WHEN** the user activates a header navigation item
- **THEN** the interaction latency does not exceed 200 milliseconds
