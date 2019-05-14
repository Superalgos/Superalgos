function newCurrentEvent () {
  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  function buildEcosystemEventsHack (reload) {
    let hackedEcosystem = [{
      'codeName': 'AAArena',
      'displayName': 'AA Arena',
      'competitions': [{
        'codeName': 'Weekend-Deathmatch',
        'description': 'First AA Internal Competition. Bots will be trading during 3 days at the USDT/BTC market of Poloniex to see who can make the gratest return over investment (ROI).',
        'displayName': 'AA Internal Challenge',
        'startDatetime': '2019-03-05T16:00:00.000Z',
        'finishDatetime': '2019-02-07T16:59:59.999Z',
        'formula': 'ROI',
        'plotter': {
          'codeName': 'PlottersROI',
          'host': 'AAArena',
          'repo': 'Plotters-ROI',
          'moduleName': 'CombinedProfits'
        },
        'participants': [
        ],
        'repo': 'Weekend-Deathmatch',
        'configFile': 'this.competition.config.json'
      }],
      'plotters': [{
        'displayName': 'Plotters ROI',
        'codeName': 'PlottersROI',
        'devTeam': 'AAMasters',
        'modules': [{
          'codeName': 'CombinedProfits',
          'moduleName': 'CombinedProfits',
          'description': 'Plots participants of a competition by the ROI each one had over time.',
          'panels': []
        }],
        'repo': 'Plotters-ROI',
        'configFile': 'this.plotter.config.json'
      }]
    }]

    let ecosysTemp = window.localStorage.getItem('currentEventObject')
    if (!(ecosysTemp === null || ecosysTemp === '[]' || ecosysTemp === '')) {
      let parsedEcosysTemp = JSON.parse(ecosysTemp)
      hackedEcosystem[0].competitions[0].startDatetime = new Date(parsedEcosysTemp.startDatetime * 1000).toISOString()
      hackedEcosystem[0].competitions[0].finishDatetime = new Date(parsedEcosysTemp.endDatetime * 1000).toISOString()
      parsedEcosysTemp.participants.forEach(function (participant) {
        hackedEcosystem[0].competitions[0].participants.push({
          devTeam: participant.clone.team.slug,
          bot: participant.clone.bot.slug,
          cloneId: participant.clone.id,
          release: '1.0.0'
        })
      })
    }

    window.localStorage.setItem('ecosystemEventsHack', JSON.stringify(hackedEcosystem))
    ecosystem.setEvent(hackedEcosystem)
    if (reload) {
      dashboard.start()
    }
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  thisObject.container.frame.width = 150
  thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT

  resize()

  container.isDraggeable = false
  container.isClickeable = true

  const NOT_FOUND = 'Event NOT FOUND'

  let sharedStatus
  let storedEvents
  let label = 'Event -'

  return thisObject

  function initialize (pSharedStatus) {
    let sessionToken = window.localStorage.getItem('sessionToken')

    if (sessionToken === null || sessionToken === '') {
            /* not logged in */
      return
    }

    sharedStatus = pSharedStatus

    storedEvents = window.localStorage.getItem('currentEvents')
    if (storedEvents === null || storedEvents === '[]' || storedEvents === '') {
      window.EVENTS = ''
      window.CURRENT_EVENT_TITLE = ''
      label = NOT_FOUND
    } else if (sharedStatus.currentEventIndex === -1) {
      storedEvents = JSON.parse(storedEvents)
      window.EVENTS = storedEvents
      window.CURRENT_EVENT_TITLE = ''
      label = 'Select an event'
    } else {
      storedEvents = JSON.parse(storedEvents)
      window.EVENTS = storedEvents
      window.CURRENT_EVENT_TITLE = storedEvents[sharedStatus.currentEventIndex].title
      label = 'Event - ' + storedEvents[sharedStatus.currentEventIndex].title
      window.localStorage.setItem('currentEventObject', JSON.stringify(storedEvents[sharedStatus.currentEventIndex]))
      buildEcosystemEventsHack(false)
      sharedStatus.eventHandler.raiseEvent('Event Changed')
    }

    thisObject.container.eventHandler.listenToEvent('onMouseClick', onClick)

    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 2
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y + BREAKPOINT_HEIGHT
  }

  function onClick () {
    let sessionToken = window.localStorage.getItem('sessionToken')

    if (sessionToken === null || sessionToken === '') {
            /* not logged in */
      return
    }

    if (sharedStatus.currentEventIndex + 1 === window.EVENTS.length) {
      sharedStatus.currentEventIndex = 0
      window.CURRENT_EVENT_TITLE = storedEvents[sharedStatus.currentEventIndex].title
      label = 'Event - ' + storedEvents[sharedStatus.currentEventIndex].title
      window.localStorage.setItem('currentEventObject', JSON.stringify(storedEvents[sharedStatus.currentEventIndex]))
      buildEcosystemEventsHack(true)
      sharedStatus.eventHandler.raiseEvent('Event Changed')
      return
    }

    if (sharedStatus.currentEventIndex + 1 < window.EVENTS.length) {
      sharedStatus.currentEventIndex++
      window.CURRENT_EVENT_TITLE = storedEvents[sharedStatus.currentEventIndex].title
      label = 'Event - ' + storedEvents[sharedStatus.currentEventIndex].title
      window.localStorage.setItem('currentEventObject', JSON.stringify(storedEvents[sharedStatus.currentEventIndex]))
      buildEcosystemEventsHack(true)
      sharedStatus.eventHandler.raiseEvent('Event Changed')
      return
    }
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
    let sessionToken = window.localStorage.getItem('sessionToken')

    if (sessionToken === null || sessionToken === '') {
            /* not logged in */
      return
    }

    thisObject.container.frame.draw(false, false)

    let breakpointsHeight = 0
    let fontSize = 12

    let point = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize / 3,
      y: thisObject.container.frame.height / 2 + fontSize / 2 + breakpointsHeight
    }

    point = thisObject.container.frame.frameThisPoint(point)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    browserCanvasContext.fillText(label, point.x, point.y)
  }
}
