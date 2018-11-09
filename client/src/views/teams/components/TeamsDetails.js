import React from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
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
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: 0,
    marginBottom: theme.spacing.unit * 3,
    padding: 0,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: `0 0 ${theme.spacing.unit * 6}px`
    }
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
    padding: `0 0 ${theme.spacing.unit * 6}px`
  },
  teamContent: {
    margin: `${theme.spacing.unit * 1}px ${theme.spacing.unit * 3}px 0 0`
  },
  banner: {
    maxWidth: '100%',
    height: 'auto'
  },
  avatar: {
    maxWidth: 100,
    height: 100,
    margin: `${theme.spacing.unit * 1}px 0 0 ${theme.spacing.unit * 3}px `
  }
})

const TeamsDetails = ({ classes, team }) => {
  let avatar
  if (team.profile.avatar !== undefined && team.profile.avatar !== null) {
    avatar = team.profile.avatar
  } else {
    avatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
  }
  let banner
  if (team.profile.banner !== undefined && team.profile.banner !== null) {
    banner = team.profile.banner
  } else {
    banner = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
  }
  return (
    <React.Fragment>
      <CssBaseline />
      <main className={classes.layout}>
        <Link to='/teams'>&larr; Back to all teams</Link>
        <Paper className={classes.paper}>
          <div className={classes.heroContent}>
            <img src={banner} alt={team.name} className={classes.banner} />
            <Grid container>
              <Grid md={3}>
                <img src={avatar} alt={team.name} className={classes.avatar} />
              </Grid>
              <Grid md={9}>
                <Grid container className={classes.teamContent} direction='column'>
                  <Typography
                    variant='h2'
                    color='textPrimary'
                    gutterBottom
                  >
                    {team.name}
                  </Typography>
                  <Typography variant='subtitle1' color='textSecondary'>
                    {team.createdAt}
                  </Typography>
                  <Typography variant='subtitle1' color='textSecondary'>
                    Motto: {team.profile.motto}
                  </Typography>
                  <Typography variant='subtitle1' color='textSecondary'>
                    Description: {team.profile.description}
                  </Typography>
                  <Typography variant='subtitle1' paragraph gutterBottom>
                    Members: {team.members.length}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Paper>
      </main>
    </React.Fragment>
  )
}
TeamsDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamsDetails)
