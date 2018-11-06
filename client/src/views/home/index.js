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
    window.dispatchEvent(new Event('load')) // This is a workaround to solve the problem that the slider does not show up
  }

  render () {
    const { classes } = this.props
    return (
      <React.Fragment>

        <section id='mainslider' className='fullwidth no_padding_container no_margin_col'>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-12'>
                <div className='flexslider slider_height_max'>
                  <ul className='slides text-center'>
                    <li>
                      <img src='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg' alt='' />
                      <div className='slide_description_wrapper slider_textblock_center'>
                        <div className='slide_description to_animate'>
                          <div data-animation='fadeInUp' align='center'>
                            <div>
                              <div>
                                <h3>Advanced Algos Platform</h3>
                                <h4 className='white-text'>
                                  <br />Enabling the evolutionary race towards the emergence of superalgos
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

        <section id='intro' className='light_section'>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-12 text-center'>
                <h1 className='sc_title'>Welcome to the Superalgos Platform!</h1>
                <h5 className='sc_title sc_title_underline'>CO-CREATE >> COMPETE >> EVOLVE</h5>
              </div>
            </div>
            <div className='row'>
              <div className='col-sm-6'>
                <p>Before you begin, please be aware <strong>this is a development environment in pre-alpha stage</strong>. The features available as of today are limited but already functional. However, you may encounter occasional instability and errors.</p>
                <p>The Superalgos Platform is the place is which we meet to collaborate in the quest to make trading algorithms evolve. You will be able to register, create or join a team, fork a functional trading bot and eventually put it to compete with other people's forks.</p>
              </div>
              <div className='col-sm-6'>
                <p>Feel free to explore the menu in the top-right corner or visit the <a href='https://www.advancedalgos.net/documentation-quick-start.shtml' target='_blank'>Quick Start Guide</a>. Reporting of bugs at the corresponding <a href='https://github.com/AdvancedAlgos' target='_blank' rel='nofollow'>Advanced Algos Github repository</a> is highly appreciated.</p>
                <p>Get in touch with the rest of the community and get answers to your questions in our <a href='https://t.me/advancedalgoscommunity' target='_blank' rel='nofollow'>Telegram Group</a>. Have fun!</p>
              </div>
            </div>
          </div>
        </section>

      </React.Fragment>
    )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)
