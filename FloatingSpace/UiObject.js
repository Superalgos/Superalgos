
function newUiObject () {
  const MODULE_NAME = 'UI Object'
  const ERROR_LOG = true

  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    fitFunction: undefined,
    isVisibleFunction: undefined,
    type: undefined,
    menu: undefined,
    isOnFocus: false,
    container: undefined,
    payload: undefined,
    codeEditor: undefined,
    configEditor: undefined,
    conditionEditor: undefined,
    formulaEditor: undefined,
    uiObjectTitle: undefined,
    circularProgressBar: undefined,
    isRunning: undefined,
    shortcutKey: undefined,
    isShowing: undefined,
    run: run,
    stop: stop,
    heartBeat: heartBeat,
    getReadyToChainAttach: getReadyToChainAttach,
    showAvailabilityToChainAttach: showAvailabilityToChainAttach,
    getReadyToReferenceAttach: getReadyToReferenceAttach,
    showAvailabilityToReferenceAttach: showAvailabilityToReferenceAttach,
    highlight: highlight,
    runningAtBackend: runningAtBackend,
    setErrorMessage: setErrorMessage,
    resetErrorMessage: resetErrorMessage,
    setValue: setValue,
    resetValue: resetValue,
    setPercentage: setPercentage,
    resetPercentage: resetPercentage,
    setStatus: setStatus,
    resetStatus: resetStatus,
    physics: physics,
    invisiblePhysics: invisiblePhysics,
    drawBackground: drawBackground,
    drawMiddleground: drawMiddleground,
    drawForeground: drawForeground,
    drawOnFocus: drawOnFocus,
    getContainer: getContainer,
    finalize: finalize,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let icon
  let executingIcon

  let selfFocusEventSubscriptionId
  let selfNotFocusEventSubscriptionId
  let selfDisplaceEventSubscriptionId
  let selfDragStartedEventSubscriptionId
  let selfDragFinishedEventSubscriptionId

  let isHighlighted
  let highlightCounter = 0

  let isRunningAtBackend
  let runningAtBackendCounter = 0

  let hasError
  let errorMessageCounter = 0

  let hasValue
  let valueCounter = 0

  let hasPercentage
  let percentageCounter = 0

  let hasStatus
  let statusCounter = 0

  let previousDistanceToChainParent
  let readyToChainAttachDisplayCounter = 5
  let readyToChainAttachDisplayIncrement = 0.1
  let readyToChainAttachCounter = 0
  let isReadyToChainAttach
  let availableToChainAttachCounter = 0
  let isAvailableToChainAttach
  let isChainAttaching = false
  let chainAttachToNode

  let previousDistanceToReferenceParent
  let readyToReferenceAttachDisplayCounter = 5
  let readyToReferenceAttachDisplayIncrement = 0.1
  let readyToReferenceAttachCounter = 0
  let isReadyToReferenceAttach
  let availableToReferenceAttachCounter = 0
  let isAvailableToReferenceAttach
  let isReferenceAttaching = false
  let referenceAttachToNode

  let isDragging = false

  let errorMessage = ''
  let currentValue = 0
  let currentPercentage = ''
  let currentStatus = ''
  let rightDragging = false

  let eventSubscriptionIdOnError
  let eventSubscriptionIdOnRunning
  let eventSubscriptionIdOnStopped
  let lastHeartBeat
  let onRunningCallBackFunction
  let onRunningCallBackFunctionWasCalled = false

  let newUiObjectCounter = 25
  let referenceLineCounter = 0
  let chainLineCounter = 0

  let eventsServerClient

  return thisObject

  function finalize () {
    finalizeEventsServerClient()

    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDisplaceEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDragStartedEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfDragFinishedEventSubscriptionId)

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.payload = undefined
    thisObject.menu.finalize()
    thisObject.menu = undefined
    thisObject.uiObjectTitle.finalize()
    thisObject.uiObjectTitle = undefined
    thisObject.fitFunction = undefined
    thisObject.isVisibleFunction = undefined

    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.finalize()
      thisObject.codeEditor = undefined
    }

    if (thisObject.configEditor !== undefined) {
      thisObject.configEditor.finalize()
      thisObject.configEditor = undefined
    }

    if (thisObject.conditionEditor !== undefined) {
      thisObject.conditionEditor.finalize()
      thisObject.conditionEditor = undefined
    }

    if (thisObject.formulaEditor !== undefined) {
      thisObject.formulaEditor.finalize()
      thisObject.formulaEditor = undefined
    }

    icon = undefined
    chainAttachToNode = undefined
    referenceAttachToNode = undefined
    lastHeartBeat = undefined

    onRunningCallBackFunction = undefined
  }

  function finalizeEventsServerClient () {
    if (eventsServerClient !== undefined) {
      let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id

      if (eventSubscriptionIdOnRunning !== undefined) {
        eventsServerClient.stopListening(key, eventSubscriptionIdOnRunning, 'UiObject')
      }
      if (eventSubscriptionIdOnStopped !== undefined) {
        eventsServerClient.stopListening(key, eventSubscriptionIdOnStopped, 'UiObject')
      }
      if (eventSubscriptionIdOnError !== undefined) {
        eventsServerClient.stopListening(key, eventSubscriptionIdOnError, 'UiObject')
      }
    }
  }

  function initialize (payload, menuItemsInitialValues) {
    thisObject.payload = payload

/* Initialize the Menu */

    thisObject.menu = newCircularMenu()
    thisObject.menu.initialize(menuItemsInitialValues, thisObject.payload)
    thisObject.menu.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)

/* Initialize UI Object Title */

    thisObject.uiObjectTitle = newUiObjectTitle()
    thisObject.uiObjectTitle.isVisibleFunction = thisObject.isVisibleFunction
    thisObject.uiObjectTitle.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)
    thisObject.uiObjectTitle.fitFunction = thisObject.fitFunction
    thisObject.uiObjectTitle.initialize(thisObject.payload)

