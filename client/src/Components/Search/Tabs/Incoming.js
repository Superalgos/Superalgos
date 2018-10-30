import React from 'react'
import { Typography } from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import styles from '../styles'

class Incoming extends React.Component {
  render () {
    const classes = this.props.classes
    return (
      <Typography
        className={classes.title}
        variant='display1'
        align='center'
        color='textPrimary'
        gutterBottom
      >
        Ongoing and incoming competitions
      </Typography>
    )
  }
}

export default withStyles(styles)(Incoming)
