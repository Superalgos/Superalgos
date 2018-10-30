import React from 'react'
import { Typography } from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import styles from '../styles'

class Future extends React.Component {
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
        Future competitions
      </Typography>
    )
  }
}

export default withStyles(styles)(Future)
