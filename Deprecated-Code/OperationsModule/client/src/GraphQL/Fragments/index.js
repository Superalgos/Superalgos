import gql from 'graphql-tag'

export const clone = gql`
  fragment clone on operations_Clone {
    id
    authId
    teamId
    botId
    mode
    resumeExecution
    beginDatetime
    endDatetime
    waitTime
    state
    stateDatetime
    createDatetime
    lastLogs
    summaryDate
    buyAverage
    sellAverage
    marketRate
    combinedProfitsA
    combinedProfitsB
    assetA
    assetB
    botType
    teamName
    botName
    botAvatar
    teamAvatar
    processName
    keyId
    botSlug
    exchangeName
    timePeriod
    balanceAssetB
  }
`
