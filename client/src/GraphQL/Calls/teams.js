import gql from 'graphql-tag';

export const GET_ALL_TEAMS_QUERY = gql`
  query Teams_FbByTeamMember {
    teams_FbByTeamMember {
      id
      name
      slug
      fb {
        id
        name
        slug
      }
    }
  }
`

export const GET_ALL_TEAM_BOTS_QUERY = gql`
  query teamBotsQuery($teamId: String!) {
    teams_TeamById(teamId: $teamId) {
      fb {
        id
        name
        slug
        team{
          id
          name
          slug
        }
      }
    }
  }
`

export default {
  GET_ALL_TEAMS_QUERY,
  GET_ALL_TEAM_BOTS_QUERY
};
