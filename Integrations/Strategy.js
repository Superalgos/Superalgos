const axios = require('axios')

exports.getStrategy = async function () {
    try {

        let strategyOnlyOnce = true
        if (process.env.STRATEGY_ONLY_ONCE !== undefined)
            strategyOnlyOnce = JSON.parse(process.env.STRATEGY_ONLY_ONCE)

        if (!global.STRATEGY || !strategyOnlyOnce) {

            let fbSlug = process.env.BOT
            if (process.env.TEST_FB !== undefined) {
                fbSlug = process.env.TEST_FB
            }

            const strategizerResponse = await axios({
                url: process.env.STRATEGIZER_ENDPOINT || process.env.GATEWAY_ENDPOINT,
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
                    access_token: process.env.ACCESS_TOKEN_STRATEGY
                }
            })

            if (strategizerResponse.data.errors)
                throw new Error(strategizerResponse.data.errors[0].message)

            global.STRATEGY = strategizerResponse.data.data.strategizer_TradingSystemByFb.data;
        }
        return global.STRATEGY

    } catch (error) {
        throw new Error('There has been an error getting the strategy: ' + error)
    }
}
