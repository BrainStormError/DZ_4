## MODIFIED Requirements

### Requirement: Indication of unread messages

The system (MUST) mark for the administrator the threads containing employee messages that they have not yet read. Unread (MUST) be counted by individual messages, not by the number of threads. In the request list, each thread (MUST) display a marker with the number of unread messages in that thread, so that the administrator understands exactly who the unread message came from. The total number of unread messages (MUST) be displayed on the "Messages" tab and in the application header. The "read" mark (MUST) be cleared when the administrator opens the corresponding thread.

#### Scenario: A marker on a thread with an unread message

- **WHEN** a thread of an employee contains messages that the administrator has not yet read
- **THEN** a marker with the number of unread messages is displayed next to this thread in the request list

#### Scenario: A badge on the messages tab

- **WHEN** the administrator has unread messages
- **THEN** the total number of unread messages is displayed on the "Messages" tab

#### Scenario: An indicator in the header

- **WHEN** the administrator has unread messages
- **THEN** the total number of unread messages is displayed in the application header

#### Scenario: Clearing the mark when opening a thread

- **WHEN** the administrator opens a thread with unread messages
- **THEN** the marker of this thread and its contribution to the total counter are cleared

#### Scenario: No unread messages

- **WHEN** all employee messages are read
- **THEN** neither markers in the request list nor a counter on the tab and in the header are displayed
