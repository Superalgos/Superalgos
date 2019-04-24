
function newContainer () {
  let thisObject = {
    frame: undefined,
    displacement: undefined,
    eventHandler: undefined,
    parentContainer: undefined,
    isDraggeable: true,
    isClickeable: false,
    isWheelable: false,
    name: undefined,
    initialize: initialize,
    finalize: finalize,
    connectToParent: connectToParent,
    isForThisPurpose: isForThisPurpose
  }

  let connectedToParentWidth = false
  let connectedToParentHeight = false
  let isConnectedToParent = false

  return thisObject

  function finalize () {
    if (isConnectedToParent === true) {
      thisObject.parentContainer.eventHandler.stopListening('Dimmensions Changed', onParentDimmensionsChanged)
      thisObject.parentContainer.eventHandler.stopListening('onMouseOver', onMouseOver)
      thisObject.parentContainer.eventHandler.stopListening('onMouseNotOver', onMouseNotOver)
    }
  }

  function initialize (pName) {
    thisObject.name = pName

    thisObject.frame = newFrame()
    thisObject.frame.initialize()
    thisObject.frame.containerName = pName
    thisObject.frame.container = thisObject

    thisObject.eventHandler = newEventHandler()
    thisObject.eventHandler.name = pName

    thisObject.displacement = newDisplacement()
    thisObject.displacement.container = thisObject
    thisObject.displacement.containerName = pName
  }

  function connectToParent (parentContainer, onWidth, onHeight) {
    connectedToParentWidth = onWidth
    connectedToParentHeight = onHeight
    isConnectedToParent = true

    thisObject.displacement.parentDisplacement = parentContainer.displacement
    thisObject.frame.parentFrame = parentContainer.frame
    thisObject.parentContainer = parentContainer
    thisObject.parentContainer.eventHandler.listenToEvent('Dimmensions Changed', onParentDimmensionsChanged)
    thisObject.parentContainer.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    thisObject.parentContainer.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)

    if (connectedToParentWidth) {
      thisObject.frame.width = thisObject.parentContainer.frame.width
    }
    if (connectedToParentHeight) {
      thisObject.frame.height = thisObject.parentContainer.frame.height
    }
  }

  function onParentDimmensionsChanged (event) {
    let dimmensionsChanged = false
    if (connectedToParentWidth) {
      thisObject.frame.width = thisObject.parentContainer.frame.width
      dimmensionsChanged = true
    }
    if (connectedToParentHeight) {
      thisObject.frame.height = thisObject.parentContainer.frame.height
      dimmensionsChanged = true
    }

    if (dimmensionsChanged) {
      thisObject.eventHandler.raiseEvent('Dimmensions Changed', event)
    }
  }

  function onMouseOver (event) {
    thisObject.eventHandler.raiseEvent('onMouseOver', event)
  }

  function onMouseNotOver (event) {
    thisObject.eventHandler.raiseEvent('onMouseNotOver', event)
  }

  function isForThisPurpose (purpose) {
    if (purpose !== undefined) {
      switch (purpose) {
        case GET_CONTAINER_PURPOSE.MOUSE_OVER:
          if (thisObject.detectMouseOver === true) {
            return true
          }
          break
        case GET_CONTAINER_PURPOSE.MOUSE_WHEEL:
          if (thisObject.isWheelable === true) {
            return true
          }
          break
        case GET_CONTAINER_PURPOSE.MOUSE_CLICK:
          if (thisObject.isClickeable === true) {
            return true
          }
          break
        default: { return false }

      }
    }
    return false
  }
}
