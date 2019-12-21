function newPlotter () {
  const MODULE_NAME = 'Plotter'
  const ERROR_LOG = true
  const INTENSIVE_LOG = false
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {

        /* Events declared outside the plotter. */

    onDailyFileLoaded: onDailyFileLoaded,

        // Main functions and properties.

    initialize: initialize,
    finalize: finalize,
    container: undefined,
    getContainer: getContainer,
    setTimePeriod: setTimePeriod,
    setDatetime: setDatetime,
    recalculateScale: recalculateScale,
    draw: draw,

        // Secondary functions and properties.

    currentRecord: undefined  // ---> Check Here
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  let timeLineCoordinateSystem = newTimeLineCoordinateSystem()        // Needed to be able to plot on the timeline.
  let slotCoordinateSystem                                            // Needed to be able to plot on a slot over the timeline.
  let plotterModuleConfig
  let slotHeight = (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y) / 10  // This is the amount of slots available
  let mustRecalculateDataPoints = false
  let atMousePositionFillStyles = new Map()
  let atMousePositionStrokeStyles = new Map()

  let timePeriod                                                      // This will hold the current Time Period the user is at.
  let datetime                                                        // This will hold the current Datetime the user is at.

  let marketFile                                                      // This is the current Market File being plotted.
  let fileCursor                                                      // This is the current File Cursor being used to retrieve Daily Files.

  let marketFiles                                                     // This object will provide the different Market Files at different Time Periods.
  let dailyFiles                                                      // This object will provide the different File Cursors at different Time Periods.

  let productDefinition                                               // Here we store a snapshot of the product definition which references this plotter.

  let records = []                                                    // We will have the information to be plotted here.

  let zoomChangedEventSubscriptionId
  let offsetChangedEventSubscriptionId
  let dragFinishedEventSubscriptionId
  let dimmensionsChangedEventSubscriptionId
  let marketFilesUpdatedEventSubscriptionId
  let dailyFilesUpdatedEventSubscriptionId

  let logged = false
  return thisObject

  function finalize () {
    try {
      /* Stop listening to the necesary events. */
      viewPort.eventHandler.stopListening(zoomChangedEventSubscriptionId)
      viewPort.eventHandler.stopListening(offsetChangedEventSubscriptionId)
      canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId)
      thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
      marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId)
      dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId)

      /* Clear References */
      marketFiles = undefined
      dailyFiles = undefined

      datetime = undefined
      timePeriod = undefined

      marketFile = undefined
      fileCursor = undefined

      timeLineCoordinateSystem = undefined
      slotCoordinateSystem = undefined
      plotterModuleConfig = undefined
      slotHeight = undefined
      mustRecalculateDataPoints = undefined
      atMousePositionFillStyles = undefined
      atMousePositionStrokeStyles = undefined
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack.stack) }
    }
  }

  function initialize (pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction, pProductDefinition) {
    try {
      /* Store the information received. */
      marketFiles = pStorage.marketFiles[0]
      dailyFiles = pStorage.dailyFiles[0]

      datetime = pDatetime
      timePeriod = pTimePeriod

      productDefinition = pProductDefinition

      /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */
      marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS)  // This file is the one processed faster.

      recalculateScale()

      /* Now we set the right files according to current Period. */
      marketFile = marketFiles.getFile(pTimePeriod)
      fileCursor = dailyFiles.getFileCursor(pTimePeriod)

      /* Listen to the necesary events. */
      zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)
      offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent('Offset Changed', onOffsetChanged)
      dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent('Drag Finished', onDragFinished)
      marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent('Files Updated', onMarketFilesUpdated)
      dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent('Files Updated', onDailyFilesUpdated)

      /* Get ready for plotting. */
      recalculate()
      dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
        recalculateScale()
        recalculate()
      })

      callBackFunction()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onMarketFilesUpdated () {
    try {
      let newMarketFile = marketFiles.getFile(timePeriod)
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
      let newFileCursor = dailyFiles.getFileCursor(timePeriod)
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
      if (this.container.frame.isThisPointHere(point) === true) {
        return this.container
      } else {
      /* This point does not belong to this space. */
        return undefined
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getContainer -> err = ' + err.stack) }
    }
  }

  function setTimePeriod (pTimePeriod) {
    try {
      if (timePeriod !== pTimePeriod) {
        timePeriod = pTimePeriod
        mustRecalculateDataPoints = true
        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {
          let newMarketFile = marketFiles.getFile(pTimePeriod)

          if (newMarketFile !== undefined) {
            marketFile = newMarketFile
            recalculate()
          }
        } else {
          let newFileCursor = dailyFiles.getFileCursor(pTimePeriod)

          if (newFileCursor !== undefined) {
            fileCursor = newFileCursor
            recalculate()
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimePeriod -> err = ' + err.stack) }
    }
  }

  function setDatetime (pDatetime) {
    datetime = pDatetime
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
      this.container.frame.draw()
      plotChart()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] draw -> err = ' + err.stack) }
    }
  }

  function recalculate () {
    try {
      if (timePeriod >= _1_HOUR_IN_MILISECONDS) {
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

      if (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) {
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

  function calculationsProcedure (jsonArray, recordDefinition, calculationsProcedure, timePeriod) {
      /*
          This function has as an input an array of JSON objects, and it adds calculated properties to
          complete the set of properties that will be available.
      */

    let system = { // These are the available system variables to be used in User Code and Formulas
      timePeriod: timePeriod,
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

      let daysOnSides = getSideDays(timePeriod)

      let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem)
      let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem)

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
            let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timePeriod)
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

      let daysOnSides = getSideDays(timePeriod)

      let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem)
      let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem)

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
        let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timePeriod)
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
      if (timeLineCoordinateSystem.maxValue > 0) { return } // Already calculated.
      /* First we calculate the default scale */
      let minValue = {
        x: MIN_PLOTABLE_DATE.valueOf(),
        y: 0
      }

      let maxValue = {
        x: MAX_PLOTABLE_DATE.valueOf(),
        y: nextPorwerOf10(USDT_BTC_HTH) / 4 // TODO: This 4 is temporary
      }

      timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            )

      /* In case the plotter is configured to a certain slot, we calculate the slot coordinate system too. */
      if (productDefinition.referenceParent.code === undefined) { return }
      plotterModuleConfig = productDefinition.referenceParent.code
      if (plotterModuleConfig.slot === undefined) { return }

      slotCoordinateSystem = newTimeLineCoordinateSystem()

      minValue.y = plotterModuleConfig.slot.minValue
      maxValue.y = plotterModuleConfig.slot.maxValue

      slotCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                slotHeight
            )
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateScale -> err = ' + err.stack) }
    }
  }

  function plotChart () {
    try {
      let userPosition = getUserPosition()
      let userPositionDate = userPosition.point.x

      /* Clean the pannel at places where there is no record. */
      let currentRecord = {
        data: undefined
      }
      thisObject.container.eventHandler.raiseEvent('Current Record Changed', currentRecord)

      for (let i = 0; i < records.length; i++) {
        let record = records[i]

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

        beginPoint = timeLineCoordinateSystem.transformThisPoint(beginPoint)
        endPoint = timeLineCoordinateSystem.transformThisPoint(endPoint)

        beginPoint = transformThisPoint(beginPoint, thisObject.container)
        endPoint = transformThisPoint(endPoint, thisObject.container)

        if (endPoint.x < viewPort.visibleArea.bottomLeft.x || beginPoint.x > viewPort.visibleArea.bottomRight.x) {
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
          /* Only calculate the datapoints for this record, if we have not calculate it before. */
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

              /*
              The information we store in files is independent from the charing system and its coordinate systems.
              That means that the first thing we allways need to do is to trasform these points to the coordinate system of the timeline.
              */
                dataPoint = timeLineCoordinateSystem.transformThisPoint(dataPoint)

              /*
              The browser canvas object does not care about our timeline and its coordinate system. In order to draw on a html canvas we
              need the points to be converted into the canvas coordinate system.
              Next we transform again to the screen coordinate system.
              */
                dataPoint = transformThisPoint(dataPoint, thisObject.container)

              /* Store the data point at the local map */
                dataPoints.set(point.id, dataPoint)

                if (plotterModuleConfig !== undefined) {
                  if (plotterModuleConfig.slot !== undefined) {
                  /* We reset the y coordinate since it will be transformed with another coordinate system to fit into a slot. */
                    dataPoint.y = (-1) * y * slotCoordinateSystem.scale.y + (plotterModuleConfig.slot.number - 1) * slotHeight + viewPort.visibleArea.topLeft.y
                  }
                }
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
              dataPoint = viewPort.fitIntoVisibleArea(dataPoint)
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

      mustRecalculateDataPoints = false
      logged = false
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] plotChart -> err = ' + err.stack) }
    }
  }

  function onZoomChanged (event) {
    try {
      mustRecalculateDataPoints = true
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onZoomChanged -> err = ' + err.stack) }
    }
  }

  function onDragFinished () {
    try {
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragFinished -> err = ' + err.stack) }
    }
  }

  function onOffsetChanged (event) {
    try {
      mustRecalculateDataPoints = true
      if (event !== undefined) {
        if (event.recalculate === true) {
          recalculate()
          return
        }
      }
      if (Math.random() * 100 > 95) {
        recalculate()
      };
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onOffsetChanged -> err = ' + err.stack) }
    }
  }
}
