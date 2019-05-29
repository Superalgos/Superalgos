
function newStrategizerGateway () {
  const MODULE_NAME = 'Strategizer Gateway'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    strategizerData: undefined,
    container: undefined,
    loadFromStrategyzer: loadFromStrategyzer,
    saveToStrategyzer: saveToStrategyzer,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let colletionItems = []

  thisObject.container = newContainer()
  thisObject.container.name = MODULE_NAME
  thisObject.container.initialize()

  thisObject.container.frame.width = 0
  thisObject.container.frame.height = 0

  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  thisObject.container.isDraggeable = false
  thisObject.container.isClickeable = false

  return thisObject

  function initialize () {

  }

  async function saveToStrategyzer () {
    try {
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
      if (user === null) {
        if (ERROR_LOG === true) { logger.write('[ERROR] saveToStrategyzer -> Can not save because user is not logged in. ') }
        return
      }

      user = JSON.parse(user)

      const authId = user.authId

      const apolloClient = new Apollo.lib.ApolloClient({
        networkInterface: Apollo.lib.createNetworkInterface({
          uri: window.canvasApp.graphQL.masterAppApiUrl,
          transportBatching: true
        }),
        connectToDevTools: true
      })

      /* Updating all Strategies */

      const networkInterface = Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl
      })

      networkInterface.use([{
        applyMiddleware (req, next) {
          req.options.headers = {
            authorization: `Bearer ${accessToken}`
          }
          next()
        }
      }])

      let tradingSystem = canvas.strategySpace.workspace.tradingSystem
      let idAtStrategizer = canvas.strategySpace.workspace.idAtStrategizer
      let dataToSave = buildGraphQLDataToSave(tradingSystem)

      const updateStrategies = () => {
        return new Promise((resolve, reject) => {
          apolloClient.mutate({
            mutation: GRAPHQL_MUTATION_UPDATE_STRATEGIES,
            variables: {
              id: idAtStrategizer,
              strategy: dataToSave.strategy
            }
          })
                  .then(response => {
                    resolve(true)
                  })
                  .catch(err => {
                    if (ERROR_LOG === true) { logger.write('[ERROR] saveToStrategyzer -> ApolloClient error updating user strategies -> err = ' + err.stack) }
                    reject(err)
                  })
        })
      }

      let result = await updateStrategies()

      return result
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] saveToStrategyzer -> err = ' + err.stack) }
    }
  }

  function buildGraphQLDataToSave (tradingSystem) {
    let graphQL_Mutation = ''

    let dataToSave = {
      strategy: {
        subStrategies: []
      }
    }

    for (m = 0; m < tradingSystem.strategies.length; m++) {
      let strategizerGatewayStrategy = tradingSystem.strategies[m]
      let strategy = {
        name: strategizerGatewayStrategy.name,
        active: strategizerGatewayStrategy.active,
        entryPoint: {
          situations: []
        },
        exitPoint: {
          situations: []
        },
        sellPoint: {
          situations: []
        },
        stopLoss: {
          phases: []
        },
        buyOrder: {
          phases: []
        }
      }

      for (let k = 0; k < strategizerGatewayStrategy.entryPoint.situations.length; k++) {
        let strategizerGatewaySituation = strategizerGatewayStrategy.entryPoint.situations[k]
        let situation = {
          name: strategizerGatewaySituation.name,
          conditions: []
        }

        for (let m = 0; m < strategizerGatewaySituation.conditions.length; m++) {
          let strategizerGatewayCondition = strategizerGatewaySituation.conditions[m]
          let condition = {
            name: strategizerGatewayCondition.name,
            code: strategizerGatewayCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.entryPoint.situations.push(situation)
      }

      for (let k = 0; k < strategizerGatewayStrategy.exitPoint.situations.length; k++) {
        let strategizerGatewaySituation = strategizerGatewayStrategy.exitPoint.situations[k]
        let situation = {
          name: strategizerGatewaySituation.name,
          conditions: []
        }

        for (let m = 0; m < strategizerGatewaySituation.conditions.length; m++) {
          let strategizerGatewayCondition = strategizerGatewaySituation.conditions[m]
          let condition = {
            name: strategizerGatewayCondition.name,
            code: strategizerGatewayCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.exitPoint.situations.push(situation)
      }

      for (let k = 0; k < strategizerGatewayStrategy.sellPoint.situations.length; k++) {
        let strategizerGatewaySituation = strategizerGatewayStrategy.sellPoint.situations[k]
        let situation = {
          name: strategizerGatewaySituation.name,
          conditions: []
        }

        for (let m = 0; m < strategizerGatewaySituation.conditions.length; m++) {
          let strategizerGatewayCondition = strategizerGatewaySituation.conditions[m]
          let condition = {
            name: strategizerGatewayCondition.name,
            code: strategizerGatewayCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.sellPoint.situations.push(situation)
      }

      for (let p = 0; p < strategizerGatewayStrategy.stopLoss.phases.length; p++) {
        let strategizerGatewayPhase = strategizerGatewayStrategy.stopLoss.phases[p]
        let phase = {
          name: strategizerGatewayPhase.name,
          code: strategizerGatewayPhase.code,
          situations: []
        }

        for (let k = 0; k < strategizerGatewayPhase.situations.length; k++) {
          let strategizerGatewaySituation = strategizerGatewayPhase.situations[k]
          let situation = {
            name: strategizerGatewaySituation.name,
            conditions: []
          }

          for (let m = 0; m < strategizerGatewaySituation.conditions.length; m++) {
            let strategizerGatewayCondition = strategizerGatewaySituation.conditions[m]
            let condition = {
              name: strategizerGatewayCondition.name,
              code: strategizerGatewayCondition.code
            }
            situation.conditions.push(condition)
          }
          phase.situations.push(situation)
        }
        strategy.stopLoss.phases.push(phase)
      }

      for (let p = 0; p < strategizerGatewayStrategy.buyOrder.phases.length; p++) {
        let strategizerGatewayPhase = strategizerGatewayStrategy.buyOrder.phases[p]
        let phase = {
          name: strategizerGatewayPhase.name,
          code: strategizerGatewayPhase.code,
          situations: []
        }

        for (let k = 0; k < strategizerGatewayPhase.situations.length; k++) {
          let strategizerGatewaySituation = strategizerGatewayPhase.situations[k]
          let situation = {
            name: strategizerGatewaySituation.name,
            conditions: []
          }

          for (let m = 0; m < strategizerGatewaySituation.conditions.length; m++) {
            let strategizerGatewayCondition = strategizerGatewaySituation.conditions[m]
            let condition = {
              name: strategizerGatewayCondition.name,
              code: strategizerGatewayCondition.code
            }
            situation.conditions.push(condition)
          }
          phase.situations.push(situation)
        }
        strategy.buyOrder.phases.push(phase)
      }
      dataToSave.strategy.subStrategies.push(strategy)
    }

    return dataToSave
  }

  async function loadFromStrategyzer () {
    try {
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
      if (user === null) {
              // if there is no user that means that we are logged off, which means this object can not be used.
        return
      }

      user = JSON.parse(user)

      const authId = user.authId

      const apolloClient = new Apollo.lib.ApolloClient({
        networkInterface: Apollo.lib.createNetworkInterface({
          uri: window.canvasApp.graphQL.masterAppApiUrl,
          transportBatching: true
        }),
        connectToDevTools: true
      })

      /* Getting the FB that own the Strategies */

      let teamtradingSystemSimulationFB = ''
      let ecosystem = JSON.parse(window.localStorage.getItem('ecosystem'))
      let teams = ecosystem.devTeams
      for (let i = 0; i < teams.length; i++) {
        let team = teams[i]
        for (let j = 0; j < team.bots.length; j++) {
          let bot = team.bots[j]
          if (bot.codeName.indexOf('simulator') >= 0) {
            teamtradingSystemSimulationFB = bot.codeName
          }
        }
      }

      if (teamtradingSystemSimulationFB === '') {
        if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> no simulation FB found at user teams. ') }
        return
      }
      /* Getting all Strategies */

      const networkInterface = Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl
      })

      networkInterface.use([{
        applyMiddleware (req, next) {
          req.options.headers = {
            authorization: `Bearer ${accessToken}`
          }
          next()
        }
      }])

      const getStrategies = () => {
        return new Promise((resolve, reject) => {
          apolloClient.query({
            query: GRAPHQL_QUERY_GET_STRATEGIES,
            variables: { fbSlug: teamtradingSystemSimulationFB}
          })
                  .then(response => {
                    window.localStorage.setItem('userStrategies', JSON.stringify(response.data.strategizer_StrategyByFb))
                    thisObject.strategizerData = JSON.parse(JSON.stringify(response.data.strategizer_StrategyByFb))

                    resolve({ strategies: response.data.strategizer_StrategyByFb.subStrategies})
                  })
                  .catch(err => {
                    if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> ApolloClient error getting user strategies -> err = ' + err.stack) }
                    reject(err)
                  })
        })
      }

          // To avoid race conditions, add asynchronous fetches to array
      let fetchDataPromises = []

      fetchDataPromises.push(getStrategies())

          // When all asynchronous fetches resolve, authenticate user or throw error.
      await Promise.all(fetchDataPromises).then(result => {

      }, err => {
        if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> GraphQL Fetch Error -> err = ' + err.stack) }
      })
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> err = ' + err.stack) }
    }
  }

  function getContainer (point) {
    let container

    return undefined
  }

  function draw () {

  }
}
