import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { MessageCard } from '../common/'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const TeamMembers = ({ classes }) => (
  <div>
    <Typography variant='display1' gutterBottom>
      Members
    </Typography>
    <div className={classes.tableContainer}>
      <MessageCard message='Coming soon. Invite and manage team members' />
    </div>
  </div>
)

TeamMembers.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(TeamMembers)
