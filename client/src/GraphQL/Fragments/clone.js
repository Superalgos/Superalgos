import gql from 'graphql-tag';

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
    runAsTeam
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
  }
`;
