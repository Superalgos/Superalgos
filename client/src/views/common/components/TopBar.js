import React from 'react'
import PropTypes from 'prop-types'

import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

import styles from './TopBarStyles'

class TopBar extends React.Component {
  render () {
    const {
      classes,
      size,
      title,
      text
    } = this.props
    if (size === 'big') {
      return (
        <div className={classes.rootBig}>
          <div className={classes.captions}>
            <Typography className={classes.title} variant='h5' align='center'>{title}</Typography>
            <Typography className={classes.text} variant='subtitle1' align='center'>{text}</Typography>
          </div>
        </div>
      )
    }
    if (size === 'medium') {
      return (
        <div className={classes.rootMedium}>
          <div className={classes.captions}>
            <Typography className={classes.title} variant='h5' align='center'>{title}</Typography>
            <Typography className={classes.text} variant='subtitle1' align='center'>{text}</Typography>
          </div>
        </div>
      )
    }
    return (
      <div className={classes.rootSmall} />
    )
  }
}

TopBar.propTypes = {
  classes: PropTypes.object.isRequired,
  size: PropTypes.string,
  title: PropTypes.string,
  text: PropTypes.string
}

export default withStyles(styles)(TopBar)
