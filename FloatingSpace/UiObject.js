
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
    uiObjectTitle: undefined,
    circularProgressBar: undefined,
    isExecuting: undefined,
    isRunning: undefined,
    shortcutKey: undefined,
    run: run,
    stop: stop,
    getReadyToChainAttach: getReadyToChainAttach,
    showAvailabilityToChainAttach: showAvailabilityToChainAttach,
    getReadyToReferenceAttach: getReadyToReferenceAttach,
    showAvailabilityToReferenceAttach: showAvailabilityToReferenceAttach,
    highlight: highlight,
    setErrorMessage: setErrorMessage,
    setValue: setValue,
    physics: physics,
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
  let selfNotFocuskEventSubscriptionId
  let selfDisplaceEventSubscriptionId
  let selfDragStartedEventSubscriptionId
  let selfDragFinishedEventSubscriptionId

  let isHighlighted
  let highlightCounter = 0

  let hasError
  let errorMessageCounter = 0

  let hasValue
  let valueCounter = 0

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
  let rightDragging = false

  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
    thisObject.container.eventHandler.stopListening(selfNotFocuskEventSubscriptionId)
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

    icon = undefined
    chainAttachToNode = undefined
    referenceAttachToNode = undefined
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
    thisObject.uiObjectTitle.initialize(thisObject.payload)

