## ADDED Requirements

### Requirement: Conversations are durable and shared

Chat messages and their read state MUST be stored in the shared persistent store. A message MUST remain after a page reload and after an application restart, MUST be visible to the other party of the thread, and the thread isolation and unread indication MUST be preserved.

#### Scenario: An employee message reaches the administrator durably

- **WHEN** an employee sends a message and the administrator later opens the request list, including after a reload or restart
- **THEN** the message is present in that employee's thread

#### Scenario: An administrator reply reaches the employee durably

- **WHEN** the administrator replies in an employee's thread and the employee later opens their conversation, including after a reload or restart
- **THEN** the reply is present in that employee's thread

#### Scenario: Thread isolation is preserved on stored data

- **WHEN** an employee opens their conversation against the stored data
- **THEN** only their own thread is shown, and other employees' threads are not exposed

#### Scenario: Unread state is durable

- **WHEN** an employee's unread message has been read by the administrator
- **THEN** after a reload the unread marker for that thread stays cleared and is not counted again

#### Scenario: Unread state still counts opened messages

- **WHEN** an employee's thread contains employee messages the administrator has not opened
- **THEN** the thread marker and the total counter still reflect those messages
