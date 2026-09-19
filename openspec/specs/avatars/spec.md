# avatars Specification

## Purpose

Guarantees that employee avatars are displayed and degrade correctly when the external image source is unavailable, without breaking the interface and without polluting the console.

## Requirements

### Requirement: Avatar display with a fallback

An employee's avatar MUST show the image when loading succeeds and the initials when the image is unavailable. A failure to load an external image MUST NOT result in a broken image being displayed or unhandled errors in the console; the interface MUST remain functional.

#### Scenario: External source is unavailable

- **WHEN** the avatar image request fails with a network error
- **THEN** a fallback with the initials is displayed, and the interface does not show a broken image and does not write an unhandled error to the console

#### Scenario: Image loaded

- **WHEN** the avatar image loads successfully
- **THEN** the employee's photo is displayed

#### Scenario: Avatar in lists and grids

- **WHEN** avatars are displayed in the header, the birthday person cards, the wish board, the chat, and the admin table
- **THEN** the behavior of the image and the fallback is the same in all these places
