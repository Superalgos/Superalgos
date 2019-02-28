function newDevTeam () {
  let thisObject = {
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  thisObject.container.frame.width = 150
  thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT

  resize()

  container.isDraggeable = false
  container.isClickeable = true

  const NOT_FOUND = 'Team NOT FOUND'

  let sharedStatus
  let label = ''

  return thisObject

  function initialize (pSharedStatus) {
    let sessionToken = window.localStorage.getItem('sessionToken')

    if (sessionToken === null || sessionToken === '') {
            /* not logged in */
      return
    }

    sharedStatus = pSharedStatus

    let storedTeams = window.localStorage.getItem('userTeams')

    if (storedTeams === null || storedTeams === '[]' || storedTeams === '') {
      window.TEAMS = ''
      window.DEV_TEAM = ''
      label = NOT_FOUND
    } else {
      storedTeams = JSON.parse(storedTeams)
      window.TEAMS = storedTeams
      window.DEV_TEAM = storedTeams[sharedStatus.currentDevTeamIndex].slug
      label = storedTeams[sharedStatus.currentDevTeamIndex].name
      sharedStatus.eventHandler.raiseEvent('devTeam Changed')
    }

    thisObject.container.eventHandler.listenToEvent('onMouseClick', onClick)

    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 0
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y
  }

  function onClick () {
    let sessionToken = window.localStorage.getItem('sessionToken')

    if (sessionToken === null || sessionToken === '') {
            /* not logged in */
      return
    }

    if (sharedStatus.currentDevTeamIndex + 1 === window.TEAMS.length) {
      sharedStatus.currentDevTeamIndex = 0
      window.DEV_TEAM = window.TEAMS[sharedStatus.currentDevTeamIndex].slug
      label = window.TEAMS[sharedStatus.currentDevTeamIndex].name
      sharedStatus.eventHandler.raiseEvent('devTeam Changed')
      return
    }

    if (sharedStatus.currentDevTeamIndex + 1 < window.TEAMS.length) {
      sharedStatus.currentDevTeamIndex++
      window.DEV_TEAM = window.TEAMS[sharedStatus.currentDevTeamIndex].slug
      label = window.TEAMS[sharedStatus.currentDevTeamIndex].name
      sharedStatus.eventHandler.raiseEvent('devTeam Changed')
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

    let breakpointsHeight = 14
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
