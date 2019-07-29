
function newLogin () {
  const MODULE_NAME = 'Login'
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

  return thisObject

  async function initialize (sharedStatus) {
    try {
      if (window.canvasApp.executingAt === 'Local') { return }

      const accessToken = window.localStorage.getItem('access_token')

      if (accessToken) {
        await getEvents(accessToken, sharedStatus)
        // await getClones(accessToken)
      }

      thisObject.container.eventHandler.listenToEvent('onMouseClick', onClick)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err) }
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err.stack = ' + err.stack) }
    }
  }

  async function getEvents (accessToken, sharedStatus) {
    var d = new Date()
    var nowSeconds = Math.round(d.getTime() / 1000)
    var twoWeeksAgoSeconds = nowSeconds - 1209600

    let response = await axios({
      url: window.canvasApp.graphQL.masterAppApiUrl,
      method: 'post',
      data: {
        query:
          `query events($maxStartDate: Int, $minEndDate: Int){
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
        }`
      },
      variables: {
        variables: { maxStartDate: nowSeconds, minEndDate: twoWeeksAgoSeconds }
      },
      headers: {
        authorization: 'Bearer ' + accessToken
      }
    })

    if (response.data.errors) {
      console.log('Error getting events: ' + JSON.stringify(response.data.errors))
      throw 'Error getting events: ' + JSON.stringify(response.data.errors)
    } else {
      window.localStorage.setItem('currentEvents', JSON.stringify(response.data.data.events_Events))
      currentEvent = window.localStorage.getItem('currentEventObject')
      if (currentEvent === null || currentEvent === '[]' || currentEvent === '') {
        sharedStatus.currentEventIndex = -1
      } else {
        currentEvent = JSON.parse(currentEvent)
        sharedStatus.currentEventIndex = response.data.data.events_Events.findIndex(function (element) {
          return element.id == currentEvent.id
        })
      }
    }
  }

  async function getClones (accessToken) {
    let response = await axios({
      url: window.canvasApp.graphQL.masterAppApiUrl,
      method: 'post',
      data: {
        query:
          `query Operations_Clones{
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
      },
      headers: {
        authorization: 'Bearer ' + accessToken
      }
    })

    if (response.data.errors) {
      console.log('Error getting clones: ' + JSON.stringify(response.data.errors))
      throw 'Error getting clones: ' + JSON.stringify(response.data.errors)
    } else {
      window.localStorage.setItem('userClones', JSON.stringify(response.data.data.operations_Clones))
      let clones = response.data.data.operations_Clones
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
    }
  }

  function onClick () {

  }

  function getContainer (point) {
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
  }
}
