import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

// import ManageTeamMembersList from './components/ManageTeamMembersList'
import { TopBar } from '../common'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const TeamMembers = ({ classes }) => (
  <div>
    <TopBar size='big' title='Team Members' text='Coming soon. Invite and manage team members.' />
  </div>
)

TeamMembers.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamMembers)
