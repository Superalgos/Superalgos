 ﻿function newRigthScale () {
   let thisObject = {
     container: undefined,
     draw: draw,
     getContainer: getContainer,
     initialize: initialize
   }

   const RIGHT_MARGIN = 50

   let container = newContainer()
   container.initialize()
   thisObject.container = container

   thisObject.container.frame.width = RIGHT_MARGIN
   thisObject.container.frame.height = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y

   container.frame.position.x = viewPort.visibleArea.bottomRight.x
   container.frame.position.y = TOP_SPACE_HEIGHT

   container.isDraggeable = false
   container.isClickeable = false
   container.isWheelable = true

   return thisObject

   function initialize () {
     thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)
   }

   function onMouseWheel (event) {
     delta = event.wheelDelta
     if (delta < 0) {
       delta = -0.1
     } else {
       delta = 0.1
     }
   }

   function getContainer (point) {
     let container

        /* First we check if this point is inside this object UI. */

     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       return this.container
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
