import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import { BannerTopBar } from '../common'

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

class Charts extends Component {
  componentDidMount () {
    if (window.canvasApp.visible === undefined) {
      loadCanvas() // This happens only once.
    }

    window.canvasApp.visible = true
    let body = document.getElementById('body')
    body.style = 'margin: 0px; padding: 0px; border: 0px; overflow:hidden;'
    this.props.hideFooter()
  }

  componentWillUnmount () {
    window.canvasApp.visible = false
    let body = document.getElementById('body')
    body.style = ''
    this.props.showFooter()
  }

  render () {
    return (
      <BannerTopBar
        size='medium'
        title=''
        text='Charts loading...'
        backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    context: state.context
  }
}

const mapDispatchToProps = dispatch => {
  return {
    hideFooter: () => {
      dispatch({ type: 'HIDE_FOOTER' })
    },
    showFooter: () => {
      dispatch({ type: 'SHOW_FOOTER' })
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(styles)(Charts))
