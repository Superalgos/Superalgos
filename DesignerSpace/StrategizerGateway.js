
function newStrategizerGateway () {
  const MODULE_NAME = 'Strategizer Gateway'
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    idAtStrategizer: undefined,
    strategizerData: undefined,
    container: undefined,
    loadFromStrategyzer: loadFromStrategyzer
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
}
