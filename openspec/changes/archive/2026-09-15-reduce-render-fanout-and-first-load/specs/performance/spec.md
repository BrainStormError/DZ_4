## MODIFIED Requirements

### Requirement: Fonts do not block the first render

Font loading (MUST NOT) block the first render. External blocking requests for font stylesheets MUST be eliminated in favor of a loading method that does not delay text display and does not cause a noticeable layout shift when the font is swapped. On the first load of the page, only the font files of the theme that is applied to the document (MUST) be requested; fonts of other themes (MUST NOT) be requested in advance and MUST be loaded only when switching to the corresponding theme.

#### Scenario: Text is displayed without waiting for external fonts

- **WHEN** the page loads on a slow connection
- **THEN** text display does not wait for an external blocking font request

#### Scenario: A font swap does not shift the layout

- **WHEN** the browser applies the loaded font instead of the fallback
- **THEN** the position of text and blocks does not shift noticeably

#### Scenario: Only fonts of the active theme are loaded

- **WHEN** the document is opened with the default theme
- **THEN** only the families of this theme are requested in advance, and the families of other themes are not requested

#### Scenario: A saved non-default theme does not pull foreign fonts

- **WHEN** the user has a saved non-default theme and opens the page
- **THEN** the families of this theme are requested, and the families of other themes are not requested

## ADDED Requirements

### Requirement: Isolation of re-renders by data domains

A change in the data of one domain — wishes, contributions, or correspondence — (MUST NOT) cause a re-render of the interface that does not display or modify that data. A component (MUST) re-render only when the data that it displays or modifies changes.

#### Scenario: Adding a wish does not touch the rest of the interface

- **WHEN** the user submits a wish
- **THEN** the application header, the correspondence strip, and the admin table do not re-render

#### Scenario: A contribution does not touch the wish board and the correspondence

- **WHEN** the user sends a contribution
- **THEN** the wish board and the correspondence strip do not re-render

#### Scenario: Changing the gift status does not touch wishes

- **WHEN** the administrator changes the gift status or the collection amount
- **THEN** the interface that works only with wishes does not re-render

#### Scenario: A theme change and login do not infect subscribers

- **WHEN** the theme or session state has not changed
- **THEN** a re-render of the theme and session provider does not cause a re-render of its subscribers

### Requirement: Heavy features outside the critical path of the first load

If the first load of a key page does not fit within the LCP budget, the code of features that are not displayed on the first render (MUST) be connected separately from the critical path and loaded only when the feature becomes needed by the user. Features located inside a route that is already loaded as a separate page are not split further by additional lazy loading.

#### Scenario: The participation dialog does not lengthen the critical path of the home page

- **WHEN** the first load of the home page exceeds the LCP budget
- **THEN** the participation dialog code is not part of the critical path of the first render and is connected on the first opening of the dialog

#### Scenario: Loading a lazy feature does not shift the layout

- **WHEN** a lazily connected feature loads
- **THEN** a placeholder is displayed during loading that does not cause a noticeable layout shift

#### Scenario: A separate page is not split again

- **WHEN** the user opens the admin panel as a separate section
- **THEN** its code is loaded as a single section chunk without additional lazy loading inside the page
