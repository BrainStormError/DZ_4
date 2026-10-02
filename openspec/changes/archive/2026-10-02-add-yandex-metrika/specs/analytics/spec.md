## Purpose

Tracks anonymous visits across the application with the Yandex Metrika counter without showing any widget or statistics to visitors.

## ADDED Requirements

### Requirement: Anonymous visits are recorded

The system SHALL load the Yandex Metrika counter on every page and send visit data to Yandex Metrika without requiring any user interaction.

#### Scenario: A page load is recorded

- **WHEN** a visitor opens any page of the application
- **THEN** the counter is initialized and sends the visit to Yandex Metrika

#### Scenario: Recording does not require consent or interaction

- **WHEN** a visitor opens a page
- **THEN** the visit is recorded without the visitor taking any action

### Requirement: No visible analytics interface

The analytics tracking SHALL NOT render any visible widget, informer, banner, or statistics display on the site.

#### Scenario: The page shows no analytics UI

- **WHEN** a page of the application is rendered
- **THEN** no analytics widget, informer, or statistics element is visible to the visitor

### Requirement: Analytics coexist with the security policy

The counter SHALL initialize and send its data without being blocked by the application's Content-Security-Policy, and the policy SHALL continue to prevent the application from being framed.

#### Scenario: The counter is not blocked

- **WHEN** a page is loaded with the Content-Security-Policy applied
- **THEN** the counter initializes and sends data without a policy violation in the browser console

#### Scenario: Framing protection is preserved

- **WHEN** a page with analytics enabled is loaded while embedded by another site
- **THEN** the page still cannot be framed