/* Load UI Object Image */

    iconPhysics()

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
    selfDisplaceEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDisplace', onDisplace)
    selfDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
    selfDragFinishedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragFinished', onDragFinished)
  }

  function getContainer (point) {
    let container

    if (isDragging === false && thisObject.isOnFocus === true) {
      if (thisObject.codeEditor !== undefined) {
        container = thisObject.codeEditor.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (thisObject.configEditor !== undefined) {
        container = thisObject.configEditor.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (thisObject.conditionEditor !== undefined) {
        container = thisObject.conditionEditor.getContainer(point)
        if (container !== undefined) { return container }
      }

      if (thisObject.formulaEditor !== undefined) {
        container = thisObject.formulaEditor.getContainer(point)
        if (container !== undefined) { return container }
      }

      let getitle = true

      if (thisObject.codeEditor !== undefined) {
        if (thisObject.codeEditor.visible === true) {
          getitle = false
        }
      }
      if (thisObject.configEditor !== undefined) {
        if (thisObject.configEditor.visible === true) {
          getitle = false
        }
      }
      if (thisObject.conditionEditor !== undefined) {
        if (thisObject.conditionEditor.visible === true) {
          getitle = false
        }
      }
      if (thisObject.formulaEditor !== undefined) {
        if (thisObject.formulaEditor.visible === true) {
          getitle = false
        }
      }

      if (getitle === true) {
        container = thisObject.uiObjectTitle.getContainer(point)
        if (container !== undefined) { return container }
      }

      container = thisObject.menu.getContainer(point)
      if (container !== undefined) { return container }
    }

    if (thisObject.container.frame.isThisPointHere(point, true, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function invisiblePhysics () {
    thisObject.menu.invisiblePhysics()
    childrenRunningPhysics()
  }

  function physics () {
    thisObject.menu.physics()
    thisObject.uiObjectTitle.physics()

    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.physics()
    }

    if (thisObject.configEditor !== undefined) {
      thisObject.configEditor.physics()
    }

    if (thisObject.conditionEditor !== undefined) {
      thisObject.conditionEditor.physics()
    }

    if (thisObject.formulaEditor !== undefined) {
      thisObject.formulaEditor.physics()
    }

    if (thisObject.payload.chainParent === undefined || thisObject.payload.chainParent.payload === undefined) {
      thisObject.payload.targetPosition.x = thisObject.payload.position.x,
      thisObject.payload.targetPosition.y = thisObject.payload.position.y
    } else {
      if (thisObject.payload.chainParent.payload.position !== undefined) {
        thisObject.payload.targetPosition.x = thisObject.payload.chainParent.payload.position.x
        thisObject.payload.targetPosition.y = thisObject.payload.chainParent.payload.position.y
      }
    }

    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.physics()
    }

    iconPhysics()
    highlightPhisycs()
    runningAtBackendPhisycs()
    errorMessagePhisycs()
    valuePhisycs()
    percentagePhisycs()
    statusPhisycs()
    chainDetachingPhysics()
    chainAttachingPhysics()
    referenceDetachingPhysics()
    referenceAttachingPhysics()
    childrenRunningPhysics()
    newObjectPhysics()
    referenceLinePhysics()
    chainLinePhysics()
  }

  function referenceLinePhysics () {
    referenceLineCounter = referenceLineCounter + 2
    if (referenceLineCounter > 500) {
      referenceLineCounter = 0
    }
  }

  function chainLinePhysics () {
    chainLineCounter = chainLineCounter - 5
    if (chainLineCounter < 0) {
      chainLineCounter = 500
    }
  }

  function newObjectPhysics () {
    newUiObjectCounter--
    if (newUiObjectCounter < 0) {
      newUiObjectCounter = 0
    }
  }

  function heartBeatPhysics () {
    if (lastHeartBeat !== undefined) {
      const ONE_MIN = 60000
      nowTimestamp = (new Date()).valueOf()
      if (nowTimestamp - lastHeartBeat.valueOf() > ONE_MIN) {
        lastHeartBeat = undefined
        thisObject.isRunning = false
        valueCounter = 0
      }
    } else {
      thisObject.isRunning = false
    }
  }

  function childrenRunningPhysics () {
    let nodeDefinition = getNodeDefinition(thisObject.payload.node)
    if (nodeDefinition.properties === undefined) { return }
    let monitorChildrenRunning = false
    for (let i = 0; i < nodeDefinition.properties.length; i++) {
      let property = nodeDefinition.properties[i]
      if (property.monitorChildrenRunning === true) {
        let children = thisObject.payload.node[property.name]
        if (children === undefined) { continue }
        let totalRunning = 0
        for (let j = 0; j < children.length; j++) {
          let child = children[j]
          if (child.payload !== undefined) {
            if (child.payload.uiObject.isRunning === true) {
              totalRunning++
            }
          }
        }
        if (totalRunning > 0) {
          setValue(totalRunning + ' / ' + children.length + ' Running')
          thisObject.isRunning = true
        } else {
          thisObject.isRunning = false
          valueCounter = 0
        }
        monitorChildrenRunning = true
        return
      }
    }
    if (monitorChildrenRunning === false) {
      heartBeatPhysics()
    }
  }

  function chainAttachingPhysics () {
    chainAttacchingCounters()

    if (thisObject.isOnFocus !== true) { return }
    if (isDragging !== true) { return }
    if (rightDragging !== true) { return }
    if (thisObject.payload.chainParent !== undefined) { return }

    let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
    let compatibleTypes

    let nodeDefinition = getNodeDefinition(thisObject.payload.node)
    if (nodeDefinition !== undefined) {
      if (nodeDefinition.chainAttachesTo !== undefined) {
        compatibleTypes = nodeDefinition.chainAttachesTo.compatibleTypes
      } else {
        return
      }
    } else {
      return
    }

    let foundCompatible = false
    chainAttachToNode = undefined
    isChainAttaching = false

    for (let i = 0; i < nearbyFloatingObjects.length; i++) {
      let nearby = nearbyFloatingObjects[i]
      let distance = nearby[0]
      let floatingObject = nearby[1]
      let nearbyNode = floatingObject.payload.node
      if (compatibleTypes.indexOf('->' + nearbyNode.type + '->') >= 0) {
        /* Discard App Schema defined objects with busy coonection ports */
        nodeDefinition = getNodeDefinition(thisObject.payload.node)
        if (nodeDefinition !== undefined) {
          let mustContinue = false
          let parentNodeDefinition = getNodeDefinition(nearbyNode)
          if (parentNodeDefinition !== undefined) {
            if (parentNodeDefinition.properties !== undefined) {
              for (let j = 0; j < parentNodeDefinition.properties.length; j++) {
                let property = parentNodeDefinition.properties[j]
                if (nodeDefinition.propertyNameAtParent === property.name) {
                  switch (property.type) {
                    case 'node': {
                      if (nearbyNode[property.name] !== undefined) {
                        mustContinue = true
                      }
                    }
                      break
                    case 'array': {
                        /* Nothing to worry about since an array can take more than one element. */
                    }
                      break
                  }
                }
              }
            }
          }
          if (mustContinue === true) { continue }
        }

        /* Discard Phases without partent */
        if (thisObject.payload.node.type === 'Phase' && nearbyNode.type === 'Phase' && nearbyNode.payload.parentNode === undefined) { continue }
        /* Control maxPhases */
        if (thisObject.payload.node.type === 'Phase') {
          if (nearbyNode.maxPhases !== undefined) {
            if (nearbyNode.phases.length >= nearbyNode.maxPhases) {
              continue
            }
          }
        }
        if (thisObject.payload.node.type === 'Phase' && nearbyNode.type === 'Phase') {
          if (nearbyNode.payload.parentNode.maxPhases !== undefined) {
            if (nearbyNode.payload.parentNode.phases.length >= nearbyNode.payload.parentNode.maxPhases) {
              continue
            }
          }
        }
        if (foundCompatible === false) {
          if (distance < thisObject.container.frame.radius * 1.5 + floatingObject.container.frame.radius * 1.5) {
            nearbyNode.payload.uiObject.getReadyToChainAttach()
            isChainAttaching = true
            chainAttachToNode = nearbyNode
            foundCompatible = true
          }
        }
        nearbyNode.payload.uiObject.showAvailabilityToChainAttach()
      }
    }
  }

  function chainAttacchingCounters () {
    if (readyToChainAttachDisplayCounter > 15) {
      readyToChainAttachDisplayIncrement = -0.25
    }

    if (readyToChainAttachDisplayCounter < 5) {
      readyToChainAttachDisplayIncrement = 0.25
    }

    readyToChainAttachDisplayCounter = readyToChainAttachDisplayCounter + readyToChainAttachDisplayIncrement

    readyToChainAttachCounter--
    if (readyToChainAttachCounter <= 0) {
      readyToChainAttachCounter = 0
      isReadyToChainAttach = false
    } else {
      isReadyToChainAttach = true
    }

    availableToChainAttachCounter--
    if (availableToChainAttachCounter <= 0) {
      availableToChainAttachCounter = 0
      isAvailableToChainAttach = false
    } else {
      isAvailableToChainAttach = true
    }
  }

  function getReadyToChainAttach () {
    readyToChainAttachCounter = 10
  }

  function showAvailabilityToChainAttach () {
    availableToChainAttachCounter = 10
  }

  function chainDetachingPhysics () {
    if (isDragging !== true) { return }
    if (thisObject.payload.floatingObject.isFrozen === true) { return }
    if (rightDragging === false) { return }

    let distanceToChainParent = Math.sqrt(Math.pow(thisObject.payload.position.x - thisObject.payload.targetPosition.x, 2) + Math.pow(thisObject.payload.position.y - thisObject.payload.targetPosition.y, 2))
    let ratio = distanceToChainParent / previousDistanceToChainParent
    if (previousDistanceToChainParent === 0) {
      previousDistanceToChainParent = distanceToChainParent
      return
    }
    previousDistanceToChainParent = distanceToChainParent

    if (thisObject.isOnFocus !== true) { return }
    if (thisObject.payload.chainParent === undefined) { return }
    if (thisObject.payload.parentNode === undefined) { return }

    let THRESHOLD = 1.15

    if (previousDistanceToChainParent !== undefined) {
      if (ratio > THRESHOLD) {
        canvas.designSpace.workspace.chainDetachNode(thisObject.payload.node)
      }
    }
  }

  function referenceAttachingPhysics () {
    referenceAttacchingCounters()

    if (thisObject.isOnFocus !== true) { return }
    if (isDragging !== true) { return }
    if (rightDragging !== true) { return }
    if (thisObject.payload.referenceParent !== undefined) { return }

    let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
    let compatibleTypes

    let nodeDefinition = getNodeDefinition(thisObject.payload.node)
    if (nodeDefinition !== undefined) {
      if (nodeDefinition.referenceAttachesTo !== undefined) {
        compatibleTypes = nodeDefinition.referenceAttachesTo.compatibleTypes
      } else {
        return
      }
    } else {
      return
    }

    let foundCompatible = false
    referenceAttachToNode = undefined
    isReferenceAttaching = false

    for (let i = 0; i < nearbyFloatingObjects.length; i++) {
      let nearby = nearbyFloatingObjects[i]
      let distance = nearby[0]
      let floatingObject = nearby[1]
      let nearbyNode = floatingObject.payload.node
      if (compatibleTypes.indexOf('->' + nearbyNode.type + '->') >= 0) {
        if (foundCompatible === false) {
          if (distance < thisObject.container.frame.radius * 1.5 + floatingObject.container.frame.radius * 1.5) {
            nearbyNode.payload.uiObject.getReadyToReferenceAttach()
            isReferenceAttaching = true
            referenceAttachToNode = nearbyNode
            foundCompatible = true
          }
        }
        nearbyNode.payload.uiObject.showAvailabilityToReferenceAttach()
      }
    }
  }

  function referenceAttacchingCounters () {
    if (readyToReferenceAttachDisplayCounter > 15) {
      readyToReferenceAttachDisplayIncrement = -0.25
    }

    if (readyToReferenceAttachDisplayCounter < 5) {
      readyToReferenceAttachDisplayIncrement = 0.25
    }

    readyToReferenceAttachDisplayCounter = readyToReferenceAttachDisplayCounter + readyToReferenceAttachDisplayIncrement

    readyToReferenceAttachCounter--
    if (readyToReferenceAttachCounter <= 0) {
      readyToReferenceAttachCounter = 0
      isReadyToReferenceAttach = false
    } else {
      isReadyToReferenceAttach = true
    }

    availableToReferenceAttachCounter--
    if (availableToReferenceAttachCounter <= 0) {
      availableToReferenceAttachCounter = 0
      isAvailableToReferenceAttach = false
    } else {
      isAvailableToReferenceAttach = true
    }
  }

  function getReadyToReferenceAttach () {
    readyToReferenceAttachCounter = 10
  }

  function showAvailabilityToReferenceAttach () {
    availableToReferenceAttachCounter = 10
  }

  function referenceDetachingPhysics () {
    if (isDragging !== true) { return }
    if (thisObject.payload.floatingObject.isFrozen === true) { return }
    if (rightDragging === false) { return }
    if (thisObject.payload === undefined) { return }
    if (thisObject.payload.referenceParent === undefined) { return }

    let distanceToReferenceParent = Math.sqrt(Math.pow(thisObject.payload.position.x - thisObject.payload.referenceParent.payload.position.x, 2) + Math.pow(thisObject.payload.position.y - thisObject.payload.referenceParent.payload.position.y, 2))
    let ratio = distanceToReferenceParent / previousDistanceToReferenceParent
    if (previousDistanceToReferenceParent === 0) {
      previousDistanceToReferenceParent = distanceToReferenceParent
      return
    }
    previousDistanceToReferenceParent = distanceToReferenceParent

    if (thisObject.isOnFocus !== true) { return }
    if (thisObject.payload.referenceParent === undefined) { return }

    let THRESHOLD = 1.15

    if (previousDistanceToReferenceParent !== undefined) {
      if (ratio > THRESHOLD) {
        canvas.designSpace.workspace.referenceDetachNode(thisObject.payload.node)
      }
    }
  }

  function highlightPhisycs () {
    highlightCounter--
    if (highlightCounter < 0) {
      highlightCounter = 0
      isHighlighted = false
    }
  }

  function runningAtBackendPhisycs () {
    runningAtBackendCounter--
    if (runningAtBackendCounter < 0) {
      runningAtBackendCounter = 0
      isRunningAtBackend = false
    }
  }

  function errorMessagePhisycs () {
    errorMessageCounter--
    if (errorMessageCounter < 0) {
      errorMessageCounter = 0
      hasError = false
    }
  }

  function valuePhisycs () {
    valueCounter--
    if (valueCounter < 0) {
      valueCounter = 0
      hasValue = false
    }
  }

  function percentagePhisycs () {
    percentageCounter--
    if (percentageCounter < 0) {
      percentageCounter = 0
      hasPercentage = false
    }
  }

  function statusPhisycs () {
    statusCounter--
    if (statusCounter < 0) {
      statusCounter = 0
      hasStatus = false
    }
  }

  function highlight (counter) {
    isHighlighted = true
    if (counter !== undefined) {
      highlightCounter = counter
    } else {
      highlightCounter = 30
    }
  }

  function runningAtBackend () {
    isRunningAtBackend = true
    runningAtBackendCounter = 5
  }

  function setErrorMessage (message, duration) {
    if (message !== undefined) {
      errorMessage = message
      hasError = true
      if (duration === undefined) { duration = 1 }
      errorMessageCounter = 100 * duration
    }
  }

  function resetErrorMessage () {
    errorMessage = undefined
    hasError = false
  }

  function setValue (value, counter) {
    if (value !== undefined) {
      currentValue = value
      hasValue = true
      if (counter !== undefined) {
        valueCounter = counter
      } else {
        valueCounter = 100
      }
    }
  }

  function resetValue () {
    currentValue = undefined
    hasValue = false
    valueCounter = 0
  }

  function setPercentage (percentage, counter) {
    if (percentage !== undefined) {
      currentPercentage = percentage
      hasPercentage = true
      if (counter !== undefined) {
        percentageCounter = counter
      } else {
        percentageCounter = 100
      }
    }
  }

  function resetPercentage () {
    currentPercentage = undefined
    hasPercentage = false
    percentageCounter = 0
  }

  function setStatus (status, counter) {
    if (status !== undefined) {
      currentStatus = status
      hasStatus = true
      if (counter !== undefined) {
        statusCounter = counter
      } else {
        statusCounter = 100
      }
    }
  }

  function resetStatus () {
    currentStatus = undefined
    hasStatus = false
    statusCounter = 0
  }

  function heartBeat () {
    lastHeartBeat = new Date()
    thisObject.isRunning = true

    if (onRunningCallBackFunctionWasCalled === false) {
      onRunningCallBackFunctionWasCalled = true
      if (onRunningCallBackFunction !== undefined) {
        onRunningCallBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
      }
    }
  }

  function run (pEventsServerClient, callBackFunction) {
    finalizeEventsServerClient()
    resetErrorMessage()
    resetPercentage()
    resetValue()
    resetStatus()
    eventsServerClient = pEventsServerClient

    /* We setup the circular progress bar. */
    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.finalize()
    }

    thisObject.circularProgressBar = newCircularProgressBar()
    thisObject.circularProgressBar.initialize(thisObject.payload, eventsServerClient)
    thisObject.circularProgressBar.fitFunction = thisObject.fitFunction
    thisObject.circularProgressBar.container = thisObject.container

    setupRunningEventListener(callBackFunction)
    setupErrorEventListener(callBackFunction)
  }

  function setupRunningEventListener (callBackFunction) {
      /* We will wait to hear the Running event in order to confirm the execution was really started */
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    eventsServerClient.listenToEvent(key, 'Running', undefined, 'UiObject', onResponse, onRunning)

    onRunningCallBackFunction = callBackFunction

    function onResponse (message) {
      eventSubscriptionIdOnRunning = message.eventSubscriptionId
    }

    function onRunning () {
      if (thisObject.payload === undefined) { return }

      let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
      eventsServerClient.stopListening(key, eventSubscriptionIdOnRunning, 'UiObject')

      thisObject.isRunning = true

      if (callBackFunction !== undefined) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        onRunningCallBackFunctionWasCalled = true
      }
    }

    /*
    While it is running, it can happen that it naturally stops or is stopped not from the UI but from other means.
    In those cases, the stop function would never be called (from the UI). So what we will do is to call it from
    here with and event, and passing our own callBackFunction. In case there is an external source stopping this,
    this will produce an execution of the callback with our event, which will produce that the menu item is restored
    to its default stage.

    If on the other side, it is executed from the UI, then we will be processing the Stopped event twice, which in
    both cases will reset the menu item to its default state.
    */

    let event = {
      type: 'Secondary Action Already Executed'
    }
    stop(callBackFunction, event)
  }

  function setupErrorEventListener (callBackFunction) {
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    eventsServerClient.listenToEvent(key, 'Error', undefined, key, onResponse, onError)

    function onResponse (message) {
      eventSubscriptionIdOnError = message.eventSubscriptionId
    }

    function onError (message) {
      setErrorMessage(message.event.errorMessage, 10)

      let event = {
        type: 'Secondary Action Already Executed'
      }
      completeStop(callBackFunction, event)
    }
  }

  function stop (callBackFunction, event) {
    /* We will wait to the event that the execution was terminated in order to call back the menu item */
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    eventsServerClient.listenToEvent(key, 'Stopped', undefined, 'UiObject', onResponse, onStopped)

    function onResponse (message) {
      eventSubscriptionIdOnStopped = message.eventSubscriptionId
    }

    function onStopped () {
      completeStop(callBackFunction, event)
    }
  }

  function completeStop (callBackFunction, event) {
    if (thisObject.payload === undefined) { return }
    if (callBackFunction !== undefined) {
      callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, event)
    }

    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.finalize()
      thisObject.circularProgressBar = undefined
    }
    thisObject.isRunning = false
    hasValue = false
    hasPercentage = false
    hasStatus = false
    lastHeartBeat = undefined

    finalizeEventsServerClient()
  }

  function iconPhysics () {
    icon = canvas.designSpace.iconByUiObjectType.get(thisObject.payload.node.type)
    let nodeDefinition = getNodeDefinition(thisObject.payload.node)
    if (nodeDefinition.alternativeIcons !== undefined) {
      let nodeToUse = thisObject.payload.node
      if (nodeDefinition.alternativeIcons === 'Use Reference Parent') {
        if (thisObject.payload.node.payload.referenceParent !== undefined) {
          nodeToUse = thisObject.payload.node.payload.referenceParent
        }
      }
      if (nodeDefinition.alternativeIcons === 'Use Reference Grandparent') {
        if (thisObject.payload.node.payload.referenceParent !== undefined) {
          if (thisObject.payload.node.payload.referenceParent.payload !== undefined) {
            if (thisObject.payload.node.payload.referenceParent.payload.referenceParent !== undefined) {
              nodeToUse = thisObject.payload.node.payload.referenceParent.payload.referenceParent
            }
          }
        }
      }
      nodeDefinition = getNodeDefinition(nodeToUse)
      let config = nodeToUse.config
      try {
        config = JSON.parse(config)
        let alternativeIcon
        let iconName
        for (let i = 0; i < nodeDefinition.alternativeIcons.length; i++) {
          alternativeIcon = nodeDefinition.alternativeIcons[i]
          if (alternativeIcon.codeName === config.codeName) {
            iconName = alternativeIcon.iconName
          }
        }
        let newIcon = canvas.designSpace.iconCollection.get(iconName)
        if (newIcon !== undefined) {
          icon = newIcon
        }
      } catch (err) {
          // Nothing to do if JSON is baddly formated.
      }
    }

    executingIcon = canvas.designSpace.iconCollection.get('attractive')
  }

  function onFocus () {
    thisObject.isOnFocus = true

    if (thisObject.payload !== undefined && thisObject.isOnFocus === true && thisObject.payload.referenceParent !== undefined) {
      if (thisObject.payload.referenceParent.payload !== undefined) {
        if (thisObject.payload.referenceParent.payload.uiObject !== undefined) {
          thisObject.payload.referenceParent.payload.uiObject.isShowing = true
        }
      }
    }
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.deactivate()
    }
    if (thisObject.configEditor !== undefined) {
      thisObject.configEditor.deactivate()
    }
    if (thisObject.conditionEditor !== undefined) {
      thisObject.conditionEditor.deactivate()
    }
    if (thisObject.formulaEditor !== undefined) {
      thisObject.formulaEditor.deactivate()
    }

    if (thisObject.payload !== undefined &&
      thisObject.isOnFocus === false &&
      thisObject.payload.referenceParent !== undefined &&
      thisObject.payload.referenceParent.payload !== undefined &&
      thisObject.payload.referenceParent.payload.uiObject !== undefined) {
      thisObject.payload.referenceParent.payload.uiObject.isShowing = false
    }
  }

  function onDisplace (event) {
    thisObject.uiObjectTitle.exitEditMode()
  }

  function onDragStarted (event) {
    thisObject.uiObjectTitle.exitEditMode()
    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.deactivate()
    }
    if (thisObject.configEditor !== undefined) {
      thisObject.configEditor.deactivate()
    }
    if (thisObject.conditionEditor !== undefined) {
      thisObject.conditionEditor.deactivate()
    }
    if (thisObject.formulaEditor !== undefined) {
      thisObject.formulaEditor.deactivate()
    }
    isDragging = true
    if (event.button === 2) {
      rightDragging = true
    } else {
      rightDragging = false
    }

    previousDistanceToReferenceParent = undefined
    previousDistanceToChainParent = undefined
  }

  function onDragFinished (event) {
    if (isChainAttaching === true) {
      canvas.designSpace.workspace.chainAttachNode(thisObject.payload.node, chainAttachToNode)
      chainAttachToNode = undefined
      isChainAttaching = false
    }
    if (isReferenceAttaching === true) {
      canvas.designSpace.workspace.referenceAttachNode(thisObject.payload.node, referenceAttachToNode)
      referenceAttachToNode = undefined
      isReferenceAttaching = false
    }
    isDragging = false
  }

  function drawBackground () {
    if (thisObject.isOnFocus === false) {
      drawReferenceLine()
      drawChainLine()

      if (isDragging === false && thisObject.isOnFocus === true) {
        thisObject.menu.drawBackground()
      }
    }

    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.drawBackground()
    }
  }

  function drawMiddleground () {
    if (thisObject.isOnFocus === false) {
      drawValue()
      drawPercentage()
      drawStatus()
      drawText()
      thisObject.uiObjectTitle.draw()
    }
  }

  function drawForeground () {
    if (thisObject.isOnFocus === false) {
      drawBodyAndPicture()
      if (isDragging === false) {
        thisObject.menu.drawForeground()
      }
    }

    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.drawForeground()
    }
  }

  function drawOnFocus () {
    if (thisObject.isOnFocus === true) {
      drawReferenceLine()
      drawChainLine()

      if (thisObject.codeEditor !== undefined) {
        thisObject.codeEditor.drawBackground()
        thisObject.codeEditor.drawForeground()
      }
      if (thisObject.configEditor !== undefined) {
        thisObject.configEditor.drawBackground()
        thisObject.configEditor.drawForeground()
      }
      if (thisObject.conditionEditor !== undefined) {
        thisObject.conditionEditor.drawBackground()
        thisObject.conditionEditor.drawForeground()
      }
      if (thisObject.formulaEditor !== undefined) {
        thisObject.formulaEditor.drawBackground()
        thisObject.formulaEditor.drawForeground()
      }

      let drawMenu = true
      let drawTitle = true

      if (thisObject.codeEditor !== undefined) {
        if (thisObject.codeEditor.visible === true) {
          drawMenu = false
          drawTitle = false
        }
      }
      if (thisObject.configEditor !== undefined) {
        if (thisObject.configEditor.visible === true) {
          drawMenu = false
          drawTitle = false
        }
      }
      if (thisObject.conditionEditor !== undefined) {
        if (thisObject.conditionEditor.visible === true) {
          drawMenu = false
          drawTitle = false
        }
      }
      if (thisObject.formulaEditor !== undefined) {
        if (thisObject.formulaEditor.visible === true) {
          drawMenu = false
          drawTitle = false
        }
      }

      if (drawMenu === true) {
        drawBodyAndPicture()
        if (isDragging === false) {
          thisObject.menu.drawBackground()
          thisObject.menu.drawForeground()
        }
      }

      drawErrorMessage()
      drawValue()
      drawPercentage()
      drawStatus()
      drawText()

      if (drawTitle === true) {
        thisObject.uiObjectTitle.draw()
      }
    }
  }

  function drawChainLine () {
    if (canvas.floatingSpace.drawChainLines === false) { return }
    if (thisObject.payload.chainParent === undefined) { return }

    let targetPoint = {
      x: thisObject.payload.chainParent.payload.floatingObject.container.frame.position.x,
      y: thisObject.payload.chainParent.payload.floatingObject.container.frame.position.y
    }

    let position = {
      x: 0,
      y: 0
    }

    targetPoint = canvas.floatingSpace.container.frame.frameThisPoint(targetPoint)
    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      targetPoint = canvas.floatingSpace.transformPointToMap(targetPoint)
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    if (thisObject.container.frame.radius > 1) {
      let LINE_STYLE = UI_COLOR.TITANIUM_YELLOW
      if (thisObject.payload.floatingObject.angleToParent !== ANGLE_TO_PARENT.NOT_FIXED) {
        LINE_STYLE = UI_COLOR.GOLDEN_ORANGE
      }
      if (thisObject.payload.floatingObject.isFrozen === true) {
        LINE_STYLE = UI_COLOR.TURQUOISE
      }
      if (newUiObjectCounter > 0) {
        LINE_STYLE = UI_COLOR.GREY
      }

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([0, chainLineCounter, 2, 3, 0, 500 - chainLineCounter])
      browserCanvasContext.lineWidth = 2
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([3, 47])
      browserCanvasContext.lineWidth = 3
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([1, 9])
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (thisObject.container.frame.radius > 0.5) {
      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
      browserCanvasContext.fill()
    }
  }

  function drawReferenceLine () {
    if (canvas.floatingSpace.drawReferenceLines === false && thisObject.isOnFocus === false) { return }
    if (thisObject.payload.referenceParent === undefined) { return }
    if (thisObject.payload.referenceParent.payload === undefined) { return }
    if (thisObject.payload.referenceParent.payload.floatingObject === undefined) { return }
    if (thisObject.payload.referenceParent.payload.floatingObject.isParentCollapsed === true && thisObject.isOnFocus === false) { return }

    let targetPoint = {
      x: thisObject.payload.referenceParent.payload.position.x,
      y: thisObject.payload.referenceParent.payload.position.y
    }

    let position = {
      x: 0,
      y: 0
    }

    targetPoint = canvas.floatingSpace.container.frame.frameThisPoint(targetPoint)
    position = thisObject.container.frame.frameThisPoint(position)

    if (thisObject.isOnFocus === true) {
      targetPoint = thisObject.fitFunction(targetPoint)
    }

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
      targetPoint = canvas.floatingSpace.transformPointToMap(targetPoint)
    }

    let LINE_STYLE = UI_COLOR.GREY

    if (thisObject.container.frame.radius > 1) {
      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([1, 9])
      browserCanvasContext.lineWidth = 0.75
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([0, referenceLineCounter, 1, 9, 2, 8, 3, 7, 4, 6, 0, 500 - referenceLineCounter])
      browserCanvasContext.lineWidth = 4
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (thisObject.container.frame.radius > 0.5) {
      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
      browserCanvasContext.fill()
    }
  }

  function isEditorVisible () {
    if (thisObject.codeEditor !== undefined) {
      if (thisObject.codeEditor.visible === true) { return true }
    }

    if (thisObject.configEditor !== undefined) {
      if (thisObject.configEditor.visible === true) { return true }
    }

    if (thisObject.conditionEditor !== undefined) {
      if (thisObject.conditionEditor.visible === true) { return true }
    }

    if (thisObject.formulaEditor !== undefined) {
      if (thisObject.formulaEditor.visible === true) { return true }
    }
  }

  function drawText () {
    if (isEditorVisible() === true) { return }
/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 30

      label = thisObject.payload.subTitle
      label = addIndexNumber(label)

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 5,
          y: position.y + radius * 4 / 5 + fontSize * FONT_ASPECT_RATIO + 15
        }

        if (canvas.floatingSpace.inMapMode === true) {
          labelPoint.y = labelPoint.y - 20
          let nodeDefinition = getNodeDefinition(thisObject.payload.node)
          if (nodeDefinition !== undefined) {
            if (nodeDefinition.isHierarchyHead !== true) {
              return
            }
          }
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = thisObject.payload.floatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function drawErrorMessage () {
    if (hasError === false) { return }

/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius * 2.5
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize * 3 / 4
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 80

      label = errorMessage

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 5,
          y: position.y + radius * 2 / 5 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function drawValue () {
    if (currentValue === null) { return }
    if (hasValue === false) { return }
    if (canvas.floatingSpace.inMapMode === true) { return }
    if (thisObject.payload === undefined) { return }
    if ((thisObject.payload.floatingObject.isCollapsed === true && thisObject.payload.floatingObject.collapsedManually === false) || thisObject.payload.floatingObject.isParentCollapsed === true) { return }

    // if (currentValue === undefined || currentValue === '') { return }

/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius * 1.35
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize * 6 / 4
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 65

      label = currentValue
      if (!isNaN(currentValue)) {
        if (currentValue.toFixed !== undefined) {
          label = dynamicDecimals(currentValue)
        }
      }

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        if (label.length > 30) {
          fontSize = fontSize / 2
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 10,
          y: position.y + radius * 7 / 5 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function drawPercentage () {
    if (hasPercentage === false) { return }
    if (canvas.floatingSpace.inMapMode === true) { return }
    if (thisObject.payload === undefined) { return }
    if ((thisObject.payload.floatingObject.isCollapsed === true && thisObject.payload.floatingObject.collapsedManually === false) || thisObject.payload.floatingObject.isParentCollapsed === true) { return }

    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius * 1.75
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize * 6 / 4
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 65

      label = Number(currentPercentage).toFixed(0) + '%'

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 5,
          y: position.y + radius * 7 / 5 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function drawStatus () {
    if (hasStatus === false) { return }
    if (canvas.floatingSpace.inMapMode === true) { return }

    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius * 0.9
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize * 6 / 4 / 2
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 100

      label = currentStatus

      if (label !== undefined) {
        if (label.length > MAX_LABEL_LENGTH) {
          label = label.substring(0, MAX_LABEL_LENGTH) + '...'
        }

        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 10,
          y: position.y + radius * 7 / 5 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }

  function addIndexNumber (label) {
    switch (thisObject.payload.node.type) {
      case 'Phase': {
        let parent = thisObject.payload.parentNode
        if (parent !== undefined) {
          let granParent = parent.payload.parentNode
          if (granParent !== undefined) {
            if (granParent.type === 'Initial Definition') {
              return label + ' #' + 0
            }
          }
          for (let i = 0; i < parent.phases.length; i++) {
            let phase = parent.phases[i]
            if (phase.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
        }

        break
      }
      case 'Situation': {
        let parent = thisObject.payload.parentNode
        if (parent !== undefined) {
          for (let i = 0; i < parent.situations.length; i++) {
            let situation = parent.situations[i]
            if (situation.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
        }

        break
      }
      case 'Condition': {
        let parent = thisObject.payload.parentNode
        if (parent !== undefined) {
          for (let i = 0; i < parent.conditions.length; i++) {
            let condition = parent.conditions[i]
            if (condition.id === thisObject.payload.node.id) {
              label = label + ' #' + (i + 1)
              return label
            }
          }
        } else {
          return label
        }

        break
      }
      default: {
        return label
      }
    }
  }

  function drawBodyAndPicture () {
    let position = {
      x: thisObject.container.frame.position.x,
      y: thisObject.container.frame.position.y
    }

    position = thisObject.container.frame.frameThisPoint(position)

    if (thisObject.isShowing === true) {
      position = thisObject.fitFunction(position)
    }

    if (canvas.floatingSpace.inMapMode === true) {
      position = canvas.floatingSpace.transformPointToMap(position)
    }

    let radius = thisObject.container.frame.radius

    if (radius > 0.5) {
      let VISIBLE_RADIUS = 5

      let visiblePosition = {
        x: thisObject.container.frame.position.x,
        y: thisObject.container.frame.position.y
      }

      visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)

      if (canvas.floatingSpace.inMapMode === true) {
        visiblePosition = canvas.floatingSpace.transformPointToMap(visiblePosition)
        radius = canvas.floatingSpace.transformRadiusToMap(radius)
        VISIBLE_RADIUS = canvas.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
      } else {
        visiblePosition = thisObject.fitFunction(visiblePosition)
      }

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = thisObject.payload.floatingObject.fillStyle

      browserCanvasContext.fill()

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS - 2, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

      browserCanvasContext.fill()

      let nodeDefinition = getNodeDefinition(thisObject.payload.node)
      if (nodeDefinition !== undefined) {
        if (nodeDefinition.isHierarchyHead === true) {
          VISIBLE_RADIUS = thisObject.payload.floatingObject.currentHierarchyRing * 2.8
          if (canvas.floatingSpace.inMapMode === true) {
            VISIBLE_RADIUS = canvas.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
          }
          let OPACITY = 1

          browserCanvasContext.beginPath()
          browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
          browserCanvasContext.closePath()
          browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'
          browserCanvasContext.lineWidth = 10
          browserCanvasContext.setLineDash([4, 16])
          browserCanvasContext.stroke()

          browserCanvasContext.beginPath()
          browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
          browserCanvasContext.closePath()
          browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'
          browserCanvasContext.lineWidth = 1
          if (thisObject.payload.node.isIncluded === true) {
            browserCanvasContext.setLineDash([0, 0])
          } else {
            browserCanvasContext.setLineDash([20, 20])
          }
          browserCanvasContext.stroke()
        }
      }

      if (thisObject.isOnFocus === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius
        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS - 2, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 0.25)'

        browserCanvasContext.fill()
      }

      if (hasError === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 1
        let OPACITY = errorMessageCounter / 30

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([19, 20])
        browserCanvasContext.stroke()
      }

      if (isHighlighted === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 1
        let OPACITY = highlightCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([4, 20])
        browserCanvasContext.stroke()
      }

      if (isReadyToChainAttach === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2.5 + readyToChainAttachDisplayCounter - readyToChainAttachDisplayCounter / 2
        let OPACITY = readyToChainAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([10, 90])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 5
        browserCanvasContext.setLineDash([5, 45])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 1
        browserCanvasContext.setLineDash([2, 8])
        browserCanvasContext.stroke()
      }

      if (isAvailableToChainAttach === true && isReadyToChainAttach === false) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2.5
        let OPACITY = availableToChainAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([8, 32])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 2
        browserCanvasContext.setLineDash([3, 5])
        browserCanvasContext.stroke()
      }

      if (isReadyToReferenceAttach === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2.5 + readyToReferenceAttachDisplayCounter - readyToReferenceAttachDisplayCounter / 2
        let OPACITY = readyToReferenceAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([10, 90])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 5
        browserCanvasContext.setLineDash([5, 45])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 1
        browserCanvasContext.setLineDash([2, 8])
        browserCanvasContext.stroke()
      }

      if (isAvailableToReferenceAttach === true && isReadyToReferenceAttach === false) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2.5
        let OPACITY = availableToReferenceAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([8, 32])
        browserCanvasContext.stroke()

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + OPACITY + ')'
        browserCanvasContext.lineWidth = 2
        browserCanvasContext.setLineDash([3, 5])
        browserCanvasContext.stroke()
      }
    }

        /* Image */

    if (icon !== undefined) {
      if (icon.canDrawIcon === true) {
        let additionalImageSize = 0
        if (isRunningAtBackend === true || isReadyToReferenceAttach === true || isReadyToChainAttach === true) { additionalImageSize = 20 }
        let totalImageSize = additionalImageSize + thisObject.payload.floatingObject.currentImageSize
        if (canvas.floatingSpace.inMapMode === true) {
          totalImageSize = canvas.floatingSpace.transformImagesizeToMap(totalImageSize)
          let nodeDefinition = getNodeDefinition(thisObject.payload.node)
          if (nodeDefinition !== undefined) {
            if (nodeDefinition.isHierarchyHead !== true) {
              totalImageSize = totalImageSize / 4
            }
          }
        }

        if (thisObject.isShowing === true) {
          totalImageSize = 50
        }

        browserCanvasContext.drawImage(
          icon, position.x - totalImageSize / 2,
          position.y - totalImageSize / 2,
          totalImageSize,
          totalImageSize)
      }
    }

    if (executingIcon !== undefined) {
      if (executingIcon.canDrawIcon === true) {
        if (isRunningAtBackend === true) {
          const DISTANCE_FROM_CENTER = thisObject.container.frame.radius / 3 + 50
          const EXECUTING_ICON_SIZE = 20 + thisObject.container.frame.radius / 6

          browserCanvasContext.drawImage(
            executingIcon, position.x - EXECUTING_ICON_SIZE / 2,
            position.y - EXECUTING_ICON_SIZE / 2 - DISTANCE_FROM_CENTER,
            EXECUTING_ICON_SIZE,
            EXECUTING_ICON_SIZE)
        }
      }
    }
  }
}
