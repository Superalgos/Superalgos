import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import log from '../../../utils/log'

const styles = theme => ({
  fbContainer: {
    margin: `0 0 ${theme.spacing.unit * 2}px`
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

export const TeamsFBView = ({ classes, team }) => {
  log.debug('ManageTeamProvileFBView', team, team.fb[0])
  let avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
  if (team.fb.length > 0) {
    avatar = team.fb[0].avatar

    return (
      <Grid item xs={12} className={classes.fbContainer}>
        <Card className={classes.card}>
          <div className={classes.cardDetails}>
            <CardMedia
              className={classes.cardMedia}
              image={avatar}
              title={team.name}
            />
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant='h5' component='h2'>
                {team.fb[0].name}
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                {team.fb[0].kind}
              </Typography>
            </CardContent>
          </div>
        </Card>
      </Grid>
    )
  } else {
    return (
      <Grid item xs={12} className={classes.fbContainer}>
        <Card className={classes.card}>
          <div className={classes.cardDetails}>
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant='h6'>
                No Financial Beings
              </Typography>
            </CardContent>
          </div>
        </Card>
      </Grid>
    )
  }
}

TeamsFBView.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamsFBView)
