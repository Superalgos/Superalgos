const axios = require('axios')
const auth = require('../utils/auth')

exports.updateExecutionResults = async function (summaryDate, buyAverage, sellAverage,
    marketRate, combinedProfitsA, combinedProfitsB) {

    try {

        const accessToken = await auth.authenticate()

        const operationsResponse = await axios({
            url: process.env.GATEWAY_ENDPOINT,
            method: 'post',
            data: {
                query: `
                mutation($id: ID!, $summaryDate: Int!, $buyAverage: Float!, $sellAverage: Float!,
                        $marketRate: Float!, $combinedProfitsA: Float!, $combinedProfitsB: Float!,
                        $assetA: String!, $assetB: String!){
                    operations_UpdateExecutionSummary(
                      id: $id,
                      summaryDate: $summaryDate,
                      buyAverage: $buyAverage,
                      sellAverage: $sellAverage,
                      marketRate: $marketRate,
                      combinedProfitsA: $combinedProfitsA,
                      combinedProfitsB: $combinedProfitsB,
                      assetA: $assetA,
                      assetB: $assetB
                    )
                  }
                `,
                variables: {
                    id: process.env.CLONE_ID,
                    summaryDate: summaryDate,
                    buyAverage: buyAverage,
                    sellAverage: sellAverage,
                    marketRate: marketRate,
                    combinedProfitsA: combinedProfitsA,
                    combinedProfitsB: combinedProfitsB,
                    assetA: global.MARKET.assetA,
                    assetB: global.MARKET.assetB
                },
            },
            headers: {
                authorization: 'Bearer ' + accessToken
            }
        })

        if (operationsResponse.data.errors)
            throw new Error(operationsResponse.data.errors[0].message)

    } catch (error) {
        throw new Error('There has been an error updating the execution on the clone: ' + error)
    }
}