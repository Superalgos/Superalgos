function newPanelTabButton () {
  let thisObject = {
    container: undefined,
    fitFunction: undefined,
    parentContainer: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let isInitialized = false
   /* Cointainer stuff */

  var container = newContainer()

  container.name = 'Panel Tab Button'
  container.initialize()

  container.isClickeable = true

  thisObject.container = container
  thisObject.container.frame.containerName = 'Panel Tab Button'

  /* Lets listen to our own events to react when we have a Mouse Click */

  thisObject.container.eventHandler.listenToEvent('onMouseClick', buttonPressed)

  /* Animation to hide the pannel */

  let tabStatus = 'visible'
  let visiblePosition = {}
  let hiddenPosition = {}
  let transitionPosition = {}

  return thisObject

  function initialize () {
    thisObject.container.frame.width = 10
    thisObject.container.frame.height = 10

    var position = {
      x: thisObject.parentContainer.frame.width - 15,
      y: 2
    }

    thisObject.container.frame.position = position

    visiblePosition.x = thisObject.parentContainer.frame.position.x
    visiblePosition.y = thisObject.parentContainer.frame.position.y

    hiddenPosition.x = thisObject.parentContainer.frame.position.x
    hiddenPosition.y = viewPort.visibleArea.bottomRight.y

    transitionPosition.x = visiblePosition.x
    transitionPosition.y = visiblePosition.y

    isInitialized = true
  }

  function buttonPressed (event) {
    if (tabStatus === 'visible') {
      visiblePosition.x = thisObject.parentContainer.frame.position.x
      visiblePosition.y = thisObject.parentContainer.frame.position.y

      hiddenPosition.x = thisObject.parentContainer.frame.position.x
      hiddenPosition.y = viewPort.visibleArea.bottomRight.y

      transitionPosition.x = visiblePosition.x
      transitionPosition.y = visiblePosition.y

      thisObject.parentContainer.isDraggeable = false
      thisObject.parentContainer.isWheelable = false
      tabStatus = 'going down'
    } else {
      thisObject.parentContainer.isDraggeable = true
      thisObject.parentContainer.isWheelable = true
      tabStatus = 'going up'
    }
  }

  function draw () {
    if (isInitialized === false) { return }

    drawButton()

    if (tabStatus === 'going down') {
      if (transitionPosition.y < hiddenPosition.y) {
        transitionPosition.y = transitionPosition.y + 50
        thisObject.parentContainer.frame.position.y = transitionPosition.y
      } else {
        thisObject.parentContainer.frame.position.y = hiddenPosition.y
        tabStatus = 'hidden'
      }
    }
    if (tabStatus === 'going up') {
      if (transitionPosition.y > visiblePosition.y) {
        transitionPosition.y = transitionPosition.y - 50
        thisObject.parentContainer.frame.position.y = transitionPosition.y
      } else {
        thisObject.parentContainer.frame.position.y = visiblePosition.y
        tabStatus = 'visible'
      }
    }
  }

  function getContainer (point) {
    var container

       /* First we check if thisObject point is inside thisObject space. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
           /* Now we see which is the inner most container that has it */

      return thisObject.container
    } else {
           /* This point does not belong to thisObject space. */

      return undefined
    }
  }

  function drawButton () {
    let point1
    let point2
    let point3

    switch (tabStatus) {
      case 'visible': {
        point1 = {
          x: 3,
          y: 3
        }

        point2 = {
          x: container.frame.width - 3,
          y: 3
        }

        point3 = {
          x: container.frame.width / 2,
          y: container.frame.height - 3
        }
        break
      }

      case 'going down': {
        point1 = {
          x: 4,
          y: 4
        }

        point2 = {
          x: container.frame.width - 4,
          y: 4
        }

        point3 = {
          x: container.frame.width / 2,
          y: container.frame.height - 4
        }
        break
      }

      case 'going up': {
        point1 = {
          x: 4,
          y: container.frame.height - 4
        }

        point2 = {
          x: container.frame.width - 4,
          y: container.frame.height - 4
        }

        point3 = {
          x: container.frame.width / 2,
          y: 4
        }
        break
      }

      case 'hidden': {
        point1 = {
          x: 3,
          y: container.frame.height - 3
        }

        point2 = {
          x: container.frame.width - 3,
          y: container.frame.height - 3
        }

        point3 = {
          x: container.frame.width / 2,
          y: 3
        }
        break
      }
    }

        /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)

    if (thisObject.fitFunction !== undefined) {
      point1 = thisObject.fitFunction(point1)
      point2 = thisObject.fitFunction(point2)
      point3 = thisObject.fitFunction(point3)
    }

        /* Lets start the drawing. */

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point1.x, point1.y)
    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(250, 250, 250, 1)'
    browserCanvasContext.lineWidth = 1
    browserCanvasContext.stroke()

    browserCanvasContext.fillStyle = 'rgba(250, 250, 250, 1)'
    browserCanvasContext.fill()
  }
}
