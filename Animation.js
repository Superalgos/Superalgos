
function newAnimation () {
  const MODULE_NAME = 'Animation'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

    /*

    Essentially, what the animation object does, is to call several functions in order to draw the content of each frame.
    To do that, it has an array of functions that need to be called, and it just goes one by one through them. His parent object
    is responsible for providing more functions to call, or removing functions from its list when they are not longer needed.

    */

  let animationLoopHandle          // This is the handle to the animation loop. With this handle we can cancel the loop, for instance.
  let callBackFunctions = new Map()

  let thisObject = {
    start: start,
    stop: stop,
    addCallBackFunction: addCallBackFunction,
    removeCallBackFunction: removeCallBackFunction,
    initialize: initialize,
    finalize: finalize
  }

  let totalConsumption = 0
  let totalCounter = 0
  let pointerIcon
  return thisObject

  function finalize () {
    thisObject.stop()
    pointerIcon = undefined
  }

  function initialize () {

  }

  function start () {
    animationLoop()  // Inside this function the animation process is started, and at the same time it creates a loop.
  }

  function stop () {
    window.cancelAnimationFrame(animationLoopHandle)
  }

  function addCallBackFunction (key, callBack) {
    callBackFunctions.set(key, callBack)
  }

  function removeCallBackFunction (key) {
    callBackFunctions.delete(key)
  }

  function animationLoop () {
    try {
      if (window.canvasApp.visible === true) {
        /* We set the canvas to its normal width and height */
        browserCanvas.width = window.innerWidth
        browserCanvas.height = window.innerHeight - CURRENT_TOP_MARGIN

        /* First thing is to clear the actual canvas */
        // clearBrowserCanvas()

        /* We loop through the callback functions collections and execute them all. */
        let performanceMap = new Map()
        let totalTimeConsumed = 0
        let totalElements = 0
        let chanceToExecute
        let randomNumber
        let mustExecute

        // console.clear()
        let row = 0
        for (const [key, callBackFunction] of callBackFunctions.entries()) {
          row++
          switch (key) {
            case 'Floating Space Physics':
              chanceToExecute = 50
              randomNumber = Math.random() * 100 * chanceToExecute
              if (randomNumber > 100 - chanceToExecute) { mustExecute = true } else { mustExecute = false }
              break
            default: {
              mustExecute = true
            }

          }
          let timeConsumed = 0
          if (mustExecute === true) {
            let t0 = performance.now()
            callBackFunction()
            let t1 = performance.now()
            timeConsumed = t1 - t0
            if (key === 'Charting Space Draw') {
              if (Math.random() * 100 > 99) {
                totalConsumption = 0
                totalCounter = 0
              }

              totalConsumption = totalConsumption + timeConsumed
              totalCounter = totalCounter + 1
            }
            performanceMap.set(key, timeConsumed)
            totalTimeConsumed = totalTimeConsumed + timeConsumed
            totalElements++
          }
        }

        /* Performance Check */
        if (SHOW_ANIMATION_PERFORMACE === true) {
          row = 0
          for (const [key, timeConsumed] of performanceMap.entries()) {
            row++
            labelToPrint = key + '   ' + timeConsumed.toFixed(4)
            printLabel(labelToPrint, 10, 100 + row * 30, 1, 20, UI_COLOR.RED)
            let percentage = timeConsumed * 100 / totalTimeConsumed
            labelToPrint = key + '   ' + percentage.toFixed(1) + '%'
            printLabel(labelToPrint, 300, 100 + row * 30, 1, 20, UI_COLOR.RED)
          }

          /* Other Variables */
          row++
          printLabel(DEBUG.variable1, 300, 100 + row * 30, 1, 20, UI_COLOR.RED)
          row++
          printLabel(DEBUG.variable2, 300, 100 + row * 30, 1, 20, UI_COLOR.RED)
          row++
          printLabel(DEBUG.variable3, 300, 100 + row * 30, 1, 20, UI_COLOR.RED)
          row++
          printLabel(DEBUG.variable4, 300, 100 + row * 30, 1, 20, UI_COLOR.RED)
        }
      } else {
        browserCanvas.width = 1
        browserCanvas.height = 1
      }

      /* Media Recording */
      if (areWeRecording === true) {
        const DISTANCE_BETWEEN_ICONS = 60
        const ICON_SIZES = 50

        let mousePointerIcon = canvas.designSpace.iconCollection.get('mouse-pointer')
        let wheelIcon = canvas.designSpace.iconCollection.get('mouse-wheel')
        let draggingIcon = canvas.designSpace.iconCollection.get('support')
        let keyDownIcon = canvas.designSpace.iconCollection.get('tron')

        let leftClickIcon = canvas.designSpace.iconCollection.get('mouse-left-click')
        let rightClickIcon = canvas.designSpace.iconCollection.get('mouse-right-click')
        let wheelClickIcon = canvas.designSpace.iconCollection.get('mouse-wheel-click')

        let imagePosition
        let buttonPressedIcon

        switch (canvas.mouse.action) {
          case 'moving': {
            pointerIcon = mousePointerIcon
            break
          }
          case 'dragging': {
            pointerIcon = draggingIcon
            break
          }
          case 'wheel': {
            pointerIcon = wheelIcon
            break
          }
          case 'key down': {
            pointerIcon = mousePointerIcon
            break
          }
          case 'key up': {
            pointerIcon = mousePointerIcon
            break
          }
        }

        imagePosition = {
          x: canvas.mouse.position.x,
          y: canvas.mouse.position.y
        }
        drawMousePointer(pointerIcon, imagePosition, ICON_SIZES)

        switch (canvas.mouse.event.buttons) {
          case 0: {
            buttonPressedIcon = undefined
            break
          }
          case 1: {
            buttonPressedIcon = leftClickIcon
            break
          }
          case 2: {
            buttonPressedIcon = rightClickIcon
            break
          }
          case 3: {
            buttonPressedIcon = undefined
            break
          }
          case 4: {
            buttonPressedIcon = wheelClickIcon
            break
          }
        }

        imagePosition = {
          x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y
        }
        drawMousePointer(buttonPressedIcon, imagePosition, ICON_SIZES)

        if (canvas.mouse.event.shiftKey === true) {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
            y: canvas.mouse.position.y - DISTANCE_BETWEEN_ICONS
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.ctrlKey === true || canvas.mouse.event.metaKey === true) {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
            y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.altKey === true) {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
            y: canvas.mouse.position.y - 0
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.code === 'ArrowUp') {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - 0,
            y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.code === 'ArrowDown') {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - 0,
            y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.code === 'ArrowLeft') {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
            y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        if (canvas.mouse.event.code === 'ArrowRight') {
          let icon = canvas.designSpace.iconCollection.get('mouse-wheel')
          imagePosition = {
            x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS,
            y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
          }
          drawMousePointer(icon, imagePosition, ICON_SIZES)
        }

        function drawMousePointer (icon, imagePosition, imageSize) {
          if (icon !== undefined) {
            if (icon.canDrawIcon === true) {
              browserCanvasContext.drawImage(
                icon, imagePosition.x,
                imagePosition.y,
                imageSize,
                imageSize)
            }
          }
        }
        mediaRecorder.capture(browserCanvas)
      }

      /* We request the next frame to be drawn, and stablishing a loop */

      /* Use this code for full animation speed. */
      animationLoopHandle = window.requestAnimationFrame(animationLoop)

      /* Use this code for max 10 frames per second animation speed, if the app is consumming too much of your CPU.  */
      /*
      setTimeout(nextLoop, 100)
      function nextLoop () {
        animationLoopHandle = window.requestAnimationFrame(animationLoop)
      }
      */
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] animationLoop -> err = ' + err.stack) }
    }
  }

  function clearBrowserCanvas () {
    browserCanvasContext.beginPath()

    browserCanvasContext.rect(0, 0, browserCanvas.width, browserCanvas.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}
