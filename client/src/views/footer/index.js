import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { connect } from 'react-redux'

import aalogo from '../../assets/advanced-algos/aa-logo-vert.svg'

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginTop: theme.spacing.unit * 7,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1200 + theme.spacing.unit * 3 * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`
  },
  footerContainer: {
    marginRight: theme.spacing.unit * 8,
    marginLeft: theme.spacing.unit * 8
  },
  footerLink: {
    textDecoration: 'none'
  }
})

class Footer extends Component {

  render () {
    let { classes } = this.props

    const masterApp = this.props.context.masterApp
    if (masterApp.footer.visible === false) {
      return (<div />)
    } else {
      return (
        <React.Fragment>
          <footer id='footer' className='dark_section footerStyleDark'><hr />
            <div className='container'>
              <div className='row margintop-25'>
                <div className='col-md-4 col-sm-4 '>
                  <div className='logo'>
                    <a href='index.shtml'>
                      <img src='img/logos/advanced-algos/aa-logo-dark.svg' alt='Advanced Algos Ltd. Logo' />
                    </a>
                  </div>
                  <div className='logo_descr'>
                    <p><strong>Advanced Algos Ltd.</strong><br />Ground Floor, Palace Court, Church Street,<br />St. Julians&nbsp;STJ3049, Malta</p>
                    <p><a href='legal-privacy-statement.shtml'>Privacy Statement</a> | <a href='legal-terms-of-service.shtml'>Terms of Service</a></p>
                  </div>
                </div>

                <div className='col-md-2 col-sm-2' />

                <div className='col-md-6 col-sm-6'>
                  <div className='signup-form-container'>
                    <h3 className='sc_title margintop20'>Stay in touch!</h3>
                    <p>Opt-in our mailing list to stay up to date with the Advanced Algos Project.</p>
                    <form id='email-signup' action='#' className='form-inline'>
                      <div className='message display-none'>Thank you for your interest! We'll keep you informed</div>
                      <div className='form-group'>
                        <input className='btn btn-lg' name='email' id='signup_email' type='email' placeholder='Enter your email' required />
                        <button id='email-submit' className='btn btn-info btn-lg' type='submit'><span className='glyphicon glyphicon-refresh animate-spin display-none' /> Submit</button>
                      </div>
                    </form>
                  </div>
                  <p>Meet us on Social Networks:</p>
                  <div className='socPage widgetWrap'>
                    <ul>
                      <li><a className='fab fa-telegram-plane' href='https://t.me/advancedalgoscommunity' title='Join us on Telgram' /></li>
                      <li><a className='fab fa-twitter' href='https://twitter.com/advancedalgos' title='Follow us on Twitter' /></li>
                      <li><a className='fab fa-facebook-f' href='https://www.facebook.com/Advanced-Algos-173249670001615/' title='Meet us on Facebook' /></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </footer>

          <section id='copyright' className='dark_section copyWrap no_padding_container'>
            <div className='container'>
              <div className='row copy'>
                <div className='col-sm-6 margin_bottom_micro'>
                  <p>&copy; Advanced Algos Ltd. 2018 | All Rights Reserved</p>
                </div>
              </div>
            </div>
          </section>
        </React.Fragment>
      )
    }
  }
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired
}

const mapStateToProps = (state) => {
  return {
    context: state.context
  }
}

export default connect(mapStateToProps)(withStyles(styles)(Footer))
