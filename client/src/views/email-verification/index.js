import React from 'react'
import PropTypes from 'prop-types'
import queryString from 'query-string'
import { Mutation } from 'react-apollo'

import { BannerTopBar } from '../common'

import NEWSLETTER_SIGNUP_VERIFY from './graphql/NewsletterSignupVerify'

export const EmailSignupConfirm = ({ tokenParam }) => {
  let token
  let BannerTitle = ''
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
        backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
      />
    )
  }
  console.log(token)
  return (
    <Mutation
      mutation={NEWSLETTER_SIGNUP_VERIFY}
      variables={{ token: token }}
    >
      {(NewsletterSignupVerify, { loading, error, data }) => {
        console.log(loading, error, data)
        if (error) {
          BannerText = ['Newsletter Signup Error: ', <br key='EmailSignupConfirm-error-br' />, JSON.stringify(error)]
        }
        if (loading && !error) {
          BannerText = ['Processing newsletter sign-up...', <br key='EmailSignupConfirm-br' />, 'Thank you for opting-in to recieve updates about the Advanced Algos project!']
        }
        if (data !== undefined && data !== null) {
          console.log(data)
          return (
            <BannerTopBar
              size='big'
              title={BannerTitle}
              text={BannerText}
              backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
            />
          )
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
    </Mutation>
  )
}

EmailSignupConfirm.propTypes = {
  tokenParam: PropTypes.string
}

export default EmailSignupConfirm
