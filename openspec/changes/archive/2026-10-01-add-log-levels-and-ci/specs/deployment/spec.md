## ADDED Requirements

### Requirement: Merging into the main branch deploys the change automatically

Once the checks pass for a change merged into the main branch, the pipeline MUST build the application image, deliver it to the host, and restart the stack without manual intervention. The image MUST be built in the pipeline rather than on the host, consistent with the requirement that the host only runs a prebuilt image.

#### Scenario: A green merge reaches the host

- **WHEN** a change is merged into the main branch and its checks pass
- **THEN** the image is built, delivered to the host, and the running stack is updated to the delivered image

#### Scenario: A failing check blocks the deployment

- **WHEN** a change merged into the main branch fails its checks
- **THEN** no image is delivered and the running stack is left unchanged

### Requirement: Automated delivery preserves host state

Automated delivery MUST NOT overwrite the host's environment file, MUST NOT discard or recreate the database data volume, and MUST NOT run a schema migration automatically. The configuration tracked in the repository MUST remain the source of truth for the stack definition and the database initialization files, while secret values stay only on the host.

#### Scenario: The host environment file is preserved

- **WHEN** the pipeline delivers a new image to the host
- **THEN** the host's environment file is not overwritten and the running application still uses the host's configured values

#### Scenario: The data volume survives a deployment

- **WHEN** a deployment restarts the stack
- **THEN** the previously stored data is still present and no schema change is applied automatically

### Requirement: A previous version remains available for rollback

The delivery MUST retain the previously running image under a distinguishable reference, so that a deployment can be reverted to the preceding version without rebuilding it.

#### Scenario: The previous image can be run again

- **WHEN** the delivered version must be reverted
- **THEN** the previous image is still available on the host and can be run again without rebuilding it
