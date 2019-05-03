
function newAnimation () {
  const MODULE_NAME = 'Animation'
  const INFO_LOG = false
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

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      thisObject.stop()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }s
  }

  function initialize (callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

            /* Nothing to do here yet. */
      callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function start (callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] start -> Entering function.') }

      animationLoop()  // Inside this function the animation process is started, and at the same time it creates a loop.
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] start -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function stop (callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] stop -> Entering function.') }

      window.cancelAnimationFrame(animationLoopHandle)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] stop -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function addCallBackFunction (key, callBack, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] addCallBackFunction -> Entering function.') }

      callBackFunctions.set(key, callBack)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] addCallBackFunction -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function removeCallBackFunction (key, callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] removeCallBackFunction -> Entering function.') }

      callBackFunctions.delete(key)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] removeCallBackFunction -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function animationLoop () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] animationLoop -> Entering function.') }

      if (window.canvasApp.visible === true) {
                /* We set the canvas to its normal width and height */

        browserCanvas.width = window.innerWidth
        browserCanvas.height = window.innerHeight - window.canvasApp.topMargin

                /* First thing is to clear the actual canvas */

        clearBrowserCanvas()

                /* Let reset the current chart that is on focus */

        window.CHART_ON_FOCUS = ''

                /* We loop through the callback functions collections and execute them all. */

        callBackFunctions.forEach(function (callBackFunction) {
          callBackFunction()
        })
      } else {
        browserCanvas.width = 1
        browserCanvas.height = 1
      }

            /* We request the next frame to be drawn, and stablishing a loop */

      animationLoopHandle = window.requestAnimationFrame(animationLoop)
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

