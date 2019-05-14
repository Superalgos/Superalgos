 ﻿
function newEndUser () {
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

  container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 5
  container.frame.position.y = viewPort.visibleArea.bottomLeft.y + BREAKPOINT_HEIGHT

  container.isDraggeable = false

  return thisObject

  function initialize () {
    let storedUser = window.localStorage.getItem('loggedInUser')

    if (storedUser === null || storedUser === '') {
            // User is currently not logged in.
      window.USER_LOGGED_IN = ''
      return
    }

    let loggedInUser = JSON.parse(storedUser)

    window.USER_LOGGED_IN = loggedInUser.alias

        /* Here we will rearrange the storage permissions array into a map, so that it can be easily consumed when needed. */

    let permissionsMap = new Map()

    for (i = 0; i < window.USER_PROFILE.storagePermissions.length; i++) {
      let permission = window.USER_PROFILE.storagePermissions[i]

      permissionsMap.set(permission[0], permission[1])
    }

    window.USER_PROFILE.storagePermissions = permissionsMap
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
    return // nothing to show

    thisObject.container.frame.draw(false, false)

    let fontSize = 12
    let label = window.USER_LOGGED_IN
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
