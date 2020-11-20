import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { Link } from 'react-router-dom'
// const TeamDetailsLink = ({ teamSlug, ...props }) => <Link to={`/teams/${teamSlug}`} {...props} />

const styles = theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  cardMedia: {
    paddingTop: '25%', // 16:9
    width: '100%'
  },
  cardContent: {
    flexGrow: 1
  },
  avatar: {
    maxWidth: 65,
    height: 65,
    margin: '0  0.875em 0 0',
    borderRadius: '50%',
    verticalAlign: 'middle',
    alignSelf: 'flex-start'
  },
  buttonRight: {
    textDecoration: 'none'
  }
})

export const TeamsItem = ({ classes, team }) => {
  let avatar
  if (team.profile.avatar !== undefined && team.profile.avatar !== 'a') {
    avatar = team.profile.avatar
  } else {
    avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
  }
  let banner
  if (team.profile.banner !== undefined && team.profile.banner !== null) {
    banner = team.profile.banner
  } else {
    banner = process.env.STORAGE_URL + '/module-teams/module-default/aa-banner-default.png'
  }
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card className={classes.card}>
        <CardActionArea component={Link} to={`/teams/${team.slug}`}>
          <CardMedia
            className={classes.cardMedia}
            image={banner}
            title={team.name}
          />
          <CardContent className={classes.cardContent}>
            <Grid container>
              <Grid item md={3} >
                <img src={avatar} alt={team.name} className={classes.avatar} />
              </Grid>
              <Grid item md={9}>
                <Grid container direction='column'>
                  <Grid item xs={12}>
                    <Typography gutterBottom variant='h5' component='h2'>
                      {team.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={8}>
                      <Grid item xs={6}>
                        <Typography variant='caption'>
                          Members: 1
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant='caption'>
                          Financial Beings: 1
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  )
}

TeamsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamsItem)
