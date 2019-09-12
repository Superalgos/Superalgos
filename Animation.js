
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

  return thisObject

  function finalize () {
    thisObject.stop()
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
