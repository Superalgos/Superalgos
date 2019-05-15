import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'

import { Link } from 'react-router-dom'

import ManageTeamDelete from './ManageTeamDelete'

import log from '../../../utils/log'

export const ManageTeamsItem = ({ classes, team, match, ...props }) => {
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
              Members: {team.members.length} | Financial Beings: {1}
            </Typography>
          </CardContent>
          <CardActions>
            <Grid container direction='row' justify='flex-end'>
              <Button
                size='small'
                color='primary'
                className={classes.buttonRight}
                component={Link}
                to={`${match.url}/${team.slug}`}
              >
                <EditIcon /> Manage Profile
              </Button>
              <ManageTeamDelete slug={team.slug} botSlug={team.fb[0].slug} />
            </Grid>
          </CardActions>
        </div>
      </Card>
    </Grid>
  )
}

ManageTeamsItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default ManageTeamsItem
