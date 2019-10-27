
function newUiObjectConstructor () {
  const MODULE_NAME = 'UI Object Constructor'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    createUiObject: createUiObject,
    destroyUiObject: destroyUiObject,
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

  function createUiObject (payload) {
    let floatingObject = newFloatingObject()
    floatingObject.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    floatingObject.container.connectToParent(canvas.floatingSpace.container, false, false, false, false, false, false, false, false)
    floatingObject.initialize('UI Object', payload)
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

    let uiObject = newUiObject()
    payload.uiObject = uiObject
    uiObject.fitFunction = canvas.floatingSpace.fitIntoVisibleArea
    uiObject.isVisibleFunction = canvas.floatingSpace.isThisPointVisible
    let menuItemsInitialValues = getMenuItemsInitialValues(uiObject, floatingObject, payload)
    uiObject.initialize(payload, menuItemsInitialValues)
    uiObject.container.connectToParent(floatingObject.container, false, false, true, true, false, false, true, true, true, true, true)

    setFloatingObjectBasicProperties(floatingObject, payload)

    if (payload.node.savedPayload !== undefined) {
      if (payload.node.savedPayload.uiObject !== undefined) {
        payload.uiObject.shortcutKey = payload.node.savedPayload.uiObject.shortcutKey
      }
    }
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
        visible: true,
        iconPathOn: 'menu-fix-pinned',
        iconPathOff: 'menu-fix-unpinned',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: -130
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Tense / Untense',
        actionFunction: floatingObject.tensionToggle,
        actionStatus: floatingObject.getTensionStatus,
        currentStatus: true,
        label: undefined,
        visible: true,
        iconPathOn: 'menu-tensor-fixed-angles',
        iconPathOff: 'menu-tensor-free-angles',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: -155
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Freeze / Unfreeze',
        actionFunction: floatingObject.freezeToggle,
        actionStatus: floatingObject.getFreezeStatus,
        currentStatus: true,
        label: undefined,
        visible: true,
        iconPathOn: 'menu-mobility-unfreeze',
        iconPathOff: 'menu-mobility-freeze',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: 180
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Collapse / Uncollapse',
        actionFunction: floatingObject.collapseToggle,
        actionStatus: floatingObject.getCollapseStatus,
        currentStatus: false,
        label: undefined,
        visible: true,
        iconPathOn: 'menu-tree-plus',
        iconPathOff: 'menu-tree-minus',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: 155
      }
      )
    menuItemsInitialValues.push(
      {
        action: 'Backup',
        actionFunction: floatingObject.payload.onMenuItemClick,
        label: undefined,
        visible: true,
        iconPathOn: 'menu-backup',
        iconPathOff: 'menu-backup',
        rawRadius: 8,
        targetRadius: 0,
        currentRadius: 0,
        angle: 130
      }
      )
  }

  function getMenuItemsInitialValues (uiObject, floatingObject, payload) {
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
            visible: true,
            iconPathOn: 'menu-fix-unpinned',
            iconPathOff: 'menu-fix-pinned',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -135
          },
          {
            action: 'Backup Workspace',
            actionFunction: payload.onMenuItemClick,
            label: undefined,
            visible: true,
            iconPathOn: 'menu-backup',
            iconPathOff: 'menu-backup',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 130
          },
          {
            action: 'Add Definition',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Definition',
            visible: true,
            relatedUiObject: 'Definition',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -10
          },
          {
            action: 'Share Workspace',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 10
          }]
        break
      }
      case 'Definition': {
        floatingObject.isPinned = true
        floatingObject.positionLocked = true
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Trading System',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Trading System',
            visible: true,
            relatedUiObject: 'Trading System',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Personal Data',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Personal Data',
            visible: true,
            relatedUiObject: 'Personal Data',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Add Network',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Network',
            visible: true,
            relatedUiObject: 'Network',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
                )
        menuItemsInitialValues.push(
          {
            action: 'Delete Definition',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Definition',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Network': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Network Node',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Network Node',
            visible: true,
            relatedUiObject: 'Network Node',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
                )
        menuItemsInitialValues.push(
          {
            action: 'Delete Network',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Network',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Network Node': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Task Manager',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Task Manager',
            visible: true,
            relatedUiObject: 'Task Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Network Node',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Network Node',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Social Bots': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Telegram Bot',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Telegram Bot',
            visible: true,
            relatedUiObject: 'Telegram Bot',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Social Bots',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Social Bots',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        break
      }
      case 'Telegram Bot': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Announcement',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Announcement',
            visible: true,
            relatedUiObject: 'Announcement',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Edit Telegram Bot',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Telegram Bot',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20,
            dontShowAtFullscreen: true
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Social Bot',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Telegram Bot',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
                )
        break
      }
      case 'Announcement': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: true,
            relatedUiObject: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
        )
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Announcement',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Announcement',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20,
            dontShowAtFullscreen: true
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Announcement',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Announcement',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
                )
        break
      }
      case 'Layer Manager': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Layer',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Layer',
            visible: true,
            relatedUiObject: 'Layer',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Layer Manager',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Layer Manager',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        break
      }
      case 'Layer': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Layer',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Layer',
            visible: true,
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
            action: 'Delete Layer',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Layer',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
                )
        break
      }
      case 'Task Manager': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run All Tasks',
            actionFunction: payload.onMenuItemClick,
            label: 'Run All Tasks',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Stop All Tasks',
            actionFunction: payload.onMenuItemClick,
            label: 'Stop All Tasks',
            visible: true,
            iconPathOn: 'stop',
            iconPathOff: 'stop',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Task',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Task',
            visible: true,
            relatedUiObject: 'Task Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Task Manager',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Task Manager',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
            )
        break
      }
      case 'Task': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Task',
            actionFunction: payload.onMenuItemClick,
            label: 'Run',
            workingLabel: 'Stop',
            workDoneLabel: 'Task Running',
            workFailedLabel: 'Task Cannot be Run',
            secondaryAction: 'Stop Task',
            secondaryLabel: 'Stop',
            secondaryWorkingLabel: 'Stopping...',
            secondaryWorkDoneLabel: 'Task Stopped',
            secondaryWorkFailedLabel: 'Task Cannot be Stopped',
            secondaryIcon: 'stop',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -75
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Sensor Bot Instance',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Sensor Bot Instance',
            visible: true,
            relatedUiObject: 'Sensor Bot Instance',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -35
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Indicator Bot Instance',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Indicator Bot Instance',
            visible: true,
            relatedUiObject: 'Indicator Bot Instance',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -12
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Trading Bot Instance',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Trading Bot Instance',
            visible: true,
            relatedUiObject: 'Trading Bot Instance',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 12
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Task',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Task',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: +35
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 75
          }
                )
        break
      }
      case 'Sensor Bot Instance': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Process',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Process',
            visible: true,
            relatedUiObject: 'Process',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -45
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Edit Sensor Bot Instance',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Sensor Bot Instance',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -15,
            dontShowAtFullscreen: true
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Sensor Bot Instance',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Sensor Bot Instance',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 15
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 45
          }
                    )
        break
      }
      case 'Indicator Bot Instance': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Process',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Process',
            visible: true,
            relatedUiObject: 'Process',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -45
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Edit Indicator Bot Instance',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Indicator Bot Instance',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -15,
            dontShowAtFullscreen: true
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Indicator Bot Instance',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Indicator Bot Instance',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 15
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 45
          }
            )
        break
      }
      case 'Trading Bot Instance': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Process',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Process',
            visible: true,
            relatedUiObject: 'Process',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -45
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Edit Trading Bot Instance',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Trading Bot Instance',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -15,
            dontShowAtFullscreen: true
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Trading Bot Instance',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Trading Bot Instance',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 15
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 45
          }
          )
        break
      }
      case 'Process': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)

        switch (payload.node.subType) {
          case 'Trading Engine Process': {
            menuItemsInitialValues.push(
              {
                action: 'Add Backtesting Session',
                actionFunction: payload.onMenuItemClick,
                label: 'Add Backtesting',
                visible: true,
                relatedUiObject: 'Backtesting Session',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: -75
              }
              )
            menuItemsInitialValues.push(
              {
                action: 'Add Live Trading Session',
                actionFunction: payload.onMenuItemClick,
                label: 'Add Live Trading',
                visible: true,
                relatedUiObject: 'Live Trading Session',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: -40
              }
                )
            menuItemsInitialValues.push(
              {
                action: 'Add Fordward Testing Session',
                actionFunction: payload.onMenuItemClick,
                label: 'Add Fordward Testing',
                visible: true,
                relatedUiObject: 'Fordward Testing Session',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: -20
              }
                  )
            menuItemsInitialValues.push(
              {
                action: 'Add Paper Trading Session',
                actionFunction: payload.onMenuItemClick,
                label: 'Add Paper Trading',
                visible: true,
                relatedUiObject: 'Paper Trading Session',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 0
              }
                    )
            menuItemsInitialValues.push(
              {
                action: 'Edit Process',
                actionFunction: uiObject.codeEditor.activate,
                label: 'Edit Process',
                visible: true,
                iconPathOn: 'html',
                iconPathOff: 'html',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 20,
                dontShowAtFullscreen: true
              }
            )
            menuItemsInitialValues.push(
              {
                action: 'Delete Process',
                askConfirmation: true,
                confirmationLabel: 'Confirm to Delete',
                actionFunction: payload.onMenuItemClick,
                label: 'Delete Process',
                visible: true,
                iconPathOn: 'delete',
                iconPathOff: 'delete',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 40
              }
                )
            menuItemsInitialValues.push(
              {
                action: 'Share',
                actionFunction: payload.onMenuItemClick,
                label: 'Share',
                visible: true,
                iconPathOn: 'menu-share',
                iconPathOff: 'menu-share',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 75
              }
                  )
            break
          }
          default: {
            menuItemsInitialValues.push(
              {
                action: 'Edit Process',
                actionFunction: uiObject.codeEditor.activate,
                label: 'Edit Process',
                visible: true,
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
                action: 'Delete Process',
                askConfirmation: true,
                confirmationLabel: 'Confirm to Delete',
                actionFunction: payload.onMenuItemClick,
                label: 'Delete Process',
                visible: true,
                iconPathOn: 'delete',
                iconPathOff: 'delete',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 0
              }
                )
            menuItemsInitialValues.push(
              {
                action: 'Share',
                actionFunction: payload.onMenuItemClick,
                label: 'Share',
                visible: true,
                iconPathOn: 'menu-share',
                iconPathOff: 'menu-share',
                rawRadius: 8,
                targetRadius: 0,
                currentRadius: 0,
                angle: 40
              }
                  )
            break
          }
        }
        break
      }
      case 'Backtesting Session': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Session',
            actionFunction: payload.onMenuItemClick,
            label: 'Run',
            workingLabel: 'Run Request Sent',
            workDoneLabel: 'Session Running',
            workFailedLabel: 'Session Cannot be Run',
            secondaryAction: 'Stop Session',
            secondaryLabel: 'Stop',
            secondaryWorkingLabel: 'Stopping...',
            secondaryWorkDoneLabel: 'Session Stopped',
            secondaryWorkFailedLabel: 'Session Cannot be Stopped',
            secondaryIcon: 'stop',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -75
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Layer Manager',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Layer Manager',
            visible: true,
            relatedUiObject: 'Layer Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Add Social Bots',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Social Bots',
            visible: true,
            relatedUiObject: 'Social Bots',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Edit Session',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Session',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20,
            dontShowAtFullscreen: true
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Backtesting Session',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Session',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 75
          }
          )
        break
      }
      case 'Live Trading Session': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Session',
            actionFunction: payload.onMenuItemClick,
            label: 'Run',
            workingLabel: 'Run Request Sent',
            workDoneLabel: 'Session Running',
            workFailedLabel: 'Session Cannot be Run',
            secondaryAction: 'Stop Session',
            secondaryLabel: 'Stop',
            secondaryWorkingLabel: 'Stopping...',
            secondaryWorkDoneLabel: 'Session Stopped',
            secondaryWorkFailedLabel: 'Session Cannot be Stopped',
            secondaryIcon: 'stop',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -75
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Layer Manager',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Layer Manager',
            visible: true,
            relatedUiObject: 'Layer Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Add Social Bots',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Social Bots',
            visible: true,
            relatedUiObject: 'Social Bots',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
                )
        menuItemsInitialValues.push(
          {
            action: 'Edit Session',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Session',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20,
            dontShowAtFullscreen: true
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Live Trading Session',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Session',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 75
          }
                )
        break
      }
      case 'Fordward Testing Session': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Session',
            actionFunction: payload.onMenuItemClick,
            label: 'Run',
            workingLabel: 'Run Request Sent',
            workDoneLabel: 'Session Running',
            workFailedLabel: 'Session Cannot be Run',
            secondaryAction: 'Stop Session',
            secondaryLabel: 'Stop',
            secondaryWorkingLabel: 'Stopping...',
            secondaryWorkDoneLabel: 'Session Stopped',
            secondaryWorkFailedLabel: 'Session Cannot be Stopped',
            secondaryIcon: 'stop',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -75
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Layer Manager',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Layer Manager',
            visible: true,
            relatedUiObject: 'Layer Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Add Social Bots',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Social Bots',
            visible: true,
            relatedUiObject: 'Social Bots',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
                )
        menuItemsInitialValues.push(
          {
            action: 'Edit Session',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Session',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20,
            dontShowAtFullscreen: true
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Fordward Testing Session',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Session',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 75
          }
                )
        break
      }
      case 'Paper Trading Session': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Run Session',
            actionFunction: payload.onMenuItemClick,
            label: 'Run',
            workingLabel: 'Run Request Sent',
            workDoneLabel: 'Session Running',
            workFailedLabel: 'Session Cannot be Run',
            secondaryAction: 'Stop Session',
            secondaryLabel: 'Stop',
            secondaryWorkingLabel: 'Stopping...',
            secondaryWorkDoneLabel: 'Session Stopped',
            secondaryWorkFailedLabel: 'Session Cannot be Stopped',
            secondaryIcon: 'stop',
            visible: true,
            iconPathOn: 'paper-plane',
            iconPathOff: 'paper-plane',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -75
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Add Layer Manager',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Layer Manager',
            visible: true,
            relatedUiObject: 'Layer Manager',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
              )
        menuItemsInitialValues.push(
          {
            action: 'Add Social Bots',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Social Bots',
            visible: true,
            relatedUiObject: 'Social Bots',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
                )
        menuItemsInitialValues.push(
          {
            action: 'Edit Session',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Session',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20,
            dontShowAtFullscreen: true
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Paper Trading Session',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Session',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 75
          }
                )
        break
      }
      case 'Personal Data': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Exchange Account',
            visible: true,
            relatedUiObject: 'Exchange Account',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Personal Data',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Personal Data',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: +20
          }
            )
        break
      }
      case 'Exchange Account': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account Asset',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Asset',
            visible: true,
            relatedUiObject: 'Exchange Account Asset',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Exchange Account Key',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Key',
            visible: true,
            relatedUiObject: 'Exchange Account Key',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Delete Exchange Account',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Account',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
          )
        break
      }
      case 'Exchange Account Key': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Key Value',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Key Value',
            visible: true,
            iconPathOn: 'html',
            iconPathOff: 'html',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20,
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
          )
        break
      }
      case 'Trading System': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Strategy',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Strategy',
            visible: true,
            relatedUiObject: 'Strategy',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Add Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Parameters',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
          )
        menuItemsInitialValues.push(
          {
            action: 'Delete Trading System',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Trading System',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
            )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            action: 'Add Missing Parameters',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Params',
            visible: true,
            relatedUiObject: 'Parameters',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Parameters',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Parameters',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Base Asset': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Base Asset',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Base Asset',
            visible: true,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Base Asset',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Base Asset',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Time Range': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Time Range',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Time Range',
            visible: true,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Time Range',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Time Range',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Time Period': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Time Period',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Time Period',
            visible: true,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Time Period',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Time Period',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Slippage': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Slippage',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Slippage',
            visible: true,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Slippage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Slippage',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Fee Structure': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Fee Structure',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Fee Structure',
            visible: true,
            iconPathOn: 'settings',
            iconPathOff: 'settings',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Fee Structure',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Fee Structure',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Strategy',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Trigger Stage': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Missing Events',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Missing Events',
            visible: true,
            relatedUiObject: 'Trigger Stage',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Trigger Stage',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete This Stage',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Open Stage': {
        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Add Initial Definition',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Initial Definition',
            visible: true,
            relatedUiObject: 'Initial Definition',
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
            visible: true,
            relatedUiObject: 'Open Execution',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Manage Stage',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Close Execution',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: true,
            relatedUiObject: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Position Size',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Position Size',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            action: 'Add Formula',
            actionFunction: payload.onMenuItemClick,
            label: 'Add Formula',
            visible: true,
            relatedUiObject: 'Formula',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -40
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Delete Position Rate',
            askConfirmation: true,
            confirmationLabel: 'Confirm to Delete',
            actionFunction: payload.onMenuItemClick,
            label: 'Delete Position Rate',
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Situation',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Situation',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Situation',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Initial Definition',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Phase',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Phase',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Formula',
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
            visible: true,
            relatedUiObject: 'Next Phase Event',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          }
        )
        break
      }
      case 'Formula': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Formula',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Formula',
            visible: true,
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Situation',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Condition',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
            visible: true,
            relatedUiObject: 'Code',
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 40
          }
        )
        break
      }
      case 'Code': {
        uiObject.codeEditor = newCodeEditor()
        uiObject.codeEditor.isVisibleFunction = uiObject.isVisibleFunction
        uiObject.codeEditor.initialize()
        uiObject.codeEditor.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)

        addLeftIcons(menuItemsInitialValues, floatingObject)
        menuItemsInitialValues.push(
          {
            action: 'Edit Code',
            actionFunction: uiObject.codeEditor.activate,
            label: 'Edit Code',
            visible: true,
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
            visible: true,
            iconPathOn: 'delete',
            iconPathOff: 'delete',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 0
          }
        )
        menuItemsInitialValues.push(
          {
            action: 'Share',
            actionFunction: payload.onMenuItemClick,
            label: 'Share',
            visible: true,
            iconPathOn: 'menu-share',
            iconPathOff: 'menu-share',
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
      case 'Network': {
        level_1()
        break
      }
      case 'Network Node': {
        level_1()
        break
      }
      case 'Social Bots': {
        level_3()
        break
      }
      case 'Telegram Bot': {
        level_2()
        break
      }
      case 'Announcement': {
        level_4()
        break
      }
      case 'Layer Manager': {
        level_3()
        break
      }
      case 'Layer': {
        level_4()
        break
      }
      case 'Task Manager': {
        level_1()
        break
      }
      case 'Task': {
        level_3()
        break
      }
      case 'Sensor Bot Instance': {
        level_3()
        break
      }
      case 'Indicator Bot Instance': {
        level_3()
        break
      }
      case 'Trading Bot Instance': {
        level_3()
        break
      }
      case 'Process': {
        level_2()
        break
      }
      case 'Backtesting Session': {
        level_2()
        break
      }
      case 'Live Trading Session': {
        level_2()
        break
      }
      case 'Fordward Testing Session': {
        level_2()
        break
      }
      case 'Paper Trading Session': {
        level_2()
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
      case 'Time Range': {
        level_3()
        break
      }
      case 'Time Period': {
        level_3()
        break
      }
      case 'Slippage': {
        level_3()
        break
      }
      case 'Fee Structure': {
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
        // floatingObject.tensionToggle()
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
        // floatingObject.tensionToggle()
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
        // floatingObject.tensionToggle()
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
        // floatingObject.tensionToggle()
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

  function destroyUiObject (payload) {
    floatingLayer.removeFloatingObject(payload.floatingObject.handle)

    payload.floatingObject.finalize()
    payload.floatingObject = undefined

    payload.uiObject.finalize()
    payload.uiObject = undefined
  }
}
