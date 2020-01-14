function newProductsPanel () {
  let thisObject = {
    name: 'Layers Panel',
    fitFunction: undefined,
    container: undefined,
    layers: [],
    payload: undefined,
    getLoadingLayers: getLoadingLayers,
    physics: physics,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize()
  thisObject.container.isDraggeable = true
  thisObject.container.isWheelable = true

  let isInitialized = false

  let layersMap = new Map()
  let visibleLayers = []
  let firstVisibleLayer = 1

  const LAYER_SEPARATION = 5
  let panelTabButton

  let onMouseWheelEventSuscriptionId
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSuscriptionId)

    panelTabButton = undefined
    layersMap = undefined
    visibleLayers = undefined

    thisObject.container.finalize()
    thisObject.container = undefined

    thisObject.payload = undefined
    thisObject = undefined
  }

  function initialize () {
    thisObject.container.name = thisObject.payload.node.name
    thisObject.container.frame.containerName = thisObject.container.name
    thisObject.container.frame.width = UI_PANEL.WIDTH.MEDIUM
    thisObject.container.frame.height = UI_PANEL.HEIGHT.LARGE   // viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y // UI_PANEL.HEIGHT.LARGE;

    let position = {
      x: viewPort.visibleArea.topLeft.x,
      y: viewPort.visibleArea.topLeft.y// viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height
    }

    thisObject.container.frame.position = position

    panelTabButton = newPanelTabButton()
    panelTabButton.parentContainer = thisObject.container
    panelTabButton.container.frame.parentFrame = thisObject.container.frame
    panelTabButton.fitFunction = thisObject.fitFunction
    panelTabButton.initialize()

    onMouseWheelEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    isInitialized = true
  }

  function removeLayer (id) {
    let layer = layersMap.get(id)
    layersMap.delete(id)
    layer.turnOff()
    layer.container.eventHandler.stopListening(layer.onLayerStatusChangedEventSuscriptionId)
    layer.container.eventHandler.stopListening(layer.onMouseWheelEventSuscriptionId)
    layer.finalize()
  }

  function addLayer (layerNode) {
    /* Now we create Product objects */
    let layer = newLayer()
    layer.payload = layerNode.payload
    layer.fitFunction = thisObject.fitFunction

    /* Initialize it */
    layer.initialize()
    layersMap.set(layerNode.id, layer)

    /* Container Stuff */
    layer.container.frame.parentFrame = thisObject.container.frame
    layer.container.parentContainer = thisObject.container
    layer.container.isWheelable = true

    /* Positioning within thisObject Panel */
    let position = {
      x: 0,
      y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
    }

    layer.container.frame.position.x = position.x
    layer.container.frame.position.y = position.y + layer.container.frame.height * thisObject.layers.length + LAYER_SEPARATION

    /* Add to the Product Array */
    thisObject.layers.push(layer)

    /* Add to Visible Product Array */
    if (layer.container.frame.position.y + layer.container.frame.height < thisObject.container.frame.height) {
      visibleLayers.push(layer)
    }

    /* Listen to Status Changes Events */
    layer.onLayerStatusChangedEventSuscriptionId = layer.container.eventHandler.listenToEvent('Status Changed', onLayerStatusChanged)
    layer.onMouseWheelEventSuscriptionId = layer.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    return layer
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta > 0) {
      delta = -1
    } else {
      delta = 1
    }

    firstVisibleLayer = firstVisibleLayer + delta

    calculateVisbleLayers()
  }

  function calculateVisbleLayers () {
    let availableSlots = visibleLayers.length

    if (firstVisibleLayer < 1) { firstVisibleLayer = 1 }
    if (firstVisibleLayer > (thisObject.layers.length - availableSlots + 1)) { firstVisibleLayer = thisObject.layers.length - availableSlots + 1 }

    visibleLayers = []

    for (let i = 0; i < thisObject.layers.length; i++) {
      if (i + 1 >= firstVisibleLayer && i + 1 < firstVisibleLayer + availableSlots) {
        let layer = thisObject.layers[i]

         /* Positioning within thisObject Panel */
        let position = {
          x: 0,
          y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
        }
        layer.container.frame.position.x = position.x
        layer.container.frame.position.y = position.y + layer.container.frame.height * visibleLayers.length + LAYER_SEPARATION

         /* Add to Visible Product Array */
        visibleLayers.push(layer)
      }
    }
  }

  function onLayerStatusChanged (layer) {
    thisObject.container.eventHandler.raiseEvent('Layer Status Changed', layer)
  }

  function getLoadingLayers () {
    /* Returns all thisObject.layers which status is LOADING */
    let onProducts = []

    for (let i = 0; i < thisObject.layers.length; i++) {
      if (thisObject.layers[i].status === PRODUCT_CARD_STATUS.LOADING) {
        onProducts.push(thisObject.layers[i])
      }
    }

    return onProducts
  }

  function getContainer (point) {
    let container

    container = panelTabButton.getContainer(point)
    if (container !== undefined) { return container }

     /* First we check if thisObject point is inside thisObject space. */
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       /* Now we see which is the inner most container that has it */
      for (let i = 0; i < visibleLayers.length; i++) {
        container = visibleLayers[i].getContainer(point)

        if (container !== undefined) {
          let checkPoint = {
            x: point.x,
            y: point.y
          }

          checkPoint = thisObject.fitFunction(checkPoint)

          if (point.x === checkPoint.x && point.y === checkPoint.y) {
            return container
          }
        }
      }

     /* The point does not belong to any inner container, so we return the current container. */
      let checkPoint = {
        x: point.x,
        y: point.y
      }

      checkPoint = thisObject.fitFunction(checkPoint)

      if (point.x === checkPoint.x && point.y === checkPoint.y) {
        return thisObject.container
      }
    }
  }

  function physics () {
    if (isInitialized === false) { return }

    /*
    The overall idea here is that we need to keep syncronized the panel with the layers that are
    defined at the Designer. Users can connect or disconnect any objext resulting in changes in which
    are valid layers and which not at any point in time. So what we do here is trying to keep the panel
    only with the layers that are connected to the Charting System hiriarcy.

    To achieve this, first we are going to move all session related cards to a local array. Then we are
    going to check for layers at the designer, and will move back the cards which still have layers well
    defined to where they were.

    If we find new layers we will add them at that point. Finally, the cards that still remain at the
    local array after all the layers at the designer have been processed, are turned off and discarded.
    */

    let localLayers = []
    moveToLocalLayers()
    syncWithDesignerLayers()

    /* At this poins all the cards still at the local array need to be removed from the panel. */
    turnOffUnusedLayers()
    calculateVisbleLayers()

    function syncWithDesignerLayers () {
      let layerManager = thisObject.payload.node
      for (let p = 0; p < layerManager.layers.length; p++) {
        let layerNode = layerManager.layers[p]

        let found = removeFromLocalLayers(layerNode.id)
        if (found !== true) {
          layer = addLayer(layerNode)
          onLayerStatusChanged(layer)
        }
      }
    }

    function moveToLocalLayers () {
      removeNext()

      function removeNext () {
        for (let i = 0; i < thisObject.layers.length; i++) {
          let layer = thisObject.layers[i]

          thisObject.layers.splice(i, 1)
          localLayers.push(layer)
          removeNext()
        }
      }
    }

    function removeFromLocalLayers (id) {
      for (let i = 0; i < localLayers.length; i++) {
        let layer = localLayers[i]
        if (layer.payload.node.id === id) {
          thisObject.layers.push(layer)
          localLayers.splice(i, 1)
          return true
        }
      }
    }

    function turnOffUnusedLayers () {
      for (let i = 0; i < localLayers.length; i++) {
        let layer = localLayers[i]
        removeLayer(layer.payload.node.id)
      }
    }
  }

  function draw () {
    if (isInitialized === false) { return }

    thisObject.container.frame.draw(false, false, false, thisObject.fitFunction)

    for (let i = 0; i < visibleLayers.length; i++) {
      visibleLayers[i].draw()
    }

    panelTabButton.draw()
  }
}
