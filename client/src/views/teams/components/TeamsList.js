import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import GET_ALL_TEAMS_QUERY from '../../../graphql/teams/GetAllTeamsQuery'

import TeamsItem from './TeamsItem'

export const TeamsList = ({ classes }) => (
  <Grid item md={12}>
    <Query query={GET_ALL_TEAMS_QUERY}>
      {({ loading, error, data }) => {
        console.log('GET_TEAMS_BY_OWNER: ', loading, error, data)
        let errors
        let queryLoader
        if (error) {
          errors = error.graphQLErrors.map(({ message }, i) => {
            return (
              <Typography key={i} variant='caption'>
                {message}
              </Typography>
            )
          })
        }
        if (!loading && !error) {
          if (data.teams.edges.length > 0) {
            return (
              <Grid container spacing={24}>
                {!loading &&
                  data.teams.edges.map(team => (
                    <TeamsItem key={team.node.id} team={team.node} />
                  ))}
                {queryLoader}
                {errors}
              </Grid>
            )
          }
        } else {
          return (
            <Grid container spacing={24}>
              <Typography variant='subheading' gutterBottom>
                Loading...
              </Typography>
              {queryLoader}
              {errors}
            </Grid>
          )
        }
      }}
    </Query>
  </Grid>
)

TeamsList.propTypes = {
  classes: PropTypes.object.isRequired
}

export default TeamsList
