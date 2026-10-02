## ADDED Requirements

### Requirement: Immediate feedback when switching sections

The application shell MUST acknowledge a section switch as soon as the user activates a header navigation item: the activated item MUST become visually selected and a loading placeholder MUST appear in the content area, without waiting for the target route to finish loading. The shell (header, menus, footer) MUST remain mounted and interactive, and the placeholder MUST NOT block scrolling or interaction, nor require a page reload.

#### Scenario: The selected item updates immediately

- **WHEN** the user activates a header navigation item
- **THEN** that item becomes selected in the same interaction, before the target section content appears

#### Scenario: A loading placeholder appears while the section loads

- **WHEN** the target section has not finished loading
- **THEN** a loading placeholder is visible in the content area in place of the previous section

#### Scenario: The shell stays interactive during the switch

- **WHEN** a section is loading
- **THEN** scrolling and clicks on the header and menus still work, and no reload is required

#### Scenario: Back and forward stay consistent

- **WHEN** the user navigates with the browser back or forward buttons
- **THEN** the selected item and the content area match the resulting URL
