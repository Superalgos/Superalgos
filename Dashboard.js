let canvas
let markets
let ecosystem = newEcosystem()
let systemEventHandler

let APP_SCHEMA_MAP = new Map()
let APP_SCHEMA_ARRAY = []

function newDashboard () {
  const MODULE_NAME = 'Dashboard'
  const ERROR_LOG = true
  const INTENSIVE_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    start: start
  }

  const DEBUG_START_UP_DELAY = 0 // 3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.

  return thisObject

  function start () {
    try {
      setBrowserEvents()

      systemEventHandler = newSystemEventHandler()
      systemEventHandler.initialize(setUpAppSchema)

      function setUpAppSchema () {
        APP_SCHEMA_ARRAY = getAppSchema()
        for (let i = 0; i < APP_SCHEMA_ARRAY.length; i++) {
          let nodeDefinition = APP_SCHEMA_ARRAY[i]
          let key
          if (nodeDefinition.subType !== undefined) {
            key = nodeDefinition.type + '-' + nodeDefinition.subType
          } else {
            key = nodeDefinition.type
          }
          APP_SCHEMA_MAP.set(key, nodeDefinition)
        }

        startCanvas()
      }

      function startCanvas () {
        /* If this method is executed for a second time, it should finalize the current execution structure */

        if (canvas !== undefined) { canvas.finalize() }

        /* Here we check where we are executing. In case we are Local we need to create a Local Dummy User and Data Mine. */

        if (window.canvasApp.executingAt === 'Local') {
          window.localStorage.setItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY, 'Local Access Token')       // Dummy Access Token
          window.localStorage.setItem(LOGGED_IN_USER_LOCAL_STORAGE_KEY, '{"authId":"x|x","alias":"user"}')  // Dummy Local User
        }

        /* Here we used to have a call to the DataMines Module to get the profile pictures. That was removed but to keep things working, we do this: */

        window.canvasApp.context.dataMineProfileImages = new Map()
        window.canvasApp.context.fbProfileImages = new Map()

        setTimeout(delayedStart, DEBUG_START_UP_DELAY)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] start -> err = ' + err.stack) }
    }
  }

  function delayedStart () {
    try {
            /* For now, we are supporting only one market. */

      let market = {
        id: 2,
        baseAsset: 'USDT',
        quotedAsset: 'BTC'
      }

      markets = new Map()

      markets.set(market.id, market)

      canvas = newCanvas()
      canvas.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] delayedStart -> err = ' + err.stack) }
    }
  }

  function setBrowserEvents () {
    window.onbeforeunload = onBrowserClosed
    function onBrowserClosed () {
      canvas.designerSpace.workspace.stopAllRunningTasks()
    }
  }
}
