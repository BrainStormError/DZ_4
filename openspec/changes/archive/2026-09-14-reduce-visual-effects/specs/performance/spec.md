## ADDED Requirements

### Requirement: Absence of continuous visual effects

The system MUST NOT apply continuously running visual effects: infinite animations and background blur under scrollable content. Shadows MUST be static and light, and unused decorative animations MUST NOT be present in the styles. Short-lived state transition effects (appearance of popovers, menus, and dialogs) and focus indicators ARE ALLOWED, since they do not create a constant load.

#### Scenario: Header without blur

- **WHEN** the user scrolls the page
- **THEN** the sticky header has a solid background and does not recompute the blur of the content beneath it

#### Scenario: Strip without infinite animation

- **WHEN** a strip of cards with overflow is displayed on the page
- **THEN** no infinite animation runs, and scrolling is available manually

#### Scenario: Static light shadows

- **WHEN** the user views cards and panels
- **THEN** static shadows with a small blur area are applied, not creating constant repaints

#### Scenario: Decorative animations are absent

- **WHEN** the project's styles are built
- **THEN** the styles contain no unused decorative animations (shimmer, floating, tilt, glow)
