import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { TeamTable } from './components/TeamTable'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

export const Settings = ({ classes }) => (
  <div>
    <Typography variant='display1' gutterBottom>
      Settings
    </Typography>
    <div className={classes.tableContainer}>
      <TeamTable />
    </div>
  </div>
)

Settings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Settings)
