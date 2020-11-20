import React from 'react'
import PropTypes from 'prop-types'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import ManageMemberDelete from './ManageMemberDelete'
import ManageMemberRole from './ManageMemberRole'
import ManageMemberStatus from './ManageMemberStatus'
import { MessageCard } from '@superalgos/web-components'

import log from '../../../utils/log'

export const ManageMembersItem = ({ classes, member, teamId, authId }) => {
  log.debug('ManageMembersItem', member)
  let profile = null
  let email = null
  let memberStatus = null
  if (member.member !== null) {
    profile = member.member
  }
  if (member.member === null && member.email !== null) {
    email = member.email
  }
  if (member.status.length > 0) memberStatus = member.status
  if (profile !== null || email !== null) {
    return (
      <Grid container className={classes.memberContainer}>
        <Grid item xs={4}>
          <Typography gutterBottom variant='subtitle1' component='h2' align='left' >
            {profile !== null ? profile.alias : email}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography color='textSecondary' variant='body1' component='h4' align='left' >
            {email !== null ? `${memberStatus[memberStatus.length - 1].status} | Sent: ${memberStatus[memberStatus.length - 1].createdAt}` : `${member.role} | Member since: `}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          { profile !== null && member.role !== 'OWNER' && (
            <ManageMemberRole teamId={teamId} authId={profile !== null ? profile.authId : null} className={classes.buttonRight} />
          )}
          {(email !== null || member.role !== 'OWNER') && (
            <ManageMemberStatus status={member.status} className={classes.buttonRight} />
          )}
          {(email !== null || member.role !== 'OWNER') && (
            <ManageMemberDelete teamId={teamId} authId={profile !== null ? profile.authId : null} email={email !== null ? email : null} className={classes.buttonRight} />
          )}
        </Grid>
      </Grid>
    )
  } else {
    return (
      <MessageCard message='No Member info found' />
    )
  }
}

ManageMembersItem.propTypes = {
  classes: PropTypes.object.isRequired,
  member: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired,
  authId: PropTypes.string.isRequired
}

export default ManageMembersItem
