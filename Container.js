
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
    connectToParent: connectToParent
  }

  let connectedToParentWidth = false
  let connectedToParentHeight = false

  return thisObject

  function initialize (pName) {
    thisObject.name = pName

    thisObject.frame = newFrame()
    thisObject.frame.initialize()
    thisObject.frame.containerName = pName
    thisObject.frame.container = thisObject

    thisObject.eventHandler = newEventHandler()
    thisObject.eventHandler.initialize()
    thisObject.eventHandler.name = pName

    thisObject.displacement = newDisplacement()
    thisObject.displacement.container = thisObject
    thisObject.displacement.containerName = pName
  }

  function connectToParent (parentContainer, onWidth, onHeight) {
    connectedToParentWidth = onWidth
    connectedToParentHeight = onHeight

    thisObject.displacement.parentDisplacement = parentContainer.displacement
    thisObject.frame.parentFrame = parentContainer.frame
    thisObject.parentContainer = parentContainer
    thisObject.parentContainer.eventHandler.listenToEvent('Dimmensions Changed', onParentDimmensionsChanged)

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
}
