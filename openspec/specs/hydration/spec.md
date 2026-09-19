# hydration Specification

## Purpose

Guarantees a consistent first rendering of the application: browser-dependent values (the current date and the theme) do not diverge between server-side rendering and client-side hydration, and the interface does not switch entirely to client-side rendering.

## Requirements

### Requirement: Consistent current date on the first render

The system MUST compute the current date consistently on the server and the client so that hydration produces no discrepancy in the date text and no forced switch of the entire tree to client-side rendering. Date-dependent blocks (birthday people, the wish board, the calendar) MUST show the same current date immediately after loading.

#### Scenario: Same date on the server and the client

- **WHEN** the page loads around midnight or with a time zone difference between the server and the browser
- **THEN** after hydration there is no discrepancy in the date text, and the application does not switch entirely to client-side rendering

#### Scenario: The date is stable after loading

- **WHEN** the page is fully loaded
- **THEN** the date-dependent blocks show the same current date without "flickering" between the server-side and client-side value

### Requirement: Consistent theme on the first render

The system MUST restore the theme so that the active theme label corresponds to the actually applied theme after loading. A discrepancy between the server-side markup and the client-side state MUST NOT result in the theme label remaining incorrect.

#### Scenario: The label corresponds to the applied theme

- **WHEN** a theme other than the default is saved in local storage and the page loads
- **THEN** the applied theme and the theme toggle label match, without a residual incorrect label

#### Scenario: Theme without a saved value

- **WHEN** no theme is set in local storage
- **THEN** the default theme is applied, and its label corresponds to the applied theme
