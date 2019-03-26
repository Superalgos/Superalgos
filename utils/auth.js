const axios = require('axios')

exports.authenticate = async function () {
    try {

        if (!global.ACCESS_TOKEN) {

            const authBody = '{"client_id":"' + process.env.AUTH_CLIENT_ID
                + '","client_secret": "' + process.env.AUTH_CLIENT_SECRET
                + '","audience":"' + process.env.AUTH_AUDIENCE
                + '","grant_type":"client_credentials"}'

            let authResponse = await axios({
                url: process.env.AUTH_URL,
                method: 'post',
                data: authBody,
                headers: { 'content-type': 'application/json' }
            })

            if (!authResponse.data.errors)
                global.ACCESS_TOKEN = authResponse.data.access_token
            else throw new Error(operationsResponse.data.errors[0].message)

            process.env.AUTH_CLIENT_ID = ""
            process.env.AUTH_CLIENT_SECRET = ""
            process.env.AUTH_AUDIENCE = ""
            process.env.AUTH_URL = ""
        }

        return global.ACCESS_TOKEN
        
    } catch (error) {
        throw new Error('There has been an error on the authentication: ' + error)
    }
}