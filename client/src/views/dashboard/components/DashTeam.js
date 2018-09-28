import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import DashTeamItem from './DashTeamItem'
import CreateTeamDialog from './CreateTeamDialog'
import { MessageCard } from '../../common/'

export const DashTeam = ({ classes }) => {
  return (
    <Grid item md={6} style={{ position: 'relative' }}>
      <Typography variant='display1' gutterBottom>
        Teams{' '}
        <Link to='/manage-teams' className={classes.dashLink}>
          Manage Teams
        </Link>
      </Typography>
      <Query query={GET_TEAMS_BY_OWNER}>
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
            if (data.teamsByOwner.length > 0) {
              return (
                <Grid container spacing={24}>
                  {!loading &&
                    data.teamsByOwner.map(team => (
                      <DashTeamItem key={team.id} team={team} />
                    ))}
                  {queryLoader}
                  {errors}
                </Grid>
              )
            } else {
              return (
                <Grid container spacing={40}>
                  <Grid item xs={10}>
                    <MessageCard message='No teams yet...'>
                      <CreateTeamDialog />
                    </MessageCard>
                  </Grid>
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
}

DashTeam.propTypes = {
  classes: PropTypes.object.isRequired
}

export default DashTeam
