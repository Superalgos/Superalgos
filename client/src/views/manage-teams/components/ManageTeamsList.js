import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { MessageCard } from '@advancedalgos/web-components'
import { withStyles } from '@material-ui/core/styles'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import ManageTeamsItem from './ManageTeamsItem'
import CreateTeamForm from './CreateTeamForm'

import log from '../../../utils/log'

const styles = theme => ({
  container: {
    padding: `${theme.spacing.unit * 8}px ${theme.spacing.unit * 6}px`,
    margin: `${theme.spacing.unit * 1}px 0`
  },
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

export const ManageTeamsList = ({ classes, user = null, ...props }) => (
  <Query
    query={GET_TEAMS_BY_OWNER}
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
        if (data.teams_TeamsByOwner.length > 0) {
          return (
            <Grid container spacing={0} direction='column' justify='center' alignItems='center'>
              {!loading &&
                data.teams_TeamsByOwner.map(team => (
                  <ManageTeamsItem
                    key={team.id}
                    team={team}
                    classes={classes}
                    {...props}
                  />
                ))}
              {errors}
            </Grid>
          )
        } else {
          return (
            <Paper>
              <Grid container spacing={0} direction='column' justify='center' alignItems='center' className={classes.container}>
                <Grid item xs={10}>
                  <Typography variant='h5' align='center'>
                    You don&rsquo;t have any teams. Create one!
                  </Typography>
                  <Typography variant='body2' align='center' gutterBottom>
                    To begin developing on the Advanced Algos platform, as well as participate in Algobot competitions,
                    you'll need to create a team. A default trading algobot will be cloned and added to your team so
                    that you can begin experimenting right away.
                  </Typography>
                  <CreateTeamForm />
                </Grid>
              </Grid>
            </Paper>
          )
        }
      } else {
        return (
          <Grid spacing={0} direction='column' justify='center' alignItems='center'>
            <Grid item xs={12}>
              {errors === null &&
                <Typography variant='h5' align='center' gutterBottom>
                  Loading...
                </Typography>
              }
              {errors !== null &&
                <Typography variant='h5' align='center' gutterBottom>
                  {errors}
                </Typography>
              }
            </Grid>
          </Grid>
        )
      }
    }}
  </Query>
)

ManageTeamsList.propTypes = {
  user: PropTypes.any,
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ManageTeamsList)
