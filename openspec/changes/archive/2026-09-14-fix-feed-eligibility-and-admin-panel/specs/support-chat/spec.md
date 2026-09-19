## MODIFIED Requirements

### Requirement: Correctness of the frequently asked questions texts

The answers in the "Frequently asked questions" section MUST be grammatically correct and MUST NOT contain typos. The texts MUST correspond to the actual behavior of the application (voluntary participation, hiding of amounts, changing the amount by an administrator, authorship on the wish board). The answer about the wish author MUST describe the display with the real name and the corporate nickname in parentheses (`Last name First name (nick)`) and MUST NOT state that the author is shown by nickname only.

#### Scenario: Reading the answer about voluntary participation

- **WHEN** the user expands the question "Is participation in the collection mandatory?"
- **THEN** the answer contains no typos; in particular, "warm attention" is displayed

#### Scenario: The answer matches the behavior

- **WHEN** the user reads the FAQ answers
- **THEN** the described behavior matches the actual one, including the hiding of amounts from employees and the procedure for changing the amount by an administrator

#### Scenario: The answer about the wish author is up to date

- **WHEN** the user expands the question about how the author is displayed on the wish board
- **THEN** the answer states that the author is shown with their real name and nickname in parentheses, gives an example of the form `Last name First name (nick)`, and does not reveal the full email address
