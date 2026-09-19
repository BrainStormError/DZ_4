## ADDED Requirements

### Requirement: The conversation scrolls inside the card

The conversation card MUST limit its height to the available screen height, and the message history MUST scroll inside the card. The conversation content MUST NOT go outside the card boundaries and MUST NOT stretch the page with a long history.

#### Scenario: Long conversation

- **WHEN** so many messages have accumulated in the thread that they do not fit in the card
- **THEN** the card keeps its height, and the history scrolls inside it without going outside the boundaries

#### Scenario: Content does not fly out of the card

- **WHEN** the conversation is long
- **THEN** no element of the conversation is displayed outside the card

### Requirement: The submit form is reachable with a limited height

The message submit form MUST remain inside the card and be reachable with any conversation length and with a limited screen height, including mobile devices. Entering text MUST NOT require scrolling the page to the form.

#### Scenario: The input form on mobile

- **WHEN** the user opens the conversation on a mobile device
- **THEN** the input field and the send button are visible inside the card and available without scrolling the page

#### Scenario: The form stays in place as the history grows

- **WHEN** new messages are added to the conversation
- **THEN** the submit form remains inside the card and does not move past its bottom boundary
