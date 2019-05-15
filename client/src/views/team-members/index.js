import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

// import ManageTeamMembersList from './components/ManageTeamMembersList'
import { BannerTopBar } from '../common'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const TeamMembers = ({ classes }) => (
  <div>
    <BannerTopBar size='big' title='Team Members' text='Coming soon. Invite and manage team members.' backgroundUrl='https://superalgos.org/img/photos/teams.jpg' />
  </div>
)

TeamMembers.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamMembers)
