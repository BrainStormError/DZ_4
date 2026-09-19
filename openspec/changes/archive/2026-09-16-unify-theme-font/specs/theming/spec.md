## Purpose

Defines the typography requirements of the theme system: all visual themes use a single font family, and the theme does not influence the font choice.

## ADDED Requirements

### Requirement: A single font family in all themes

The system MUST apply the same font family to headings and body text in all themes. The theme styling MUST NOT define its own font families.

#### Scenario: Changing the theme does not change the font

- **WHEN** the user switches the visual theme
- **THEN** the font family of the headings and body text remains unchanged

#### Scenario: The heading and text match by family

- **WHEN** a page with headings and body text is displayed
- **THEN** the headings and text use the same font family

### Requirement: A single font family in the application

The application MUST include no more than one font family for all themes. Additional font families MUST NOT be included.

#### Scenario: Only one family is included

- **WHEN** the application loads fonts
- **THEN** only files of a single font family are requested

### Requirement: Cyrillic is displayed with the single font

The single font family MUST contain Cyrillic glyphs so that Russian text is displayed with this family without substitution with a fallback system font.

#### Scenario: Russian heading without font substitution

- **WHEN** a Russian-language heading or text is displayed
- **THEN** it is rendered with the single font family, not a fallback system font
