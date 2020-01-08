function newTimeFrameScale () {
  const MODULE_NAME = 'Time Frame Scale'

  let thisObject = {
    timeFrame: undefined,
    container: undefined,
    fitFunction: undefined,
    draw: draw,
    physics: physics,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  const FILES_PERIOD_DEFAULT_VALUE = 0
  const TIME_PERIOD_DEFAULT_VALUE = 0
  const MIN_HEIGHT = 50

  let visible = true
  let objectStorage = {}
  let filePeriodIndex = FILES_PERIOD_DEFAULT_VALUE
  let timeFrameIndex = TIME_PERIOD_DEFAULT_VALUE
  let timeFramesMasterArray = [marketFilesPeriods, dailyFilePeriods]
  let timeFrameLabel = ''

  let onMouseWheelEventSubscriptionId
  let onZoomChangedEventSubscriptionId

  setupContainer()
  return thisObject

  function setupContainer () {
    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    thisObject.container.isDraggeable = false
    thisObject.container.isClickeable = false
    thisObject.container.isWheelable = true

    thisObject.container.frame.width = 190
    thisObject.container.frame.height = 25
  }

  function finalize () {
    thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
    viewPort.eventHandler.stopListening(onZoomChangedEventSubscriptionId)

    objectStorage = undefined

    thisObject.container.finalize()
    thisObject.container = undefined
    thisObject.fitFunction = undefined
  }

  function initialize () {
    onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

    readObjectState()
    newTimeFrame()

    onZoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent('Zoom Changed', onZoomChanged)
  }

  function physics () {

  }

  function onZoomChanged (event) {
    if (event !== undefined) { // it is undefined when the level is just being animated.
      let currentTimeFrame = thisObject.timeFrame
      let timeFrame = recalculatePeriod(event.newLevel)
      if (timeFrame !== currentTimeFrame) {
        for (let i = 0; i < timeFramesMasterArray.length; i++) {
          let timeFrameArray = timeFramesMasterArray[i]
          for (let j = 0; j < timeFrameArray.length; j++) {
            let record = timeFrameArray[j]
            if (timeFrame === record[0]) {
              filePeriodIndex = i
              timeFrameIndex = j
            }
          }
        }
        saveObjectState()
        newTimeFrame()
      }
    }
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta < 0) {
      timeFrameIndex--
      if (timeFrameIndex < 0) {
        filePeriodIndex--
        if (filePeriodIndex < 0) {
          filePeriodIndex = 0
          timeFrameIndex = 0
        } else {
          timeFrameIndex = timeFramesMasterArray[filePeriodIndex].length - 1
        }
      }
    } else {
      timeFrameIndex++
      if (timeFrameIndex > timeFramesMasterArray[filePeriodIndex].length - 1) {
        filePeriodIndex++
        if (filePeriodIndex > timeFramesMasterArray.length - 1) {
          filePeriodIndex = timeFramesMasterArray.length - 1
          timeFrameIndex = timeFramesMasterArray[filePeriodIndex].length - 1
        } else {
          timeFrameIndex = 0
        }
      }
    }

    saveObjectState()
    newTimeFrame()
  }

  function getContainer (point) {
    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    }
  }

  function saveObjectState () {
    objectStorage.filePeriodIndex = filePeriodIndex
    objectStorage.timeFrameIndex = timeFrameIndex
    window.localStorage.setItem(MODULE_NAME, JSON.stringify(objectStorage))
  }

  function readObjectState () {
    let objectStorageString = window.localStorage.getItem(MODULE_NAME)
    if (objectStorageString !== null && objectStorageString !== '') {
      objectStorage = JSON.parse(objectStorageString)
      filePeriodIndex = objectStorage.filePeriodIndex
      timeFrameIndex = objectStorage.timeFrameIndex
    }
  }

  function newTimeFrame () {
    let timeFrameArray = timeFramesMasterArray[filePeriodIndex]
    thisObject.timeFrame = timeFrameArray[timeFrameIndex][0]
    timeFrameLabel = timeFrameArray[timeFrameIndex][1]

    let event = {}
    event.timeFrame = thisObject.timeFrame
    thisObject.container.eventHandler.raiseEvent('Time Frame Changed', event)
    window.localStorage.setItem('Current Time Frame', JSON.stringify({filePeriodIndex: filePeriodIndex, timeFrameIndex: timeFrameIndex}))
  }

  function draw () {
    if (visible === false) { return }

    drawTimeFrame()
  }

  function drawTimeFrame () {
    if (thisObject.visible === false || timeFrameLabel === undefined) { return }

    let label = timeFrameLabel.split('-')
    let label1 = label[0]
    let label2 = label[1].toUpperCase()

    drawScaleDisplay(label1, label2, 10, 60, thisObject.container, thisObject.fitFunction)
  }
}
