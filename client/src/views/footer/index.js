import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { NavLink, Link } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import { connect } from 'react-redux'
import lightGreen from '@material-ui/core/colors/lightGreen';

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import InputBase from '@material-ui/core/InputBase'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faTelegramPlane, faTwitter } from '@fortawesome/free-brands-svg-icons'

import aalogo from '../../assets/advanced-algos/aa-logo-horiz-dark.svg'

const styles = theme => ({
  textLight: {
    color: theme.palette.primary.light
  },
  textWhite: {
    color: theme.palette.common.white
  },
  textSuccess: {
    color: lightGreen[400]
  },
  linkLight: {
    color: theme.palette.secondary.main,
    textDecoration: 'none'
  },
  descriptionLeft: {
    marginLeft: theme.spacing.unit * 12
  },
  signupRight: {
    marginTop: theme.spacing.unit * 3
  },
  signupContainer: {
    marginBottom: theme.spacing.unit * 2
  },
  footer: {
    borderTop: `4px solid ${theme.palette.secondary.light}`,
    padding: `${theme.spacing.unit * 6}px 0`,
    marginTop: '-42px',
    backgroundColor: '#19191C', /* #29292c */
    color: theme.palette.primary.light
  },
  footerContainer: {
    marginRight: theme.spacing.unit * 4,
    marginLeft: theme.spacing.unit * 4
  },
  footerLink: {
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.secondary.light
    }
  },
  footerInputRoot: {
    'label + &': {
      marginTop: theme.spacing.unit * 3
    }
  },
  footerInput: {
    borderRadius: 4,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    marginRight: theme.spacing.unit * 1
  },
  footerInputSubmit: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
    lineHeight: '1.1875em',
    color: theme.palette.common.white,
    padding: '10px 12px',
    backgroundColor: '#5bc0de',
    borderColor: '#46b8da',
    '&:hover': {
      backgroundColor: '#31b0d5',
      borderColor: '#269abc'
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#0062cc',
      borderColor: '#005cbf'
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)'
    }
  },
  icon: {
    margin: theme.spacing.unit * 1,
    fontSize: 24
  },
  iconHover: {
    margin: theme.spacing.unit * 1,
    '&:hover': {
      color: theme.palette.secondary.light
    }
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
        <footer className={classNames(classes.darkSection, classes.footer)}>
          <Grid
            container
            spacing={8}
            justify='space-evenly'
            className={classes.footerContainer}
          >
            <Grid item xs={12} md={4} >
              <NavLink to='/'>
                <img alt='' src={aalogo} width={'100%'} height={'auto'} />
              </NavLink>
              <Grid container className={classes.descriptionLeft}>
                <Typography variant='subtitle2' className={classes.textLight} ><strong>Advanced Algos Ltd.</strong></Typography>
                <Typography variant='subtitle1' className={classes.textLight} gutterBottom>Ground Floor, Palace Court, Church Street,<br />St. Julians&nbsp;STJ3049, Malta</Typography>
                <Typography variant='subtitle1' className={classes.textLight}>
                  <Link to='legal-privacy-statement.shtml' className={classes.linkLight}>Privacy Statement</Link> | <a href='legal-terms-of-service.shtml' className={classes.linkLight}>Terms of Service</a>
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} md={1} />
            <Grid item xs={12} md={6} >
              <Grid container className={classes.signupRight}>
                <Typography variant='h4' className={classes.textWhite} gutterBottom>Stay in touch!</Typography>
                <Typography variant='subtitle1' className={classes.textWhite} gutterBottom>Opt-in our mailing list to stay up to date with the Advanced Algos Project.</Typography>
                <form id='email-signup' action='#' className='form-inline' autoComplete='off'>
                  <Typography variant='body2' className={classes.textSuccess} gutterBottom>Thank you for your interest! We'll keep you informed</Typography>
                  <Grid container className={classes.signupContainer}>
                    <InputBase
                      id='footer-input'
                      placeholder='Enter your email'
                      classes={{
                        root: classes.footerInputRoot,
                        input: classes.footerInput
                      }}
                    />
                    <Button id='email-submit' className={classes.footerInputSubmit}>Submit</Button>
                  </Grid>
                </form>
              </Grid>
              <Typography variant='subtitle1' className={classes.textWhite}>Meet us on Social Networks:</Typography>
              <Grid container justify='flex-start'>
                <Link to='https://t.me/advancedalgoscommunity' title='Join us on Telgram' className={classes.linkLight}>
                  <FontAwesomeIcon
                    icon={faTelegramPlane}
                    className={classNames(classes.icon, classes.iconHover)}
                  />
                </Link>
                <Link to='https://twitter.com/advancedalgos' title='Follow us on Twitter' className={classes.linkLight}>
                  <FontAwesomeIcon
                    icon={faTwitter}
                    className={classNames(classes.icon, classes.iconHover)}
                  />
                </Link>
                <Link to='https://www.facebook.com/Advanced-Algos-173249670001615/' title='Meet us on Facebook' className={classes.linkLight}>
                  <FontAwesomeIcon
                    icon={faFacebookF}
                    className={classNames(classes.icon, classes.iconHover)}
                  />
                </Link>
              </Grid>
            </Grid>
          </Grid>
        </footer>
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
