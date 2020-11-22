import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'
import { Mutation } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import InputBase from '@material-ui/core/InputBase'

import styles from './styles'

import NEWSLETTER_SIGNUP from '../graphql/NewsletterSignup'

import { isEmpty } from '../../../utils/js-helpers'

export class SignupForm extends Component {
  constructor (props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validate = this.validate.bind(this)

    this.state = {
      email: '',
      emailError: '',
      success: false
    }
  }

  render () {
    const {
      classes,
      width,
      alignCenter,
      displayTitle,
      displayIntro
    } = this.props
    return (
      <Mutation
        mutation={NEWSLETTER_SIGNUP}
      >
        {(NewsletterSignup, { loading, error, data }) => {
          return (
            <Grid container className={classes.signupRight} direction='column' justify={alignCenter ? 'center' : 'flex-start'}>
              {displayTitle && <Typography variant='h4' className={classNames(classes.textWhite, classes.signupTitle)} gutterBottom>Stay in touch!</Typography>}
              {displayIntro && <Typography variant='subtitle1' className={classNames(classes.textWhite, classes.signupText)} gutterBottom>Opt-in our mailing list to stay up to date with the Superalgos Project.</Typography>}
              <form id='email-signup' action='#' className='form-inline' autoComplete='off'>
                <Typography
                  variant='subtitle1'
                  className={classes.textSuccess}
                  gutterBottom
                  style={{
                    display: this.state.success ? 'block' : 'none',
                    textAlign: alignCenter ? 'center' : 'inherit'
                  }}
                >
                  Thank you for signing up! Please check your email and click on the confirmation link to complete the signup process.
                </Typography>
                <Grid container className={classes.signupContainer} justify={(width === 'xs' || alignCenter) ? 'center' : 'flex-start'}>
                  <InputBase
                    id='email'
                    placeholder='Enter your email'
                    classes={{
                      root: classes.signupInputRoot,
                      input: classes.signupInput
                    }}
                    onChange={this.handleChange}
                    value={this.state.email}
                  />
                  <Button
                    id='email-submit'
                    className={classes.signupInputSubmit}
                    onClick={e => {
                      this.handleSubmit(e, NewsletterSignup)
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </form>
            </Grid>
          )
        }}
      </Mutation>
    )
  }

  validate (data) {
    const errors = {}
    switch (data.id) {
      case 'email':
        if (data.value === '') {
          this.setState({ emailError: 'Please enter an email address' })
        } else {
          this.setState({ emailError: '' })
        }
        break
      default:
    }
    return errors
  }

  handleChange (e) {
    let id = e.target.id
    let value = e.target.value
    let error = this.validate({ id, value })
    switch (id) {
      case 'email':
        if (!isEmpty(error)) this.setState({ emailError: error })
        this.setState({ email: value })
        break
      default:
    }
  }

  async handleSubmit (e, NewsletterSignup) {
    e.preventDefault()
    console.log('NewsletterSignup handleSubmit: ', this.state.email)
    const signupResponse = await NewsletterSignup({ variables: { email: this.state.email } })
    console.log('NewsletterSignup: ', signupResponse)
    if (signupResponse.data.notifications_Master_NewsletterSignup === 'SUCCESS') this.setState({ email: '', success: true })
  }
}

SignupForm.propTypes = {
  classes: PropTypes.object,
  width: PropTypes.string,
  alignCenter: PropTypes.bool,
  displayTitle: PropTypes.bool,
  displayIntro: PropTypes.bool
}

const SignupFormWithStyles = withStyles(styles)(SignupForm)

export default withWidth()(SignupFormWithStyles)
