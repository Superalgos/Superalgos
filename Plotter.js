function newPlotter () {
  const MODULE_NAME = 'AAMasters Plotters Bollinger Channels'
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

    currentChannel: undefined
  }

    /* this is part of the module template */

  let container = newContainer()     // Do not touch this 3 lines, they are just needed.
  container.initialize()
  thisObject.container = container

  let timeLineCoordinateSystem = newTimeLineCoordinateSystem()       // Needed to be able to plot on the timeline, otherwise not.

  let timePeriod                     // This will hold the current Time Period the user is at.
  let datetime                       // This will hold the current Datetime the user is at.

  let marketFile                     // This is the current Market File being plotted.
  let fileCursor                     // This is the current File Cursor being used to retrieve Daily Files.

  let marketFiles                      // This object will provide the different Market Files at different Time Periods.
  let dailyFiles                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

  let channels = []

  let zoomChangedEventSubscriptionId
  let offsetChangedEventSubscriptionId
  let dragFinishedEventSubscriptionId
  let dimmensionsChangedEventSubscriptionId
  let marketFilesUpdatedEventSubscriptionId
  let dailyFilesUpdatedEventSubscriptionId

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

            /* Destroyd References */

      marketFiles = undefined
      dailyFiles = undefined

      datetime = undefined
      timePeriod = undefined

      marketFile = undefined
      fileCursor = undefined
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize (pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {
    try {
            /* Store the information received. */

      marketFiles = pStorage.marketFiles[0]
      dailyFiles = pStorage.dailyFiles[0]

      datetime = pDatetime
      timePeriod = pTimePeriod

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
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function onMarketFilesUpdated () {
    try {
      let newMarketFile = marketFiles.getFile(timePeriod)
      if (newMarketFile !== undefined) {
        marketFile = newMarketFile
        recalculate()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMarketFilesUpdated -> err = ' + err.stack) }
    }
  }

  function onDailyFilesUpdated () {
    try {
      let newFileCursor = dailyFiles.getFileCursor(timePeriod)
      if (newFileCursor !== undefined) {
        fileCursor = newFileCursor
        recalculate()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFilesUpdated -> err = ' + err.stack) }
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
      if (ERROR_LOG === true) { logger.write('[ERROR] getContainer -> err = ' + err) }
    }
  }

  function setTimePeriod (pTimePeriod) {
    try {
      if (timePeriod !== pTimePeriod) {
        timePeriod = pTimePeriod

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
      if (ERROR_LOG === true) { logger.write('[ERROR] setTimePeriod -> err = ' + err) }
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
      if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFileLoaded -> err = ' + err) }
    }
  }

  function draw () {
    try {
      this.container.frame.draw()

      plotChart()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] draw -> err = ' + err) }
    }
  }

  function recalculate () {
    try {
      if (timePeriod >= _1_HOUR_IN_MILISECONDS) {
        recalculateUsingMarketFiles()
      } else {
        recalculateUsingDailyFiles()
      }

      thisObject.container.eventHandler.raiseEvent('CandleStairs Changed', channels)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculate -> err = ' + err) }
    }
  }

  function recalculateUsingDailyFiles () {
    try {
      if (fileCursor === undefined) { return } // We need to wait

      if (fileCursor.files.size === 0) { return } // We need to wait until there are files in the cursor

      let daysOnSides = getSideDays(timePeriod)

      let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem)
      let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem)

      let dateDiff = rightDate.valueOf() - leftDate.valueOf()

      let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
      let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

      let currentDate = new Date(farLeftDate.valueOf())

      channels = []

      while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {
        let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2)

        let dailyFile = fileCursor.files.get(stringDate)

        if (dailyFile !== undefined) {
          for (let i = 0; i < dailyFile.length; i++) {
            let channel = {
              begin: undefined,
              end: undefined,
              direction: undefined,
              period: 0,
              firstMovingAverage: 0,
              lastMovingAverage: 0,
              firstDeviation: 0,
              lastDeviation: 0
            }

            channel.begin = dailyFile[i][0]
            channel.end = dailyFile[i][1]

            channel.direction = dailyFile[i][2]

            channel.period = dailyFile[i][3]

            channel.firstMovingAverage = dailyFile[i][4]
            channel.lastMovingAverage = dailyFile[i][5]

            channel.firstDeviation = dailyFile[i][6]
            channel.lastDeviation = dailyFile[i][7]

            if (channel.begin >= farLeftDate.valueOf() && channel.end <= farRightDate.valueOf()) {
              channels.push(channel)

              if (datetime.valueOf() >= channel.begin && datetime.valueOf() <= channel.end) {
                thisObject.currentChannel = channel
                thisObject.container.eventHandler.raiseEvent('Current Channel Changed', thisObject.currentChannel)
              }
            }
          }
        }

        currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS)
      }

            /* Lests check if all the visible screen is going to be covered by candle-channel. */

      let lowerEnd = leftDate.valueOf()
      let upperEnd = rightDate.valueOf()

      if (channels.length > 0) {
        if (channels[0].begin > lowerEnd || channels[channels.length - 1].end < upperEnd) {
          setTimeout(recalculate, 2000)

                    // console.log("File missing while calculating candle-channel, scheduling a recalculation in 2 seconds.");
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingDailyFiles -> err = ' + err) }
    }
  }

  function recalculateUsingMarketFiles () {
    try {
      if (marketFile === undefined) { return } // Initialization not complete yet.

      let daysOnSides = getSideDays(timePeriod)

      let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem)
      let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem)

      let dateDiff = rightDate.valueOf() - leftDate.valueOf()

      leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
      rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

      channels = []

      for (let i = 0; i < marketFile.length; i++) {
        let channel = {
          begin: undefined,
          end: undefined,
          direction: undefined,
          period: 0,
          firstMovingAverage: 0,
          lastMovingAverage: 0,
          firstDeviation: 0,
          lastDeviation: 0
        }

        channel.begin = marketFile[i][0]
        channel.end = marketFile[i][1]

        channel.direction = marketFile[i][2]

        channel.period = marketFile[i][3]

        channel.firstMovingAverage = marketFile[i][4]
        channel.lastMovingAverage = marketFile[i][5]

        channel.firstDeviation = marketFile[i][6]
        channel.lastDeviation = marketFile[i][7]

        if (channel.begin >= leftDate.valueOf() && channel.end <= rightDate.valueOf()) {
          channels.push(channel)

          if (datetime.valueOf() >= channel.begin && datetime.valueOf() <= channel.end) {
            thisObject.currentChannel = channel
            thisObject.container.eventHandler.raiseEvent('Current Channel Changed', thisObject.currentChannel)
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingMarketFiles -> err = ' + err) }
    }
  }

  function recalculateScale () {
    try {
      if (timeLineCoordinateSystem.maxValue > 0) { return } // Already calculated.

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
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] recalculateScale -> err = ' + err) }
    }
  }

  function plotChart () {
    try {
      let userPosition = getUserPosition()
      let userPositionDate = userPosition.point.x

            /* Clean the pannel at places where there is no channel. */

      let channel = {
        direction: '',
        period: ''
      }

      let currentChannel = {
        innerChannel: channel
      }

      thisObject.container.eventHandler.raiseEvent('Current Channel Changed', currentChannel)

      if (channels.length > 0) {
        for (let i = 0; i < channels.length; i++) {
          channel = channels[i]

          let channelPoint1
          let channelPoint2
          let channelPoint3
          let channelPoint4

          channelPoint1 = {
            x: channel.begin,
            y: channel.firstMovingAverage - channel.firstDeviation
          }

          channelPoint2 = {
            x: channel.end,
            y: channel.lastMovingAverage - channel.lastDeviation
          }

          channelPoint3 = {
            x: channel.end,
            y: channel.lastMovingAverage + channel.lastDeviation
          }

          channelPoint4 = {
            x: channel.begin,
            y: channel.firstMovingAverage + channel.firstDeviation
          }

          channelPoint1 = timeLineCoordinateSystem.transformThisPoint(channelPoint1)
          channelPoint2 = timeLineCoordinateSystem.transformThisPoint(channelPoint2)
          channelPoint3 = timeLineCoordinateSystem.transformThisPoint(channelPoint3)
          channelPoint4 = timeLineCoordinateSystem.transformThisPoint(channelPoint4)

          channelPoint1 = transformThisPoint(channelPoint1, thisObject.container)
          channelPoint2 = transformThisPoint(channelPoint2, thisObject.container)
          channelPoint3 = transformThisPoint(channelPoint3, thisObject.container)
          channelPoint4 = transformThisPoint(channelPoint4, thisObject.container)

          if (channelPoint2.x < viewPort.visibleArea.bottomLeft.x || channelPoint1.x > viewPort.visibleArea.bottomRight.x) {
            continue
          }

          channelPoint1 = viewPort.fitIntoVisibleArea(channelPoint1)
          channelPoint2 = viewPort.fitIntoVisibleArea(channelPoint2)
          channelPoint3 = viewPort.fitIntoVisibleArea(channelPoint3)
          channelPoint4 = viewPort.fitIntoVisibleArea(channelPoint4)

          browserCanvasContext.beginPath()

          browserCanvasContext.moveTo(channelPoint1.x, channelPoint1.y)
          browserCanvasContext.lineTo(channelPoint2.x, channelPoint2.y)
          browserCanvasContext.lineTo(channelPoint3.x, channelPoint3.y)
          browserCanvasContext.lineTo(channelPoint4.x, channelPoint4.y)

          browserCanvasContext.closePath()

          let opacity = '0.25'

          if (channel.direction === 'Side') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT + ', ' + opacity + ')' }
          if (channel.direction === 'Up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')' }
          if (channel.direction === 'Down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')' }

          if (userPositionDate >= channel.begin && userPositionDate <= channel.end) {
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.1)' // Current channel accroding to time

            let currentChannel = {
              innerChannel: channel
            }
            thisObject.container.eventHandler.raiseEvent('Current Channel Changed', currentChannel)
          }

          browserCanvasContext.fill()

          browserCanvasContext.beginPath()

          browserCanvasContext.moveTo(channelPoint1.x, channelPoint1.y)
          browserCanvasContext.lineTo(channelPoint2.x, channelPoint2.y)
          browserCanvasContext.moveTo(channelPoint3.x, channelPoint3.y)
          browserCanvasContext.lineTo(channelPoint4.x, channelPoint4.y)

          browserCanvasContext.closePath()

          if (channel.direction === 'Side') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')' }
          if (channel.direction === 'Up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')' }
          if (channel.direction === 'Down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')' }

          browserCanvasContext.lineWidth = 1
          browserCanvasContext.setLineDash([0, 0])
          browserCanvasContext.stroke()
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] plotChart -> err = ' + err) }
    }
  }

  function onZoomChanged (event) {
    try {
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onZoomChanged -> err = ' + err) }
    }
  }

  function onDragFinished () {
    try {
      recalculate()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragFinished -> err = ' + err) }
    }
  }

  function onOffsetChanged (event) {
    try {
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
      if (ERROR_LOG === true) { logger.write('[ERROR] onOffsetChanged -> err = ' + err) }
    }
  }
}

