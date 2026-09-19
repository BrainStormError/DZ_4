## Purpose

Guarantees a consistent first render of the application: browser-dependent values (the current date and theme) do not diverge between server-side rendering and client-side hydration, and the interface does not switch entirely to client-side rendering.

## ADDED Requirements

### Requirement: Consistent current date on first render

The system MUST compute the current date consistently on the server and client so that during hydration there is no date text mismatch and no forced switch of the entire tree to client-side rendering. Date-dependent blocks (birthday people, wish board, calendar) MUST show the same current date immediately after loading.

#### Scenario: Same date on the server and client

- **WHEN** the page loads around midnight or when the server and browser time zones differ
- **THEN** after hydration there is no date text mismatch, and the application does not switch entirely to client-side rendering

#### Scenario: The date is stable after loading

- **WHEN** the page is fully loaded
- **THEN** date-dependent blocks show the same current date without "flashing" between the server and client value

### Requirement: Consistent theme on first render

The system MUST restore the theme so that the active theme label matches the actually applied theme after loading. A mismatch between the server markup and the client state MUST NOT result in the theme label remaining incorrect.

#### Scenario: The label matches the applied theme

- **WHEN** a theme other than the default theme is saved in local storage, and the page loads
- **THEN** the applied theme and the theme switcher label match without a residual incorrect label

#### Scenario: Theme without a saved value

- **WHEN** no theme is set in local storage
- **THEN** the default theme is applied, and its label matches the applied theme
