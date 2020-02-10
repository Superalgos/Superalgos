 ﻿/*

The Splash Screen is to show some 'loading...' controls while the app is being loaded on the background. After the loading is complete the Splash Screens dissapears for good.

*/

function newSplashScreen () {
  let thisObject = {
    container: undefined,
    draw: draw,
    timeMachines: [],
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  var container = newContainer()
  container.initialize()
  thisObject.container = container

  resize()

  container.frame.containerName = 'Splash Screen'

  container.frame.position.x = 0
  container.frame.position.y = 0

  container.isDraggeable = false

  let fadeOutCounter = 0
  let opacity = 1

  let logo
  let canDrawLogo = false

  return thisObject

  function initialize () {
    logo = new Image()

    logo.onload = onImageLoad

    function onImageLoad () {
      canDrawLogo = true
    }

    logo.src = window.canvasApp.urlPrefix + 'Images/superalgos-logo.png'

    canvas.eventHandler.listenToEvent('Browser Resized', resize)
  }

  function resize () {
    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = browserCanvas.height
  }

  function draw () {
    if (splashScreenNeeded === false) {
      stepsInitializationCounter = 100
      canDrawLogo = false

      fadeOutCounter++

      if (fadeOutCounter > 2) {
        return
      }
      opacity = opacity - 1
    }

    thisObject.container.frame.draw(false, false)

        /* Set the background. */

    browserCanvasContext.beginPath()
    browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'
    browserCanvasContext.closePath()
    browserCanvasContext.fill()

    if (canDrawLogo === false) { return }

        /* First the AA Logo. */

    let imageHeight = 192 / 2
    let imageWidth = 720 / 2
    let yDisplacement = -60
    let xDisplacement = -60

    let imagePoint = {
      x: thisObject.container.frame.width * 1 / 2 - imageWidth / 2 + xDisplacement,
      y: thisObject.container.frame.height * 1 / 2 - imageHeight / 2 + yDisplacement
    }

    imagePoint = thisObject.container.frame.frameThisPoint(imagePoint)

    browserCanvasContext.drawImage(logo, imagePoint.x, imagePoint.y, imageWidth, imageHeight)

        /* Second the % of Advance. */

    let label = '' + Math.trunc(stepsInitializationCounter) + ' %'
    stepsInitializationCounter = stepsInitializationCounter + 2.0

    if (stepsInitializationCounter > 99) {
      splashScreenNeeded = false
      stepsInitializationCounter = 99
    }

    let fontSize = 15

    let labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 22,
      y: thisObject.container.frame.height / 2 + fontSize / 2 + fontSize * 0.1 + 90 + yDisplacement
    }

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

    let title
    let titlePoint

        /* Algo Bots Competitions Sub Title */

    fontSize = 35

    title = 'Beta'

    titlePoint = {
      x: thisObject.container.frame.width / 2 - title.length / 2 * fontSize * FONT_ASPECT_RATIO - 20,
      y: thisObject.container.frame.height / 2 + 70 + yDisplacement
    }

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.font = 'Saira Condensed'
    browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')'
    browserCanvasContext.fillText(title, titlePoint.x, titlePoint.y)
  }

  function getContainer (point) {
    var container

        /* First we check if this point is inside this space. */

    if (thisObject.container.frame.isThisPointHere(point) === true) {
            /* Now we see which is the inner most container that has it */

            // add validation of inner most containers here.

            /* The point does not belong to any inner container, so we return the current container. */

      return thisObject.container
    } else {
            /* This point does not belong to this space. */

      return undefined
    }
  }
}
