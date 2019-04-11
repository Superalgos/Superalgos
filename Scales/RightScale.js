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
 }
