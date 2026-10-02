## MODIFIED Requirements

### Requirement: Login by corporate email

The system MUST allow login only by an address that ends with `@company.com` and is present in the corporate directory. After a successful login the system MUST preserve the session, and the user's role MUST be determined from the directory data. The session MUST be available to the server before the page markup is sent. The session MUST end when the browser is closed, without being preserved between runs.

#### Scenario: Successful employee login

- **WHEN** the user enters the address `anna.smirnova@company.com` from the directory
- **THEN** the system logs the user in and opens the home page with the rights of the `employee` role

#### Scenario: Address outside the corporate domain

- **WHEN** the user enters an address that does not end with `@company.com`
- **THEN** the system rejects the login with a message about the need to use a corporate email

#### Scenario: Unknown corporate address

- **WHEN** the user enters the address `unknown.user@company.com`, which is absent from the directory
- **THEN** the system rejects the login with a message that the employee was not found

#### Scenario: The session ends when the browser is closed

- **WHEN** the user has logged in and closed the browser
- **THEN** the next time the app is opened a repeated login is required

#### Scenario: The server knows the session before sending the page

- **WHEN** a user with an active session opens an app page
- **THEN** the server sends markup that takes the user's role into account, without waiting for client JavaScript execution

### Requirement: Role-based access control

The system MUST hide administrative capabilities from users with the `employee` role and MUST restrict access to the administrative section to the `admin` role. The decision about access to a protected section MUST be made before the section markup is sent, so that protected content does not reach the response of an unauthorized user.

#### Scenario: Employee without administrative access

- **WHEN** a user with the `employee` role opens the administrative section directly
- **THEN** the system does not show administrative data and reports the lack of access

#### Scenario: Hidden administrative menu item

- **WHEN** a user with the `employee` role views the navigation
- **THEN** the item for going to the administrative section is not displayed

#### Scenario: A user without a session does not receive protected markup

- **WHEN** a user without an active session requests a protected section
- **THEN** the server does not send the markup of that section, but redirects to the login page
