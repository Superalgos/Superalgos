import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import ManageTeamProfileFBEdit from './ManageTeamProfileFBEdit'

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

export const ManageTeamProvileFBView = ({ classes, team }) => {
  log.debug('ManageTeamProvileFBView', team, team.fb[0], team.fb[0].avatar)

  let fbs = team.fb;
  return fbs.map((fb, index) => {
    let avatar = (fb.avatar !== undefined && fb.avatar !== null) ? fb.avatar : process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
    return (
      <Grid item xs={12} className={classes.fbContainer} key={`fb-${index}`}>
        <Card className={classes.card}>
          <div className={classes.cardDetails}>
            <CardMedia
              className={classes.cardMedia}
              image={avatar}
              title={fb.name}
            />
            <CardContent className={classes.cardContent}>
              <Typography gutterBottom variant='h5' component='h2'>
                {fb.name}
              </Typography>
              <Typography variant='caption' color='textSecondary'>
                {fb.kind}
              </Typography>
            </CardContent>
            <CardActions>
              <ManageTeamProfileFBEdit slug={team.slug} fb={fb} />
            </CardActions>
          </div>
        </Card>
      </Grid>
    )
  })
}

ManageTeamProvileFBView.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(ManageTeamProvileFBView)
