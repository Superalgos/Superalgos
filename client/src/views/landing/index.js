import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import { BannerTopBar } from '../common'

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

const Landing = ({ classes, ...props }) => (
  <div>
    <BannerTopBar size='big' title='Teams Module' text='Create and manage your Advanced Algos teams' backgroundUrl='https://advancedalgos.net/img/photos/teams.jpg' />
  </div>
)

Landing.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Landing)
