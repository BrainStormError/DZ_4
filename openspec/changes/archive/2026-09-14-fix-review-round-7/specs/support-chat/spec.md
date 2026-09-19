## ADDED Requirements

### Requirement: Navigation to the correspondence tab from the header

Navigation via the unread-messages indicator in the header (MUST) open the frequently asked questions section with the correspondence tab active. The active tab (MUST) correspond to the page address for any navigation method, including navigation from an already open page of the section without a full reload.

#### Scenario: Navigation from the header opens the correspondence

- **WHEN** the administrator presses the unread-messages indicator in the header
- **THEN** the correspondence tab opens, and the administrator can select a thread and reply

#### Scenario: Navigation from an already open page of the section

- **WHEN** the administrator is already on the frequently asked questions page on the questions tab and presses the indicator in the header
- **THEN** the correspondence tab becomes active without reloading the page

#### Scenario: A direct link to the correspondence tab

- **WHEN** the user opens the address of the correspondence tab directly
- **THEN** the correspondence tab is displayed
