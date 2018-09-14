import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { withStateHandlers, lifecycle, compose } from 'recompose'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import DashTeamItem from './DashTeamItem'
import CreateTeamWrapper from './CreateTeamWrapper'

import { checkGraphQLError } from '../../../utils/graphql-errors'
import { isDefined, isString } from '../../../utils/js-helpers'
import { getItem } from '../../../utils/local-storage'

export const DashTeam = ({ classes, user = null }) => {
  let owner
  let loader
  let authId = null
  if (user !== null && isString(user)) {
    owner = JSON.parse(user)
    if (isDefined(owner.authId)) authId = owner.authId
  } else {
    loader = (<Typography variant='caption'>Loading...</Typography>)
  }

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
            errors = error.graphQLErrors.map(({ message }, i) => {
              const displayMessage = checkGraphQLError(message)
              return (
                <Typography key={i} variant='caption'>{displayMessage}</Typography>
              )
            })
          }
          if (!loading) {
            if (data.teamsByOwner.edges.length > 0) {
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
                <CreateTeamWrapper />
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
