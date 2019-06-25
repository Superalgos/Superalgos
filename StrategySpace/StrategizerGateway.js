
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
      let fbSlug = 'simulator' + '-' + 'bot' + '-' + user.alias

      /* See if we need to update or create a new record at the strategizer */

      let tradingSystem = canvas.strategySpace.workspace.getProtocolTradingSystem()
      let idAtStrategizer = canvas.strategySpace.workspace.idAtStrategizer

      if (idAtStrategizer === undefined) {
        let response = await axios({
          url: window.canvasApp.graphQL.masterAppApiUrl,
          method: 'post',
          data: {
            query: `
            mutation strategizer_CreateTradingSystem
            (
              $fbSlug: String!, $data: strategizer_JSON!
            )
            {
              strategizer_CreateTradingSystem(fbSlug: $fbSlug, tradingSystem: { data: $data })
              {
                id
              }
            }
                  `,
            variables: {
              fbSlug: fbSlug,
              data: tradingSystem
            }
          },
          headers: {
            authorization: 'Bearer ' + accessToken
          }
        })

        if (response.data.errors) {
          console.log('Error getting events: ' + JSON.stringify(response.data.errors))
          throw 'Error getting events: ' + JSON.stringify(response.data.errors)
        } else {
          canvas.strategySpace.workspace.idAtStrategizer = response.data.data.strategizer_CreateTradingSystem.id
        }
      } else {
        const graphQLServer = await axios({
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
      }

      return true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] saveToStrategyzer -> err = ' + err.stack) }
    }
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
      let fbSlug = 'simulator' + '-' + 'bot' + '-' + user.alias

      let response = await axios({
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

      if (response.data.errors) {
        if (response.data.errors[0] === 'Ressource not found : None of the tradingSystem are linked to that fbSlug') {
          return false
        } else {
          logger.write('[ERROR] Error while getting Trading System from Strategizer: ' + JSON.stringify(response.data.errors))
          return false
        }
      } else {
        window.localStorage.setItem('userStrategies', JSON.stringify(response.data.data.strategizer_TradingSystemByFb.data))
        thisObject.strategizerData = JSON.parse(JSON.stringify(response.data.data.strategizer_TradingSystemByFb.data))
        canvas.strategySpace.workspace.idAtStrategizer = response.data.data.strategizer_TradingSystemByFb.id
        return true
      }
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
