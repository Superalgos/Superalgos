import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { MessageCard } from '@superalgos/web-components'
import { withStyles } from '@material-ui/core/styles'

import { isEmpty } from '../../../utils/js-helpers'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import ManageTeamsItem from './ManageTeamsItem'
import ManageTeamProfile from './ManageTeamProfile'
import CreateTeamForm from './CreateTeamForm'

import log from '../../../utils/log'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40
  },
  heroContent: {
    maxWidth: 800,
    margin: `${theme.spacing.unit * 4}px auto`,
    padding: 0
  },
  newTeamContainer: {
    padding: `${theme.spacing.unit * 4}px 0`
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
  },
  paper: {
    width: '100%',
    flexGrow: 1,
    padding: 10,
    marginTop: '5%',
    marginBottom: '10%'
  }
})

export const ManageTeamsList = ({ classes, match, ...props }) => (
  <Query
    query={GET_TEAMS_BY_OWNER}
    fetchPolicy='network-only'
  >
    {({ loading, error, data }) => {
      log.debug('GET_TEAMS_BY_OWNER: ', loading, error, data)
      let slug = null
      if (!isEmpty(match.params) && match.params.slug) slug = match.params.slug

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
              <div className={slug === null ? classes.heroContent : ''}>
                <Grid container spacing={8} direction='column' alignItems='stretch'>
                  {!loading &&
                    data.teams_TeamsByOwner.map(team => {
                      if (slug === team.slug) {
                        return (
                          <ManageTeamProfile
                            key={`team-profile-${team.id}`}
                            team={team}
                            slug={team.slug}
                            match={match}
                            {...props}
                          />
                        )
                      } else {
                        return (
                          <ManageTeamsItem
                            key={`team-list-${team.id}`}
                            team={team}
                            classes={classes}
                            match={match}
                            {...props}
                          />
                        )
                      }
                    })}
                  {errors}
                </Grid>
              </div>
            </div>
          )
        } else {
          return (
            <div className='container'>
              <Paper className={classes.paper} >

                <Typography className={classes.typography} variant='h5' gutterBottom>
                  Your First Team
                </Typography>

                <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
                  Whether you are a trader willing to try out the Strategizer or a developer with more complex aspirations, the first thing you will need is to create a Team.
                </Typography>
                <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
                  At the time of Team creation, the platform will fork two template Finacial Beings to get you started. 
                </Typography>
                <CreateTeamForm />

              </Paper>
            </div>

          )
        }
      } else {
        return (
          <div className={classes.root} >
            <Grid container spacing={0} direction='column' justify='center' alignItems='center'>
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
          </div>
        )
      }
    }}
  </Query>
)

ManageTeamsList.propTypes = {
  user: PropTypes.any,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default withStyles(styles)(ManageTeamsList)