/* Load UI Object Image */

    iconPhysics()

    selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
    selfNotFocuskEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
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

      container = thisObject.uiObjectTitle.getContainer(point)
      if (container !== undefined) { return container }

      container = thisObject.menu.getContainer(point)
      if (container !== undefined) { return container }
    }

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {
    thisObject.menu.physics()
    thisObject.uiObjectTitle.physics()

    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.physics()
    }

    if (thisObject.payload.chainParent === undefined || thisObject.payload.chainParent.payload === undefined) {
      thisObject.payload.targetPosition.x = thisObject.payload.position.x,
      thisObject.payload.targetPosition.y = thisObject.payload.position.y
    } else {
      thisObject.payload.targetPosition.x = thisObject.payload.chainParent.payload.position.x
      thisObject.payload.targetPosition.y = thisObject.payload.chainParent.payload.position.y
    }

    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.physics()
    }

    iconPhysics()
    highlightPhisycs()
    errorMessagePhisycs()
    valuePhisycs()
    chainDetachingPhysics()
    chainAttachingPhysics()
    referenceDetachingPhysics()
    referenceAttachingPhysics()
  }

  function chainAttachingPhysics () {
    chainAttacchingCounters()

    if (thisObject.isOnFocus !== true) { return }
    if (isDragging !== true) { return }
    if (rightDragging !== true) { return }
    if (thisObject.payload.chainParent !== undefined) { return }

    let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
    let compatibleType
    let compatibleSubType
    switch (thisObject.payload.node.type) {
      case 'Sensor Bot':
        compatibleType = '->' + 'Team' + '->'
        compatibleSubType = undefined
        break
      case 'Indicator Bot':
        compatibleType = '->' + 'Team' + '->'
        compatibleSubType = undefined
        break
      case 'Trading Bot':
        compatibleType = '->' + 'Team' + '->'
        compatibleSubType = undefined
        break
      case 'Process Definition':
        compatibleType = '->' + 'Sensor Bot' + '->' + 'Indicator Bot' + '->' + 'Trading Bot' + '->'
        compatibleSubType = undefined
        break
      case 'Calculations Procedure':
        compatibleType = '->' + 'Process Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Data Building Procedure':
        compatibleType = '->' + 'Process Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Procedure Initialization':
        compatibleType = '->' + 'Calculations Procedure' + '->' + 'Data Building Procedure' + '->'
        compatibleSubType = undefined
        break
      case 'Procedure Loop':
        compatibleType = '->' + 'Calculations Procedure' + '->' + 'Data Building Procedure' + '->'
        compatibleSubType = undefined
        break
      case 'Output Dataset':
        compatibleType = '->' + 'Process Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Status Dependency':
        compatibleType = '->' + 'Process Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Data Dependency':
        compatibleType = '->' + 'Process Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Product Definition':
        compatibleType = '->' + 'Sensor Bot' + '->' + 'Indicator Bot' + '->' + 'Trading Bot' + '->'
        compatibleSubType = undefined
        break
      case 'Record Definition':
        compatibleType = '->' + 'Product Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Record Property':
        compatibleType = '->' + 'Record Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Dataset Definition':
        compatibleType = '->' + 'Product Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Plotter':
        compatibleType = '->' + 'Team' + '->'
        compatibleSubType = undefined
        break
      case 'Plotter Module':
        compatibleType = '->' + 'Plotter' + '->'
        compatibleSubType = undefined
        break
      case 'Plotter Panel':
        compatibleType = '->' + 'Plotter Module' + '->'
        compatibleSubType = undefined
        break
      case 'Trading System':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Personal Data':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Network Node':
        compatibleType = '->' + 'Network' + '->'
        compatibleSubType = undefined
        break
      case 'Exchange Account':
        compatibleType = '->' + 'Personal Data' + '->'
        compatibleSubType = undefined
        break
      case 'Exchange Account Asset':
        compatibleType = '->' + 'Exchange Account' + '->'
        compatibleSubType = undefined
        break
      case 'Exchange Account Key':
        compatibleType = '->' + 'Exchange Account' + '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Parameters':
        compatibleType = '->' + 'Trading System' + '->' + 'Backtesting Session' + '->' + 'Live Trading Session' + '->' + 'Paper Trading Session' + '->' + 'Fordward Testing Session' + '->'
        compatibleSubType = '->' + 'Trading Process Instance' + '->'
        break
      case 'Backtesting Session':
        compatibleType = '->' + 'Process Instance' + '->'
        compatibleSubType = '->' + 'Trading Process Instance' + '->'
        break
      case 'Live Trading Session':
        compatibleType = '->' + 'Process Instance' + '->'
        compatibleSubType = '->' + 'Trading Process Instance' + '->'
        break
      case 'Paper Trading Session':
        compatibleType = '->' + 'Process Instance' + '->'
        compatibleSubType = '->' + 'Trading Process Instance' + '->'
        break
      case 'Fordward Testing Session':
        compatibleType = '->' + 'Process Instance' + '->'
        compatibleSubType = '->' + 'Trading Process Instance' + '->'
        break
      case 'Base Asset':
        compatibleType = '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Time Range':
        compatibleType = '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Time Period':
        compatibleType = '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Slippage':
        compatibleType = '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Fee Structure':
        compatibleType = '->' + 'Parameters' + '->'
        compatibleSubType = undefined
        break
      case 'Layer Manager':
        compatibleType = '->' + 'Backtesting Session' + '->' + 'Live Trading Session' + '->' + 'Paper Trading Session' + '->' + 'Fordward Testing Session' + '->'
        compatibleSubType = undefined
        break
      case 'Layer':
        compatibleType = '->' + 'Layer Manager' + '->'
        compatibleSubType = undefined
        break
      case 'Social Bots':
        compatibleType = '->' + 'Backtesting Session' + '->' + 'Live Trading Session' + '->' + 'Paper Trading Session' + '->' + 'Fordward Testing Session' + '->'
        compatibleSubType = undefined
        break
      case 'Telegram Bot':
        compatibleType = '->' + 'Social Bots' + '->'
        compatibleSubType = undefined
        break
      case 'Announcement':
        compatibleType = '->' + 'Telegram Bot' + '->' + 'Trigger On Event' + '->' + 'Trigger Off Event' + '->' + 'Take Position Event' + '->' + 'Next Phase Event' + '->' + '->' + 'Phase' + '->'
        compatibleSubType = undefined
        break
      case 'Task Manager':
        compatibleType = '->' + 'Network Node' + '->'
        compatibleSubType = undefined
        break
      case 'Task':
        compatibleType = '->' + 'Task Manager' + '->'
        compatibleSubType = undefined
        break
      case 'Sensor Bot Instance':
        compatibleType = '->' + 'Task' + '->'
        compatibleSubType = undefined
        break
      case 'Indicator Bot Instance':
        compatibleType = '->' + 'Task' + '->'
        compatibleSubType = undefined
        break
      case 'Trading Bot Instance':
        compatibleType = '->' + 'Task' + '->'
        compatibleSubType = undefined
        break
      case 'Process Instance':
        switch (thisObject.payload.node.subType) {
          case 'Sensor Process Instance': {
            compatibleType = '->' + 'Sensor Bot Instance' + '->'
            break
          }
          case 'Indicator Process Instance': {
            compatibleType = '->' + 'Indicator Bot Instance' + '->'
            break
          }
          case 'Trading Process Instance': {
            compatibleType = '->' + 'Trading Bot Instance' + '->'
            break
          }
        }
        compatibleSubType = undefined
        break
      case 'Strategy':
        compatibleType = '->' + 'Trading System' + '->'
        compatibleSubType = undefined
        break
      case 'Trigger Stage':
        compatibleType = '->' + 'Strategy' + '->'
        compatibleSubType = undefined
        break
      case 'Open Stage':
        compatibleType = '->' + 'Strategy' + '->'
        compatibleSubType = undefined
        break
      case 'Manage Stage':
        compatibleType = '->' + 'Strategy' + '->'
        compatibleSubType = undefined
        break
      case 'Close Stage':
        compatibleType = '->' + 'Strategy' + '->'
        compatibleSubType = undefined
        break
      case 'Position Size':
        compatibleType = '->' + 'Initial Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Position Rate':
        compatibleType = '->' + 'Initial Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Take Position Event':
        compatibleType = '->' + 'Trigger Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Trigger Off Event':
        compatibleType = '->' + 'Trigger Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Trigger On Event':
        compatibleType = '->' + 'Trigger Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Initial Definition':
        compatibleType = '->' + 'Open Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Open Execution':
        compatibleType = '->' + 'Open Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Close Execution':
        compatibleType = '->' + 'Close Stage' + '->'
        compatibleSubType = undefined
        break
      case 'Stop':
        compatibleType = '->' + 'Manage Stage' + '->' + 'Initial Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Take Profit':
        compatibleType = '->' + 'Manage Stage' + '->' + 'Initial Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Phase':
        compatibleType = '->' + 'Stop' + '->' + 'Take Profit' + '->' + 'Phase' + '->'
        compatibleSubType = undefined
        break
      case 'Formula':
        compatibleType = '->' + 'Position Size' + '->' + 'Position Rate' + '->' + 'Phase' + '->' + 'Announcement' + '->'
        compatibleSubType = undefined
        break
      case 'Next Phase Event':
        compatibleType = '->' + 'Phase' + '->'
        compatibleSubType = undefined
        break
      case 'Situation':
        compatibleType = '->' + 'Take Position Event' + '->' + 'Trigger On Event' + '->' + 'Trigger Off Event' + '->' + 'Next Phase Event' + '->'
        compatibleSubType = undefined
        break
      case 'Condition':
        compatibleType = '->' + 'Situation' + '->'
        compatibleSubType = undefined
        break
      case 'Code':
        compatibleType = '->' + 'Condition' + '->'
        compatibleSubType = undefined
        break
      default:
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
      if (compatibleType.indexOf('->' + nearbyNode.type + '->') >= 0) {
        /* Discard objects with busy coonection ports */
        if (thisObject.payload.node.type === 'Calculations Procedure' && nearbyNode.calculations !== undefined) { continue }
        if (thisObject.payload.node.type === 'Data Building Procedure' && nearbyNode.dataBuilding !== undefined) { continue }
        if (thisObject.payload.node.type === 'Procedure Initialization' && nearbyNode.initialization !== undefined) { continue }
        if (thisObject.payload.node.type === 'Procedure Loop' && nearbyNode.loop !== undefined) { continue }
        if (thisObject.payload.node.type === 'Record Definition' && nearbyNode.record !== undefined) { continue }
        if (thisObject.payload.node.type === 'Task' && nearbyNode.task !== undefined) { continue }
        if (thisObject.payload.node.type === 'Sensor Bot Instance' && nearbyNode.bot !== undefined) { continue }
        if (thisObject.payload.node.type === 'Indicator Bot Instance' && nearbyNode.bot !== undefined) { continue }
        if (thisObject.payload.node.type === 'Trading Bot Instance' && nearbyNode.bot !== undefined) { continue }
        if (thisObject.payload.node.type === 'Process Instance' && nearbyNode.process !== undefined) { continue }
        if (thisObject.payload.node.type === 'Trading System' && nearbyNode.tradingSystem !== undefined) { continue }
        if (thisObject.payload.node.type === 'Personal Data' && nearbyNode.personalData !== undefined) { continue }
        if (thisObject.payload.node.type === 'Parameters' && nearbyNode.parameters !== undefined) { continue }
        if (thisObject.payload.node.type === 'Backtesting Session' && nearbyNode.session !== undefined) { continue }
        if (thisObject.payload.node.type === 'Live Trading Session' && nearbyNode.session !== undefined) { continue }
        if (thisObject.payload.node.type === 'Fordward Testing Session' && nearbyNode.session !== undefined) { continue }
        if (thisObject.payload.node.type === 'Paper Trading Session' && nearbyNode.session !== undefined) { continue }
        if (thisObject.payload.node.type === 'Base Asset' && nearbyNode.baseAsset !== undefined) { continue }
        if (thisObject.payload.node.type === 'Time Range' && nearbyNode.timeRange !== undefined) { continue }
        if (thisObject.payload.node.type === 'Time Period' && nearbyNode.timePeriod !== undefined) { continue }
        if (thisObject.payload.node.type === 'Slippage' && nearbyNode.slippage !== undefined) { continue }
        if (thisObject.payload.node.type === 'Fee Structure' && nearbyNode.feeStructure !== undefined) { continue }
        if (thisObject.payload.node.type === 'Trigger Stage' && nearbyNode.triggerStage !== undefined) { continue }
        if (thisObject.payload.node.type === 'Open Stage' && nearbyNode.openStage !== undefined) { continue }
        if (thisObject.payload.node.type === 'Manage Stage' && nearbyNode.manageStage !== undefined) { continue }
        if (thisObject.payload.node.type === 'Close Stage' && nearbyNode.closeStage !== undefined) { continue }
        if (thisObject.payload.node.type === 'Position Size' && nearbyNode.positionSize !== undefined) { continue }
        if (thisObject.payload.node.type === 'Position Rate' && nearbyNode.positionRate !== undefined) { continue }
        if (thisObject.payload.node.type === 'Take Position Event' && nearbyNode.takePosition !== undefined) { continue }
        if (thisObject.payload.node.type === 'Trigger Off Event' && nearbyNode.triggerOff !== undefined) { continue }
        if (thisObject.payload.node.type === 'Trigger On Event' && nearbyNode.triggerOn !== undefined) { continue }
        if (thisObject.payload.node.type === 'Initial Definition' && nearbyNode.initialDefinition !== undefined) { continue }
        if (thisObject.payload.node.type === 'Open Execution' && nearbyNode.openExecution !== undefined) { continue }
        if (thisObject.payload.node.type === 'Close Execution' && nearbyNode.closeExecution !== undefined) { continue }
        if (thisObject.payload.node.type === 'Stop' && nearbyNode.stopLoss !== undefined) { continue }
        if (thisObject.payload.node.type === 'Take Profit' && nearbyNode.takeProfit !== undefined) { continue }
        if (thisObject.payload.node.type === 'Formula' && nearbyNode.formula !== undefined) { continue }
        if (thisObject.payload.node.type === 'Next Phase Event' && nearbyNode.nextPhaseEvent !== undefined) { continue }
        if (thisObject.payload.node.type === 'Code' && nearbyNode.code !== undefined) { continue }
        /* Here we check if the subtypes are compatible. */
        if (nearbyNode.subType !== undefined && compatibleSubType !== undefined) {
          if (compatibleSubType.indexOf('->' + nearbyNode.subType + '->') < 0) {
            continue
          }
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
        canvas.designerSpace.workspace.chainDetachNode(thisObject.payload.node)
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
    let compatibleType
    let compatibleSubType
    switch (thisObject.payload.node.type) {
      case 'Backtesting Session':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Live Trading Session':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Paper Trading Session':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      case 'Fordward Testing Session':
        compatibleType = '->' + 'Definition' + '->'
        compatibleSubType = undefined
        break
      default:
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
      if (compatibleType.indexOf('->' + nearbyNode.type + '->') >= 0) {
        /* Here we check if the subtypes are compatible. */
        if (nearbyNode.subType !== undefined && compatibleSubType !== undefined) {
          if (compatibleSubType.indexOf('->' + nearbyNode.subType + '->') < 0) {
            continue
          }
        }

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
        canvas.designerSpace.workspace.referenceDetachNode(thisObject.payload.node)
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

  function highlight () {
    isHighlighted = true
    highlightCounter = 30
  }

  function setErrorMessage (message) {
    if (message !== undefined) {
      errorMessage = message
      hasError = true
      errorMessageCounter = 100
    }
  }

  function setValue (value) {
    if (value !== undefined) {
      currentValue = value
      hasValue = true
      valueCounter = 500
    }
  }

  function run (callBackFunction) {
    /* We setup the circular progress bar. */
    if (thisObject.circularProgressBar !== undefined) {
      thisObject.circularProgressBar.finalize()
    }

    thisObject.circularProgressBar = newCircularProgressBar()
    thisObject.circularProgressBar.initialize(thisObject.payload)
    thisObject.circularProgressBar.fitFunction = thisObject.fitFunction
    thisObject.circularProgressBar.container = thisObject.container

    /* We will wait to the event that the execution was terminated in order to call back the menu item */
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    systemEventHandler.listenToEvent(key, 'Running', undefined, key, undefined, onRunning)

    function onRunning () {
      if (callBackFunction !== undefined) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
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

    thisObject.isRunning = true
  }

  function stop (callBackFunction, event) {
    /* We will wait to the event that the execution was terminated in order to call back the menu item */
    let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
    systemEventHandler.listenToEvent(key, 'Stopped', undefined, key, undefined, onStopped)

    function onStopped () {
      if (callBackFunction !== undefined) {
        callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, event)
      }

      if (thisObject.circularProgressBar !== undefined) {
        thisObject.circularProgressBar.finalize()
        thisObject.circularProgressBar = undefined
      }
      thisObject.isRunning = false
    }
  }

  function iconPhysics () {
    icon = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.type)
    executingIcon = canvas.designerSpace.iconCollection.get('attractive')
  }

  function onFocus () {
    thisObject.isOnFocus = true
  }

  function onNotFocus () {
    thisObject.isOnFocus = false
    if (thisObject.codeEditor !== undefined) {
      thisObject.codeEditor.deactivate()
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
      canvas.designerSpace.workspace.chainAttachNode(thisObject.payload.node, chainAttachToNode)
      chainAttachToNode = undefined
      isChainAttaching = false
    }
    if (isReferenceAttaching === true) {
      canvas.designerSpace.workspace.referenceAttachNode(thisObject.payload.node, referenceAttachToNode)
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

      if (thisObject.codeEditor !== undefined) {
        if (thisObject.codeEditor.visible === false) {
          drawBodyAndPicture()
          if (isDragging === false) {
            thisObject.menu.drawBackground()
            thisObject.menu.drawForeground()
          }
        }
      } else {
        drawBodyAndPicture()
        if (isDragging === false) {
          thisObject.menu.drawBackground()
          thisObject.menu.drawForeground()
        }
      }

      drawErrorMessage()
      drawValue()
      drawText()
      thisObject.uiObjectTitle.draw()
    }
  }

  function drawChainLine () {
    if (thisObject.payload.chainParent === undefined) { return }

    let targetPoint = {
      x: thisObject.payload.targetPosition.x,
      y: thisObject.payload.targetPosition.y
    }

    let position = {
      x: 0,
      y: 0
    }

    targetPoint = canvas.floatingSpace.container.frame.frameThisPoint(targetPoint)
    position = thisObject.container.frame.frameThisPoint(position)

    if (thisObject.container.frame.radius > 1) {
            /* Target Line */

      let LINE_STYLE = UI_COLOR.TITANIUM_YELLOW
      if (thisObject.payload.floatingObject.isTensed === true) {
        LINE_STYLE = UI_COLOR.GOLDEN_ORANGE
      }
      if (thisObject.payload.floatingObject.isFrozen === true) {
        LINE_STYLE = UI_COLOR.TURQUOISE
      }

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([3, 4])
      browserCanvasContext.lineWidth = 2
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (thisObject.container.frame.radius > 0.5) {
            /* Target Spot */

      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
      browserCanvasContext.fill()
    }
  }

  function drawReferenceLine () {
    if (thisObject.payload.referenceParent === undefined) { return }

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

    if (thisObject.container.frame.radius > 1) {
            /* Target Line */

      let LINE_STYLE = UI_COLOR.GREY

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(position.x, position.y)
      browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
      browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
      browserCanvasContext.setLineDash([2, 20])
      browserCanvasContext.lineWidth = 2
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (thisObject.container.frame.radius > 0.5) {
            /* Target Spot */

      let radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
      browserCanvasContext.fill()
    }
  }

  function drawText () {
/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

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

    let radius = thisObject.container.frame.radius * 3.5
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
    if (hasValue === false) { return }

/* Text Follows */
    let position = {
      x: 0,
      y: 0
    }

    position = thisObject.container.frame.frameThisPoint(position)

    let radius = thisObject.container.frame.radius * 1.5
            /* Label Text */
    let labelPoint
    let fontSize = thisObject.payload.floatingObject.currentFontSize * 6 / 4
    let label

    if (radius > 6) {
      const MAX_LABEL_LENGTH = 30

      label = currentValue
      if (!isNaN(label)) {
        label = currentValue.toFixed(2)
      }

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

    let radius = thisObject.container.frame.radius

    if (radius > 0.5) {
      let VISIBLE_RADIUS = 5

      let visiblePosition = {
        x: thisObject.container.frame.position.x,
        y: thisObject.container.frame.position.y
      }

      visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)
      visiblePosition = thisObject.fitFunction(visiblePosition)

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

      if (thisObject.payload.node.type === 'Definition' || thisObject.payload.node.type === 'Network' || thisObject.payload.node.type === 'Team') {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2
        let OPACITY = 1

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([4, 20])
        browserCanvasContext.stroke()
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
        let OPACITY = highlightCounter / 30

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([4, 20])
        browserCanvasContext.stroke()
      }

      if (isReadyToChainAttach === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2 + readyToChainAttachDisplayCounter * 2
        let OPACITY = readyToChainAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([readyToChainAttachDisplayCounter, readyToChainAttachDisplayCounter * 2])
        browserCanvasContext.stroke()
      }

      if (isAvailableToChainAttach === true && isReadyToChainAttach === false) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 1.5
        let OPACITY = availableToChainAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([8, 20])
        browserCanvasContext.stroke()
      }

      if (isReadyToReferenceAttach === true) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 2 + readyToReferenceAttachDisplayCounter * 2
        let OPACITY = readyToReferenceAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([readyToReferenceAttachDisplayCounter, readyToReferenceAttachDisplayCounter * 2])
        browserCanvasContext.stroke()
      }

      if (isAvailableToReferenceAttach === true && isReadyToReferenceAttach === false) {
        VISIBLE_RADIUS = thisObject.container.frame.radius * 1.5
        let OPACITY = availableToReferenceAttachCounter / 10

        browserCanvasContext.beginPath()
        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + OPACITY + ')'

        browserCanvasContext.lineWidth = 10
        browserCanvasContext.setLineDash([8, 20])
        browserCanvasContext.stroke()
      }
    }

        /* Image */

    if (icon !== undefined) {
      if (icon.canDrawIcon === true) {
        let additionalImageSize = 0
        if (thisObject.isExecuting === true) { additionalImageSize = 20 }
        let totalImageSize = additionalImageSize + thisObject.payload.floatingObject.currentImageSize

        browserCanvasContext.drawImage(
          icon, position.x - totalImageSize / 2,
          position.y - totalImageSize / 2,
          totalImageSize,
          totalImageSize)
      }
    }

    if (executingIcon !== undefined) {
      if (executingIcon.canDrawIcon === true) {
        if (thisObject.isExecuting === true) {
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
