import axios from 'axios'
import jwt from 'jsonwebtoken'
import { ApolloError } from 'apollo-server-express'

import logger from '../../logger'

const API_KEY = process.env.SG_APIKEY
const API_KEY_CONTACTS = process.env.SG_APIKEY_CONTACTS

const dev = process.env.NODE_ENV === 'development' ? true : false
let origin = 'https://app.advancedalgos.net'
if (dev){
  origin = 'http://localhost:3100'
}

export default {
  async master_NewsletterSignup(parent, { email }, ctx, info) {
    const token = jwt.sign({ email: email }, API_KEY, { expiresIn: '1d' })
    let origin = 'https://advancedalgos.net'
    const params = '/email-verification?token='
    if (dev){
      origin = 'http://localhost:4100'
    }

    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : origin,
      'Access-Control-Allow-Credentials': 'true'
    }

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
              "subject": 'VERIFY YOUR INTEREST in Advanced Algos'
            },
            "subject": 'VERIFY YOUR INTEREST in Advanced Algos'
          }
        ],
        "from": {
          "email": "feedback@advancedalgos.net",
          "name": "Advanced Algos Team"
        },
        "reply_to": {
          "email": "feedback@advancedalgos.net",
          "name": "Advanced Algos Team"
        },
        "template_id": process.env.SG_SIGNUP_EMAILID
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
  async master_NewsletterSignupVerify(parent, { token }, ctx, info){
    let origin = 'https://app.advancedalgos.net'
    if (dev){
      origin = 'http://localhost:4100'
    }
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : origin,
      'Access-Control-Allow-Credentials': 'true'
    }

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
          'authorization': 'Bearer ' + API_KEY_CONTACTS
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
            'authorization': 'Bearer ' + API_KEY_CONTACTS
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
  async master_Contact(parent, { email, subject, message, recaptcha }, ctx, info) {
    let origin = 'https://advancedalgos.net'
    if (dev){
      origin = 'http://localhost:4000'
    }
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin' : origin,
      'Access-Control-Allow-Credentials': 'true'
    }

    const toEmail = 'feedback@advancedalgos.net'

    const data = JSON.stringify({
      "personalizations": [
          {
            "to": [
              {
                "email": email
              }
            ],
            dynamic_template_data: {
              "aacontactname": name,
              "aacontactemail": email,
              "aacontactbody": message
            },
            "subject": `AA Corporate Site Contact - Message from ${name}`
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
      "template_id": process.env.SG_CONTACT_EMAILID
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
        context.log('presend SendGrid')
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
          logger.info('Sendgrid Contact response: ')
          logger.info(response)
          if (response.status >= 200 && response.status < 300) {
            return `Contact email sent`
          } else {
            throw response.data.errors[0].message
          }
        })
        .catch(function (error) {
          logger.error(`sendgrid Error: ${JSON.stringify(error)}`)
          throw `Contact email send error: ${error.response.data.errors[0].message}`
        })
      }else{
        throw response.data
      }
    })
    .then(function(response){
      return response
    })
    .catch(function (error) {
      logger.error('Sendgrid Contact RECAPTCHA Error:')
      logger.error(error)
      throw new ApolloError(`Sendgrid Contact RECAPTCHA Error: ${error.response.data.errors[0].message}`, 404)
    })

    return checkCaptcha
  }
}
