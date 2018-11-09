import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'

import { TopBar } from '../common'
import ManageTeamsList from './components/ManageTeamsList'

const styles = theme => ({
  container: {
    width: 'auto',
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

const ManageTeams = ({ classes, ...props }) => (
  <div>
    <TopBar size='medium' title='Manage Your Teams' text='Create and manage your Advanced Algos teams' />
    <Grid
      container
      direction='column'
      justify='center'
      alignItems='stretch'
      className={classes.container}
      spacing={0}
    >
      <Grid item spacing={0}>
        <ManageTeamsList {...props} />
      </Grid>
    </Grid>
  </div>
)

ManageTeams.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(ManageTeams)
