## MODIFIED Requirements

### Requirement: Transition to the correspondence tab from the header

A click on the unread messages indicator in the header (MUST) open the frequently asked questions section with the correspondence tab active. The active tab MUST correspond to the page address in any way of navigation, including a transition from an already open section page without a full reload. Switching the tab by the user themselves (MUST NOT) cause a server rendering request for the route and (MUST NOT) show an empty content placeholder: the active tab MUST change immediately, without waiting for the server response, and the page address MUST update so that a direct link and a reload open the same tab.

#### Scenario: Navigation from the header opens the correspondence

- **WHEN** the administrator clicks the unread messages indicator in the header
- **THEN** the correspondence tab opens, and the administrator can select a thread and reply

#### Scenario: Transition from an already open section page

- **WHEN** the administrator is already on the frequently asked questions section page on the questions tab and clicks the indicator in the header
- **THEN** the correspondence tab becomes active without reloading the page

#### Scenario: A direct link to the correspondence tab

- **WHEN** the user opens the correspondence tab address directly
- **THEN** the correspondence tab is displayed

#### Scenario: Switching the tab without contacting the server

- **WHEN** the user switches the tab on the frequently asked questions page
- **THEN** the active tab changes immediately, the content placeholder is not shown, and no server rendering request for the route is performed

#### Scenario: The address reflects the active tab

- **WHEN** the user switches the tab
- **THEN** the page address corresponds to the active tab and the same tab opens after a reload

#### Scenario: Going back through history does not lose the tab

- **WHEN** the user switches the tab and returns to the frequently asked questions page
- **THEN** the active tab corresponds to the page address
