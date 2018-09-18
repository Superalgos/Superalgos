import React from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { withStyles } from '@material-ui/core/styles'

import { Link } from 'react-router-dom'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(900 + theme.spacing.unit * 3 * 2)]: {
      width: 900,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3
    }
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  }
})

const TeamsDetails = ({ classes, team }) => (
  <React.Fragment>
    <CssBaseline />
    <main className={classes.layout}>
      <Paper className={classes.paper}>
        <div className={classes.heroContent}>
          <Link to='/teams'>&larr; Back to all teams</Link>
          <Typography
            variant='display3'
            align='center'
            color='textPrimary'
            gutterBottom
          >
            {team.name}
          </Typography>
          <Typography variant='subheading' color='textSecondary'>
            {team.createdAt}
          </Typography>
          <Typography variant='subheading' color='textSecondary'>
            Motto: {team.profile.motto}
          </Typography>
          <Typography variant='subheading' color='textSecondary'>
            Description: {team.profile.description}
          </Typography>
          <Typography variant='subheading' paragraph gutterBottom>
            Members: {team.members.length}
          </Typography>
          <Typography variant='subheading' color='primary'>
            Team Admin:&nbsp;
            {team.members.map(member => {
              if (member.role === 'OWNER' || member.role === 'ADMIN') {
                return member.member.alias
              }
            })}
          </Typography>
        </div>
      </Paper>
    </main>
  </React.Fragment>
)
TeamsDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamsDetails)
