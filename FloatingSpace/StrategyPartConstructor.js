
function newStrategyPartConstructor () {
  const MODULE_NAME = 'Strategy Part Constructor'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    createStrategyPart: createStrategyPart,
    destroyStrategyPart: destroyStrategyPart,
    initialize: initialize,
    finalize: finalize
  }

  let floatingLayer

  return thisObject

  function finalize () {
    floatingLayer = undefined

    payload.uiObject.finalize()
    payload.uiObject = undefined
  }

  function initialize (pFloatingLayer) {
    floatingLayer = pFloatingLayer
  }

  function createStrategyPart (payload) {
    let floatingObject = newFloatingObject()
    floatingObject.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    floatingObject.container.connectToParent(canvas.floatingSpace.container, false, false, false, false, false, false, false, false)
    floatingObject.initialize('Strategy Part', payload)
    payload.floatingObject = floatingObject

    if (payload.node.savedPayload !== undefined) {
      position = {
        x: payload.node.savedPayload.position.x,
        y: payload.node.savedPayload.position.y
      }

      if (position.x === null) { position.x = spawnPosition.x }
      if (position.y === null) { position.y = spawnPosition.y }

      floatingObject.setPosition(position)
      payload.node.savedPayload.position = undefined
      if (payload.node.savedPayload.floatingObject.isPinned === true) {
        floatingObject.pinToggle()
      }
      if (payload.node.savedPayload.floatingObject.isFrozen === true) {
        floatingObject.freezeToggle()
      }
      if (payload.node.savedPayload.floatingObject.isCollapsed === true) {
        floatingObject.collapseToggle()
      }
      if (payload.node.savedPayload.floatingObject.isTensed === true) {
        floatingObject.tensionToggle()
      }
    }

    let strategyPart = newStrategyPart()
    payload.uiObject = strategyPart
    strategyPart.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    strategyPart.isVisibleFunction = canvas.floatingSpace.isThisPointVisible
    let menuItemsInitialValues = getMenuItemsInitialValues(strategyPart, floatingObject, payload)
    strategyPart.initialize(payload, menuItemsInitialValues)
    strategyPart.container.connectToParent(floatingObject.container, false, false, true, true, false, false, true, true, true, true, true)

    if (payload.node.savedPayload !== undefined) {
      if (payload.node.savedPayload.uiObject.isRunning === true) {
        strategyPart.setRunningStatus()
        canvas.strategySpace.workspace.tradingSystem = payload.node
      }
    }

    setFloatingObjectBasicProperties(floatingObject, payload)

    payload.node.savedPayload = undefined

    floatingLayer.addFloatingObject(floatingObject)

    return
  }

  function addLeftIcons (menuItemsInitialValues, floatingObject) {
    menuItemsInitialValues.push(
      {
        action: 'Pin / Unpin',
        actionFunction: floatingObject.pinToggle,
        actionStatus: floatingObject.getPinStatus,
        currentStatus: false,
        label: undefined,
        visible: false,
        iconPathOn: 'target',
        iconPathOff: 'security',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: -135
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Tense / Untense',
        actionFunction: floatingObject.tensionToggle,
        actionStatus: floatingObject.getTensionStatus,
        currentStatus: true,
        label: undefined,
        visible: false,
        iconPathOn: 'compass',
        iconPathOff: 'headphones',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: -165
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Freeze / Unfreeze',
        actionFunction: floatingObject.freezeToggle,
        actionStatus: floatingObject.getFreezeStatus,
        currentStatus: true,
        label: undefined,
        visible: false,
        iconPathOn: 'broken-link',
        iconPathOff: 'targeting',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: 165
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Collapse / Uncollapse',
        actionFunction: floatingObject.collapseToggle,
        actionStatus: floatingObject.getCollapeseStatus,
        currentStatus: false,
        label: undefined,
        visible: false,
        iconPathOn: 'tap',
        iconPathOff: 'layout',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: 135
      }
      )
  }

  function getMenuItemsInitialValues (strategyPart, floatingObject, payload) {
    let menuItemsInitialValues = []
    switch (payload.node.type) {
      case 'Workspace': {
        floatingObject.isPinned = true
        floatingObject.positionLocked = true
        menuItemsInitialValues = [
          {
            action: 'Pin / Unpin',
            actionFunction: floatingObject.pinToggle,
            actionStatus: floatingObject.getPinStatus,
            currentStatus: true,
            label: undefined,
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'security',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -135
          },
          {
            action: 'Download Workspace',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }]
        break
      }
      case 'Definition': {
        floatingObject.isPinned = true
        floatingObject.positionLocked = true
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Trading System',
            actionFunction: payload.uiObject.run,
            label: 'Run',
            visible: false,
            iconPathOn: 'paper-plane',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -70
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Save Trading System',
            actionFunction: payload.onMenuItemClick,
            label: 'Save Changes',
            workingLabel: 'Saving...',
            workDoneLabel: 'Saved',
            workFailedLabel: 'Not Saved',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Definition',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Definition',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -10
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Trading System',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Trading System',
            visible: false,
            iconPathOn: 'approve',
            iconPathOff: 'approve',
            relatedStrategyPart: 'Trading System',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 10
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Personal Data',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Personal Data',
            visible: false,
            iconPathOn: 'approve',
            iconPathOff: 'approve',
            relatedStrategyPart: 'Personal Data',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 70
          }
        )
        break
      }
      case 'Personal Data': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Personal Data',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Personal Data',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -30
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Exchange Account',
            visible: false,
            iconPathOn: 'approve',
            iconPathOff: 'approve',
            relatedStrategyPart: 'Exchange Account',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: +0
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 30
          }
        )
        break
      }
      case 'Exchange Account': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Exchange Account',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Account',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account Asset',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Asset',
            visible: false,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            relatedStrategyPart: 'Exchange Account Asset',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account Key',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Key',
            visible: false,
            iconPathOn: 'login',
            iconPathOff: 'login',
            relatedStrategyPart: 'Exchange Account Key',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
        )
        break
      }
      case 'Exchange Account Asset': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Exchange Account Asset',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Asset',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        break
      }
      case 'Exchange Account Key': {
        strategyPart.codeEditor = newCodeEditor()
        strategyPart.codeEditor.isVisibleFunction = strategyPart.isVisibleFunction
        strategyPart.codeEditor.initialize()
        strategyPart.codeEditor.container.connectToParent(strategyPart.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Key Value',
            actionFunction: strategyPart.codeEditor.activate,
            label: 'Edit Key Value',
            visible: false,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40,
            dontShowAtFullscreen: true
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Exchange Account Key',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Key',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Trading System': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Trading System',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Trading System',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Strategy',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Strategy',
            visible: false,
            iconPathOn: 'quality',
            iconPathOff: 'quality',
            relatedStrategyPart: 'Strategy',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: false,
            iconPathOn: 'quality',
            iconPathOff: 'quality',
            relatedStrategyPart: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
        )
        break
      }
      case 'Parameters': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Parameters',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Parameters',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Missing Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Params',
            visible: false,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Base Asset': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Base Asset',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Base Asset',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: false,
            iconPathOn: 'pipette',
            iconPathOff: 'pipette',
            relatedStrategyPart: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Strategy': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Missing Stages',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Stages',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Strategy',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Strategy',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Trigger Stage': {
        menuItemsInitialValues = [
          {
            action: 'Pin / Unpin',
            actionFunction: floatingObject.pinToggle,
            actionStatus: floatingObject.getPinStatus,
            currentStatus: false,
            label: undefined,
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'security',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -135
          },
          {
            action: 'Tense / Untense',
            actionFunction: floatingObject.tensionToggle,
            actionStatus: floatingObject.getTensionStatus,
            currentStatus: false,
            label: undefined,
            visible: false,
            iconPathOn: 'compass',
            iconPathOff: 'headphones',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 180
          },
          {
            action: 'Freeze / Unfreeze',
            actionFunction: floatingObject.freezeToggle,
            actionStatus: floatingObject.getFreezeStatus,
            currentStatus: true,
            label: undefined,
            visible: false,
            iconPathOn: 'targeting',
            iconPathOff: 'broken-link',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 135
          },
          {
            action: 'Add Missing Events',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Events',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          },
          {
            action: 'Delete Trigger Stage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Stage',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          },
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }]
        break
      }
      case 'Open Stage': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Initial Definition',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Initial Definition',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Open Execution',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Open Execution',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Open Stage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Stage',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
        )
        break
      }
      case 'Manage Stage': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Missing Items',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Items',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Manage Stage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Stage',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Close Stage': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Close Execution',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Close Execution',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Close Stage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Stage',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Position Size': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Position Size',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Position Size',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: false,
            iconPathOn: 'pipette',
            iconPathOff: 'pipette',
            relatedStrategyPart: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Position Rate': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Position Rate',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Position Rate',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: false,
            iconPathOn: 'pipette',
            iconPathOff: 'pipette',
            relatedStrategyPart: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Trigger On Event': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Situation',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Situation',
            visible: false,
            iconPathOn: 'pyramid',
            iconPathOff: 'pyramid',
            relatedStrategyPart: 'Situation',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Event',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Event',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Trigger Off Event': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Situation',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Situation',
            visible: false,
            iconPathOn: 'pyramid',
            iconPathOff: 'pyramid',
            relatedStrategyPart: 'Situation',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Event',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Event',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Take Position Event': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Situation',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Situation',
            visible: false,
            iconPathOn: 'pyramid',
            iconPathOff: 'pyramid',
            relatedStrategyPart: 'Situation',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Event',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Event',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Initial Definition': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Missing Items',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Items',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Initial Definition',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Definition',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Open Execution': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Open Execution',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        break
      }
      case 'Close Execution': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Delete Close Execution',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        break
      }
      case 'Stop': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Phase',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Phase',
            visible: false,
            iconPathOn: 'placeholder',
            iconPathOff: 'placeholder',
            relatedStrategyPart: 'Phase',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Managed Item',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Item',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Take Profit': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Phase',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Phase',
            visible: false,
            iconPathOn: 'placeholder',
            iconPathOff: 'placeholder',
            relatedStrategyPart: 'Phase',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Managed Item',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Item',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Phase': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: false,
            iconPathOn: 'pipette',
            iconPathOff: 'pipette',
            relatedStrategyPart: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Next Phase Event',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Next Phase Event',
            visible: false,
            iconPathOn: 'pipette',
            iconPathOff: 'pipette',
            relatedStrategyPart: 'Next Phase Event',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Phase',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Phase',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
        )
        break
      }
      case 'Formula': {
        strategyPart.codeEditor = newCodeEditor()
        strategyPart.codeEditor.isVisibleFunction = strategyPart.isVisibleFunction
        strategyPart.codeEditor.initialize()
        strategyPart.codeEditor.container.connectToParent(strategyPart.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Formula',
            actionFunction: strategyPart.codeEditor.activate,
            label: 'Edit Formula',
            visible: false,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40,
            dontShowAtFullscreen: true
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Formula',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Formula',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Next Phase Event': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Situation',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Situation',
            visible: false,
            iconPathOn: 'pyramid',
            iconPathOff: 'pyramid',
            relatedStrategyPart: 'Situation',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Event',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Event',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Situation': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Condition',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Condition',
            visible: false,
            iconPathOn: 'testing',
            iconPathOff: 'testing',
            relatedStrategyPart: 'Condition',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Situation',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Situation',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Condition': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Code',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Code',
            visible: false,
            iconPathOn: 'html',
            iconPathOff: 'html',
            relatedStrategyPart: 'Code',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Condition',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Condition',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Code': {
        strategyPart.codeEditor = newCodeEditor()
        strategyPart.codeEditor.isVisibleFunction = strategyPart.isVisibleFunction
        strategyPart.codeEditor.initialize()
        strategyPart.codeEditor.container.connectToParent(strategyPart.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Code',
            actionFunction: strategyPart.codeEditor.activate,
            label: 'Edit Code',
            visible: false,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40,
            dontShowAtFullscreen: true
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Code',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Code',
            visible: false,
            iconPathOn: 'trash',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Download',
            actionFunction: payload.onMenuItemClick,
            label: 'Download',
            visible: false,
            iconPathOn: 'upload',
            iconPathOff: 'upload',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      default: {
        if (ERROR_LOG === true) { logger.write('[ERROR] getMenuItemsInitialValues -> Part Type not Recognized -> type = ' + payload.node.type) }
      }
    }

    return menuItemsInitialValues
  }

  function setFloatingObjectBasicProperties (floatingObject, payload) {
    const FRICTION = 0.95
    const INITIAL_FRICTION = 0.97

    switch (payload.node.type) {
      case 'Workspace': {
        level_0()
        break
      }
      case 'Definition': {
        level_0()
        break
      }
      case 'Exchange Account': {
        level_1()
        break
      }
      case 'Exchange Account Asset': {
        level_3()
        break
      }
      case 'Exchange Account Key': {
        level_3()
        break
      }
      case 'Personal Data': {
        level_1()
        break
      }
      case 'Trading System': {
        level_1()
        break
      }
      case 'Parameters': {
        level_3()
        break
      }
      case 'Base Asset': {
        level_3()
        break
      }
      case 'Strategy': {
        level_1()
        break
      }
      case 'Trigger Stage': {
        level_2()
        break
      }
      case 'Open Stage': {
        level_2()
        break
      }
      case 'Manage Stage': {
        level_2()
        break
      }
      case 'Close Stage': {
        level_2()
        break
      }
      case 'Position Size': {
        level_3()
        break
      }
      case 'Position Rate': {
        level_3()
        break
      }
      case 'Trigger On Event': {
        level_3()
        break
      }
      case 'Trigger Off Event': {
        level_3()
        break
      }
      case 'Take Position Event': {
        level_3()
        break
      }
      case 'Initial Definition': {
        level_3()
        break
      }
      case 'Open Execution': {
        level_3()
        break
      }
      case 'Close Execution': {
        level_3()
        break
      }
      case 'Stop': {
        level_3()
        break
      }
      case 'Take Profit': {
        level_3()
        break
      }
      case 'Phase': {
        level_2()
        break
      }
      case 'Formula': {
        level_5()
        break
      }
      case 'Next Phase Event': {
        level_4()
        break
      }
      case 'Situation': {
        level_4()
        break
      }
      case 'Condition': {
        level_5()
        break
      }
      case 'Code': {
        level_5()
        break
      }
      default: {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + payload.node.type) }
        return
      }
    }

    function level_0 () {
      floatingObject.targetFriction = 0.93
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(500)
      floatingObject.initializeRadius(45)
      floatingObject.initializeImageSize(80)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    }

    function level_1 () {
      floatingObject.targetFriction = 0.94
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(600)
      floatingObject.initializeRadius(45)
      floatingObject.initializeImageSize(80)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

      if (payload.node.savedPayload === undefined) {
        floatingObject.tensionToggle()
      }
    }

    function level_2 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(300)
      floatingObject.initializeRadius(40)
      floatingObject.initializeImageSize(70)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'

      if (payload.node.savedPayload === undefined) {
        floatingObject.tensionToggle()
      }
    }

    function level_3 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(150)
      floatingObject.initializeRadius(35)
      floatingObject.initializeImageSize(60)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'

      if (payload.node.savedPayload === undefined) {
        floatingObject.tensionToggle()
      }
    }

    function level_4 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(75)
      floatingObject.initializeRadius(30)
      floatingObject.initializeImageSize(50)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'

      if (payload.node.savedPayload === undefined) {
        floatingObject.tensionToggle()
      }
    }

    function level_5 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(50)
      floatingObject.initializeRadius(25)
      floatingObject.initializeImageSize(40)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
    }
    function level_6 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(25)
      floatingObject.initializeRadius(20)
      floatingObject.initializeImageSize(30)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
    }

    floatingObject.labelStrokeStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
  }

  function destroyStrategyPart (payload) {
    floatingLayer.removeFloatingObject(payload.floatingObject.handle)

    payload.floatingObject.finalize()
    payload.floatingObject = undefined

    payload.uiObject.finalize()
    payload.uiObject = undefined
  }
}
