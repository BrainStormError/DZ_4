# theming Specification

## Purpose

Defines the requirements for the typography of the theme system: all visual themes use a single font family, and the theme does not affect the choice of font.

## Requirements

### Requirement: Single font family in all themes

The system MUST apply the same font family to headings and body text in all themes. A theme's styling MUST NOT define its own font families.

#### Scenario: Changing the theme does not change the font

- **WHEN** the user switches the visual theme
- **THEN** the font family of headings and body text remains unchanged

#### Scenario: The heading and the text match in family

- **WHEN** a page with headings and body text is displayed
- **THEN** the headings and the text use the same font family

### Requirement: A single font family in the application

The application MUST load no more than one font family for all themes. Additional font families MUST NOT be loaded.

#### Scenario: Only one family is loaded

- **WHEN** the application loads fonts
- **THEN** files of only one font family are requested

### Requirement: Cyrillic is displayed in a single font

The single font family MUST contain Cyrillic glyphs so that Russian text is displayed in this family without substitution by a fallback system font.

#### Scenario: A Russian heading without font substitution

- **WHEN** a Russian-language heading or text is displayed
- **THEN** it is rendered in the single font family, and not in a fallback system font
