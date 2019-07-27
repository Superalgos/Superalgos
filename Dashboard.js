let canvas
let markets
let ecosystem = newEcosystem()

let viewPort
try {
  viewPort = newViewPort()
} catch (e) {
  setTimeout(() => {
    console.log("Loading deferred.")
    viewPort = newViewPort()
  }, 1000);
}

function newDashboard () {
  const MODULE_NAME = 'Dashboard'
  const ERROR_LOG = true
  const INTENSIVE_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    start: start
  }

  const DEBUG_START_UP_DELAY = 0 // 3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.

  let userProfileChangedEventSubscriptionId
  let browserResizedEventSubscriptionId

  return thisObject

  function start () {
    try {
      /* If this method is executed for a second time, it should finalize the current execution structure */

      if (canvas !== undefined) { canvas.finalize() }

      /* Here we will setup the global eventHandler that will enable the Canvas App to react to events happening outside its execution scope. */

      window.canvasApp.eventHandler = newEventHandler()
      userProfileChangedEventSubscriptionId = window.canvasApp.eventHandler.listenToEvent('User Profile Changed', userProfileChanged)
      browserResizedEventSubscriptionId = window.canvasApp.eventHandler.listenToEvent('Browser Resized', browserResized)

      loadImages(onImagesLoaded)

      function onImagesLoaded () {
                /* Next we start the App */

        setTimeout(delayedStart, DEBUG_START_UP_DELAY)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] start -> err = ' + err.stack) }
    }
  }

  function delayedStart () {
    try {
            /* For now, we are supporting only one market. */

      let market = {
        id: 2,
        assetA: 'USDT',
        assetB: 'BTC'
      }

      markets = new Map()

      markets.set(market.id, market)

      canvas = newCanvas()
      canvas.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] delayedStart -> err = ' + err.stack) }
    }
  }

  function userProfileChanged () {
    try {
      canvas.topSpace.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] userProfileChanged -> err = ' + err.stack) }
    }
  }

  function browserResized () {
    try {
      browserCanvas = document.getElementById('canvas')

      browserCanvas.width = window.innerWidth
      browserCanvas.height = window.innerHeight - CURRENT_TOP_MARGIN

      viewPort.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] browserResized -> err = ' + err.stack) }
    }
  }

  function loadImages (callBack) {
    try {
      const accessToken = ''
      // Soon, we will need to get images from the Financial Beings Module.

      const networkInterfaceTeams = Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl
      })

      networkInterfaceTeams.use([{
        applyMiddleware (req, next) {
          req.options.headers = {
            authorization: `Bearer ${accessToken}`
          }
          next()
        }
      }])

      const apolloClientTeams = new Apollo.lib.ApolloClient({
        networkInterface: networkInterfaceTeams,
        connectToDevTools: true
      })

      const ALL_TEAMS_QUERY = Apollo.gql`
            {
              teams_Teams{
                edges{
                  node{
                    id
                    name
                    slug
                    profile {
                    avatar
                    banner
                    description
                    motto
                    updatedAt
                    }
                    fb {
                        id
                        name
                        slug
                        avatar
                        kind
                        status {
                            status
                            reason
                            createdAt
                        }
                      }
                  }
                }
              }
            }
        `

      let teams

      const getTeams = () => {
        return new Promise((resolve, reject) => {
          apolloClientTeams.query({
            query: ALL_TEAMS_QUERY
          })
                        .then(response => {
                          teams = response.data.teams_Teams
                          //window.localStorage.setItem('Teams', JSON.stringify(response.data.teams_Teams))
                          resolve({ teams: response.data.teams_Teams })
                        })
                        .catch(err => {
                          if (ERROR_LOG === true) { logger.write('[ERROR] loadImages -> getTeams -> Error fetching data from Teams Module.') }
                          if (ERROR_LOG === true) { logger.write('[ERROR] loadImages -> getTeams -> err = ' + err.stack) }
                          reject(err)
                        })
        })
      }

            // To avoid race conditions, add asynchronous fetches to array
      let fetchDataPromises = []

      fetchDataPromises.push(/* getUser(), */ getTeams())   //   <-- Here we must add the function calll to the Financial Beings module.

            // When all asynchronous fetches resolve, authenticate user or throw error.
      Promise.all(fetchDataPromises).then(result => {
                /* All good, we will go through the results creating a map with all the Images URLs */

        let teamProfileImages = new Map()
        let fbProfileImages = new Map()

        for (let i = 0; i < teams.edges.length; i++) {
          let team = teams.edges[i].node

          teamProfileImages.set(team.slug, team.profile.avatar)

          if (team.fb.length > 0) {
            fbProfileImages.set(team.slug + '-' + team.fb[0].slug, team.fb[0].avatar)
          }
        }

        window.canvasApp.context.teamProfileImages = teamProfileImages
        window.canvasApp.context.fbProfileImages = fbProfileImages

        callBack()
      }, err => {
        if (ERROR_LOG === true) { logger.write('[ERROR] loadImages -> Error fetching data from Teams Module.') }
        if (ERROR_LOG === true) { logger.write('[ERROR] loadImages -> err = ' + err.stack) }
      })
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] loadImages -> err = ' + err.stack) }
    }
  }
}
