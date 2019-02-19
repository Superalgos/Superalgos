import gql from 'graphql-tag';

export const eventMinimalInfo = gql`
  fragment EventMinimalInfo on events_Event {
    id
    state
    title
    startDatetime
    endDatetime
    host {
      alias
      firstName
      lastName
    }
    description
    formula{
      name
    }
    plotter{
      name
    }
  }
`;

export const eventFullInfo = gql`
  fragment EventFullInfo on events_Event {
    id
    title
    subtitle
    hostId
    host {
      id
      email
      firstName
      middleName
      lastName
    }
    description
    startDatetime
    endDatetime
    state
    rules {
      title
      description
    }
    prizes {
      condition {
        from
        to
        additional
      }
      pool {
        amount
        asset
      }
    }
    participants {
      participantId
      participant {
        id
        name
      }
      state
      operationId
      clone{
        botId
      }
    }
    participatingAs{
      id
      name
    }
    canParticipateAs{
      id
      name
      fb{
        id
        name
      }
    }
    invitations {
      inviteeId
      invitee {
        id
        name
      }
      acceptedDate
      refusedDate
      by {
        date
        inviterId
        inviter {
          id
          email
          firstName
          middleName
          lastName
        }
      }
    }
    presentation {
      banner
      profile
      page
    }
    formula {
      id
      ownerId

      owner {
        id
        email
        firstName
        middleName
        lastName
      }
      isTemplate
      name
    }

    plotter {
      id
      ownerId
      owner {
        id
        email
        firstName
        middleName
        lastName
      }
      isTemplate
      name
      host
      repo
      moduleName
    }
  }
`;
