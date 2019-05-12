
function newWorkspace () {
  const MODULE_NAME = 'Workspace'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    isDeployed: false,
    strategies: undefined,
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

  async function initialize () {

  }

  function saveToStrategyzer () {
    let graphQL_Mutation = ''

    graphQL_Mutation = graphQL_Mutation + 'strategy: { '
    graphQL_Mutation = graphQL_Mutation + 'subStrategies: [ '

    for (m = 0; m < thisObject.tradingSystem.protocolData.strategies.length; m++) {
      let strategy = thisObject.tradingSystem.protocolData.strategies[m]

      graphQL_Mutation = graphQL_Mutation + '{ '
      graphQL_Mutation = graphQL_Mutation + 'active: true '
      graphQL_Mutation = graphQL_Mutation + 'name: "' + strategy.name + '" '

      graphQL_Mutation = graphQL_Mutation + 'entryPoint: { '
      graphQL_Mutation = graphQL_Mutation + 'situations: [ '

      for (let k = 0; k < strategy.entryPoint.situations.length; k++) {
        let situation = strategy.entryPoint.situations[k]

        graphQL_Mutation = graphQL_Mutation + '{ '
        graphQL_Mutation = graphQL_Mutation + 'name: "' + situation.name + '" '
        graphQL_Mutation = graphQL_Mutation + 'conditions: [ '

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]

          graphQL_Mutation = graphQL_Mutation + '{ '
          graphQL_Mutation = graphQL_Mutation + 'name: "' + condition.name + '" '
          graphQL_Mutation = graphQL_Mutation + 'code: "' + condition.code + '" '
          graphQL_Mutation = graphQL_Mutation + '} '
        }

        graphQL_Mutation = graphQL_Mutation + '] '
        graphQL_Mutation = graphQL_Mutation + '} '
      }

      graphQL_Mutation = graphQL_Mutation + '] '
      graphQL_Mutation = graphQL_Mutation + '} '

      graphQL_Mutation = graphQL_Mutation + 'exitPoint: { '
      graphQL_Mutation = graphQL_Mutation + 'situations: [ '

      for (let k = 0; k < strategy.exitPoint.situations.length; k++) {
        let situation = strategy.exitPoint.situations[k]

        graphQL_Mutation = graphQL_Mutation + '{ '
        graphQL_Mutation = graphQL_Mutation + 'name: "' + situation.name + '" '
        graphQL_Mutation = graphQL_Mutation + 'conditions: [ '

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]

          graphQL_Mutation = graphQL_Mutation + '{ '
          graphQL_Mutation = graphQL_Mutation + 'name: "' + condition.name + '" '
          graphQL_Mutation = graphQL_Mutation + 'code: "' + condition.code + '" '
          graphQL_Mutation = graphQL_Mutation + '} '
        }

        graphQL_Mutation = graphQL_Mutation + '] '
        graphQL_Mutation = graphQL_Mutation + '} '
      }

      graphQL_Mutation = graphQL_Mutation + '] '
      graphQL_Mutation = graphQL_Mutation + '} '

      graphQL_Mutation = graphQL_Mutation + 'sellPoint: { '
      graphQL_Mutation = graphQL_Mutation + 'situations: [ '

      for (let k = 0; k < strategy.sellPoint.situations.length; k++) {
        let situation = strategy.sellPoint.situations[k]

        graphQL_Mutation = graphQL_Mutation + '{ '
        graphQL_Mutation = graphQL_Mutation + 'name: "' + situation.name + '" '
        graphQL_Mutation = graphQL_Mutation + 'conditions: [ '

        for (let m = 0; m < situation.conditions.length; m++) {
          let condition = situation.conditions[m]

          graphQL_Mutation = graphQL_Mutation + '{ '
          graphQL_Mutation = graphQL_Mutation + 'name: "' + condition.name + '" '
          graphQL_Mutation = graphQL_Mutation + 'code: "' + condition.code + '" '
          graphQL_Mutation = graphQL_Mutation + '} '
        }

        graphQL_Mutation = graphQL_Mutation + '] '
        graphQL_Mutation = graphQL_Mutation + '} '
      }

      graphQL_Mutation = graphQL_Mutation + '] '
      graphQL_Mutation = graphQL_Mutation + '} '

      graphQL_Mutation = graphQL_Mutation + 'stopLoss: { '
      graphQL_Mutation = graphQL_Mutation + 'phases: [ '

      for (let p = 0; p < strategy.stopLoss.phases.length; p++) {
        let phase = strategy.stopLoss.phases[p]

        graphQL_Mutation = graphQL_Mutation + '{ '
        graphQL_Mutation = graphQL_Mutation + 'name: "' + phase.name + '" '
        graphQL_Mutation = graphQL_Mutation + 'code: "' + phase.code + '" '
        graphQL_Mutation = graphQL_Mutation + 'situations: [ '

        for (let k = 0; k < phase.situations.length; k++) {
          let situation = phase.situations[k]

          graphQL_Mutation = graphQL_Mutation + '{ '
          graphQL_Mutation = graphQL_Mutation + 'name: "' + situation.name + '" '
          graphQL_Mutation = graphQL_Mutation + 'conditions: [ '

          for (let m = 0; m < situation.conditions.length; m++) {
            let condition = situation.conditions[m]

            graphQL_Mutation = graphQL_Mutation + '{ '
            graphQL_Mutation = graphQL_Mutation + 'name: "' + condition.name + '" '
            graphQL_Mutation = graphQL_Mutation + 'code: "' + condition.code + '" '
            graphQL_Mutation = graphQL_Mutation + '} '
          }

          graphQL_Mutation = graphQL_Mutation + '] '
          graphQL_Mutation = graphQL_Mutation + '} '
        }

        graphQL_Mutation = graphQL_Mutation + '] '
        graphQL_Mutation = graphQL_Mutation + '} '
      }

      graphQL_Mutation = graphQL_Mutation + '] '
      graphQL_Mutation = graphQL_Mutation + '} '

      graphQL_Mutation = graphQL_Mutation + 'buyOrder: { '
      graphQL_Mutation = graphQL_Mutation + 'phases: [ '

      for (let p = 0; p < strategy.buyOrder.phases.length; p++) {
        let phase = strategy.buyOrder.phases[p]

        graphQL_Mutation = graphQL_Mutation + '{ '
        graphQL_Mutation = graphQL_Mutation + 'name: "' + phase.name + '" '
        graphQL_Mutation = graphQL_Mutation + 'code: "' + phase.code + '" '
        graphQL_Mutation = graphQL_Mutation + 'situations: [ '

        for (let k = 0; k < phase.situations.length; k++) {
          let situation = phase.situations[k]

          graphQL_Mutation = graphQL_Mutation + '{ '
          graphQL_Mutation = graphQL_Mutation + 'name: "' + situation.name + '" '
          graphQL_Mutation = graphQL_Mutation + 'conditions: [ '

          for (let m = 0; m < situation.conditions.length; m++) {
            let condition = situation.conditions[m]

            graphQL_Mutation = graphQL_Mutation + '{ '
            graphQL_Mutation = graphQL_Mutation + 'name: "' + condition.name + '" '
            graphQL_Mutation = graphQL_Mutation + 'code: "' + condition.code + '" '
            graphQL_Mutation = graphQL_Mutation + '} '
          }

          graphQL_Mutation = graphQL_Mutation + '] '
          graphQL_Mutation = graphQL_Mutation + '} '
        }

        graphQL_Mutation = graphQL_Mutation + '] '
        graphQL_Mutation = graphQL_Mutation + '} '
      }

      graphQL_Mutation = graphQL_Mutation + '] '
      graphQL_Mutation = graphQL_Mutation + '} '

      graphQL_Mutation = graphQL_Mutation + '} '
    }

    graphQL_Mutation = graphQL_Mutation + '] '
    graphQL_Mutation = graphQL_Mutation + '} '

    console.log(graphQL_Mutation)
  }

  async function loadFromStrategyzer () {
    try {
      const accessToken = window.localStorage.getItem('xaccess_token')

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
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> no user clones found at local storage. Can not get Strategies without them. ') }
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
                    window.localStorage.setItem('userStrategies', JSON.stringify(response.data.strategizer_StrategyByFb.subStrategies))
                    thisObject.strategies = JSON.parse(JSON.stringify(response.data.strategizer_StrategyByFb.subStrategies))

                    resolve({ strategies: response.data.strategizer_StrategyByFb.subStrategies})
                  })
                  .catch(error => {
                    if (ERROR_LOG === true) { logger.write('[ERROR] ApolloClient error getting user strategies -> err = ' + err.stack) }
                    reject(error)
                  })
        })
      }

          // To avoid race conditions, add asynchronous fetches to array
      let fetchDataPromises = []

      fetchDataPromises.push(getStrategies())

          // When all asynchronous fetches resolve, authenticate user or throw error.
      await Promise.all(fetchDataPromises).then(result => {

      }, err => {
        if (ERROR_LOG === true) { logger.write('[ERROR] GraphQL Fetch Error -> err = ' + err.stack) }
      })
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] loadFromStrategyzer -> err = ' + err.stack) }
    }
  }

  function deploydTradingSystem () {
    thisObject.tradingSystem = newTradingSystem()
    thisObject.tradingSystem.initialize(thisObject.strategies)
    thisObject.isDeployed = true
  }

  function getContainer (point) {
    let container

    return undefined
  }

  function draw () {

  }
}
