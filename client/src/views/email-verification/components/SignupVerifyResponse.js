import React from 'react'
import PropTypes from 'prop-types'

import { BannerTopBar } from '../../common'
import SignupForm from './SignupForm'

export class SignupVerifyResponse extends React.Component {
  componentDidMount () {
    const { mutate } = this.props
    mutate()
  };

  render () {
    const { loading, error, data } = this.props
    let BannerTitle = ''
    let BannerText = ''
    let displayForm = false
    console.log('SignupVerifyResponse:', loading, error, data)
    if (error) {
      if (error.message === 'GraphQL error: Error: Token Expired. Please resubmit email address.') {
        BannerText = [
          <strong key='EmailSignupConfirm-error-b1'>
            Newsletter Signup Error: Verification Token Expired
          </strong>,
          <br key='EmailSignupConfirm-error-br' />,
          'Please resubmit your email address and a new token will be emailed to you.',
          <br key='EmailSignupConfirm-error-br2' />,
          ' We apologize for the inconvenience, but we highly value your seurity and privacy.'
        ]
        displayForm = true
      } else {
        BannerText = ['Newsletter Signup Error: ', <br key='EmailSignupConfirm-error-br' />, error.message]
      }
      return (
        <BannerTopBar
          size='big'
          title={BannerTitle}
          text={BannerText}
          backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
        />
      )
    }
    if (loading && !error) {
      BannerText = ['Processing newsletter sign-up...', <br key='EmailSignupConfirm-br' />, 'Thank you for opting-in to recieve updates about the Advanced Algos project!']
    }
    if (data !== undefined && data !== null) {
      console.log(data)
      if (data.master_NewsletterSignupVerify === 'SUCCESS') {
        return (
          <React.Fragment>
            <BannerTopBar
              size='big'
              title='Mailing Sign-Up Complete!'
              text='We look forward to keeping you up-to-date on the Advanced Algos project.'
              backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
            >
              {displayForm && <SignupForm alignCenter />}
            </BannerTopBar>
          </React.Fragment>
        )
      }
    } else {
      return (
        <BannerTopBar
          size='big'
          title=''
          text='Newsletter Signup Error'
          backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
        />
      )
    }
  }
}

SignupVerifyResponse.propTypes = {
  mutate: PropTypes.function,
  loading: PropTypes.bool,
  error: PropTypes.object,
  data: PropTypes.object
}

export default SignupVerifyResponse
