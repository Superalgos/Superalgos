const axios = require('axios')

exports.getStrategy = async function () {
    try {
        if (!global.STRATEGY) {
            let fbSlug = process.env.BOT
            if (process.env.TEST_FB !== undefined) {
                fbSlug = process.env.TEST_FB
            }

            const strategizerResponse = await axios({
                url: process.env.GATEWAY_ENDPOINT_K8S,
                method: 'post',
                data: {
                    query: `
                    query($fbSlug: String!){
                        strategizer_TradingSystemByFb(fbSlug: $fbSlug){
                            data
                        }
                    }
                    `,
                    variables: {
                        fbSlug: fbSlug
                    },
                },
                headers: {
                    authorization: process.env.AUTHORIZATION
                }
            })

            if (strategizerResponse.data.errors)
                throw new Error(strategizerResponse.data.errors[0].message)

            global.STRATEGY = strategizerResponse.data.data.strategizer_TradingSystemByFb.data;
        }
        return global.STRATEGY

    } catch (error) {
        throw new Error('There has been an error getting the strategy: ', JSON.stringify(error))
    }
}
