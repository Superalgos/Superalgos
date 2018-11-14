import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import { Link } from 'react-router-dom'
// const TeamDetailsLink = ({ teamSlug, ...props }) => <Link to={`/teams/${teamSlug}`} {...props} />
export const TeamsItem = ({ classes, team }) => {
  let avatar
  if (team.profile.avatar !== undefined && team.profile.avatar !== 'a') {
    avatar = team.profile.avatar
  } else {
    avatar = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-avatar-default.png'
  }
  let banner
  if (team.profile.banner !== undefined && team.profile.banner !== null) {
    banner = team.profile.banner
  } else {
    banner = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-banner-default.png'
  }
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            className={classes.cardMedia}
            image={banner}
            title={team.name}
          />
          <CardContent className={classes.cardContent}>
            <Grid container>
              <Grid item md={3}>
                <img src={avatar} alt={team.name} className={classes.avatar} />
              </Grid>
              <Grid item md={9}>
                <Typography gutterBottom variant='h5' component='h2'>
                  {team.name}
                </Typography>
                <Typography variant='caption' paragraph gutterBottom>
                  Members: 1
                </Typography>
                <Typography variant='subtitle1' color='primary'>
                  Now recruiting!
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
        <CardActions>
          <Link to={`/teams/${team.slug}`}>
            <Button size='small' color='primary' className={classes.buttonRight}>
              Details
            </Button>
          </Link>
        </CardActions>
      </Card>
    </Grid>
  )
}

TeamsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default TeamsItem
