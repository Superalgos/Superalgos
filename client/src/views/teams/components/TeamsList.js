import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import { MessageCard } from '@superalgos/web-components'

import GET_ALL_TEAMS_QUERY from '../../../graphql/teams/GetAllTeamsQuery'

import { isEmpty } from '../../../utils/js-helpers'
import log from '../../../utils/log'

import TeamsItem from './TeamsItem'
import TeamsDetails from './TeamsDetails'

const styles = theme => ({
  teamListsContainer: {
    margin: `${theme.spacing.unit * 3}px 0 ${theme.spacing.unit * 6}px`
  }
})

export const TeamsList = ({ classes, match }) => (
  <Query query={GET_ALL_TEAMS_QUERY} fetchPolicy='cache-and-network' >
    {({ loading, error, data, ...props }) => {
      log.debug('GET_ALL_TEAMS: ', loading, error, data, match, props)
      let slug = null
      if (!isEmpty(match.params) && match.params.slug) slug = match.params.slug

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
        if (data.teams_Teams.edges.length > 0) {
          if (slug !== null) {
            return (
              <Grid container >
                {!loading &&
                  data.teams_Teams.edges.map(team => {
                    if (team.node.slug === slug) {
                      return (
                        <TeamsDetails key={team.node.id} team={team.node} />
                      )
                    }
                  })}
                {queryLoader}
                {errors}
              </Grid>
            )
          } else {
            return (
              <div className={classes.teamListsContainer} >
                <Grid container spacing={24}>
                  {!loading &&
                    data.teams_Teams.edges.map(team => (
                      <TeamsItem
                        key={team.node.id}
                        team={team.node}
                      />
                    ))}
                  {queryLoader}
                  {errors}
                </Grid>
              </div>
            )
          }
        } else {
          return (
            <Grid container>
              <MessageCard message='No teams found' />
            </Grid>
          )
        }
      } else {
        return (
          <Grid container>
            <MessageCard message='Loading...' />
            {queryLoader}
            {errors}
          </Grid>
        )
      }
    }}
  </Query>
)

TeamsList.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default withStyles(styles)(TeamsList)
