import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'
import { withStateHandlers, lifecycle, compose } from 'recompose'

import Grid from '@material-ui/core/Grid'
import { MessageCard } from '@superalgos/web-components'
import { withStyles } from '@material-ui/core/styles'

import { isDefined, isString } from '../../../utils/js-helpers'
import { getItem } from '../../../utils/local-storage'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import ManageTeamsItem from './ManageTeamsItem'
import CreateTeamDialog from './CreateTeamDialog'

import log from '../../../utils/log'

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
  log.debug('ManageTeamsList: ', user)
  if (user !== null && isString(user)) {
    owner = JSON.parse(user)
    if (isDefined(owner.authId)) authId = owner.authId
  }
  log.debug('ManageTeamsList 2: ', owner, authId)
  if (authId === undefined || authId === null) {
    return (
      <Grid container spacing={40}>
        <Grid>
          <MessageCard message='Loading...' />
        </Grid>
      </Grid>
    )
  } else {
    return (
      <Query
        query={GET_TEAMS_BY_OWNER}
        variables={{ authId }}
        fetchPolicy='network-only'
      >
        {({ loading, error, data }) => {
          log.debug('GET_TEAMS_BY_OWNER: ', loading, error, data)

          let errors = null
          if (error) {
            errors = error.graphQLErrors.map(({ message }, i) => {
              return <MessageCard message={message} />
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
                          authId={authId}
                        />
                      ))}
                    {errors}
                  </Grid>
                </React.Fragment>
              )
            } else {
              return (
                <Grid container spacing={40}>
                  <Grid item xs={10}>
                    <MessageCard message='You don&rsquo;t have any teams. Create one!'>
                      <CreateTeamDialog authId={authId} />
                    </MessageCard>
                  </Grid>
                </Grid>
              )
            }
          } else {
            return (
              <Grid container spacing={40}>
                <Grid item xs={12}>
                  <MessageCard message='Loading...' />
                  {errors !== null && <MessageCard message={errors} />}
                </Grid>
              </Grid>
            )
          }
        }}
      </Query>
    )
  }
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
