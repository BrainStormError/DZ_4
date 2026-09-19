## ADDED Requirements

### Requirement: Administrator messages section

In the FAQ section, the chat tab MUST be displayed as "Messages" for the administrator and as "Write to admin" for the employee. The section description MUST match the role: the employee sees a personal chat thread, the administrator sees employee requests. The administrator MUST reply in this tab.

#### Scenario: Administrator tab

- **WHEN** a user with the `admin` role opens the FAQ section
- **THEN** the chat tab is named "Messages" and allows replying in employee threads

#### Scenario: Employee tab

- **WHEN** a user with the `employee` role opens the FAQ section
- **THEN** the chat tab is named "Write to admin"

#### Scenario: Administrator reply from the messages tab

- **WHEN** the administrator selects an employee's thread and sends a reply in the "Messages" tab
- **THEN** the reply is added to the selected employee's thread

### Requirement: Unread message indication

The system MUST mark for the administrator the threads containing employee messages that they have not yet read. The unread message indicator MUST be displayed on the "Messages" tab and in the application header. The "read" mark MUST be cleared when the administrator opens the corresponding thread.

#### Scenario: Badge on the messages tab

- **WHEN** the administrator has a thread with unread messages
- **THEN** the unread message indicator is displayed on the "Messages" tab

#### Scenario: Indicator in the header

- **WHEN** the administrator has unread messages
- **THEN** the unread message indicator is displayed in the application header

#### Scenario: Clearing the mark when opening a thread

- **WHEN** the administrator opens a thread with unread messages
- **THEN** the unread indicator for this thread is cleared on the tab and in the header

#### Scenario: No unread messages

- **WHEN** all the administrator's threads are read
- **THEN** the unread message indicator is not displayed
