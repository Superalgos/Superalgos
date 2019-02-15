import React from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { Mutation } from 'react-apollo'

import { BannerTopBar } from '../common'
import SignupVerifyResponse from './components/SignupVerifyResponse'

import NEWSLETTER_SIGNUP_VERIFY from './graphql/NewsletterSignupVerify'

export const EmailSignupConfirm = ({ tokenParam }) => {
  let token
  let BannerText = ''
  if (tokenParam !== '' && tokenParam !== null) {
    const values = queryString.parse(tokenParam)
    token = values.token
  } else {
    BannerText = [
      'Newsletter Signup Error: Invalid Token',
      <br key='EmailSignupConfirm-error-br' />,
      'Please try signing up again! We apologize for the inconvenience,',
      <br key='EmailSignupConfirm-error-br2' />,
      'but we highly value your seurity and privacy.'
    ]
    return (
      <BannerTopBar
        size='big'
        title=''
        text={BannerText}
        backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
      />
    )
  }
  console.log(token)
  return (
    <Mutation mutation={NEWSLETTER_SIGNUP_VERIFY} variables={{ token: token }}>
      {(NewsletterSignupVerify, { loading, error, data }) => {
        return (
          <SignupVerifyResponse
            mutate={NewsletterSignupVerify}
            loading={loading}
            error={error}
            data={data}
          />
        )
      }}
    </Mutation>
  )
}

EmailSignupConfirm.propTypes = {
  tokenParam: PropTypes.string
}

export default EmailSignupConfirm
