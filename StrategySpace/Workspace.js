
function newWorkspace () {
  const MODULE_NAME = 'Workspace'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    isDeployed: false,
    strategizerData: undefined,
    container: undefined,
    tradingSystem: undefined,
    loadFromStrategyzer: loadFromStrategyzer,
    saveToStrategyzer: saveToStrategyzer,
    deploydTradingSystem: deploydTradingSystem,
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
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE)

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE)
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

      let dataToSave = buildGraphQLDataToSave()

      const updateStrategies = () => {
        return new Promise((resolve, reject) => {
          apolloClient.mutate({
            mutation: GRAPHQL_MUTATION_UPDATE_STRATEGIES,
            variables: {
              id: thisObject.strategizerData.id,
              strategy: dataToSave.strategy
            }
          })
                  .then(response => {
                    resolve(true)
                  })
                  .catch(err => {
                    if (ERROR_LOG === true) { logger.write('[ERROR] saveToStrategyzer -> ApolloClient error getting user strategies -> err = ' + err.stack) }
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

  function buildGraphQLDataToSave () {
    let graphQL_Mutation = ''

    let dataToSave = {
      strategy: {
        subStrategies: []
      }
    }

    for (m = 0; m < thisObject.tradingSystem.protocolData.strategies.length; m++) {
      let workspaceStrategy = thisObject.tradingSystem.protocolData.strategies[m]
      let strategy = {
        name: workspaceStrategy.name,
        active: workspaceStrategy.active,
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

      for (let k = 0; k < workspaceStrategy.entryPoint.situations.length; k++) {
        let workspaceSituation = workspaceStrategy.entryPoint.situations[k]
        let situation = {
          name: workspaceSituation.name,
          conditions: []
        }

        for (let m = 0; m < workspaceSituation.conditions.length; m++) {
          let workspaceCondition = workspaceSituation.conditions[m]
          let condition = {
            name: workspaceCondition.name,
            code: workspaceCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.entryPoint.situations.push(situation)
      }

      for (let k = 0; k < workspaceStrategy.exitPoint.situations.length; k++) {
        let workspaceSituation = workspaceStrategy.exitPoint.situations[k]
        let situation = {
          name: workspaceSituation.name,
          conditions: []
        }

        for (let m = 0; m < workspaceSituation.conditions.length; m++) {
          let workspaceCondition = workspaceSituation.conditions[m]
          let condition = {
            name: workspaceCondition.name,
            code: workspaceCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.exitPoint.situations.push(situation)
      }

      for (let k = 0; k < workspaceStrategy.sellPoint.situations.length; k++) {
        let workspaceSituation = workspaceStrategy.sellPoint.situations[k]
        let situation = {
          name: workspaceSituation.name,
          conditions: []
        }

        for (let m = 0; m < workspaceSituation.conditions.length; m++) {
          let workspaceCondition = workspaceSituation.conditions[m]
          let condition = {
            name: workspaceCondition.name,
            code: workspaceCondition.code
          }
          situation.conditions.push(condition)
        }
        strategy.sellPoint.situations.push(situation)
      }

      for (let p = 0; p < workspaceStrategy.stopLoss.phases.length; p++) {
        let workspacePhase = workspaceStrategy.stopLoss.phases[p]
        let phase = {
          name: workspacePhase.name,
          code: workspacePhase.code,
          situations: []
        }

        for (let k = 0; k < workspacePhase.situations.length; k++) {
          let workspaceSituation = workspacePhase.situations[k]
          let situation = {
            name: workspaceSituation.name,
            conditions: []
          }

          for (let m = 0; m < workspaceSituation.conditions.length; m++) {
            let workspaceCondition = workspaceSituation.conditions[m]
            let condition = {
              name: workspaceCondition.name,
              code: workspaceCondition.code
            }
            situation.conditions.push(condition)
          }
          phase.situations.push(situation)
        }
        strategy.stopLoss.phases.push(phase)
      }

      for (let p = 0; p < workspaceStrategy.buyOrder.phases.length; p++) {
        let workspacePhase = workspaceStrategy.buyOrder.phases[p]
        let phase = {
          name: workspacePhase.name,
          code: workspacePhase.code,
          situations: []
        }

        for (let k = 0; k < workspacePhase.situations.length; k++) {
          let workspaceSituation = workspacePhase.situations[k]
          let situation = {
            name: workspaceSituation.name,
            conditions: []
          }

          for (let m = 0; m < workspaceSituation.conditions.length; m++) {
            let workspaceCondition = workspaceSituation.conditions[m]
            let condition = {
              name: workspaceCondition.name,
              code: workspaceCondition.code
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
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE)

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE)
      if (user === null) {
              // if there is no user that means that we are logged off, which means this object can not be used.
        return
      }

      user = JSON.parse(user)

      const authId = user.authId

      let sessionToken

      const apolloClient = new Apollo.lib.ApolloClient({
        networkInterface: Apollo.lib.createNetworkInterface({
          uri: window.canvasApp.graphQL.masterAppApiUrl,
          transportBatching: true
        }),
        connectToDevTools: true
      })

      /* Getting the FB that own the Strategies */

      let tradingSystemSimulationClone = ''
      let clones = window.localStorage.getItem('userClones')
      if (clones === null || clones === '') {
        if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> no user clones found at local storage. Can not get Strategies without them. ') }
        return
      }
      clones = JSON.parse(clones)
      for (let i = 0; i < clones.length; i++) {
        let clone = clones[i]
        if (clone.botType === 'Indicator') {
          tradingSystemSimulationClone = clone.botSlug
        }
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
            variables: { fbSlug: tradingSystemSimulationClone}
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

  function deploydTradingSystem () {
    thisObject.tradingSystem = newTradingSystem()
    thisObject.tradingSystem.initialize(thisObject.strategizerData)
    thisObject.isDeployed = true
  }

  function getContainer (point) {
    let container

    return undefined
  }

  function draw () {

  }
}
