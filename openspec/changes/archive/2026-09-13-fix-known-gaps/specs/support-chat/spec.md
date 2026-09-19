## Purpose

Answers FAQ about the collection and provides private chat between the employee and the administrator.

## ADDED Requirements

### Requirement: FAQ

The FAQ section MUST provide answers to typical questions about the voluntariness of participation, amount visibility, reasons for amount changes, author display, and login. Questions MUST expand one at a time, and answers MUST be available without navigating to other pages.

#### Scenario: Expanding a question

- **WHEN** the user opens a question in the list
- **THEN** the system shows the answer text for that question

### Requirement: Privacy of the employee's chat

The employee MUST see only their own chat thread with the administrator and MUST NOT have access to other employees' chats or to the list of others' requests.

#### Scenario: The employee sees only their own thread

- **WHEN** the employee opens the chat section
- **THEN** only the messages of their own thread are displayed

#### Scenario: An employee's message goes to their thread

- **WHEN** the employee sends a message to the administrator
- **THEN** the message is saved in that employee's thread and displayed in their chat

### Requirement: The administrator sees employee requests and can reply

The administrator MUST see the list of all employee request threads and MUST be able to open any thread and reply in it. The administrator's reply MUST be added to the selected employee's thread and MUST be visible to that employee in their chat.

#### Scenario: Viewing the request list

- **WHEN** the administrator opens the chat section
- **THEN** they see employee requests, including threads created by employees

#### Scenario: Reply in an employee's thread

- **WHEN** the administrator selects an employee's thread and sends a reply
- **THEN** the reply is added to that thread and becomes visible to the corresponding employee

#### Scenario: A thread without messages

- **WHEN** the administrator selects an employee without a chat
- **THEN** the system shows the thread's empty state and allows sending the first message

### Requirement: Correct message authorship

The system MUST set the administrator flag for messages sent by the administrator and, accordingly, for employee messages, without a hard-coded value. The message author MUST match the user who sent it.

#### Scenario: An administrator's message is marked as administrative

- **WHEN** the administrator sends a message
- **THEN** the message is saved as administrative and attributed to the administrator

#### Scenario: An employee's message is not marked as administrative

- **WHEN** the employee sends a message
- **THEN** the message is saved as an employee message and attributed to them
