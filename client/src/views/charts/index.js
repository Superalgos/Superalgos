import React, { Component } from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'

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
    window.canvasApp.visible = true
    let body = document.getElementById('body')
    body.style = 'margin: 0px; padding: 0px; border: 0px; overflow:hidden;'
    this.props.hideFooter()

    window.dispatchEvent(new Event('load')) // This is a workaround to solve the problem that the slider does not show up
  }

  componentWillUnmount () {
    window.canvasApp.visible = false
    let body = document.getElementById('body')
    body.style = ''
    this.props.showFooter()
  }

  addSlider () {
    return (
      <section id='mainslider' className='fullwidth no_padding_container no_margin_col'>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-12'>
              <div className='flexslider'>
                <ul className='slides text-center'>
                  <li>
                    <img src='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg' alt='' />
                    <div className='slide_description_wrapper slider_textblock_center'>
                      <div className='slide_description to_animate'>
                        <div data-animation='fadeInUp' align='center'>
                          <div>
                            <div>
                              <h3>Advanced Algos Charts</h3>
                              <h4 className='white-text'>
                                <br />Map of markets and competitions.
                              </h4>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  render () {
    return (
      <React.Fragment>
        {this.addSlider()}
      </React.Fragment>
    )
  }
}

Charts.propTypes = {
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    context: state.context
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    hideFooter: () => { dispatch({type: 'HIDE_FOOTER'}) },
    showFooter: () => { dispatch({type: 'SHOW_FOOTER'}) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Charts))
