 ﻿function newRigthScale () {
   const MODULE_NAME = 'Right Scale'
   const INFO_LOG = false
   const INTENSIVE_LOG = false
   const ERROR_LOG = true
   const logger = newWebDebugLog()
   logger.fileName = MODULE_NAME

   let thisObject = {
     container: undefined,
     draw: draw,
     getContainer: getContainer,
     initialize: initialize,
     heightPercentage: 100
   }

   const HEIGHT_PERCENTAGE_DEFAULT_VALUE = 50
   const RIGHT_MARGIN = 50
   const STEP_SIZE = 5

   thisObject.container = newContainer()
   thisObject.container.initialize(MODULE_NAME)

   thisObject.container.frame.width = RIGHT_MARGIN
   thisObject.container.frame.height = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y

   thisObject.container.frame.position.x = viewPort.visibleArea.bottomRight.x
   thisObject.container.frame.position.y = TOP_SPACE_HEIGHT

   thisObject.container.isDraggeable = false
   thisObject.container.isClickeable = false
   thisObject.container.isWheelable = true

   let mouse = {
     position: {
       x: 0,
       y: 0
     }
   }

   return thisObject

   function initialize () {
     thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)

     thisObject.heightPercentage = window.localStorage.getItem(MODULE_NAME)
     if (!thisObject.heightPercentage) {
       thisObject.heightPercentage = HEIGHT_PERCENTAGE_DEFAULT_VALUE
     } else {
       thisObject.heightPercentage = JSON.parse(thisObject.heightPercentage)
     }

     event.heightPercentage = thisObject.heightPercentage
     thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

     thisObject.container.eventHandler.listenToEvent('onMouseOver', function (event) {
       mouse.position.x = event.x
       mouse.position.y = event.y
     })
   }

   function onMouseWheel (event) {
     delta = event.wheelDelta
     if (delta < 0) {
       thisObject.heightPercentage = thisObject.heightPercentage - STEP_SIZE
       if (thisObject.heightPercentage < STEP_SIZE) { thisObject.heightPercentage = STEP_SIZE }
     } else {
       thisObject.heightPercentage = thisObject.heightPercentage + STEP_SIZE
       if (thisObject.heightPercentage > 100) { thisObject.heightPercentage = 100 }
     }
     event.heightPercentage = thisObject.heightPercentage
     thisObject.container.eventHandler.raiseEvent('Height Percentage Changed', event)

     window.localStorage.setItem(MODULE_NAME, thisObject.heightPercentage)
   }

   function getContainer (point) {
     let container

        /* First we check if this point is inside this object UI. */

     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       return thisObject.container
     } else {
            /* This point does not belong to this space. */

       return undefined
     }
   }

   function draw () {
     drawBackground()
     drawLabel()
   }

   function drawBackground () {
     const RIGHT_MARGIN = 50

          /* We will paint some transparent background here. */

     let opacity = '0.95'

     browserCanvasContext.beginPath()

     browserCanvasContext.rect(viewPort.visibleArea.topRight.x, viewPort.visibleArea.topRight.y, RIGHT_MARGIN, viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'

     browserCanvasContext.closePath()

     browserCanvasContext.fill()
   }

   function drawLabel () {
     let label = '6000'
     let fontSize = 10

     let ratePoint = {
       x: 0,
       y: mouse.position.y
     }

     // getRateFromPoint(ratePoint)

     let labelPoint = {
       x: viewPort.visibleArea.topRight.x + 5,
       y: mouse.position.y - fontSize / 2 + 1
     }

     let xOffset = 0// label.length / 2 * fontSize * FONT_ASPECT_RATIO

     browserCanvasContext.beginPath()

     browserCanvasContext.rect(labelPoint.x, labelPoint.y, xOffset * 2, fontSize)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'
     browserCanvasContext.fill()

     browserCanvasContext.closePath()

     browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
     browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
     browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
   }
 }
