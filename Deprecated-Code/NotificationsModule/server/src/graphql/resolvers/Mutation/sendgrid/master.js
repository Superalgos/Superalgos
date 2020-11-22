import sgMail from '@sendgrid/mail'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { ApolloError } from 'apollo-server-express'

import logger from '../../../../logger'

const API_KEY = process.env.SG_APIKEY
const API_KEY_CAMPAIGN = process.env.SG_APIKEY_CAMPAIGN

const origin = process.env.SG_PLATFORM_ORIGIN

export default {
  async Master_NewsletterSignup(parent, { email }, ctx, info) {
    logger.info('Master_NewsletterSignup params email:')
    logger.info(email)
    const token = jwt.sign({ email: email }, API_KEY, { expiresIn: '1d' })
    const params = '/email-verification?token='

    const data = JSON.stringify({
      "personalizations": [
          {
            "to": [
              {
                "email": email
              }
            ],
            dynamic_template_data: {
              "aaverifylink": origin + params + token,
              "subject": 'VERIFY YOUR INTEREST in the Superalgos Project'
            },
            "subject": 'VERIFY YOUR INTEREST in the Superalgos Project'
          }
      ],
      "from": {
        "email": "feedback@superalgos.org",
        "name": "Superalgos Project Team"
      },
      "reply_to": {
        "email": "feedback@superalgos.org",
        "name": "Superalgos Project Team"
      },
      "template_id": process.env.SG_MASTER_SIGNUP_EMAILID
    })

    const sendVerify = axios({
      method: 'post',
      url: 'https://api.sendgrid.com/v3/mail/send',
      data: data,
      headers:{
          'content-type': 'application/json',
          'authorization': 'Bearer ' + API_KEY
      }
    })
    .then(function (response) {
      logger.info('Sendgrid Master SendVerify response:')
      logger.info (response)
      if (response.status >= 200 && response.status < 300) {
        return 'SUCCESS'
      } else {
        throw response.data.errors[0].message
      }
    })
    .catch(function (error) {
      logger.error('Sendgrid Master SendVerify Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid Master SendVerify Error: ${error.response.data.errors[0].message}`, 404)
    })
    return sendVerify
  },
  async Master_NewsletterSignupVerify(parent, { token }, ctx, info){
    let verifiedToken
    try {
      verifiedToken = jwt.verify(token, API_KEY, {maxAge: '1d'})
    } catch(err) {
      logger.error('Sendgrid Master verifiedToken Error:')
      logger.error(err)
      if (err.name === 'TokenExpiredError'){
        throw new ApolloError('Error: Token Expired. Please resubmit email address.', 400)
      } else {
        throw new ApolloError(`Error: ${err.message}`, 400)
      }
    }
    logger.info('Sendgrid Master verifySignup verifiedToken: ')
    logger.info(verifiedToken)

    const email = verifiedToken.email

    const subscribe = axios({
        method: 'post',
        url: 'https://api.sendgrid.com/v3/contactdb/recipients',
        data: [{"email": email}],
        headers:{
          'content-type': 'application/json',
          'authorization': 'Bearer ' + API_KEY_CAMPAIGN
        }
    })
    .then(response => {
      logger.info('Sendgrid Master verifySignup subscribe: ')
      logger.info(response)
      const recipients = response.data.persisted_recipients

      if (recipients.length > 0 ){
        const addToList = axios({
          method: 'post',
          url: 'https://api.sendgrid.com/v3/contactdb/lists/4068018/recipients/' + recipients[0],
          headers:{
            'content-type': 'application/json',
            'authorization': 'Bearer ' + API_KEY_CAMPAIGN
          }
        })
        .then(response => {
          logger.info('Sendgrid Master verifySignup addToList: ')
          logger.info(response)
          if (response.status >= 200 && response.status < 300) {
            return 'SUCCESS'
          } else {
            throw response.data.errors[0].message
          }
        })
        .catch(error => {
          logger.error('Sendgrid Master verifySignUp subscribe Error:')
          logger.error(error)
          throw `Email SignUp Error: ${error}`
        })
        return addToList
      } else{
        return response.data.errors[0].message
      }
    })
    .then(response => {
      return response
    })
    .catch(error => {
      logger.error('Sendgrid Master verifySubscribe Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid Master verifySubscribe Error: ${error.response.data.errors[0].message}`, 404)
    })
    return subscribe
  },
  async Master_Feedback(parent, { email, subject, message, recaptcha }, ctx, info) {
    const toEmail = 'feedback@superalgos.org'

    const data = JSON.stringify({
      "personalizations": [
          {
            "to": [
              {
                "email": toEmail
              }
            ],
            dynamic_template_data: {
              "aacontactname": name,
              "aacontactemail": email,
              "aacontactbody": message
            },
            "subject": `Superalgos Platform App Feedback - Message from ${name}`
          }
        ],
      "from": {
        "email": email,
        "name": name
      },
      "reply_to": {
        "email": email,
        "name": name
      },
      "template_id": process.env.SG_MASTER_FEEDBACK_EMAILID
    })

    const checkCaptcha = axios({
      method: 'post',
      url: 'https://www.google.com/recaptcha/api/siteverify',
      params: {
        secret: process.env.RECAPTCHA,
        response: recaptcha
      }
    })
    .then(function (response) {
      logger.info(response.data)
      if (response.status >= 200 && response.status < 300 && response.data.success) {
        return axios({
          method: 'post',
          url: 'https://api.sendgrid.com/v3/mail/send',
          data: data,
          headers:{
            'content-type': 'application/json',
            'authorization': 'Bearer ' + API_KEY
          }
        })
        .then(function (response) {
          logger.info('Platform Feedback response: ')
          logger.info(response)
          if (response.status >= 200 && response.status < 300) {
            return `Platform Feedback email sent`
          } else {
            throw response.data.errors[0].message
          }
        })
        .catch(function (error) {
          logger.error(`sendgrid Error: ${JSON.stringify(error)}`)
          throw `Platform Feedback email send error: ${error.response.data.errors[0].message}`
        })
      }else{
        throw response.data
      }
    })
    .then(function(response){
      return response
    })
    .catch(function (error) {
      logger.error('Platform Feedback RECAPTCHA Error:')
      logger.error(error)
      throw new ApolloError(`Platform Feedback RECAPTCHA Error: ${error.response.data.errors[0].message}`, 404)
    })

    return checkCaptcha
  }
}
