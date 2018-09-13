import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { withStateHandlers, lifecycle, compose } from 'recompose'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import DashTeamItem from './DashTeamItem'

import { isDefined, isString } from '../../../utils/js-helpers'
import { getItem } from '../../../utils/local-storage'

export const DashTeam = ({ user = null }) => {
  console.log('DashTeam 1: ', user)
  let owner
  let loader
  let authId = null
  if (user !== null && isString(user)) {
    owner = JSON.parse(user)
    if (isDefined(owner.sub)) authId = owner.sub
  } else {
    loader = (<Typography variant='caption'>Loading...</Typography>)
  }

  console.log('DashTeam 2: ', owner, authId)
  if (authId === null) {
    return (
      <Grid item md={6}>
        <Typography variant='display1' gutterBottom>
          Teams
        </Typography>
        <Typography variant='caption'>Loading...</Typography>
      </Grid>
    )
  }
  return (
    <Grid item md={6}>
      <Typography variant='display1' gutterBottom>
        Teams
      </Typography>
      <Query query={GET_TEAMS_BY_OWNER} variables={{ authId }}>
        {({ loading, error, data }) => {
          console.log('GET_TEAMS_BY_OWNER: ', loading, error, data)
          let errors
          let queryLoader
          if (error) {
            errors = error.graphQLErrors.map(({ message }, i) => (
              <Typography key={i} variant='caption'>{message}</Typography>
            ))
          }
          if (!loading) {
            return (
              <Grid container spacing={24}>
                {!loading && data.teamsByOwner.edges.map(team => (
                  <DashTeamItem key={team.id} />
                ))}
                {queryLoader}
                {errors}
                {loader}
              </Grid>
            )
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
  user: PropTypes.any
}

const getUserOnMount = lifecycle({
  componentDidMount () {
    getItem('user').then(user => {
      this.setState({ user })
    }) // Set user to state
  }
})

const mapStateToProps = withStateHandlers(
  () => ({ user: null }), {
    user: ({ user }) => () => ({ user })
  }
)

const DashTeamAuthId = compose(
  mapStateToProps,
  getUserOnMount
)(DashTeam)

export default DashTeamAuthId
