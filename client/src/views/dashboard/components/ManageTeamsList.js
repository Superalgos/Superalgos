import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'

import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { isEmpty } from '../../../utils/js-helpers'

import ManageTeamsItem from './ManageTeamsItem'
import ManageTeamsDetails from './ManageTeamsDetails'

const styles = theme => ({
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '56.25%' // 16:9
  },
  cardContent: {
    flexGrow: 1
  },
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

export const ManageTeamsList = ({ classes, match }) => (
  <Query query={GET_TEAMS_BY_OWNER} fetchPolicy='cache-and-network' >
    {({ loading, error, data }) => {
      console.log('GET_TEAMS_BY_OWNER: ', loading, error, data, match)
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
        if (data.teams.edges.length > 0) {
          if (slug !== null) {
            return (
              <Grid container spacing={40}>
                {!loading &&
                  data.teams.edges.map(team => {
                    if (team.node.slug === slug) {
                      return (
                        <ManageTeamsDetails
                          key={team.node.id}
                          team={team.node}
                        />
                      )
                    }
                  })}
                {queryLoader}
                {errors}
              </Grid>
            )
          } else {
            return (
              <React.Fragment>
                <div className={classes.heroContent}>
                  <Typography
                    variant='display3'
                    align='center'
                    color='textPrimary'
                    gutterBottom
                  >
                    Teams
                  </Typography>
                </div>
                <Grid container spacing={40}>
                  {!loading &&
                    data.teams.edges.map(team => (
                      <ManageTeamsItem
                        key={team.node.id}
                        team={team.node}
                        classes={classes}
                      />
                    ))}
                  {queryLoader}
                  {errors}
                </Grid>
              </React.Fragment>
            )
          }
        }
      } else {
        return (
          <Grid container spacing={40}>
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
)

ManageTeamsList.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default withStyles(styles)(ManageTeamsList)
