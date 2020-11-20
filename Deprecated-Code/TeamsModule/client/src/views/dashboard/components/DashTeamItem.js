import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions'

import ManageTeamDetails from './ManageTeamDetails'

const styles = theme => ({
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
    width: 160,
    height: 160,
    justifyContent: 'flex-start'
  },
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

const placeholder = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E' // eslint-disable-line max-len

export const DashTeamItem = ({ classes, team }) => (
  <Grid item>
    <Card className={classes.card}>
      <div className={classes.cardDetails}>
        <CardMedia
          className={classes.cardMedia}
          image={team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null ? team.profile.avatar : placeholder}
          title='Image title'
        />
        <CardContent className={classes.cardContent}>
          <Typography variant='h5'>{team.name}</Typography>
          <Typography variant='subtitle1' color='textSecondary'>
            {team.createdAt}
          </Typography>
          <Typography variant='subtitle1' paragraph>
            Members: {team.members.length}
          </Typography>
        </CardContent>
        <CardActions>
          <ManageTeamDetails team={team} />
        </CardActions>
      </div>
    </Card>
  </Grid>
)

DashTeamItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired
}

export default withStyles(styles)(DashTeamItem)
