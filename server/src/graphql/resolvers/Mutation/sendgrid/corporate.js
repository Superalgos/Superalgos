import sgMail from '@sendgrid/mail'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { ApolloError } from 'apollo-server-express'

import logger from '../../../../logger'

const API_KEY = process.env.SG_APIKEY
const API_KEY_CAMPAIGN = process.env.SG_APIKEY_CAMPAIGN
const CORPORATE_EMAIL = process.env.CORPORATE_EMAIL

const origin = process.env.SG_CORPORATE_ORIGIN

export default {
  async Corporate_NewsletterSignup(parent, { email }, ctx, info) {
    logger.info('Corporate_NewsletterSignup params email:')
    logger.info(email)
    const token = jwt.sign({ email: email }, API_KEY, { expiresIn: '1d' })
    const params = '/email-verification.shtml?token='

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
              "subject": 'VERIFY YOUR INTEREST in the Superalgos project'
            },
            "subject": 'VERIFY YOUR INTEREST in the Superalgos project'
          }
        ],
        "from": {
          "email": "feedback@superalgos.org",
          "name": "Superalgos Project Team"
        },
        "template_id": process.env.SG_CORPORATE_SIGNUP_EMAILID
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
      logger.info('Sendgrid sendVerify response:')
      logger.info(response)
      if (response.status >= 200 && response.status < 300) {
        return 'SUCCESS'
      } else {
        throw response.data.errors[0].message
      }
    })
    .catch(function (error) {
      logger.error('Sendgrid sendVerify Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid sendVerify Error: ${error.response.data.errors[0].message}`, 404)
    })
    return sendVerify
  },

  async Corporate_NewsletterSignupVerify(parent, { token }, ctx, info){
    let verifiedToken
    try {
      verifiedToken = jwt.verify(token, API_KEY, {maxAge: '1d'})
    } catch(err) {
      logger.error('Sendgrid verifiedToken Error:')
      logger.error(err)
      if (err.name === 'TokenExpiredError'){
        throw new ApolloError('Error: Token Expired. Please resubmit email address.', 400)
      } else {
        throw new ApolloError(`Error: ${err.message}`, 400)
      }
    }
    logger.info('Sendgrid verifySignup verifiedToken: ')
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
      logger.info('Sendgrid verifySignup subscribe: ')
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
          logger.info('Sendgrid verifySignup addToList: ')
          logger.info(response)
          if (response.status >= 200 && response.status < 300) {
            return 'SUCCESS'
          } else {
            throw response.data.errors[0].message
          }
        })
        .catch(error => {
          logger.error('Sendgrid verifySignUp subscribe Error:')
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
      logger.error('Sendgrid verifySubscribe Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid verifySubscribe Error: ${error.response.data.errors[0].message}`, 404)
    })
    return subscribe
  },

  async Corporate_Contact(parent, { email, name, message, recaptcha }, ctx, info) {
    logger.info(`Corporate_Contact: ${email} | ${name} | ${message} | ${recaptcha}`)
    const data = JSON.stringify({
      "personalizations": [
          {
            "to": [
              {
                "email": CORPORATE_EMAIL
              }
            ],
            dynamic_template_data: {
              "aacontactname": name,
              "aacontactemail": email,
              "aacontactbody": message,
              "subject": `Superalgos Project Site Contact - Message from ${name}`
            },
            "subject": `Superalgos Project Site Contact - Message from ${name}`
          }
        ],
      "from": {
        "email": "feedback@superalgos.org",
        "name": "Superalgos Project Team"
      },
      "reply_to": {
        "email": email,
        "name": name
      },
      "template_id": process.env.SG_CORPORATE_CONTACT_EMAILID
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
      // logger.info(response)
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
          // logger.info('Sendgrid Contact response: ')
          // logger.info(response)
          if (response.status >= 200 && response.status < 300) {
            logger.info('Sendgrid Contact email sent')
            return `Superalgos Project Contact email sent`
          } else {
            throw response.data.errors[0].message
          }
        })
        .catch(function (error) {
          logger.error(`sendgrid Error: ${JSON.stringify(error)}`)
          throw `Superalgos Project Contact email send error: ${error.response.data.errors[0].message}`
        })
      }else{
        logger.info('Superalgos Project Contact recaptcha error')
        logger.info(response.data)
        throw { response: { data: JSON.stringify(response.data) } }
      }
    })
    .then(function(response){
      return response
    })
    .catch(function (error) {
      logger.error('Sendgrid Superalgos Project Contact RECAPTCHA Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid Superalgos Project Contact RECAPTCHA Error: ${error.response.data}`, 404)
    })

    return checkCaptcha
  }
}
