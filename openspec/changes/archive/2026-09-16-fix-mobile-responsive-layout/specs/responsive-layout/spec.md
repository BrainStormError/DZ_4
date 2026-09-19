## Purpose

Defines end-to-end layout invariants for narrow viewports: the page does not get horizontal scrolling because of the content, overlay elements (dialogs, popovers, selects) fit within the screen, height is measured in dynamic units, anchor sections do not hide under the fixed header, and hover effects are not applied on devices without hover.

## ADDED Requirements

### Requirement: No horizontal page overflow

The page MUST NOT get horizontal scrolling because of the content at widths from 320px. Any block that exceeds the container width MUST either wrap, shrink, or scroll within its own area. The root container MUST have protection against content going horizontally outside the viewport.

#### Scenario: Narrow screen without horizontal scrolling

- **WHEN** the page is open at a width of 320px or 360px
- **THEN** the document width does not exceed the viewport width, and there is no horizontal page scrolling

#### Scenario: Local scrolling instead of page scrolling

- **WHEN** an element is clearly wider than the available space (for example, a wide table)
- **THEN** scrolling is limited to the area of that element and does not expand the page

### Requirement: Dialogs fitting within the viewport

Modal dialogs MUST preserve side margins from the viewport edges and MUST NOT exceed the available screen height. If the content does not fit, the dialog MUST scroll inside itself so that the header, fields, and action buttons remain reachable.

#### Scenario: Dialog on a narrow screen

- **WHEN** the dialog opens at a width of 320px
- **THEN** a margin remains between the dialog and the screen edges, and the width does not go outside the viewport

#### Scenario: A tall dialog scrolls

- **WHEN** the dialog content is taller than the available screen height
- **THEN** the dialog is limited by the viewport height and scrolls inside itself, the action buttons are reachable

### Requirement: Dynamic viewport height

Elements stretched to the screen height MUST use dynamic height units so that showing or hiding the browser address bar does not cause a height jump.

#### Scenario: Showing the address bar

- **WHEN** the browser on a mobile device hides or shows the address bar
- **THEN** the application screen height changes without a jump and without clipping the content

### Requirement: Anchor section offset under the fixed header

When following an internal link to a section, the section heading MUST NOT end up hidden under the fixed header; the section MUST offset the scroll position by the header height.

#### Scenario: Navigating to the wish board

- **WHEN** the user activates navigation to the wish board section
- **THEN** the heading and the beginning of the section are visible below the header, not hidden under it

### Requirement: Hover effects only when hover is present

Scale and highlight effects tied to cursor hover MUST be applied only on devices that support hover, so that on touch screens the effect does not stick after a touch.

#### Scenario: Touch on a touch screen

- **WHEN** the user touches a card with a hover effect on a touch device
- **THEN** the hover effect is not applied and does not stick

#### Scenario: Cursor hover

- **WHEN** the user hovers the cursor over the card on a device with hover
- **THEN** the hover effect is applied as before
