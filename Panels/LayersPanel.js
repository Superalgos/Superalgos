function newLayersPanel () {
  let thisObject = {
    name: 'Layers Panel',
    fitFunction: undefined,
    container: undefined,
    layers: [],
    payload: undefined,
    isVisible: true,
    panelTabButton: undefined,
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

  const LAYER_SEPARATION = 0

  let headerHeight = 40
  let footerHeight = 10
  let layerHeight = 70
  let desiredVisibleLayers = 5
  let posibleVisibleLayers = 5
  let desiredPanelHeight = (layerHeight + LAYER_SEPARATION) * desiredVisibleLayers + headerHeight + footerHeight
  let posiblePanelHeight = (layerHeight + LAYER_SEPARATION) * posibleVisibleLayers + headerHeight + footerHeight

  let onMouseWheelEventSuscriptionId
  return thisObject

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSuscriptionId)

    thisObject.panelTabButton.finalize()
    thisObject.panelTabButton = undefined
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
    thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
    thisObject.container.frame.height = headerHeight

    let position = { // Default position
      x: canvas.chartSpace.viewport.visibleArea.topLeft.x,
      y: canvas.chartSpace.viewport.visibleArea.topLeft.y
    }

    thisObject.container.frame.position = position
    loadFrame(thisObject.payload, thisObject.container.frame)

    thisObject.panelTabButton = newPanelTabButton()
    thisObject.panelTabButton.parentContainer = thisObject.container
    thisObject.panelTabButton.container.frame.parentFrame = thisObject.container.frame
    thisObject.panelTabButton.fitFunction = thisObject.fitFunction
    thisObject.panelTabButton.initialize()

    onMouseWheelEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    readObjectState()

    isInitialized = true
  }

  function saveObjectStateVisibleLayers () {
    savePropertyAtNodeConfig(thisObject.payload, 'visibleLayers', desiredVisibleLayers)
  }

  function saveObjectStatePanelLocation () {
    savePropertyAtNodeConfig(thisObject.payload, 'panelLocation', thisObject.panelTabButton.status)
  }

  function readObjectState () {
    let storedValue

    storedValue = loadPropertyFromNodeConfig(thisObject.payload, 'visibleLayers')

    if (isNaN(storedValue) || storedValue === null || storedValue === undefined) {
         // not using this value
      saveObjectStateVisibleLayers() // this overrides any invalid value at the config.
      return
    } else {
      if (storedValue < 0) { storedValue = 0 }
      if (storedValue > thisObject.layers.length) {
        storedValue = thisObject.layers.length
      }

      if (storedValue !== desiredVisibleLayers) {
        desiredVisibleLayers = storedValue
        desiredPanelHeight = (layerHeight + LAYER_SEPARATION) * desiredVisibleLayers + headerHeight + footerHeight
        calculateVisbleLayers()
      }
    }

    storedValue = loadPropertyFromNodeConfig(thisObject.payload, 'panelLocation')

    if (storedValue === null || storedValue === undefined) {
         // not using this value
      saveObjectStatePanelLocation() // this overrides any invalid value at the config.
      return
    } else {
      if (storedValue !== 'up' && storedValue !== 'down') {
        saveObjectStatePanelLocation() // this overrides any invalid value at the config.
        return
      }
      thisObject.panelTabButton.setStatus(storedValue)
      saveObjectStatePanelLocation()
    }
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
    layer.nodeId = layerNode.payload.node.id
    layer.fitFunction = thisObject.fitFunction

    /* Initialize it */
    layer.initialize(onInitialized)

    function onInitialized (err) {
      if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
        layersMap.set(layerNode.id, layer)

        /* Container Stuff */
        layer.container.frame.parentFrame = thisObject.container.frame
        layer.container.parentContainer = thisObject.container
        layer.container.isWheelable = true

        /* Add to the Product Array */
        thisObject.layers.push(layer)

        /* Listen to Status Changes Events */
        layer.onLayerStatusChangedEventSuscriptionId = layer.container.eventHandler.listenToEvent('Status Changed', onLayerStatusChanged)
        layer.onMouseWheelEventSuscriptionId = layer.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

        return layer
      }
    }
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta > 0) {
      delta = -1
    } else {
      delta = 1
    }

    if (event.y - thisObject.container.frame.position.y - CURRENT_TOP_MARGIN < headerHeight) { // Mouse wheel over the header, not a layer
      desiredVisibleLayers = desiredVisibleLayers + delta
      if (desiredVisibleLayers < 0) { desiredVisibleLayers = 0 }
      if (desiredVisibleLayers > thisObject.layers.length) { desiredVisibleLayers = thisObject.layers.length }
    } else {
      firstVisibleLayer = firstVisibleLayer + delta
    }
    desiredPanelHeight = (layerHeight + LAYER_SEPARATION) * desiredVisibleLayers + headerHeight + footerHeight
    calculateVisbleLayers()
    saveObjectStateVisibleLayers()
  }

  function panelSizePhysics () {
    if (isInitialized === false || thisObject.visible === false || thisObject.isHidden === true) { return }

    let viewPortHeight = canvas.chartSpace.viewport.visibleArea.bottomLeft.y - canvas.chartSpace.viewport.visibleArea.topLeft.y

    if (viewPortHeight < headerHeight) {
      thisObject.visible = false
    } else {
      thisObject.visible = true
    }

    if (desiredPanelHeight > viewPortHeight) {
      posibleVisibleLayers = Math.trunc((viewPortHeight - headerHeight - footerHeight) / (layerHeight + LAYER_SEPARATION))
    } else {
      posibleVisibleLayers = desiredVisibleLayers
    }
    if (thisObject.layers.length < posibleVisibleLayers) { posibleVisibleLayers = thisObject.layers.length }

    if (posibleVisibleLayers === 0) {
      posiblePanelHeight = (layerHeight + LAYER_SEPARATION) * posibleVisibleLayers + headerHeight
    } else {
      posiblePanelHeight = (layerHeight + LAYER_SEPARATION) * posibleVisibleLayers + headerHeight + footerHeight
    }

    thisObject.container.frame.height = posiblePanelHeight
  }

  function calculateVisbleLayers () {
    panelSizePhysics()
    let availableSlots = posibleVisibleLayers

    if (firstVisibleLayer < 1) { firstVisibleLayer = 1 }
    if (firstVisibleLayer > (thisObject.layers.length - availableSlots + 1)) { firstVisibleLayer = thisObject.layers.length - availableSlots + 1 }

    visibleLayers = []

    for (let i = 0; i < thisObject.layers.length; i++) {
      if (i + 1 >= firstVisibleLayer && i + 1 < firstVisibleLayer + availableSlots) {
        let layer = thisObject.layers[i]

        layer.container.frame.position.x = 0
        layer.container.frame.position.y = (layerHeight + LAYER_SEPARATION) * visibleLayers.length + headerHeight

         /* Add to Visible Product Array */
        visibleLayers.push(layer)
      }
    }
  }

  function onLayerStatusChanged (layer) {
    thisObject.container.eventHandler.raiseEvent('Layer Status Changed', layer)
  }

  function getContainer (point) {
    if (isInitialized === false || thisObject.visible === false || thisObject.isHidden === true) { return }
    let container

    container = thisObject.panelTabButton.getContainer(point)
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

  function childrenPhysics () {
    for (let i = 0; i < thisObject.layers.length; i++) {
      let layer = thisObject.layers[i]
      layer.physics()
    }
  }

  function syncWithConfigPhysics () {
    readObjectState()
  }

  function physics () {
    if (isInitialized === false) { return }
    thisObject.panelTabButton.physics()
    saveFrame(thisObject.payload, thisObject.container.frame)
    syncWithConfigPhysics()

    /*
    The overall idea here is that we need to keep syncronized the panel with the layers that are
    defined at the Designer. Users can connect or disconnect any objext resulting in changes in which
    are valid layers and which not at any point in time. So what we do here is trying to keep the panel
    only with the layers that are connected to the Charting Space hiriarcy.

    To achieve this, first we are going to move all session related cards to a local array. Then we are
    going to check for layers at the designer, and will move back the cards which still have layers well
    defined to where they were.

    If we find new layers we will add them at that point. Finally, the cards that still remain at the
    local array after all the layers at the designer have been processed, are turned off and discarded.
    */
    childrenPhysics()

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
          if (layer !== undefined) {
            onLayerStatusChanged(layer)
          }
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
        removeLayer(layer.nodeId)
      }
    }
  }

  function draw () {
    if (isInitialized === false || thisObject.visible === false || thisObject.isHidden === true) { return }

    // thisObject.container.frame.draw(false, false, false, thisObject.fitFunction)

    drawHeader()
    for (let i = 0; i < visibleLayers.length; i++) {
      visibleLayers[i].draw()
    }
    drawScrollBar()
    thisObject.panelTabButton.draw()
  }

  function drawHeader () {
    let label1 = thisObject.payload.node.payload.parentNode.payload.parentNode.name.substring(0, 18)
    let label2 = thisObject.payload.node.payload.parentNode.name.substring(0, 18)
    let label3 = ''

    let icon1 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.payload.parentNode.type)
    let icon2 = canvas.designerSpace.iconByUiObjectType.get(thisObject.payload.node.payload.parentNode.type)

    let backgroundColor = UI_COLOR.BLACK

    let params = {
      cornerRadius: 5,
      lineWidth: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.RUSTED_RED,
      castShadow: false,
      backgroundColor: backgroundColor,
      opacity: 1
    }

    roundedCornersBackground(params)

    drawLabel(label1, 1 / 2, 0, 0, 15, 9, thisObject.container)
    drawLabel(label2, 1 / 2, 0, 0, 30, 9, thisObject.container)

    drawIcon(icon1, 1 / 8, 0, 0, 20, 28, thisObject.container)
    drawIcon(icon2, 7 / 8, 0, 0, 20, 28, thisObject.container)
  }

  function drawScrollBar () {
    if (thisObject.layers.length > posibleVisibleLayers && posibleVisibleLayers > 0) {
      let xOffset = 4
      let barTopPoint = {
        x: thisObject.container.frame.width - xOffset,
        y: headerHeight
      }
      let barBottomPoint = {
        x: thisObject.container.frame.width - xOffset,
        y: thisObject.container.frame.height - footerHeight
      }
      let ratio = posibleVisibleLayers / thisObject.layers.length
      let handleHeight = (posibleVisibleLayers * (layerHeight + LAYER_SEPARATION)) * ratio
      let handleTopPoint = {
        x: thisObject.container.frame.width - xOffset,
        y: headerHeight + (layerHeight + LAYER_SEPARATION) * ratio * (firstVisibleLayer - 1)
      }
      let handleBottomPoint = {
        x: thisObject.container.frame.width - xOffset,
        y: handleTopPoint.y + handleHeight
      }
      barTopPoint = thisObject.container.frame.frameThisPoint(barTopPoint)
      barBottomPoint = thisObject.container.frame.frameThisPoint(barBottomPoint)
      handleTopPoint = thisObject.container.frame.frameThisPoint(handleTopPoint)
      handleBottomPoint = thisObject.container.frame.frameThisPoint(handleBottomPoint)

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(barTopPoint.x, barTopPoint.y)
      browserCanvasContext.lineTo(barBottomPoint.x, barBottomPoint.y)
      browserCanvasContext.closePath()
      browserCanvasContext.setLineDash([0, 0])
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + 1 + ')'
      browserCanvasContext.stroke()

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(handleTopPoint.x, handleTopPoint.y)
      browserCanvasContext.lineTo(handleBottomPoint.x, handleBottomPoint.y)
      browserCanvasContext.closePath()
      browserCanvasContext.setLineDash([0, 0])
      browserCanvasContext.lineWidth = 4
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + 1 + ')'
      browserCanvasContext.stroke()
    }
  }
}
