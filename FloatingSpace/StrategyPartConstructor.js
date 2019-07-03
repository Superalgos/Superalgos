
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
      case 'Trading System': {
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
            angle: 180
          },
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
            angle: 135
          },
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
          },
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
          },
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
            angle: -10
          },
          {
            action: 'New Strategy',
            actionFunction: payload.onMenuItemClick,
            label: 'New Strategy',
            visible: false,
            iconPathOn: 'quality',
            iconPathOff: 'quality',
            relatedStrategyPart: 'Strategy',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: +10
          },
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
            angle: 40
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
            angle: 70
          }]
        break
      }
      case 'Parameters': {
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
          },
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
      case 'Base Asset': {
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
          },
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
      case 'Strategy': {
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
          },
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
            angle: -60
          },
          {
            action: 'Add Position Size',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Position Size',
            visible: false,
            iconPathOn: 'responsive',
            iconPathOff: 'responsive',
            relatedStrategyPart: 'Position Size',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
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
            angle: 20
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
            angle: 60
          }]
        break
      }
      case 'Open Stage': {
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
            action: 'Add Initial Definition',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Initial Definition',
            visible: false,
            iconPathOn: 'target',
            iconPathOff: 'trash',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          },
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
      case 'Manage Stage': {
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
          },
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
      case 'Close Stage': {
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
            angle: -20
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
            angle: 20
          }]
        break
      }
      case 'Position Size': {
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
            action: 'Delete Position Size',
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
            angle: -40
          },
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
      case 'Trigger On Event': {
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
          },
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
      case 'Trigger Off Event': {
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
          },
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
      case 'Take Position Event': {
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
          },
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
      case 'Initial Definition': {
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
          },
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
      case 'Stop': {
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
          },
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
      case 'Take Profit': {
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
          },
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
      case 'Phase': {
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
          },
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
          },
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
            angle: 60
          }]
        break
      }
      case 'Formula': {
        strategyPart.codeEditor = newCodeEditor()
        strategyPart.codeEditor.isVisibleFunction = strategyPart.isVisibleFunction
        strategyPart.codeEditor.initialize()
        strategyPart.codeEditor.container.connectToParent(strategyPart.container, false, false, true, true, false, false, false, false)

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
          },
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
      case 'Next Phase Event': {
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
          },
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
      case 'Situation': {
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
          },
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
      case 'Condition': {
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
          },
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
      case 'Code': {
        strategyPart.codeEditor = newCodeEditor()
        strategyPart.codeEditor.isVisibleFunction = strategyPart.isVisibleFunction
        strategyPart.codeEditor.initialize()
        strategyPart.codeEditor.container.connectToParent(strategyPart.container, false, false, true, true, false, false, false, false)

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
          },
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
      case 'Trading System': {
        level_0()
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

      floatingObject.initializeMass(400)
      floatingObject.initializeRadius(45)
      floatingObject.initializeImageSize(80)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    }

    function level_1 () {
      floatingObject.targetFriction = 0.94
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(200)
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

      floatingObject.initializeMass(100)
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

      floatingObject.initializeMass(50)
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

      floatingObject.initializeMass(20)
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

      floatingObject.initializeMass(20)
      floatingObject.initializeRadius(25)
      floatingObject.initializeImageSize(40)
      floatingObject.initializeFontSize(10)

      floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
    }
    function level_6 () {
      floatingObject.targetFriction = FRICTION
      floatingObject.friction = INITIAL_FRICTION

      floatingObject.initializeMass(20)
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

