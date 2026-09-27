# support-chat Specification

## Purpose

Answers frequently asked questions about the collection and provides a private conversation between an employee and an administrator.

## Requirements

### Requirement: Frequently asked questions

The frequently asked questions section MUST provide answers to typical questions about the voluntary nature of participation, the visibility of amounts, the reasons for changing an amount, the display of the author, and logging into the system. Questions MUST expand one at a time, and the answers MUST be available without navigating to other pages.

#### Scenario: Expanding a question

- **WHEN** the user opens a question in the list
- **THEN** the system shows the text of the answer to that question

### Requirement: Privacy of the employee's conversation

An employee MUST see only their own conversation thread with the administrator and MUST NOT have access to other employees' conversations or to the list of others' requests. **Sending a message MUST show a loading state on the button, on error — an inline notification with "Retry", on success — the message appears in the strip.**

#### Scenario: The employee sees only their own thread
- **WHEN** the employee opens the conversation section
- **THEN** only the messages of their own thread are displayed

#### Scenario: An employee's message goes into their thread
- **WHEN** the employee sends a message to the administrator
- **THEN** the message is saved in that employee's thread and displayed in their conversation

#### Scenario: Loading state when an employee sends a message
- **WHEN** the employee clicks "Send" with non-empty text
- **THEN** the button becomes `disabled` with `Loader2`, after success — the message appears in the strip, the field is cleared, after error — an `Alert` with a "Retry" button

### Requirement: The administrator sees employee requests and can reply

The administrator MUST see the list of all employee request threads and MUST be able to open any thread and reply in it. The administrator's reply MUST be added to the selected employee's thread and MUST be visible to that employee in their conversation. **Sending a reply by the administrator MUST show the loading state, error, and success analogously to the employee.**

#### Scenario: Viewing the list of requests
- **WHEN** the administrator opens the conversation section
- **THEN** they see employee requests, including threads created by employees

#### Scenario: Reply in an employee's thread
- **WHEN** the administrator selects an employee's thread and sends a reply
- **THEN** the reply is added to that thread and becomes visible to the corresponding employee

#### Scenario: A thread without messages
- **WHEN** the administrator selects an employee with no conversation
- **THEN** the system shows an empty state of the thread and allows sending the first message

#### Scenario: Loading state when the administrator replies
- **WHEN** the administrator clicks "Reply" with non-empty text
- **THEN** the button becomes `disabled` with `Loader2`, after success — the reply appears in the thread strip, the field is cleared, after error — an `Alert` with a "Retry" button

### Requirement: Correct message authorship

The system MUST set the administrator flag for messages sent by the administrator and, accordingly, for an employee's messages, without a hardcoded value. The author of a message MUST match the user who sent it.

#### Scenario: An administrator's message is marked as administrative
- **WHEN** the administrator sends a message
- **THEN** the message is saved as administrative and attributed to the administrator

#### Scenario: An employee's message is not marked as administrative
- **WHEN** the employee sends a message
- **THEN** the message is saved as the employee's message and attributed to them

### Requirement: Correctness of the FAQ texts

The answers in the "Frequently asked questions" section MUST be grammatically correct and MUST NOT contain typos. The texts MUST correspond to the actual behavior of the application (the voluntary nature of participation, the hiding of amounts, the change of an amount by the administrator, authorship on the wish board). The answer about the wish author MUST describe displaying the real name with the corporate nickname in parentheses (`Last name First name (nick)`) and MUST NOT claim that the author is shown only by nickname.

#### Scenario: Reading the answer about the voluntary nature of participation

- **WHEN** the user expands the question "Is participation in the collection mandatory?"
- **THEN** the answer contains no typos, in particular "warm attention" is displayed

#### Scenario: The answer matches the behavior

- **WHEN** the user reads the FAQ answers
- **THEN** the described behavior matches the actual behavior, including hiding amounts from employees and the procedure for changing an amount by the administrator

#### Scenario: The answer about the wish author is up to date

- **WHEN** the user expands the question about how the author is displayed on the wish board
- **THEN** the answer states that the author is shown by real name and nickname in parentheses, gives an example of the form `Last name First name (nick)`, and does not disclose the full email address

### Requirement: Administrator messages section

In the frequently asked questions section, the conversation tab MUST be displayed for the administrator under the name "Messages", and for the employee under the name "Write to admin". The description of the section MUST correspond to the role: the employee sees a personal conversation thread, the administrator sees employee requests. The administrator MUST reply in this tab.

#### Scenario: The administrator's tab

- **WHEN** a user with the `admin` role opens the frequently asked questions section
- **THEN** the conversation tab is called "Messages" and allows replying in employee threads

#### Scenario: The employee's tab

- **WHEN** a user with the `employee` role opens the frequently asked questions section
- **THEN** the conversation tab is called "Write to admin"

