
function newStrategyCollection () {
  const MODULE_NAME = 'Strategy Collection'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    collection: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  thisObject.container.frame.width = viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x
  thisObject.container.frame.height = viewPort.visibleArea.topLeft.y - viewPort.visibleArea.bottomLeft.y

  container.frame.position.x = viewPort.visibleArea.topLeft.x
  container.frame.position.y = viewPort.visibleArea.topLeft.y

  container.isDraggeable = false
  container.isClickeable = true

  return thisObject

  async function initialize () {
    try {
      const accessToken = window.localStorage.getItem('access_token')
      let user = window.localStorage.getItem('user')

      if (user === null) {
              // if there is no user that means that we are logged off, which means this object can not be used.
        return
      }

      thisObject.container.eventHandler.listenToEvent('onMouseClick', onClick)

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
                    thisObject.collection = response.data.strategizer_StrategyByFb.subStrategies
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

  function onClick () {

  }

  function getContainer (point) {
    let container

        /* First we check if this point is inside this object UI. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return this.container
    } else {
            /* This point does not belong to this space. */

      return undefined
    }
  }

  function draw () {
    if (thisObject.collection === undefined) {
      return
    }

    const ROW_HEIGHT = 50
    const LEFT_MARGIN = 50
    const TOP_MARGIN = 10

    for (let i = 0; i < thisObject.collection.length; i++) {
      let strategy = thisObject.collection[i]

      let labelPoint = {
        x: LEFT_MARGIN,
        y: TOP_MARGIN + i * ROW_HEIGHT
      }

      let labelToPrint = strategy.name
      let opacity = 1
      let fontSize = 12

      printLabel(labelToPrint, labelPoint.x, labelPoint.y, opacity, fontSize)
    }
  }
}
