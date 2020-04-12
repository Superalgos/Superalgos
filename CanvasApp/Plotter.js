function newPlotter () {
  const MODULE_NAME = 'Plotter'
  const ERROR_LOG = true
  const INTENSIVE_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    currentRecord: undefined,
    container: undefined,
    fitFunction: undefined,
    onDailyFileLoaded: onDailyFileLoaded,
    initialize: initialize,
    finalize: finalize,
    getContainer: getContainer,
    setTimeFrame: setTimeFrame,
    setDatetime: setDatetime,
    setCoordinateSystem: setCoordinateSystem,
    draw: draw
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  let coordinateSystem
  let slotHeight = (canvas.chartingSpace.viewport.visibleArea.bottomRight.y - canvas.chartingSpace.viewport.visibleArea.topLeft.y) / 10  // This is the amount of slots available
  let mustRecalculateDataPoints = false
  let atMousePositionFillStyles = new Map()
  let atMousePositionStrokeStyles = new Map()

  let timeFrame                                                      // This will hold the current Time Frame the user is at.
  let datetime                                                        // This will hold the current Datetime the user is at.

  let marketFile                                                      // This is the current Market File being plotted.
  let fileCursor                                                      // This is the current File Cursor being used to retrieve Daily Files.

  let marketFiles                                                     // This object will provide the different Market Files at different Time Periods.
  let dailyFiles                                                      // This object will provide the different File Cursors at different Time Periods.

  let productDefinition                                               // Here we store a snapshot of the product definition which references this plotter.

  let records = []                                                    // We will have the information to be plotted here.
  let userPositionDate

  let onMouseOverEventSuscriptionId
  let zoomChangedEventSubscriptionId
  let offsetChangedEventSubscriptionId
  let dragFinishedEventSubscriptionId
  let dimmensionsChangedEventSubscriptionId
  let marketFilesUpdatedEventSubscriptionId
  let dailyFilesUpdatedEventSubscriptionId
  let onDisplaceEventSubscriptionId
  let scaleChangedEventSubscriptionId

  let logged = false
  return thisObject

  function finalize () {
    try {
      /* Stop listening to the necesary events. */
      thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
      canvas.chartingSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId)
      canvas.chartingSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId)
      canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId)
      thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
      marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId)
      dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId)
      thisObject.container.eventHandler.stopListening(onDisplaceEventSubscriptionId)
      thisObject.fitFunction = undefined

      /* Clear References */
      marketFiles = undefined
      dailyFiles = undefined

      datetime = undefined
      timeFrame = undefined

      marketFile = undefined
      fileCursor = undefined

      finalizeCoordinateSystem()
      coordinateSystem = undefined
      slotHeight = undefined
      mustRecalculateDataPoints = undefined
      atMousePositionFillStyles = undefined
      atMousePositionStrokeStyles = undefined
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack.stack) }
    }
  }

  function initialize (pStorage, pDatetime, pTimeFrame, pCoordinateSystem, callBackFunction, pProductDefinition) {
    try {
      /* Store the information received. */
      marketFiles = pStorage.marketFiles[0]
      dailyFiles = pStorage.dailyFiles[0]

      datetime = pDatetime
      timeFrame = pTimeFrame
      coordinateSystem = pCoordinateSystem
      initializeCoordinateSystem()

      productDefinition = pProductDefinition

      /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */
      marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS)  // This file is the one processed faster.

      /* Now we set the right files according to current Period. */
      marketFile = marketFiles.getFile(pTimeFrame)
      fileCursor = dailyFiles.getFileCursor(pTimeFrame)

      /* Listen to the necesary events. */
      zoomChangedEventSubscriptionId = canvas.chartingSpace.viewport.eventHandler.listenToEvent('Zoom Changed', onViewportZoomChanged)
      offsetChangedEventSubscriptionId = canvas.chartingSpace.viewport.eventHandler.listenToEvent('Position Changed', onViewportPositionChanged)
      dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent('Drag Finished', onDragFinished)
      marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent('Files Updated', onMarketFilesUpdated)
      dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent('Files Updated', onDailyFilesUpdated)
      onDisplaceEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDisplace', onDisplace)
      onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

      /* Get ready for plotting. */
      recalculate()
      dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
        recalculate()
      })

      callBackFunction()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initializeCoordinateSystem () {
    scaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
  }

  function finalizeCoordinateSystem () {
    coordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)
  }

  function onScaleChanged () {
    mustRecalculateDataPoints = true
    recalculate()
  }

  function onMouseOver (event) {
    let userPosition = getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
    userPositionDate = userPosition.valueOf()
  }

  function onMarketFilesUpdated () {
    try {
      let newMarketFile = marketFiles.getFile(timeFrame)
      if (newMarketFile !== undefined) {
        marketFile = newMarketFile
        mustRecalculateDataPoints = true
        recalculate()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMarketFilesUpdated -> err = ' + err.stack.stack) }
    }
  }

  function onDailyFilesUpdated () {
    try {
      let newFileCursor = dailyFiles.getFileCursor(timeFrame)
      if (newFileCursor !== undefined) {
        fileCursor = newFileCursor
        mustRecalculateDataPoints = true
        recalculate()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFilesUpdated -> err = ' + err.stack.stack) }
    }
  }

  function getContainer (point) {
    try {
      let container
      /* First we check if this point is inside this space. */
      if (thisObject.container.frame.isThisPointHere(point) === true) {
        return thisObject.container
      } else {
      /* This point does not belong to this space. */
        return undefined
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getContainer -> err = ' + err.stack) }
    }
  }

  function setTimeFrame (pTimeFrame) {
    try {
      if (timeFrame !== pTimeFrame) {
        timeFrame = pTimeFrame
        mustRecalculateDataPoints = true
        if (timeFrame >= _1_HOUR_IN_MILISECONDS) {
          let newMarketFile = marketFiles.getFile(pTimeFrame)

          if (newMarketFile !== undefined) {
            marketFile = newMarketFile
            recalculate()
          } else {
            logger.write('[WARN] setTimeFrame -> Could not change to market file for timeFrame = ' + pTimeFrame
          }
        } else {
          let newFileCursor = dailyFiles.getFileCursor(pTimeFrame)

          if (newFileCursor !== undefined) {
            fileCursor = newFileCursor
            recalculate()
          } else {
            logger.write('[WARN] setTimeFrame -> Could not change to market file for timeFrame = ' + pTimeFrame
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> err = ' + err.stack) }
    }
  }

  function setDatetime (pDatetime) {
    datetime = pDatetime
  }

  function setCoordinateSystem (pCoordinateSystem) {
    finalizeCoordinateSystem()
    coordinateSystem = pCoordinateSystem
    initializeCoordinateSystem()
  }

  function onDailyFileLoaded (event) {
    try {
      if (event.currentValue === event.totalValue) {
        /* This happens only when all of the files in the cursor have been loaded. */
        recalculate()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFileLoaded -> err = ' + err.stack) }
    }
  }

  function draw () {
    try {
      thisObject.container.frame.draw()
      plotChart()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] draw -> err = ' + err.stack) }
    }
  }

  function recalculate () {
    try {
      if (timeFrame >= _1_HOUR_IN_MILISECONDS) {
        recalculateUsingMarketFiles()
      } else {
        recalculateUsingDailyFiles()
      }
      thisObject.container.eventHandler.raiseEvent('CandleStairs Changed', records)  // --> Check This
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculate -> err = ' + err.stack) }
    }
  }

  function jsonifyDataFile (dataFile, recordDefinition, farLeftDate, farRightDate) {
      /*
          This function has as an input the raw data on files and creates with it an array of JSON objects
          with not calculated properties for later being consumed by Formulas
      */

    let jsonifiedArray = []
    let previous

    for (let i = 0; i < dataFile.length; i++) {
      let record = {}
      for (let j = 0; j < recordDefinition.properties.length; j++) {
        let property = recordDefinition.properties[j]
        if (property.code.isCalculated !== true) {
          record[property.code.codeName] = dataFile[i][j]
        }
      }

      if (
          (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) &&
          (record.end >= coordinateSystem.min.x && record.begin <= coordinateSystem.max.x)
          ) {
        record.previous = previous
        jsonifiedArray.push(record)
        previous = record

        if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {
          thisObject.currentRecord = record
          thisObject.container.eventHandler.raiseEvent('Current Record Changed', thisObject.currentRecord)
        }
      }
    }

    return jsonifiedArray
  }

  function calculationsProcedure (jsonArray, recordDefinition, calculationsProcedure, timeFrame) {
      /*
          This function has as an input an array of JSON objects, and it adds calculated properties to
          complete the set of properties that will be available.
      */

    let system = { // These are the available system variables to be used in User Code and Formulas
      timeFrame: timeFrame,
      ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS
    }
    let variable = {} // This is the structure where the user will define its own variables that will be shared across different code blocks and formulas.
    let results = []

    /* This is Initialization Code */
    if (calculationsProcedure.initialization !== undefined) {
      if (calculationsProcedure.initialization.javascriptCode !== undefined) {
        try {
          eval(calculationsProcedure.initialization.javascriptCode.code)
        } catch (err) {
          logger.write('[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Error = ' + err.stack.stack)
          logger.write('[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Code = ' + calculationsProcedure.initialization.javascriptCode.code)
          throw ('Error Executing User Code.')
        }
      }
    }

    /* This is Initialization Code */
    if (calculationsProcedure.loop !== undefined) {
      if (calculationsProcedure.loop.javascriptCode !== undefined) {
        for (let index = 0; index < jsonArray.length; index++) {
          let product = jsonArray[index]

          /* This is Loop Code */
          try {
            eval(calculationsProcedure.loop.javascriptCode.code)
          } catch (err) {
            logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. Error = ' + err.stack.stack)
            logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. product = ' + JSON.stringify(product))
            logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. Code = ' + calculationsProcedure.loop.javascriptCode.code)
            throw ('Error Executing User Code.')
          }

          /* For each calculated property we apply its formula */
          for (let j = 0; j < recordDefinition.properties.length; j++) {
            let property = recordDefinition.properties[j]
            if (property.code.isCalculated === true) {
              if (property.formula !== undefined) {
                if (property.formula.code !== undefined) {
                  try {
                    let newValue = eval(property.formula.code)
                    let currentRecord = product
                    currentRecord[property.code.codeName] = newValue
                  } catch (err) {
                    logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Error = ' + err.stack.stack)
                    logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. product = ' + JSON.stringify(product))
                    logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Code = ' + property.formula.code)
                    throw ('Error Executing User Code.')
                  }
                }
              }
            }
          }

          /* Adding the new element to the resulting array */
          results.push(product)
        }
      }
    }
    return results
  }

  function recalculateUsingDailyFiles () {
    try {
      if (fileCursor === undefined) { return }    // We need to wait until there is a fileCursor
      if (fileCursor.files.size === 0) { return } // We need to wait until there are files in the cursor

      let daysOnSides = getSideDays(timeFrame)

      let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem)
      let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem)

      let dateDiff = rightDate.valueOf() - leftDate.valueOf()

      let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
      let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

      let currentDate = new Date(farLeftDate.valueOf())

      records = []

      while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {
        let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2)

        let dailyFile = fileCursor.files.get(stringDate)

        if (dailyFile !== undefined) {
          /* Transform the current file content into an array of JSON objects */
          let jsonData = jsonifyDataFile(dailyFile, productDefinition.record, farLeftDate, farRightDate)

          /* Add the calculated properties */
          if (productDefinition.calculations !== undefined) {
            let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timeFrame)
            records.push(...calculationsResult) // This adds records to the current array.
          } else {
            records.push(...jsonData)// This adds records to the current array.
          }
        }

        currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS)
      }

      /* Lests check if all the visible screen is going to be covered by candle-record. */
      let lowerEnd = leftDate.valueOf()
      let upperEnd = rightDate.valueOf()

      if (records.length > 0) {
        if (records[0].begin > lowerEnd || records[records.length - 1].end < upperEnd) {
          setTimeout(recalculate, 2000)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingDailyFiles -> err = ' + err.stack) }
    }
  }

  function recalculateUsingMarketFiles () {
    try {
      if (marketFile === undefined) { return }    // Initialization not complete yet.

      let daysOnSides = getSideDays(timeFrame)

      let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem)
      let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem)

      let dateDiff = rightDate.valueOf() - leftDate.valueOf()

      leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
      rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

      for (let i = 0; i < records.length; i++) {
        let record = records[i]
        record.fillStyle = undefined
        record.strokeStyle = undefined
        record.dataPoints = undefined
        record.previous = undefined
        records[i] = {}
      }
      records = []

      /* Transform the current file content into an array of JSON objects */
      let jsonData = jsonifyDataFile(marketFile, productDefinition.record, leftDate, rightDate)

      /* Add the calculated properties */
      if (productDefinition.calculations !== undefined) {
        let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timeFrame)
        records.push(...calculationsResult) // This adds records to the current array.
      } else {
        records.push(...jsonData)// This adds records to the current array.
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingMarketFiles -> err = ' + err.stack) }
    }
  }

  function recalculateScale () {
    try {
      if (coordinateSystem.maxValue > 0) { return } // Already calculated.
      /* First we calculate the default scale */
      let minValue = {
        x: MIN_PLOTABLE_DATE.valueOf(),
        y: 0
      }

      let maxValue = {
        x: MAX_PLOTABLE_DATE.valueOf(),
        y: nextPorwerOf10(MAX_DEFAULT_RATE_SCALE_VALUE) / 4 // TODO: This 4 is temporary
      }

      coordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            )
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateScale -> err = ' + err.stack) }
    }
  }

  function plotChart () {
    try {
      /* Clean the pannel at places where there is no record. */
      let currentRecord = {
        data: undefined
      }
      thisObject.container.eventHandler.raiseEvent('Current Record Changed', currentRecord)

      for (let i = 0; i < records.length; i++) {
        let record = records[i]

        /*
        In the formulas to create plotters, we allos users to reference the previous record.
        To enable that we need to link all records to the previous one in this way.
        */
        if (i == 0) {
          record.previous = record
        } else {
          record.previous = records[i - 1]
        }

        let beginPoint = {
          x: record.begin,
          y: 0
        }

        let endPoint = {
          x: record.end,
          y: 0
        }

        beginPoint = coordinateSystem.transformThisPoint(beginPoint)
        endPoint = coordinateSystem.transformThisPoint(endPoint)

        beginPoint = transformThisPoint(beginPoint, thisObject.container)
        endPoint = transformThisPoint(endPoint, thisObject.container)

        beginPoint = canvas.chartingSpace.viewport.fitIntoVisibleArea(beginPoint)
        endPoint = canvas.chartingSpace.viewport.fitIntoVisibleArea(endPoint)

        beginPoint = thisObject.fitFunction(beginPoint)
        endPoint = thisObject.fitFunction(endPoint)

        if (endPoint.x < canvas.chartingSpace.viewport.visibleArea.bottomLeft.x || beginPoint.x > canvas.chartingSpace.viewport.visibleArea.bottomRight.x) {
          continue
        }

        let atMousePosition = false
        if (userPositionDate >= record.begin && userPositionDate <= record.end) {
          atMousePosition = true

          let currentRecord = {
            data: record
          }
          thisObject.container.eventHandler.raiseEvent('Current Record Changed', currentRecord)
        }

        /* If there is code we execute it now. */
        if (productDefinition.referenceParent.javascriptCode !== undefined) {
          eval(productDefinition.referenceParent.javascriptCode.code)
        }

        if (productDefinition.referenceParent.shapes === undefined) { continue }
        if (productDefinition.referenceParent.shapes.chartPoints === undefined) { continue }
        let dataPoints = new Map()
        if (record.dataPoints !== undefined && mustRecalculateDataPoints === false) {
          /* We use the datapoints already calculated. */
          dataPoints = record.dataPoints
        } else {
          if (logged === false) {
            logged = true
          }
          /* It seems we need to calculate the data points this time. */
          for (let k = 0; k < productDefinition.referenceParent.shapes.chartPoints.length; k++) {
            let chartPoints = productDefinition.referenceParent.shapes.chartPoints[k]
            for (let j = 0; j < chartPoints.points.length; j++) {
              let point = chartPoints.points[j]
              if (point.pointFormula !== undefined) {
                let x = 0
                let y = 0
                eval(point.pointFormula.code)
                let dataPoint = {
                  x: x,
                  y: y
                }
                /* Contributing to Auto-Scale */
                coordinateSystem.reportYValue(dataPoint.y)

              /*
              The information we store in files is independent from the charing system and its coordinate systems.
              That means that the first thing we allways need to do is to trasform these points to the coordinate system of the timeline.
              */
                dataPoint = coordinateSystem.transformThisPoint(dataPoint)
                dataPoint = transformThisPoint(dataPoint, thisObject.container)
                dataPoint = canvas.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)
                dataPoint = thisObject.fitFunction(dataPoint)

              /* Store the data point at the local map */
                dataPoints.set(point.id, dataPoint)
              }
            }
          }

          /* Remember this datapoints, so that we do not need to calculate them again. */
          record.dataPoints = dataPoints
        }

        for (let j = 0; j < productDefinition.referenceParent.shapes.polygons.length; j++) {
          let polygon = productDefinition.referenceParent.shapes.polygons[j]
          let calculatedStyle

          /* Finding out the fill style */
          let fillStyle = { // default values
            opacity: 1,
            paletteColor: UI_COLOR.BLACK
          }
          if (polygon.polygonBody !== undefined) {
            if (record.fillStyle === undefined) {
              record.fillStyle = new Map()
            }
            calculatedStyle = record.fillStyle.get(polygon.id)
            if (calculatedStyle !== undefined) {
            /* We use the already calculated style */
              fillStyle = calculatedStyle
            } else {
              /* Get the default style if exists */
              if (polygon.polygonBody.style !== undefined) {
                if (polygon.polygonBody.style.code !== undefined) {
                  if (polygon.polygonBody.style.code.default !== undefined) {
                    let bodyStyle = polygon.polygonBody.style.code.default
                    if (bodyStyle.opacity !== undefined) { fillStyle.opacity = bodyStyle.opacity }
                    if (bodyStyle.paletteColor !== undefined) { fillStyle.paletteColor = eval(bodyStyle.paletteColor) }
                  }
                }
              }
              /* Apply conditional styles */
              if (polygon.polygonBody.styleConditions !== undefined) {
                for (let k = 0; k < polygon.polygonBody.styleConditions.length; k++) {
                  let condition = polygon.polygonBody.styleConditions[k]
                  let value = eval(condition.code)
                  if (value === true) {
                    if (condition.style !== undefined) {
                      let bodyStyle = condition.style.code
                      if (bodyStyle.opacity !== undefined) { fillStyle.opacity = bodyStyle.opacity }
                      if (bodyStyle.paletteColor !== undefined) { fillStyle.paletteColor = eval(bodyStyle.paletteColor) }
                    }
                  }
                }
              }
              /* Get the atMousePosition style if exists */
              if (polygon.polygonBody.style !== undefined) {
                if (polygon.polygonBody.style.code.atMousePosition !== undefined) {
                  let atMousePositionStyleDefinition = polygon.polygonBody.style.code.atMousePosition
                  let atMousePositionStyle = {}
                  if (atMousePositionStyleDefinition.opacity !== undefined) { atMousePositionStyle.opacity = atMousePositionStyleDefinition.opacity }
                  if (atMousePositionStyleDefinition.paletteColor !== undefined) { atMousePositionStyle.paletteColor = eval(atMousePositionStyleDefinition.paletteColor) }
                  atMousePositionFillStyles.set(polygon.id, atMousePositionStyle)
                }
              }

              record.fillStyle.set(polygon.id, fillStyle)
            }
          }

          /* Finding out the stroke style */
          let strokeStyle = { // default values
            opacity: 1,
            paletteColor: UI_COLOR.BLACK,
            lineWidth: 1,
            lineDash: [0, 0]
          }
          if (polygon.polygonBorder !== undefined) {
            if (record.strokeStyle === undefined) {
              record.strokeStyle = new Map()
            }
            calculatedStyle = record.strokeStyle.get(polygon.id)
            if (calculatedStyle !== undefined) {
            /* We use the already calculated style */
              strokeStyle = calculatedStyle
            } else {
              /* Get the default style if exists */
              if (polygon.polygonBorder.style !== undefined) {
                if (polygon.polygonBorder.style.code !== undefined) {
                  if (polygon.polygonBorder.style.code.default !== undefined) {
                    let borderStyle = polygon.polygonBorder.style.code.default
                    if (borderStyle.opacity !== undefined) { strokeStyle.opacity = borderStyle.opacity }
                    if (borderStyle.paletteColor !== undefined) { strokeStyle.paletteColor = eval(borderStyle.paletteColor) }
                    if (borderStyle.lineWidth !== undefined) { strokeStyle.lineWidth = borderStyle.lineWidth }
                    if (borderStyle.lineDash !== undefined) { strokeStyle.lineDash = borderStyle.lineDash }
                  }
                }
              }
              /* Apply conditional styles */
              if (polygon.polygonBorder.styleConditions !== undefined) {
                for (let k = 0; k < polygon.polygonBorder.styleConditions.length; k++) {
                  let condition = polygon.polygonBorder.styleConditions[k]
                  let value = eval(condition.code)
                  if (value === true) {
                    if (condition.style !== undefined) {
                      let borderStyle = condition.style.code
                      if (borderStyle.opacity !== undefined) { strokeStyle.opacity = borderStyle.opacity }
                      if (borderStyle.paletteColor !== undefined) { strokeStyle.paletteColor = eval(borderStyle.paletteColor) }
                      if (borderStyle.lineWidth !== undefined) { strokeStyle.lineWidth = borderStyle.lineWidth }
                      if (borderStyle.lineDash !== undefined) { strokeStyle.lineDash = borderStyle.lineDash }
                    }
                  }
                }
              }
              /* Get the atMousePosition style if exists */
              if (polygon.polygonBorder.style !== undefined) {
                if (polygon.polygonBorder.style.code.atMousePosition !== undefined) {
                  let atMousePositionStyleDefinition = polygon.polygonBorder.style.code.atMousePosition
                  let atMousePositionStyle = {}
                  if (atMousePositionStyleDefinition.opacity !== undefined) { atMousePositionStyle.opacity = atMousePositionStyleDefinition.opacity }
                  if (atMousePositionStyleDefinition.paletteColor !== undefined) { atMousePositionStyle.paletteColor = eval(atMousePositionStyleDefinition.paletteColor) }
                  if (atMousePositionStyleDefinition.lineWidth !== undefined) { atMousePositionStyle.lineWidth = atMousePositionStyleDefinition.lineWidth }
                  if (atMousePositionStyleDefinition.lineDash !== undefined) { atMousePositionStyle.lineDash = atMousePositionStyleDefinition.lineDash }
                  atMousePositionStrokeStyles.set(polygon.id, atMousePositionStyle)
                }
              }

              record.strokeStyle.set(polygon.id, strokeStyle)
            }
          }

          /* Draw the Polygon */
          browserCanvasContext.beginPath()
          for (let k = 0; k < polygon.polygonVertexes.length; k++) {
            let polygonVertex = polygon.polygonVertexes[k]
            if (polygonVertex.referenceParent !== undefined) {
              let dataPointObject = dataPoints.get(polygonVertex.referenceParent.id)
              let dataPoint = {
                x: dataPointObject.x,
                y: dataPointObject.y
              }
              /* We make sure the points do not fall outside the viewport visible area. This step allways need to be done.  */
              dataPoint = canvas.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)
              dataPoint = thisObject.fitFunction(dataPoint)
              if (k === 0) {
                browserCanvasContext.moveTo(dataPoint.x, dataPoint.y)
              } else {
                browserCanvasContext.lineTo(dataPoint.x, dataPoint.y)
              }
            }
          }
          browserCanvasContext.closePath()

        /* Apply the fill style to the canvas object */
          if (polygon.polygonBody !== undefined) {
            /* Replace the fill style if we are at mouse position */
            if (atMousePosition === true) {
              let atMousePositionFillStyle = atMousePositionFillStyles.get(polygon.id)
              if (atMousePositionFillStyle !== undefined) {
                fillStyle = atMousePositionFillStyle
              }
            }

            browserCanvasContext.fillStyle = 'rgba(' + fillStyle.paletteColor + ', ' + fillStyle.opacity + ')'
            browserCanvasContext.fill()
          }

        /* Apply the stroke style to the canvas object */
          if (polygon.polygonBorder !== undefined) {
            /* Replace the stroke style if we are at mouse position */
            if (atMousePosition === true) {
              let atMousePositionStrokeStyle = atMousePositionStrokeStyles.get(polygon.id)
              if (atMousePositionStrokeStyle !== undefined) {
                strokeStyle = atMousePositionStrokeStyle
              }
            }

            browserCanvasContext.lineWidth = strokeStyle.lineWidth
            browserCanvasContext.setLineDash(strokeStyle.lineDash)
            browserCanvasContext.strokeStyle = 'rgba(' + strokeStyle.paletteColor + ', ' + strokeStyle.opacity + ')'
            browserCanvasContext.stroke()
          }
        }
      }

      if (coordinateSystem.autoMinYScale === true || coordinateSystem.autoMinYScale === true) {
        mustRecalculateDataPoints = true
      } else {
        mustRecalculateDataPoints = false
      }

      logged = false
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] plotChart -> err = ' + err.stack) }
    }
  }

  function onViewportZoomChanged (event) {
    try {
      mustRecalculateDataPoints = true
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onViewportZoomChanged -> err = ' + err.stack) }
    }
  }

  function onDragFinished () {
    try {
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragFinished -> err = ' + err.stack) }
    }
  }

  function onDisplace (event) {
    recalculateAll(event)
  }

  function onViewportPositionChanged (event) {
    recalculateAll(event)
  }

  function recalculateAll (event) {
    mustRecalculateDataPoints = true
    if (event !== undefined) {
      if (event.recalculate === true) {
        recalculate()
        return
      }
    }
    if (Math.random() * 100 > 95) {
      recalculate()
    }
  }
}
