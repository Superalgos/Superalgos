import React, { Component } from 'react'
import PropTypes from 'prop-types'
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
      emailError: ''
    }
  }

  render () {
    const { classes, width } = this.props
    return (
      <Mutation
        mutation={NEWSLETTER_SIGNUP}
      >
        {(NewsletterSignup, { loading, error, data }) => {
          let successMessage = false
          if (data.NewsletterSignup === 'SUCESS') {
            successMessage = true
          }
          return (
            <Grid container className={classes.signupRight} direction='column'>
              <Typography variant='h4' className={classes.textWhite} gutterBottom>Stay in touch!</Typography>
              <Typography variant='subtitle1' className={classes.textWhite} gutterBottom>Opt-in our mailing list to stay up to date with the Advanced Algos Project.</Typography>
              <form id='email-signup' action='#' className='form-inline' autoComplete='off'>
                <Typography
                  variant='body2'
                  className={classes.textSuccess}
                  gutterBottom
                  style={successMessage ? 'display: block' : 'display: none'}
                >
                  Thank you for your interest! We'll keep you informed
                </Typography>
                <Grid container className={classes.signupContainer} justify={width === 'xs' ? 'center' : 'flex-start'}>
                  <InputBase
                    id='email'
                    placeholder='Enter your email'
                    classes={{
                      root: classes.signupInputRoot,
                      input: classes.signupInput
                    }}
                    onChange={this.handleChange}
                  />
                  <Button
                    id='email-submit'
                    className={classes.signupInputSubmit}
                    onClick={e => {
                      this.handleSubmit(e, NewsletterSignup, this.state.email)
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
        this.setState({ emaail: value })
        break
      default:
    }
  }

  async handleSubmit (e, NewsletterSignup, email) {
    e.preventDefault()
    const signupResponse = await NewsletterSignup({ variables: { email } })
    console.log('NewsletterSignup: ', signupResponse)
    this.setState({ email: '' })
  }
}

SignupForm.propTypes = {
  classes: PropTypes.object,
  width: PropTypes.string
}

const SignupFormWithStyles = withStyles(styles)(SignupForm)

export default withWidth()(SignupFormWithStyles)
