
function newAnimation() {
    const MODULE_NAME = 'Animation'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

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
    let videoRecorder
    return thisObject

    function finalize() {
        thisObject.stop()
        pointerIcon = undefined
        videoRecorder = undefined
    }

    function initialize() {
        videoRecorder = newVideoRecorder()
    }

    function start() {
        animationLoop()  // Inside this function the animation process is started, and at the same time it creates a loop.
    }

    function stop() {
        window.cancelAnimationFrame(animationLoopHandle)
    }

    function addCallBackFunction(key, callBack) {
        callBackFunctions.set(key, callBack)
    }

    function removeCallBackFunction(key) {
        callBackFunctions.delete(key)
    }

    function animationLoop() {
        try {
            /* First thing is to clear the actual canvas */
            clearBrowserCanvas()

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

            /* Frame per Seconds */

            ANIMATION_FRAME_PER_SECONDS = Math.trunc(1000 / totalTimeConsumed)

            /* Performance Check */
            if (SHOW_ANIMATION_PERFORMACE === true) {
                row = 0
                for (const [key, timeConsumed] of performanceMap.entries()) {
                    row++
                    let labelToPrint = key + '   ' + timeConsumed.toFixed(4)
                    UI.projects.superalgos.utilities.drawPrint.printLabel(labelToPrint, 10,undefined, undefined,  100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                    let percentage = timeConsumed * 100 / totalTimeConsumed
                    labelToPrint = key + '   ' + percentage.toFixed(1) + '%'
                    UI.projects.superalgos.utilities.drawPrint.printLabel(labelToPrint, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                }

                /* Other Variables */
                row++
                UI.projects.superalgos.utilities.drawPrint.printLabel(DEBUG.variable1, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                row++
                UI.projects.superalgos.utilities.drawPrint.printLabel(DEBUG.variable2, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                row++
                UI.projects.superalgos.utilities.drawPrint.printLabel(DEBUG.variable3, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                row++
                UI.projects.superalgos.utilities.drawPrint.printLabel(DEBUG.variable4, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
                row++
                UI.projects.superalgos.utilities.drawPrint.printLabel('Animation Frame Per Seconds: ' + ANIMATION_FRAME_PER_SECONDS, 300, undefined, undefined, 100 + row * 30, 1, 20, UI_COLOR.RED, 'Left')
            }

            /* Video Recording */
            videoRecorder.physics()
            if (ARE_WE_RECORDING_A_VIDEO === true) {
                videoRecorder.recordCanvas()
            }

            /* Panorama Recording */
            if (ARE_WE_RECORDING_A_MARKET_PANORAMA === true) {
                if (PANORAMA_WAS_PANNED === true) {
                    UI.projects.superalgos.utilities.download.addToMarketPanorama()
                    PANORAMA_WAS_PANNED = false
                }
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

    function clearBrowserCanvas() {
        if (CAN_SPACES_DRAW === false) { return }
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        browserCanvasContext.clearRect(0, 0, browserCanvas.width, browserCanvas.height)
    }
}
