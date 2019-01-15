import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'

import ManageTeamDetails from './ManageTeamDetails'
import ManageTeamDelete from './ManageTeamDelete'
import ManageTeamEdit from './ManageTeamEdit'

import log from '../../../utils/log'

export const ManageTeamsItem = ({ classes, team, authId }) => {
  log.debug('ManageTeamsItem', team, team.profile, team.profile.avatar)
  let avatar
  if (team.profile.avatar !== undefined && team.profile.avatar !== 'a') {
    avatar = team.profile.avatar
  } else {
    avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
  }
  return (
    <Grid item xs={12}>
      <Card className={classes.card}>
        <div className={classes.cardDetails}>
          <CardMedia
            className={classes.cardMedia}
            image={avatar}
            title={team.name}
          />
          <CardContent className={classes.cardContent}>
            <Typography gutterBottom variant='h5' component='h2'>
              {team.name}
            </Typography>
            <Typography variant='caption' color='textSecondary'>
              {team.createdAt} | Members: {team.members.length}
            </Typography>
          </CardContent>
          <CardActions>
            <ManageTeamDetails team={team} />
            <ManageTeamEdit slug={team.slug} team={team} authId={authId} />
            <ManageTeamDelete slug={team.slug} authId={authId} />
          </CardActions>
        </div>
      </Card>
    </Grid>
  )
}

ManageTeamsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  authId: PropTypes.string.isRequired
}

export default ManageTeamsItem
