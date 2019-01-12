import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { withStateHandlers, lifecycle, compose } from 'recompose'
import { Link } from 'react-router-dom'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import DashTeamItem from './DashTeamItem'
import CreateTeamDialog from './CreateTeamDialog'
import { MessageCard } from '@superalgos/web-components'

import { isDefined, isString } from '../../../utils/js-helpers'
import { getItem } from '../../../utils/local-storage'

import log from '../../../utils/log'

export const DashTeam = ({ classes, user = null }) => {
  let owner
  let authId = null
  log.debug('DashTeam: ', user)
  if (user !== null && isString(user)) {
    owner = JSON.parse(user)
    if (isDefined(owner.authId)) authId = owner.authId
  }
  log.debug('DashTeam 2: ', owner, authId)

  if (authId === undefined || authId === null) {
    return (
      <Grid item md={6}>
        <Typography variant='h4' gutterBottom>
          Teams
        </Typography>
        <Typography variant='caption'>Loading...</Typography>
      </Grid>
    )
  }
  return (
    <Grid item md={6} style={{ position: 'relative' }}>
      <Typography variant='h4' gutterBottom>
        Teams{' '}
        <Link to='/manage-teams' className={classes.dashLink}>
          Manage Teams
        </Link>
      </Typography>
      <Query query={GET_TEAMS_BY_OWNER} variables={{ authId }}>
        {({ loading, error, data }) => {
          log.debug('GET_TEAMS_BY_OWNER: ', loading, error, data)
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
                <Typography variant='subtitle1' gutterBottom>
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
  user: PropTypes.any,
  classes: PropTypes.object.isRequired
}

const getUserOnMount = lifecycle({
  componentDidMount () {
    getItem('user').then(user => {
      this.setState({ user })
    }) // Set user to state
  }
})

const mapStateToProps = withStateHandlers(() => ({ user: null }), {
  user: ({ user }) => () => ({ user })
})

const DashTeamAuthId = compose(
  mapStateToProps,
  getUserOnMount
)(DashTeam)

export default DashTeamAuthId
