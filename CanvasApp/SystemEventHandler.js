
function newSystemEventHandler () {
  /* Web Sockets Connection */

  const MODULE_NAME = 'System Event Handler'
  const ERROR_LOG = true
  const INFO_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  const WEB_SOCKETS_URL = 'ws://localhost:8080'
  let WEB_SOCKETS_CONNECTION

  let thisObject = {
    initialize: initialize,
    physics: physics,
    createEventHandler: createEventHandler,
    deleteEventHandler: deleteEventHandler,
    listenToEvent: listenToEvent,
    stopListening: stopListening,
    raiseEvent: raiseEvent
  }

  let eventListeners = new Map()
  let responseWaiters = new Map()

  return thisObject

  function initialize (callBackFunction) {
    setuptWebSockets(callBackFunction)
  }

  function sendCommand (command, responseCallBack, eventsCallBack) {
    if (command.action === 'listenToEvent') {
      let key
      if (command.callerId !== undefined) {
        key = command.eventHandlerName + '-' + command.eventType + '-' + command.callerId
      } else {
        key = command.eventHandlerName + '-' + command.eventType
      }
      eventListeners.set(key, eventsCallBack)
    }
    if (command.callerId && responseCallBack) {
      responseWaiters.set(command.callerId, responseCallBack)
    }

    if (WEB_SOCKETS_CONNECTION.readyState === 1) { // 1 means connected and ready.
      WEB_SOCKETS_CONNECTION.send(JSON.stringify(command))
    } else {
      console.log('WebSocket message could not be sent because the connection was not ready. Message = ' + JSON.stringify(command))
    }
  }

  function createEventHandler (eventHandlerName, callerId, responseCallBack) {
    let eventCommand = {
      action: 'createEventHandler',
      eventHandlerName: eventHandlerName,
      callerId: callerId
    }
    sendCommand(eventCommand, responseCallBack)
  }

  function deleteEventHandler (eventHandlerName, callerId, responseCallBack) {
    let eventCommand = {
      action: 'deleteEventHandler',
      eventHandlerName: eventHandlerName,
      callerId: callerId
    }
    sendCommand(eventCommand, responseCallBack)
  }

  function listenToEvent (eventHandlerName, eventType, extraData, callerId, responseCallBack, eventsCallBack) {
    let eventCommand = {
      action: 'listenToEvent',
      eventHandlerName: eventHandlerName,
      eventType: eventType,
      extraData: extraData,
      callerId: callerId
    }
    sendCommand(eventCommand, responseCallBack, eventsCallBack)
  }

  function stopListening (eventHandlerName, eventSubscriptionId, callerId, responseCallBack) {
    let eventCommand = {
      action: 'stopListening',
      eventHandlerName: eventHandlerName,
      eventSubscriptionId: eventSubscriptionId,
      callerId: callerId
    }
    sendCommand(eventCommand, responseCallBack)
  }

  function raiseEvent (eventHandlerName, eventType, event, callerId, responseCallBack) {
    let eventCommand = {
      action: 'raiseEvent',
      eventHandlerName: eventHandlerName,
      eventType: eventType,
      event: event,
      callerId: callerId
    }
    sendCommand(eventCommand, responseCallBack)
  }

  function physics () {
    if (WEB_SOCKETS_CONNECTION !== undefined) {
      if (WEB_SOCKETS_CONNECTION.readyState === 3) { // Connection closed. May happen after computer goes to sleep.
        setuptWebSockets(onOpen)
        function onOpen () {
          if (INFO_LOG === true) { logger.write('[INFO] setuptWebSockets -> Found Web Sockets Connection Closed. Reconnected to WebSockets Server.') }
        }
      }
    }
  }

  function setuptWebSockets (callBackFunction) {
    try {
      WEB_SOCKETS_CONNECTION = new WebSocket(WEB_SOCKETS_URL)
      WEB_SOCKETS_CONNECTION.onopen = () => {
        console.log('Websocket connection opened.')
      }
      WEB_SOCKETS_CONNECTION.onerror = error => {
        console.log('WebSocket error:' + JSON.stringify(error))
      }
      WEB_SOCKETS_CONNECTION.onopen = () => {
        if (callBackFunction !== undefined) {
          callBackFunction()
        }
      }
      WEB_SOCKETS_CONNECTION.onmessage = e => {
        // console.log('Websoked Message Received: ' + e.data)

        let message = JSON.parse(e.data)

        if (message.action === 'Event Raised') {
          let key
          if (message.callerId !== undefined) {
            key = message.eventHandlerName + '-' + message.eventType + '-' + message.callerId
          } else {
            key = message.eventHandlerName + '-' + message.eventType
          }
          let handler = eventListeners.get(key)
          if (handler) {
            handler(message)
          }
          return
        }

        if (message.action === 'Event Server Response') {
          let handler = responseWaiters.get(message.callerId)
          if (handler) {
            handler(message)
          }
          return
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setuptWebSockets -> err = ' + err.stack) }
    }
  }
}
