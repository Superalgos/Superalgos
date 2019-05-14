
function newLogin () {
  const MODULE_NAME = 'Login'
  const INFO_LOG = false
  const INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  thisObject.container.frame.width = 200
  thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT

  container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1
  container.frame.position.y = viewPort.visibleArea.bottomLeft.y + BREAKPOINT_HEIGHT

  container.isDraggeable = false
  container.isClickeable = true

  let currentLabel

  let userAuthorization

  return thisObject

  async function initialize (pSharedStatus) {
    try {
      const accessToken = window.localStorage.getItem('access_token')
      let user = window.localStorage.getItem('user')

      sharedStatus = pSharedStatus

      if (user === null) {
              // if there is no user that means that we are logged off, which means it is time to clean the local storage of things from the last log in.

        window.localStorage.removeItem('loggedInUser')
        window.localStorage.removeItem('sessionToken')
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

      const USERS_QUERY = Apollo.gql`
              query($authId: String){
                  users_UserByAuthId (authId: $authId){
                      id
                      referrerId
                      alias
                      firstName
                      middleName
                      lastName
                      bio
                      email
                      emailVerified
                      isDeveloper
                      isDataAnalyst
                      isTrader
                      avatarHandle
                      avatarChangeDate
                      sessionToken
                      role {
                      id
                      }
                  }
              }
              `
      const getUser = () => {
        return new Promise((resolve, reject) => {
          apolloClient.query({
            query: USERS_QUERY,
            variables: {
              authId: authId
            }
          })
                      .then(response => {
                        sessionToken = response.data.users_UserByAuthId.sessionToken

                        window.localStorage.setItem('loggedInUser', JSON.stringify(response.data.users_UserByAuthId))
                        resolve({ user: response.data.users_UserByAuthId})
                      })
                      .catch(error => {
                        console.log('apolloClient error getting user query', error.graphQLErrors, error.stack)
                        reject(error)
                      })
        })
      }

      /* Getting all Teams */

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

      const TEAM_BY_OWNER_QUERY = Apollo.gql`
              query teamsByOwnerQuery {
                  teams_TeamsByOwner {
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
                      members {
                      member {
                          alias
                      }
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
          `

      const getTeamByOwner = () => {
        return new Promise((resolve, reject) => {
          apolloClientTeams.query({
            query: TEAM_BY_OWNER_QUERY
          })
              .then(response => {
                window.localStorage.setItem('userTeams', JSON.stringify(response.data.teams_TeamsByOwner))
                resolve({ teams: response.data.teams_TeamsByOwner})
              })
              .catch(error => {
                console.log('apolloClient error getting user teams', error.graphQLErrors, error.stack)
                reject(error)
              })
        })
      }

        /* Gettings All Events */

      const networkInterfaceEvents = Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl
      })

      const apolloClientEvents = new Apollo.lib.ApolloClient({
        networkInterface: networkInterfaceEvents,
        connectToDevTools: true,
        addTypename: false
      })

      const EVENTS_QUERY = Apollo.gql`
          query events($maxStartDate: Int, $minEndDate: Int){
              events_Events(maxStartDate: $maxStartDate, minEndDate: $minEndDate){
                  id
                  title
                  startDatetime
                  endDatetime
                  participants{
                      clone{
                          id
                          team{
                              slug
                          }
                          bot{
                              slug
                          }
                      }
                  }
              }
          }
      `

      const getCurrentEvents = () => {
        var d = new Date()
        var nowSeconds = Math.round(d.getTime() / 1000)
        var twoWeeksAgoSeconds = nowSeconds - 1209600
        return new Promise((resolve, reject) => {
          apolloClientEvents.query({
            query: EVENTS_QUERY,
            variables: { maxStartDate: nowSeconds, minEndDate: twoWeeksAgoSeconds }
          })
              .then(response => {
                window.localStorage.setItem('currentEvents', JSON.stringify(response.data.events_Events))
                currentEvent = window.localStorage.getItem('currentEventObject')
                if (currentEvent === null || currentEvent === '[]' || currentEvent === '') {
                  sharedStatus.currentEventIndex = -1
                } else {
                  currentEvent = JSON.parse(currentEvent)
                  sharedStatus.currentEventIndex = response.data.events_Events.findIndex(function (element) {
                    return element.id == currentEvent.id
                  })
                }
                resolve({ currentEvents: response.data.events_Events})
              })
              .catch(error => {
                console.log('apolloClient error getting current events', error.graphQLErrors, error.stack)
                reject(error)
              })
        })
      }

      /* Getting all Clones */

      const networkInterfaceClones = Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl
      })

      networkInterfaceClones.use([{
        applyMiddleware (req, next) {
          req.options.headers = {
            authorization: `Bearer ${accessToken}`
          }
          next()
        }
      }])

      const apolloClientClones = new Apollo.lib.ApolloClient({
        networkInterface: networkInterfaceClones,
        connectToDevTools: true
      })

      const CLONES_QUERY = Apollo.gql`
      query Operations_Clones{
              operations_Clones {
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
                    processName
                    keyId
                    botSlug
                    }
                  }
          `

      const getClones = () => {
        return new Promise((resolve, reject) => {
          apolloClientClones.query({
            query: CLONES_QUERY
          })
              .then(response => {
                window.localStorage.setItem('userClones', JSON.stringify(response.data.operations_Clones))
                let clones = response.data.operations_Clones
                for (let i = 0; i < clones.length; i++) {
                  let clone = clones[i]
                  if (clone.botType === 'Trading') {
                    let teamSlug = clone.teamName.toLowerCase()
                    teamSlug = teamSlug.replace(' ', '-')
                    let devTeam = ecosystem.getTeam(teamSlug)
                    let bot = ecosystem.getBot(devTeam, clone.botSlug)
                    if (bot !== undefined) {
                      bot.cloneId = clone.id
                    }
                  }
                }

                resolve({ clones: response.data.operations_Clones})
              })
              .catch(error => {
                console.log('apolloClient error getting user clones', error.graphQLErrors, error.stack)
                reject(error)
              })
        })
      }

          // To avoid race conditions, add asynchronous fetches to array
      let fetchDataPromises = []

      fetchDataPromises.push(getUser(), getTeamByOwner(), getCurrentEvents(), getClones(), authenticateUser())

          // When all asynchronous fetches resolve, authenticate user or throw error.
      await Promise.all(fetchDataPromises).then(result => {

      }, err => {
        console.error('[ERROR] Login -> GraphQL Fetch Error -> err = ', err)
      })

      thisObject.container.eventHandler.listenToEvent('onMouseClick', onClick)

      async function authenticateUser () {
        if (sessionToken === undefined) { sessionToken = '' }

        let path = window.canvasApp.urlPrefix + 'AABrowserAPI/authenticateUser/' + sessionToken

        return new Promise(
                  function (resolve, reject) {
                    callServer(undefined, path, (result) => {
                      let responseFromServer = JSON.parse(result)

                      err = responseFromServer.err

                      if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                        console.log('Please make sure you create a new team!')
                        reject(err)
                      }

                      window.USER_PROFILE = responseFromServer.userProfile
                      window.localStorage.setItem('sessionToken', sessionToken)

                      currentLabel = 'Logged In'
                      resolve()
                    })
                  }
                )
      }
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
    return // nothing to show.

    thisObject.container.frame.draw(false, false)

    let fontSize = 12
    let label = currentLabel
    if (label === undefined) { label = '' };

    let point = {
      x: thisObject.container.frame.width * 1 / 3,
      y: (thisObject.container.frame.height / 2) + 4
    }

    point = thisObject.container.frame.frameThisPoint(point)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    browserCanvasContext.fillText(label, point.x, point.y)
  }
}
