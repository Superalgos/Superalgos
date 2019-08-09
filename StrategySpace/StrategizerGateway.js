
function newStrategizerGateway () {
  const MODULE_NAME = 'Strategizer Gateway'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    idAtStrategizer: undefined,
    strategizerData: undefined,
    container: undefined,
    loadFromStrategyzer: loadFromStrategyzer,
    saveToStrategyzer: saveToStrategyzer
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

  let graphQLServer

  return thisObject

  async function loadFromStrategyzer () {
    try {
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)
      if (accessToken === null) {
        logger.write('[ERROR] loadFromStrategyzer -> Can load from strategizer because the accessToken is missing.')
        return
      }

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
      if (user === null) {
        logger.write('[ERROR] saveToStrategyzer -> Can not load from strategizer because user is not logged in. ')
        return
      }

      user = JSON.parse(user)

      if (window.canvasApp.executingAt === 'Local') {
        window.localStorage.setItem(CANVAS_APP_NAME + '.' + MODULE_NAME + '.' + user.alias, 'Local File')
        thisObject.strategizerData = JSON.parse('{"type":"Definition"}')
        thisObject.idAtStrategizer = 'Local File'
        return true
      } else {
        let fbSlug = 'simulator-bot-' + user.alias.replace('.', '')

        graphQLServer = await axios({
          url: window.canvasApp.graphQL.masterAppApiUrl,
          method: 'post',
          data: {
            query:
            `
            query($fbSlug: String!){
            strategizer_TradingSystemByFb(fbSlug: $fbSlug){
              id
              fbSlug
              data
            }
          }
          `,

            variables: {
              fbSlug: fbSlug
            }
          },
          headers: {
            authorization: 'Bearer ' + accessToken
          }
        })

        if (graphQLServer.data.errors) {
          logger.write('[ERROR] loadFromStrategyzer -> GraphQL Error: ' + JSON.stringify(graphQLServer.data.errors))
          return false
        } else {
          thisObject.strategizerData = JSON.parse(JSON.stringify(graphQLServer.data.data.strategizer_TradingSystemByFb.data))
          thisObject.idAtStrategizer = graphQLServer.data.data.strategizer_TradingSystemByFb.id
          window.localStorage.setItem(CANVAS_APP_NAME + '.' + MODULE_NAME + '.' + user.alias, thisObject.idAtStrategizer)
          return true
        }
      }
    } catch (err) {
      logger.write('[ERROR] loadFromStrategyzer -> err = ' + err.stack)
    }
  }

  async function saveToStrategyzer (simulationParams) {
    try {
      const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)
      if (accessToken === null) {
        logger.write('[ERROR] saveToStrategyzer -> Can not save because the accessToken is missing.')
        return
      }

      let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY)
      if (user === null) {
        logger.write('[ERROR] saveToStrategyzer -> Can not save because user is not logged in. ')
        return
      }

      let tradingSystem = canvas.strategySpace.workspace.getProtocolTradingSystem()
      if (tradingSystem === undefined || tradingSystem === null) {
        logger.write('[ERROR] saveToStrategyzer -> Can not save when tradingSystem is null or undefined.')
        return
      }

      let idAtStrategizer = window.localStorage.getItem(CANVAS_APP_NAME + '.' + MODULE_NAME + '.' + user.alias)
      if (idAtStrategizer === undefined || idAtStrategizer === null) {
        logger.write('[ERROR] saveToStrategyzer -> Can not save when idAtStrategizer is null or undefined.')
        return
      }

      if (window.canvasApp.executingAt === 'Local') {
        tradingSystem.simulationParams = simulationParams
        callServer(JSON.stringify(tradingSystem), 'SaveDefinition', onSaved)
        function onSaved (err) {
          if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
            return true
          } else {
            logger.write('[ERROR] saveToStrategyzer -> Can not save definition to local server. err = ' + err.messsage)
            return false
          }
        }
        return true // TODO: Here we will always show that the saving works even if it does not. We need to fix this at some point in time.
      } else {
        user = JSON.parse(user)

        graphQLServer = await axios({
          url: window.canvasApp.graphQL.masterAppApiUrl,
          method: 'post',
          data: {
            query: `
              mutation strategizer_EditTradingSystem
              (
                $id: ID!, $data: strategizer_JSON!
              )
              {
                strategizer_EditTradingSystem(id: $id, tradingSystem: { data: $data })
                {
                  id
                }
              }
                    `,
            variables: {
              id: idAtStrategizer,
              data: tradingSystem
            }
          },
          headers: {
            authorization: 'Bearer ' + accessToken
          }
        })

        if (graphQLServer.data.errors) {
          logger.write('[ERROR] saveToStrategyzer -> GraphsQL Error -> graphQLServer.data.errors = ' + JSON.stringify(graphQLServer.data.errors))
        }

        return true
      }
    } catch (err) {
      logger.write('[ERROR] saveToStrategyzer -> err = ' + err.stack)
    }
  }
}
