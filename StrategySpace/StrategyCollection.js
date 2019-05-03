
function newStrategyCollection () {
  const MODULE_NAME = 'Strategy Collection'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    strategies: undefined,
    container: undefined,
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
    try {
      const accessToken = window.localStorage.getItem('xaccess_token')
      let user = window.localStorage.getItem('xuser')

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

      let strategySimulationClone = ''
      let clones = window.localStorage.getItem('userClones')
      if (clones === null || clones === '') {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> no user clones found at local storage. Can not get Strategies without them. ') }
        return
      }
      clones = JSON.parse(clones)
      for (let i = 0; i < clones.length; i++) {
        let clone = clones[i]
        if (clone.botType === 'Indicator') {
          strategySimulationClone = clone.botSlug
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

      const QUERY = Apollo.gql`
          query($fbSlug: String!){

                    strategizer_StrategyByFb(fbSlug: $fbSlug){
                    subStrategies(activeOnly: true){
                        name
                        entryPoint{
                        situations{
                            name
                            conditions{
                            name
                            code
                            }
                        }
                        }
                        exitPoint{
                        situations{
                            name
                            conditions{
                            name
                            code
                            }
                        }
                        }
                        sellPoint{
                        situations{
                            name
                            conditions{
                            name
                            code
                            }
                        }
                        }
                        buyPoint{
                        situations{
                            name
                            conditions{
                            name
                            code
                            }
                        }
                        }
                        stopLoss{
                        phases{
                            name
                            code
                            situations{
                            name
                            conditions{
                                name
                                code
                            }
                            }
                        }
                        }
                        buyOrder{
                        phases{
                            name
                            code
                            situations{
                            name
                            conditions{
                                name
                                code
                            }
                            }
                        }
                        }
                        sellOrder{
                        phases{
                            name
                            code
                            situations{
                            name
                            conditions{
                                name
                                code
                            }
                            }
                        }
                        }
                    }
                    }
                }
              `

      const getStrategies = () => {
        return new Promise((resolve, reject) => {
          apolloClient.query({
            query: QUERY,
            variables: { fbSlug: strategySimulationClone}
          })
                  .then(response => {
                    window.localStorage.setItem('userStrategies', JSON.stringify(response.data.strategizer_StrategyByFb.subStrategies))
                    thisObject.strategies = JSON.parse(JSON.stringify(response.data.strategizer_StrategyByFb.subStrategies))
                    createCollectionItems()
                    resolve({ strategies: response.data.strategizer_StrategyByFb.subStrategies})
                  })
                  .catch(error => {
                    console.log('apolloClient error getting user strategies', error.graphQLErrors, error.stack)
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
        console.error('[ERROR] Login -> GraphQL Fetch Error -> err = ', err.stack)
      })
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function createCollectionItems () {
    const TOP_MARGIN = 100
    const ITEMS_SEPARATION = 90

    for (let i = 0; i < thisObject.strategies.length; i++) {
      let strategy = thisObject.strategies[i]
      let collectionItem = newStrategyCollectionItem()

      collectionItem.container.connectToParent(thisObject.container, false, false)
      collectionItem.initialize()
      collectionItem.strategy = strategy
      collectionItem.container.frame.position.y = i * ITEMS_SEPARATION + TOP_MARGIN

      colletionItems.push(collectionItem)

      /* Load Strategies Icons */

      let imageIndex = i + 1
      if (imageIndex > 14) { imageIndex = 14 }

      let strategyImage = loadEmoji('Symbols/Emoji Symbols-' + (112 + imageIndex) + '.png')
      collectionItem.icon = strategyImage
    }
  }

  function getContainer (point) {
    let container

    for (let i = 0; i < colletionItems.length; i++) {
      let item = colletionItems[i]
      container = item.getContainer(point)
      if (container !== undefined) {
        return container
      }
    }

    return undefined
  }

  function draw () {
    if (colletionItems === undefined) {
      return
    }

    for (let i = 0; i < colletionItems.length; i++) {
      let item = colletionItems[i]
      item.draw()
    }
  }
}
