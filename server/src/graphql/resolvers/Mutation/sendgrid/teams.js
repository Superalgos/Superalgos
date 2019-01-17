import sgMail from '@sendgrid/mail'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { ApolloError } from 'apollo-server-express'

import logger from '../../../../logger'

const API_KEY = process.env.SG_APIKEY
const API_KEY_CAMPAIGN = process.env.SG_APIKEY_CAMPAIGN

const origin = process.env.SG_PLATFORM_ORIGIN

export default {
  async Teams_SendTeamMemberInvite(parent, { email, teamName }, ctx, info) {
    logger.info('Teams_NewsletterSignup params email:')
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
              "aateaminvitelink": origin + params + token,
              "aateamname": teamName,
              "subject": "INVITATION: Join team " + teamName
            },
            "subject": "INVITATION: Join team " + teamName
          }
        ],
        "from": {
          "email": "noreply@superalgos.org",
          "name": "Superalgos Project Teams"
        },
        "reply_to": {
          "email": "feedback@superalgos.org",
          "name": "Superalgos Project Teams"
        },
        "template_id": process.env.SG_TEAMS_MEMBER_INVITE_EMAILID
      })

    let sendVerify = axios({
        method: 'post',
        url: 'https://api.sendgrid.com/v3/mail/send',
        data: data,
        headers:{
            'content-type': 'application/json',
            'authorization': 'Bearer ' + API_KEY
        }
    })
    .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
          return 'Success'
        } else {
          throw response.data.errors[0].message
        }
    })
    .catch(function (error) {
      throw new ApolloError (`Send Team Invite Verification Error: - ${error.status}-${error.response.data.errors[0].message}`, 404)
    })
    return sendVerify
  },

  async Teams_VerifyTeamMemberInviteToken(parent, { email, teamName }, ctx, info) {
    let verifiedToken
    try {
        verifiedToken = await jwt.verify(token, API_KEY, {maxAge: '7d'})
    } catch(err) {
      if (err.name === "TokenExpiredError"){
          throw new ApolloError('Team Invite Token Error: Token Expired. Please request new invitation or apply to the team again', 404)
      } else {
        throw new ApolloError (`Team Invite Token Error: - ${err.message}`, 404)
      }
    }
    logger.info(`verifyInviteToken: ${verifiedToken}`)
    return verifiedToken
  },

  async Teams_SendTeamCreateConfirmation(parent, { email, teamName, botName }, ctx, info){
    const data = JSON.stringify({
        "personalizations": [
          {
            "to": [
              {
                "email": email
              }
            ],
            dynamic_template_data: {
              "aadeveloplink": "https://platform.superalgos.org/index.html",
              "aateamname": teamName,
              "aabotname": botName,
              "subject": "Team " + teamName + " has been created!"
            },
            "subject": "Team " + teamName + " has been created!"
          }
        ],
        "from": {
          "email": "noreply@superalgos.org",
          "name": "Superalgos Project Teams"
        },
        "reply_to": {
          "email": "feedback@superalgos.org",
          "name": "Superalgos Project Teams"
        },
        "template_id": process.env.SG_TEAMS_TEAMCREATE_EMAILID
      })

    let sendTeamCreation = axios({
      method: 'post',
      url: 'https://api.sendgrid.com/v3/mail/send',
      data: data,
      headers:{
          'content-type': 'application/json',
          'authorization': 'Bearer ' + API_KEY
      }
    })
    .then(function (response) {
      if (response.status >= 200 && response.status < 300) {
        return 'Success'
      } else {
        throw response.data.errors[0].message
      }
    })
    .catch(function (error) {
      throw new ApolloError(`Team Creation Confirmation Error: ${error.response.data.errors[0].message}`)
    })
    return sendTeamCreation
  }
}
