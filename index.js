import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
// import { BannerTopBar } from '../common'
import { loadAdvancedAlgosPlatform } from './Scripts/AppPreLoader'

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
    console.log("componentDidMount")
    // if (window.canvasApp.visible === undefined) {
      loadCanvas() // This happens only once.
    // }

    // window.canvasApp.visible = true
    let body = document.getElementById('body')
    body.style = 'margin: 0px; padding: 0px; border: 0px; overflow:hidden;'
    this.props.hideFooter()
  }

  componentWillUnmount () {
    // window.canvasApp.visible = false
    let body = document.getElementById('body')
    body.style = ''
    this.props.showFooter()
  }

  render () {
    return (
        <div> TESTING CANVAS APP </div>
    //   <BannerTopBar
    //     size='medium'
    //     title=''
    //     text='Charts loading...'
    //     backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
    //   />
    )
  }
}

function loadCanvas(){
    console.log("loadCanvas")
    // if (window.canvasApp.visible === undefined) {
        window.canvasApp = {
          version: '1.0.0',  // This is used to avoid catching problems at the browser level.
          sessionToken: '',
          executingAt: 'Master App',
          visible: false,
          topMargin: 130,
          urlPrefix:'http://localhost:3100/',
        //   urlPrefix: '<%= process.env.CANVAS_URL %>',
          graphQL: {
            masterAppApiUrl: '<%= process.env.PLATFORM_API_URL %>',
          },
          context: {}
        };

        try {
          loadAdvancedAlgosPlatform();
        }
        catch (err) {
          console.log("[ERROR] MasterApp -> Index -> CanvasApp can not be started. Please check that AAWeb is running.");
          console.log("[ERROR] MasterApp -> Index -> err = " + err.stack);
        }
    //   }
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
