## MODIFIED Requirements

### Requirement: Privacy of an employee's correspondence

An employee MUST see only their own correspondence thread with the administrator and MUST NOT have access to the correspondence of other employees or to the list of others' requests. **Sending a message MUST show a loading state on the button, on error — an inline notification with "Retry", on success — the message appears in the strip.**

#### Scenario: An employee sees only their own thread
- **WHEN** an employee opens the correspondence section
- **THEN** only the messages of their own thread are displayed

#### Scenario: An employee's message goes into their thread
- **WHEN** an employee sends a message to the administrator
- **THEN** the message is saved in this employee's thread and displayed in their correspondence

#### Scenario: Loading state when an employee sends a message
- **WHEN** an employee clicks "Send" with non-empty text
- **THEN** the button becomes `disabled` with `Loader2`, after success — the message appears in the strip, the field is cleared, after error — an `Alert` with a "Retry" button

### Requirement: The administrator sees employees' requests and can reply

The administrator MUST see the list of all employees' request threads and MUST be able to open any thread and reply in it. The administrator's reply MUST be added to the selected employee's thread and MUST be visible to that employee in their correspondence. **Sending a reply by the administrator MUST show a loading state, error, and success similarly to an employee.**

#### Scenario: Viewing the list of requests
- **WHEN** the administrator opens the correspondence section
- **THEN** they see employees' requests, including threads created by employees

#### Scenario: A reply in an employee's thread
- **WHEN** the administrator selects an employee's thread and sends a reply
- **THEN** the reply is added to this thread and becomes visible to the corresponding employee

#### Scenario: A thread without messages
- **WHEN** the administrator selects an employee without correspondence
- **THEN** the system shows the empty state of the thread and allows sending the first message

#### Scenario: Loading state when the administrator replies
- **WHEN** the administrator clicks "Reply" with non-empty text
- **THEN** the button becomes `disabled` with `Loader2`, after success — the reply appears in the thread strip, the field is cleared, after error — an `Alert` with a "Retry" button

### Requirement: Correct message authorship

The system MUST set the administrator flag for messages sent by the administrator, and correspondingly for an employee's messages, without a hardcoded value. The author of a message MUST match the user who sent it.

#### Scenario: An administrator's message is marked as administrative
- **WHEN** the administrator sends a message
- **THEN** the message is saved as administrative and attributed to the administrator

#### Scenario: An employee's message is not marked as administrative
- **WHEN** an employee sends a message
- **THEN** the message is saved as an employee's message and attributed to them
