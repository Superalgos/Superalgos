import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { withStateHandlers, lifecycle, compose } from 'recompose'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import { isDefined, isString } from '../../../utils/js-helpers'
import { getItem } from '../../../utils/local-storage'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import ManageTeamsItem from './ManageTeamsItem'

const styles = theme => ({
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  buttonRight: {
    justifyContent: 'flex-end'
  },
  card: {
    display: 'flex',
    width: '100%'
  },
  cardDetails: {
    display: 'flex',
    flex: 1
  },
  cardContent: {
    flex: 1
  },
  cardMedia: {
    flex: 1,
    width: 100,
    height: 100,
    maxWidth: 100,
    justifyContent: 'flex-start'
  }
})

export const ManageTeamsList = ({ classes, user = null }) => {
  let owner
  let authId = null
  console.log('ManageTeamsList: ', user)
  if (user !== null && isString(user)) {
    owner = JSON.parse(user)
    if (isDefined(owner.authId)) authId = owner.authId
  }
  console.log('ManageTeamsList 2: ', owner, authId)

  return (
    <Query query={GET_TEAMS_BY_OWNER} fetchPolicy='network-only' variables={{ authId }}>
      {({ loading, error, data }) => {
        console.log('GET_TEAMS_BY_OWNER: ', loading, error, data)

        let errors
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
              <React.Fragment>
                <Grid container spacing={40}>
                  {!loading &&
                    data.teamsByOwner.map(team => (
                      <ManageTeamsItem
                        key={team.id}
                        team={team}
                        classes={classes}
                      />
                    ))}
                  {errors}
                </Grid>
              </React.Fragment>
            )
          }
        } else {
          return (
            <Grid container spacing={40}>
              <Typography variant='subheading' gutterBottom>
                Loading...
              </Typography>
              {errors}
            </Grid>
          )
        }
      }}
    </Query>
  )
}

ManageTeamsList.propTypes = {
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

const ManageTeamsListAuthId = compose(
  mapStateToProps,
  getUserOnMount
)(ManageTeamsList)

export default withStyles(styles)(ManageTeamsListAuthId)
