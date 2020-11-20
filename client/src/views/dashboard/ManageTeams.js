import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import ManageTeamsList from './components/ManageTeamsList'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const ManageTeams = ({ classes }) => (
  <div>
    <Typography variant='h4' gutterBottom>
      Manage Your Teams
    </Typography>
    <ManageTeamsList />
  </div>
)

ManageTeams.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ManageTeams)
