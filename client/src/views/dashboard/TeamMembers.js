import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

// import ManageTeamMembersList from './components/ManageTeamMembersList'
import { MessageCard } from '@superalgos/web-components'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const TeamMembers = ({ classes }) => (
  <div>
    <Typography variant='h4' gutterBottom>
      Team Members
      <MessageCard message='Coming soon. Invite and manage team members.' />
    </Typography>

  </div>
)

TeamMembers.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamMembers)
