import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import ManageTeamDelete from './ManageTeamDelete'
import ManageTeamEdit from './ManageTeamEdit'

export const ManageTeamsItem = ({ classes, team, authId }) => (
  <Grid item xs={12}>
    <Card className={classes.card}>
      <div className={classes.cardDetails}>
        <CardMedia
          className={classes.cardMedia}
          image='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E' // eslint-disable-line max-len
          title='Image title'
        />
        <CardContent className={classes.cardContent}>
          <Typography gutterBottom variant='headline' component='h2'>
            {team.name}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {team.createdAt} | Members: {team.members.length}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size='small' color='primary' className={classes.buttonRight}>
            Details
          </Button>
          <ManageTeamEdit classes={classes} slug={team.slug} authId={authId} />
          <ManageTeamDelete classes={classes} slug={team.slug} authId={authId} />
        </CardActions>
      </div>
    </Card>
  </Grid>
)

ManageTeamsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  authId: PropTypes.string.isRequired
}

export default ManageTeamsItem
