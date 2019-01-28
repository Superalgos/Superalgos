const axios = require('axios')
const appRoot = require('app-root-path')
const { logger } = require(`${appRoot}/utils/logger`)

exports.authenticate = function () {
    try {
        logger.debug('authenticate -> Entering Function.')

        const authBody = '{"client_id":"' + process.env.AUTH_CLIENT_ID
            + '","client_secret": "' + process.env.AUTH_CLIENT_SECRET
            + '","audience":"' + process.env.AUTH_AUDIENCE
            + '","grant_type":"client_credentials"}'

        return axios({
            url: process.env.AUTH_URL,
            method: 'post',
            data: authBody,
            headers: { 'content-type': 'application/json' }
        })

    } catch (error) {
        logger.error('authenticate -> Error: ' + error.stack)
        throw new Error('There has been an error on the authentication: ' + error)
    }
}