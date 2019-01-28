const axios = require('axios')
const appRoot = require('app-root-path')
const { logger } = require(`${appRoot}/utils/logger`)
const auth = require(`${appRoot}/utils/auth`)

exports.updateExecutionResults = async function (summaryDate, buyAverage, sellAverage,
    marketRate, combinedProfitsA, combinedProfitsB) {

    logger.debug('updateExecutionResults -> Entering Function.')

    try {

        const authResponse = await auth.authenticate()

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
                authorization: 'Bearer ' + authResponse.data.access_token
            }
        })

        logger.debug('updateExecutionResults -> Operations Module Response: %s', operationsResponse.data.data.operations_UpdateExecutionSummary)

    } catch (error) {
        logger.error('updateExecutionResults -> Error: ' + error.stack)
        throw new Error('There has been an error updating the execution report: ' + error)
    }
}