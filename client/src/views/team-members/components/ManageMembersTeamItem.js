import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'

import InviteMemberDialog from './InviteMemberDialog'
import ManageMembersItem from './ManageMembersItem'
import { MessageCard } from '@superalgos/web-components'

import log from '../../../utils/log'

const styles = theme => ({
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  buttonRight: {
    justifyContent: 'flex-end'
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
  },
  cardMemberMedia: {
    flex: 1,
    width: 36,
    height: 36,
    maxWidth: 36,
    justifyContent: 'flex-start'
  },
  memberContainer: {
    margin: 10,
    padding: 6
  }
})

export const ManageMembersTeamItem = ({ classes, team, authId }) => {
  log.debug('ManageMembersItem', team, team.profile, team.profile.avatar)
  let avatar
  if (team.profile.avatar !== undefined && team.profile.avatar !== 'a') {
    avatar = team.profile.avatar
  } else {
    avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
  }
  if (team.members.length > 0) {
    return (
      <React.Fragment>
        <Grid item xs={12} key={team.id}>
          <Card className={classes.card}>
            <div className={classes.cardDetails}>
              <CardContent className={classes.cardContent}>
                <Grid container>
                  <Grid item xs={2}>
                    <CardMedia
                      className={classes.cardMedia}
                      image={avatar}
                      title={team.name}
                    />
                  </Grid>
                  <Grid item xs={9}>
                    <Typography gutterBottom variant='h5' component='h2'>
                      {team.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <InviteMemberDialog teamId={team.id} />
                  </Grid>
                </Grid>
                {team.members.length > 0 && team.members.map((member, index) => (
                  <ManageMembersItem
                    member={member}
                    teamId={team.id}
                    authId={authId}
                    classes={classes}
                    key={`${team.id}-${index}`}
                  />
                ))}
              </CardContent>
            </div>
          </Card>
        </Grid>
      </React.Fragment>
    )
  } else {
    return <MessageCard message='No Member info found' />
  }
}

ManageMembersTeamItem.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  authId: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageMembersTeamItem)
