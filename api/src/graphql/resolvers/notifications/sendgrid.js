var jwt = require('jsonwebtoken')
var axios = require('axios')

import { logger } from '../../../logger'

export const notifications_sendTeamMemberInvite = (email, team) => {
  logger.info('notifications_sendTeamMemberInvite')
  logger.info(email)
  logger.info(teamName)
  return new Promise((resolve, reject) => {
    try {
      return axios.post(process.env.PLATFORM_API_URL, {
        query: `mutation notifications_Teams_SendTeamMemberInvite($email:String!, $teamName:String!){
          notifications_Teams_SendTeamMemberInvite(email:$email, teamName:$teamName)
        }`,
        variables: {
          email: email,
          teamName: team.name
        }
      }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          logger.info('sendTeamMemberInvite result')
          logger.info(res.data)
          resolve(res.data)
        })
        .catch(err => {
          logger.info('sendTeamMemberInvite err')
          logger.info(err)
          reject(err)
        })
    } catch (error) {
      reject(error)
    }
  })
}

export const notifications_sendTeamCreateConfirmation = (email, teamName, botName) => {
  logger.info('notifications_sendTeamCreateConfirmation')
  logger.info(email)
  logger.info(teamName)
  logger.info(botName)
  return new Promise((resolve, reject) => {
    try {
      return axios.post(process.env.PLATFORM_API_URL, {
        query: `mutation notifications_sendTeamCreateConfirmation($email: String!, $teamName: String!, $botName: String!){
          notifications_Teams_SendTeamCreateConfirmation(email: $email, teamName: $teamName, botName: $botName)
        }`,
        variables: {
          email: email,
          teamName: teamName,
          botName: botName
        }
      }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          logger.info('sendTeamCreateConfirmation result')
          logger.info(res.data)
          resolve(res.data)
        })
        .catch(err => {
          logger.info('sendTeamCreateConfirmation err')
          logger.info(err)
          reject(err)
        })
    } catch (error) {
      reject(error)
    }
  })
}

export const notifications_VerifyTeamMemberInviteToken = (token) => {
  logger.info('notifications_VerifyTeamMemberInviteToken')
  logger.info(token)
  return new Promise((resolve, reject) => {
    try {
      return axios.post(process.env.PLATFORM_API_URL, {
        query: `mutation notifications_VerifyTeamMemberInviteToken($token: String!){
          notifications_Teams_VerifyTeamMemberInviteToken(token: $token)
        }`,
        variables: {
          token: token
        }
      }, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(res => {
          logger.info('VerifyTeamMemberInviteToken result')
          logger.info(res.data)
          resolve(res.data)
        })
        .catch(err => {
          logger.info('VerifyTeamMemberInviteToken err')
          logger.info(err)
          reject(err)
        })
    } catch (error) {
      reject(error)
    }
  })
}

const verifyInviteToken = async function(token) {
  const API_KEY = process.env.SG_APIKEY
  let verifiedToken
  try {
      verifiedToken = await jwt.verify(token, API_KEY, {maxAge: '7d'})
  } catch(err) {
    if (err.name === "TokenExpiredError"){
        throw new Error ("Error: Token Expired. Please request new invitation or apply to the team again")
    } else {
      throw new Error (`Error: Token error - ${err.message}`)
    }
  }
  logger.info(`verifyInviteToken: ${verifiedToken}`)
  return verifiedToken
}
