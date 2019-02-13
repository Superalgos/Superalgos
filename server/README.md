
## AA Operations Server

Server side functions support the business rules for the module.

## Available Methods

# Active clones List
- List active personal clones
- List active team clones (future release)

# History clone List
- List history personal clones
- List history team clones (future release)

# Get clone by id
- Get existing clones corresponding to the clone ids passed by parameter and returns:
  - Clone id
  - Team id
  - Bot id

# Add new clones:
  Receive a list of clones, create each of them and return the newly created clone.
  A clone can be created:
    - As a personal clone (run from the personal user folder)
    - As a team clone (on competitions, run from the team folder)
  Who can create each type:
  - Personal clones are managed by the user who creates it, not visible for any other user.
  - Team clones are managed by any ADMIN type team member (on the team member role attribute),
    and all team admins will see it listed.

  - Events Module:
      At enroll time, the clone is created and the authId is sent
