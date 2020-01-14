function newLayer () {
  const MODULE_NAME = 'Layer'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    status: PRODUCT_CARD_STATUS.OFF,
    fitFunction: undefined,
    payload: undefined,
    definition: undefined,
    draw: draw,
    turnOff: turnOff,
    turnOn: turnOn,
    setDatetime: setDatetime,
    setTimeFrame: setTimeFrame,
    onMarketFileLoaded: onMarketFileLoaded,
    onDailyFileLoaded: onDailyFileLoaded,
    onSingleFileLoaded: onSingleFileLoaded,
    onFileSequenceLoaded: onFileSequenceLoaded,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize,
    finalize: finalize
  }

  let LOADING_FILL_STYLE = 'rgba(234, 143, 23, @Opacity)'
  let LOADED_FILL_STYLE = 'rgba(45, 232, 28, @Opacity)'
  let UNLOADED_FILL_STYLE = 'rgba(226, 226, 226, @Opacity)'

  let LOADING_STROKE_STYLE = 'rgba(234, 143, 23, @Opacity)'
  let LOADED_STROKE_STYLE = 'rgba(45, 232, 28, @Opacity)'
  let UNLOADED_STROKE_STYLE = 'rgba(226, 226, 226, @Opacity)'

  let marketFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let dailyFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let singleFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let fileSequenceProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let timeFrame = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

   /* Add an Event Handler */

  thisObject.eventHandler = newEventHandler()
  let imagesLoaded = 0
  let onMouseClickEventSuscriptionId

  return thisObject

  function finalize () {
    thisObject.container.finalize()
    thisObject.eventHandler.finalize()
    thisObject.container = undefined
    thisObject.eventHandler = undefined
    thisObject.status = undefined
    thisObject.fitFunction = undefined
    thisObject.payload = undefined
    thisObject.definition = undefined

    timeFrame = undefined
    datetime = undefined

    LOADING_FILL_STYLE = undefined
    LOADED_FILL_STYLE = undefined
    UNLOADED_FILL_STYLE = undefined

    LOADING_STROKE_STYLE = undefined
    LOADED_STROKE_STYLE = undefined
    UNLOADED_STROKE_STYLE = undefined

    marketFileProgressBar = undefined
    dailyFileProgressBar = undefined
    singleFileProgressBar = undefined
    fileSequenceProgressBar = undefined

    thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)
  }

  function initialize () {
       /* Create this objects continer */
    try {
      thisObject.container = newContainer()
      thisObject.container.initialize(MODULE_NAME + ' ' + thisObject.payload.node.id)
      thisObject.container.isDraggeable = false
      thisObject.container.isClickeable = true

       /* Lets set the basic dimensions of this thisObject. */

      let position = {
        x: 0,
        y: 0
      }

      thisObject.container.frame.position = position
      thisObject.container.frame.width = UI_PANEL.WIDTH.MEDIUM
      thisObject.container.frame.height = 90

      let functionLibraryProtocolNode = newProtocolNode()
      let lightingPath =
                        '->Layer->' +
                        'Data Product->Single Market Data->Market->' +
                        'Market Base Asset->Asset->' +
                        'Market Quoted Asset->Asset->' +
                        'Exchange Markets->Crypto Exchange->' +
                        'Product Definition->' +
                        'Sensor Bot->Indicator Bot->Trading Bot->' +
                        'Data Mine->' +
                        'Dataset Definition->' +
                        'Record Definition->Record Property->Formula->' +
                        'Data Building Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                        'Calculations Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                        'Plotter Module->Shapes->' +
                        'Chart Points->Point->Point Formula->' +
                        'Polygon->Polygon Body->Style->Style Condition->Style->' +
                        'Polygon Border->Style->Style Condition->Style->' +
                        'Polygon Vertex->Point->' +
                        'Plotter Panel->Javascript Code->Panel Data->Data Formula->'
      thisObject.definition = functionLibraryProtocolNode.getProtocolNode(thisObject.payload.node, false, true, true, false, false, lightingPath)

      /* Here we validate that we have all the needed information */
      if (thisObject.definition.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.referenceParent.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.baseAsset === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.baseAsset.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.quotedAsset === undefined) { return }
      if (thisObject.definition.referenceParent.parentNode.referenceParent.quotedAsset.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.referenceParent === undefined) { return }
      if (thisObject.definition.referenceParent.referenceParent.parentNode === undefined) { return }
      if (thisObject.definition.referenceParent.referenceParent.parentNode.parentNode === undefined) { return }

       /* We retrieve the locally stored status of the Product */
      let storedValue = window.localStorage.getItem(thisObject.payload.node.id)

      if (storedValue !== null) {
        thisObject.status = storedValue

        if (thisObject.status === PRODUCT_CARD_STATUS.ON) {
          changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
        }
      } else {
        changeStatusTo(PRODUCT_CARD_STATUS.OFF)
      }

       /* Lets listen to our own events to react when we have a Mouse Click */
      onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function setDatetime (pDatetime) {
     /*
     When the datetime changes from one day to another, this forces cursors to potentially load more files, thus we reset this counter and
     get ready to receive events on files loaded.
     */
    let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS)
    let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS)

    datetime = pDatetime

    if (currentDate !== newDate) {
      if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
        dailyFileProgressBar.animatedValue = 0
      }
    }
  }

  function setTimeFrame (pTimeFrame) {
     /*
     When the time period below or equal to 1 hour changes, this forces cursors to potentially load more files, thus we reset this counter and
     get ready to receive events on files loaded.
     */
    if (timeFrame !== pTimeFrame) {
      timeFrame = pTimeFrame

      if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
        dailyFileProgressBar.animatedValue = 0
      }
    }
  }

  function onMarketFileLoaded (event) {
    marketFileProgressBar.value = Math.trunc(event.totalValue * 100 / event.totalValue)
    marketFileProgressBar.fillStyle = LOADING_FILL_STYLE
    marketFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (marketFileProgressBar.value > 100) { marketFileProgressBar.value = 100 }
  }

  function onDailyFileLoaded (event) {
    dailyFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    dailyFileProgressBar.fillStyle = LOADING_FILL_STYLE
    dailyFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (dailyFileProgressBar.value > 100) { dailyFileProgressBar.value = 100 }
  }

  function onSingleFileLoaded (event) {
    singleFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    singleFileProgressBar.fillStyle = LOADING_FILL_STYLE
    singleFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (singleFileProgressBar.value > 100) { singleFileProgressBar.value = 100 }
  }

  function onFileSequenceLoaded (event) {
    fileSequenceProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    fileSequenceProgressBar.fillStyle = LOADING_FILL_STYLE
    fileSequenceProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (fileSequenceProgressBar.value > 100) { fileSequenceProgressBar.value = 100 }
  }

  function turnOff () {
    if (thisObject.status !== PRODUCT_CARD_STATUS.OFF) {
      resetProgressBars()
      changeStatusTo(PRODUCT_CARD_STATUS.OFF)
    }
  }

  function turnOn () {
    if (thisObject.status === PRODUCT_CARD_STATUS.OFF) {
      changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
    }
  }

  function onMouseClick (event) {
    switch (thisObject.status) {
      case PRODUCT_CARD_STATUS.ON:
        resetProgressBars()
        changeStatusTo(PRODUCT_CARD_STATUS.OFF)
        break
      case PRODUCT_CARD_STATUS.OFF:
        changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
        break
      case PRODUCT_CARD_STATUS.LOADING:
        changeStatusTo(PRODUCT_CARD_STATUS.OFF)
        break
    }
  }

  function resetProgressBars () {
    marketFileProgressBar.animatedValue = 0
    marketFileProgressBar.value = 0
    marketFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    marketFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    dailyFileProgressBar.animatedValue = 0
    dailyFileProgressBar.value = 0
    dailyFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    dailyFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    singleFileProgressBar.animatedValue = 0
    singleFileProgressBar.value = 0
    singleFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    singleFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    fileSequenceProgressBar.animatedValue = 0
    fileSequenceProgressBar.value = 0
    fileSequenceProgressBar.fillStyle = UNLOADED_FILL_STYLE
    fileSequenceProgressBar.strokeStyle = UNLOADED_STROKE_STYLE
  }

  function changeStatusTo (pNewStatus) {
    if (thisObject.status !== pNewStatus) {
      thisObject.status = pNewStatus
      let eventData = thisObject
      thisObject.container.eventHandler.raiseEvent('Status Changed', eventData)
      window.localStorage.setItem(thisObject.code, thisObject.status)
    }
  }

  function draw () {
    drawLayer()
  }

  function drawLayer () {
    switch (thisObject.status) {
      case PRODUCT_CARD_STATUS.ON:

        break
      case PRODUCT_CARD_STATUS.OFF:

        break
      case PRODUCT_CARD_STATUS.LOADING:

        break
    }

    drawLayerDisplay()

       /* ------------------- Progress Bars -------------------------- */

    const ANIMATED_INCREMENT = 5
    const OPACITY_INCREMENT = 0.05
    const OPACITY_MIN = 1

    let point1
    let point2

       /* We draw here the Market Progress Bar. */

       /* Animate */

    if (marketFileProgressBar.animatedValue < marketFileProgressBar.value) {
      marketFileProgressBar.animatedValue = marketFileProgressBar.animatedValue + ANIMATED_INCREMENT
      marketFileProgressBar.opacity = marketFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (marketFileProgressBar.animatedValue >= 100) {
      marketFileProgressBar.animatedValue = 100

      marketFileProgressBar.opacity = marketFileProgressBar.opacity - OPACITY_INCREMENT
      if (marketFileProgressBar.opacity < OPACITY_MIN) { marketFileProgressBar.opacity = OPACITY_MIN }

      marketFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', marketFileProgressBar.opacity.toString())
      marketFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', marketFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 15
    }

    point2 = {
      x: thisObject.container.frame.width * marketFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 15
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)

    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = marketFileProgressBar.strokeStyle.replace('@Opacity', marketFileProgressBar.opacity.toString())

    browserCanvasContext.setLineDash([2, 5])
    browserCanvasContext.lineWidth = 10
    browserCanvasContext.stroke()

       /* We draw here the Daily Progress Bar. */

       /* Animate */

    if (dailyFileProgressBar.animatedValue < dailyFileProgressBar.value) {
      dailyFileProgressBar.animatedValue = dailyFileProgressBar.animatedValue + ANIMATED_INCREMENT
      dailyFileProgressBar.opacity = dailyFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (dailyFileProgressBar.animatedValue >= 100) {
      dailyFileProgressBar.animatedValue = 100

      dailyFileProgressBar.opacity = dailyFileProgressBar.opacity - OPACITY_INCREMENT
      if (dailyFileProgressBar.opacity < OPACITY_MIN) { dailyFileProgressBar.opacity = OPACITY_MIN }

      dailyFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', dailyFileProgressBar.opacity.toString())
      dailyFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', dailyFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 25
    }

    point2 = {
      x: thisObject.container.frame.width * dailyFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 25
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)

    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = dailyFileProgressBar.strokeStyle.replace('@Opacity', dailyFileProgressBar.opacity.toString())

    browserCanvasContext.setLineDash([2, 5])
    browserCanvasContext.lineWidth = 10
    browserCanvasContext.stroke()

       /* We draw here the Single File Progress Bar. */

       /* Animate */

    if (singleFileProgressBar.animatedValue < singleFileProgressBar.value) {
      singleFileProgressBar.animatedValue = singleFileProgressBar.animatedValue + ANIMATED_INCREMENT
      singleFileProgressBar.opacity = singleFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (singleFileProgressBar.animatedValue >= 100) {
      singleFileProgressBar.animatedValue = 100

      singleFileProgressBar.opacity = singleFileProgressBar.opacity - OPACITY_INCREMENT
      if (singleFileProgressBar.opacity < OPACITY_MIN) { singleFileProgressBar.opacity = OPACITY_MIN }

      singleFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', singleFileProgressBar.opacity.toString())
      singleFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', singleFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 7
    }

    point2 = {
      x: thisObject.container.frame.width * singleFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 7
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = singleFileProgressBar.strokeStyle.replace('@Opacity', singleFileProgressBar.opacity.toString())

    browserCanvasContext.setLineDash([2, 5])
    browserCanvasContext.lineWidth = 10

       /* We draw here the File Sequence Progress Bar. */

       /* Animate */

    if (fileSequenceProgressBar.animatedValue < fileSequenceProgressBar.value) {
      fileSequenceProgressBar.animatedValue = fileSequenceProgressBar.animatedValue + ANIMATED_INCREMENT
      fileSequenceProgressBar.opacity = fileSequenceProgressBar.opacity + OPACITY_INCREMENT
    }

    if (fileSequenceProgressBar.animatedValue >= 100) {
      fileSequenceProgressBar.animatedValue = 100

      fileSequenceProgressBar.opacity = fileSequenceProgressBar.opacity - OPACITY_INCREMENT
      if (fileSequenceProgressBar.opacity < OPACITY_MIN) { fileSequenceProgressBar.opacity = OPACITY_MIN }

      fileSequenceProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', fileSequenceProgressBar.opacity.toString())
      fileSequenceProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', fileSequenceProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 10
    }

    point2 = {
      x: thisObject.container.frame.width * fileSequenceProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 10
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)

    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = fileSequenceProgressBar.strokeStyle.replace('@Opacity', fileSequenceProgressBar.opacity.toString())

    browserCanvasContext.setLineDash([2, 5])
    browserCanvasContext.lineWidth = 10
  }

  function drawLayerDisplay () {
    let baseAsset = thisObject.definition.referenceParent.parentNode.referenceParent.baseAsset.referenceParent
    let quotedAsset = thisObject.definition.referenceParent.parentNode.referenceParent.quotedAsset.referenceParent
    let market = baseAsset.code.codeName + '/' + quotedAsset.code.codeName
    let exchange = thisObject.definition.referenceParent.parentNode.referenceParent.parentNode.parentNode
    let plotterModule = thisObject.definition.referenceParent.referenceParent.referenceParent

    let labelArray = thisObject.payload.node.name.split(' ')
    let label1 = labelArray[0]
    let label2 = labelArray[1]
    let label3 = exchange.name.substring(0, 15) + ' - ' + market
    let label4 = thisObject.status.toUpperCase()

    if (label1 !== undefined) {
      label1 = label1.substring(0, 15)
    }
    if (label2 !== undefined) {
      label2 = label2.substring(0, 15)
    }

    let icon1 = getIcon(exchange)

    let icon2
    if (plotterModule.code.icon !== undefined) {
      icon2 = canvas.designerSpace.iconCollection.get(plotterModule.code.icon)
    }

    let icon3 = getIcon(baseAsset)
    let icon4 = getIcon(quotedAsset)

    function getIcon (node) {
      let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
      let iconName
      if (nodeDefinition.alternativeIcons !== undefined) {
        for (let i = 0; i < nodeDefinition.alternativeIcons.length; i++) {
          alternativeIcon = nodeDefinition.alternativeIcons[i]
          if (alternativeIcon.codeName === node.code.codeName) {
            iconName = alternativeIcon.iconName
          }
        }
      }
      if (iconName !== undefined) {
        icon = canvas.designerSpace.iconCollection.get(iconName)
      } else {
        icon = canvas.designerSpace.iconCollection.get(nodeDefinition.icon)
      }
      return icon
    }

    let backgroundColor = UI_COLOR.BLACK

    const RED_LINE_HIGHT = 4
    const OPACITY = 1

    let params = {
      cornerRadius: 0,
      lineWidth: 1,
      container: thisObject.container,
      borderColor: UI_COLOR.RUSTED_RED,
      castShadow: false,
      backgroundColor: backgroundColor,
      opacity: OPACITY
    }

    roundedCornersBackground(params)

    if (label2 !== undefined) {
      drawLabel(label1, 1 / 2, 2 / 8, 16)
      drawLabel(label2, 1 / 2, 4 / 8, 16)
    } else {
      drawLabel(label1, 1 / 2, 3 / 8, 20)
    }

    drawLabel(label3, 1 / 2, 6 / 8, 10)
    drawLabel(label4, 1 / 2, 7 / 8, 10)

    function drawLabel (label, xFactor, yFactor, fontSize) {
      if (label === undefined) { return }
      let xOffset = label.length * fontSize * FONT_ASPECT_RATIO + 10

      let labelPoint = {
        x: thisObject.container.frame.width * xFactor - xOffset / 2,
        y: thisObject.container.frame.height * yFactor
      }

      labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

      browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }

    /* Images */

    drawIcon(icon1, 1 / 8, 1 / 4)
    drawIcon(icon2, 7 / 8, 1 / 4)
    drawIcon(icon3, 1 / 8, 3 / 4)
    drawIcon(icon4, 7 / 8, 3 / 4)

    function drawIcon (icon, xFactor, yFactor) {
      if (icon !== undefined) {
        if (icon.canDrawIcon === true) {
          let imageSize = 20
          let imagePosition = {
            x: thisObject.container.frame.width * xFactor - imageSize / 2,
            y: thisObject.container.frame.height * yFactor - imageSize / 2
          }

          imagePosition = thisObject.container.frame.frameThisPoint(imagePosition)
          browserCanvasContext.drawImage(
            icon, imagePosition.x,
            imagePosition.y,
            imageSize,
            imageSize)
        }
      }
    }
  }
}

