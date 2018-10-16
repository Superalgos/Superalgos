import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: '100%',
    height: '100%'
  },
  heroContent: {
    textColor: theme.palette.common.white,
    maxWidth: 600,
    height: 800,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  }
})

class Home extends Component {

  componentDidMount () {
    window.CANVAS_VISIBLE = true
    let body = document.getElementById('body')
    body.style = 'margin: 0px; padding: 0px; border: 0px; overflow:hidden;'
    window.HIDE_FOOTER = true
  }

  componentWillUnmount () {
    window.CANVAS_VISIBLE = false
    let body = document.getElementById('body')
    body.style = ''
    window.HIDE_FOOTER = false
  }

  render () {
    const { classes } = this.props
    return (
      <React.Fragment />
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)
