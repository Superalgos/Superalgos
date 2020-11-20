import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { MessageCard } from '@superalgos/web-components'
import { withStyles } from '@material-ui/core/styles'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import log from '../../../utils/log'

import ManageFBItem from './ManageFBItem'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  heroContent: {
    maxWidth: 800,
    margin: `${theme.spacing.unit * 4}px auto`,
    padding: 0
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

export const ManageFBList = ({ classes }) => (
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
            <div className={classes.root}>
              <div className={classes.heroContent}>
                <Grid container spacing={8} direction='column' alignItems='stretch'>
                  {!loading &&
                    data.teams_TeamsByOwner.map(team => (
                      <ManageFBItem
                        key={team.id}
                        team={team}
                        classes={classes}
                      />
                    ))}
                  {errors}
                </Grid>
              </div>
            </div>
          )
        } else {
          return (
            <Paper>
              <Grid container spacing={0} direction='column' justify='center' alignItems='center' className={classes.container}>
                <Grid item xs={10}>
                  <Typography variant='h5' align='center'>
                    You don&rsquo;t have any financial being. To create one, create a team first!
                  </Typography>
                  <Typography variant='body1' align='center' gutterBottom>
                    After you create a team, a default trading algobot will be cloned and added to your team so
                    that you can begin experimenting right away.
                  </Typography>
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

ManageFBList.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ManageFBList)
