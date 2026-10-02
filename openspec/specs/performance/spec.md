# performance Specification

## Purpose

Establishes target Core Web Vitals budgets for the application's key pages and requires verifying the actual metrics of loading, responsiveness, and visual stability on real controls.

## Requirements

### Requirement: Core Web Vitals budgets

The application's key pages MUST fit within the target Core Web Vitals budgets: LCP no more than 2.5 seconds, INP no more than 200 milliseconds, CLS no more than 0.1. The metrics MUST be verified on the key pages and MUST NOT exceed the specified values.

#### Scenario: LCP within budget

- **WHEN** the LCP of a key page is measured
- **THEN** the value does not exceed 2.5 seconds

#### Scenario: INP within budget

- **WHEN** the INP is measured when interacting with a key control of the page
- **THEN** the value does not exceed 200 milliseconds

#### Scenario: CLS within budget

- **WHEN** the CLS of a key page is measured during loading
- **THEN** the value does not exceed 0.1

### Requirement: Fonts do not block the initial render

Font loading MUST NOT block the initial render. External blocking requests for font stylesheets MUST be eliminated in favor of a loading method that does not delay text display and does not cause a noticeable layout shift when the font is substituted. On the first page load, font files MUST be requested only for the theme that is applied to the document; fonts of the other themes MUST NOT be requested in advance and MUST be loaded only when switching to the corresponding theme.

#### Scenario: Text is displayed without waiting for external fonts

- **WHEN** the page loads on a slow connection
- **THEN** text display does not wait for an external blocking font request

#### Scenario: Font substitution does not shift the layout

- **WHEN** the browser applies the loaded font instead of the fallback
- **THEN** the position of the text and blocks does not shift noticeably

#### Scenario: Only the fonts of the active theme are loaded

- **WHEN** the document opens with the default theme
- **THEN** files of only the families of this theme are requested in advance, and files of the families of other themes are not requested

#### Scenario: A saved non-default theme does not pull other themes' fonts

- **WHEN** the user has a non-default theme saved and opens the page
- **THEN** files of the families of this theme are requested, and the families of the other themes are not requested

### Requirement: Isolation of re-renders by data domains

A change in the data of one domain — wishes, contributions, or the conversation — MUST NOT cause a re-render of the interface that neither displays nor changes this data. A component MUST re-render only when the data it shows or changes is modified.

#### Scenario: Adding a wish does not touch the rest of the interface

- **WHEN** the user submits a wish
- **THEN** the application header, the conversation strip, and the admin table do not re-render

#### Scenario: A contribution does not touch the wish board or the conversation

- **WHEN** the user submits a contribution
- **THEN** the wish board and the conversation strip do not re-render

#### Scenario: Changing the gift status does not touch wishes

- **WHEN** the administrator changes the gift status or the collection amount
- **THEN** the interface that works only with wishes does not re-render

#### Scenario: Theme and login changes do not infect subscribers

- **WHEN** the theme or session state has not changed
- **THEN** a re-render of the theme and session provider does not cause a re-render of its subscribers

### Requirement: Heavy features outside the critical path of the first load

If the first load of a key page does not fit within the LCP budget, the code of features not displayed on the first render MUST be loaded separately from the critical path and be loaded only when the feature becomes needed by the user. Features located inside a route that is already loaded as a separate page are not split further by additional lazy loading.

#### Scenario: The participation dialog does not lengthen the critical path of the home page

- **WHEN** the first load of the home page exceeds the LCP budget
- **THEN** the participation dialog code is not part of the first-render critical path and is loaded when the dialog is first opened

#### Scenario: Loading a lazy feature does not shift the layout

- **WHEN** a lazily loaded feature is loaded
- **THEN** a placeholder that does not cause a noticeable layout shift is displayed during loading

#### Scenario: A separate page is not split again

- **WHEN** the user opens the admin panel as a separate section
- **THEN** its code is loaded as a single section chunk without additional lazy loading inside the page

### Requirement: Server content on the first render

The application MUST serve server-side markup with meaningful content on the first render, and not an empty document waiting for client-side hydration and reading of local storage. Restoring the theme and session MUST NOT lead to the disappearance of the page's main content before hydration. The session MUST be known to the server before the page markup is sent, so that the content does not depend on the moment client JavaScript executes.

#### Scenario: The first render contains content

- **WHEN** the browser receives the page's HTML before the client-side JavaScript runs
- **THEN** the document contains the page's main content, and not an empty tree

#### Scenario: Restoring the theme and session does not hide the page

- **WHEN** the theme and an active session are saved in local storage
- **THEN** the main content remains visible throughout the restoration, without passing through a completely empty screen

#### Scenario: The largest text block arrives from the server

- **WHEN** the LCP of the key page is measured before hydration
- **THEN** the largest text block is already present in the sent markup and its rendering does not wait for client JavaScript

#### Scenario: The session is known before the markup is sent

- **WHEN** the browser requests a page with an active session
- **THEN** the server markup contains the content of that page, not a placeholder replaced after hydration

### Requirement: No continuous visual effects

The system MUST NOT apply continuously running visual effects: infinite animations and background blur under scrollable content. Shadows MUST be static and light, and unused decorative animations MUST NOT be present in the styles. Short-term state-transition effects (the appearance of popovers, menus, and dialogs) and focus indicators ARE ALLOWED, since they do not create a constant load.

#### Scenario: Header without blur

- **WHEN** the user scrolls the page
- **THEN** the fixed header has a solid background and does not recompute the blur of the content beneath it

#### Scenario: Strip without an infinite animation

- **WHEN** a strip of cards with overflow is displayed on the page
- **THEN** no infinite animation runs, and scrolling is available manually

#### Scenario: Static light shadows

- **WHEN** the user views cards and panels
- **THEN** static shadows with a small blur radius are applied, without creating constant re-renders

#### Scenario: Decorative animations are absent

- **WHEN** the project's styles are built
- **THEN** unused decorative animations (flicker, hover, tilt, glow) are absent from the styles

### Requirement: No protected requests before a session exists

The application MUST NOT request protected data while no session exists. The sign-in page MUST NOT trigger requests that the server answers as unauthenticated, so that opening the sign-in page does not produce authentication errors in the browser console. Protected data MUST be requested once after a session exists.

#### Scenario: The sign-in page does not request protected data

- **WHEN** an unauthenticated user opens the sign-in page
- **THEN** no request for protected data is issued, and no unauthenticated response is produced

#### Scenario: Data is requested after sign-in

- **WHEN** the user signs in and the application opens
- **THEN** the protected data is requested once and is displayed

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
