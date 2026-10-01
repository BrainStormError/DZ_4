## ADDED Requirements

### Requirement: Malformed thread identifiers produce a defined error response

A conversation request whose thread identifier is malformed MUST be answered with one of the documented client-error responses and MUST NOT end in an internal error. The isolation rule MUST hold for every shape of the identifier.

#### Scenario: A malformed identifier is answered, not crashed

- **WHEN** a request is sent to the conversation endpoints with a thread identifier that is not valid address encoding
- **THEN** the response is a documented client-error response and no internal error is produced

#### Scenario: Nothing is stored for a malformed identifier

- **WHEN** an employee sends a message with a malformed thread identifier
- **THEN** no message is stored in any thread and no thread state is changed

#### Scenario: Isolation is unaffected

- **WHEN** an employee sends a well-formed request naming a thread that is not their own
- **THEN** the request is still refused with the documented authorisation error