#### Scenario: The administrator replies from the messages tab

- **WHEN** the administrator selects an employee's thread and sends a reply in the "Messages" tab
- **THEN** the reply is added to the selected employee's thread

### Requirement: Indication of unread messages

The system MUST mark for the administrator the threads containing employee messages that they have not yet read. Unread messages MUST be counted by individual messages, and not by the number of threads. In the list of requests, each thread MUST display a marker with the number of unread messages of that thread, so that the administrator understands from whom exactly the unread message came. The total number of unread messages MUST be displayed on the "Messages" tab and in the application header. The "read" marker MUST be cleared when the administrator opens the corresponding thread.

#### Scenario: Marker on a thread with an unread message

- **WHEN** an employee's thread contains messages that the administrator has not yet read
- **THEN** the list of requests displays a marker with the number of unread messages for that thread

#### Scenario: Badge on the messages tab

- **WHEN** the administrator has unread messages
- **THEN** the total number of unread messages is displayed on the "Messages" tab

#### Scenario: Indicator in the header

- **WHEN** the administrator has unread messages
- **THEN** the total number of unread messages is displayed in the application header

#### Scenario: Clearing the marker when a thread is opened

- **WHEN** the administrator opens a thread with unread messages
- **THEN** the marker of that thread and its contribution to the total counter are cleared

#### Scenario: No unread messages

- **WHEN** all employee messages have been read
- **THEN** neither markers in the list of requests nor a counter on the tab and in the header are displayed

### Requirement: Transition to the conversation tab from the header

Following the unread messages indicator in the header MUST open the frequently asked questions section with the conversation tab active. The active tab MUST correspond to the page address in any way of navigating, including navigating from an already open section page without a full reload. Switching the tab by the user themselves MUST NOT cause a server-side rendering request for the route and MUST NOT show an empty content placeholder: the active tab MUST change immediately, without waiting for a server response, and the page address MUST be updated so that a direct link and a reload open the same tab.

#### Scenario: Navigation from the header opens the conversation

- **WHEN** the administrator clicks the unread messages indicator in the header
- **THEN** the conversation tab opens, and the administrator can select a thread and reply

#### Scenario: Navigation from an already open section page

- **WHEN** the administrator is already on the frequently asked questions section page on the questions tab and clicks the indicator in the header
- **THEN** the conversation tab becomes active without reloading the page

#### Scenario: Direct link to the conversation tab

- **WHEN** the user opens the conversation tab address directly
- **THEN** the conversation tab is displayed

#### Scenario: Switching the tab without a server request

- **WHEN** the user switches the tab on the frequently asked questions page
- **THEN** the active tab changes immediately, no content placeholder is shown, and no server-side rendering request for the route is performed

#### Scenario: The address reflects the active tab

- **WHEN** the user switches the tab
- **THEN** the page address corresponds to the active tab and, after a reload, the same tab opens

#### Scenario: History navigation does not lose the tab

- **WHEN** the user switches the tab and returns to the frequently asked questions page
- **THEN** the active tab corresponds to the page address

### Requirement: Availability of the administrator reply field

The administrator's reply field in a conversation thread MUST remain visible and usable for input with any number of employee requests, including on the desktop layout when the list of requests is long.

#### Scenario: Many requests on desktop

- **WHEN** the administrator opens the conversation, and the list of employees contains so many threads that it does not fit in the chat area
- **THEN** the field "Reply to employee..." is visible and available for input, without being cut off at the bottom edge

#### Scenario: The list of requests scrolls independently

- **WHEN** the list of requests is long
- **THEN** the list scrolls within its own area, and the reply field stays in place and remains available

### Requirement: The conversation scrolls inside the card

The conversation card MUST limit its height to the available screen height, and the message history MUST scroll inside the card. The conversation content MUST NOT extend beyond the card's bounds and MUST NOT stretch the page with a long history.

#### Scenario: Long conversation

- **WHEN** so many messages have accumulated in the thread that they do not fit in the card
- **THEN** the card preserves its height, and the history scrolls inside it without extending beyond its bounds

#### Scenario: Content does not fly out of the card

- **WHEN** the conversation is long
- **THEN** not a single conversation element is displayed outside the card

### Requirement: The send form is reachable at a limited height

The message send form MUST remain inside the card and be reachable with any conversation length and at a limited screen height, including on mobile devices. Entering text MUST NOT require scrolling the page to the form.

#### Scenario: The input form on mobile

- **WHEN** the user opens the conversation on a mobile device
- **THEN** the input field and the send button are visible inside the card and available without scrolling the page

#### Scenario: The form stays in place as the history grows

- **WHEN** new messages are added to the conversation
- **THEN** the send form remains inside the card and does not move beyond its bottom border

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
