 ﻿function newChartAspectRatio () {
   let thisObject = {
     aspectRatio: undefined,
     draw: draw,
     getContainer: getContainer,
     initialize: initialize
   }

   let container = newContainer()
   container.initialize()
   thisObject.container = container

   thisObject.container.frame.width = 50
   thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT

   resize()

   container.isDraggeable = false
   container.isClickeable = false
   container.isWheelable = true

   thisObject.aspectRatio = {}

   const INITIAL_Y_ASPECT_RATIO = 5 / 10
   const MIN_Y_ASPECT_RATIO = 1 / 10
   const MAX_Y_ASPECT_RATIO = 10 / 10

   thisObject.aspectRatio.x = 1
   thisObject.aspectRatio.y = INITIAL_Y_ASPECT_RATIO

   canDrawIcon = false

   return thisObject

   function initialize () {
     icon = new Image()

     icon.onload = onImageLoad

     function onImageLoad () {
       canDrawIcon = true
     }

     icon.src = window.canvasApp.urlPrefix + 'Images/Icons/chart-scale.png'

     thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)

     window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
   }

   function resize () {
     container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width
     container.frame.position.y = viewPort.visibleArea.bottomLeft.y
   }

   function onMouseWheel (event) {
     delta = event.wheelDelta

     if (viewPort.isMinZoom() === false) { return } // We only make this button to work at the min zoom level.

     if (delta < 0) {
       delta = -0.1
     } else {
       delta = 0.1
     }

     thisObject.aspectRatio.y = thisObject.aspectRatio.y + delta
     thisObject.aspectRatio.y = Math.round(thisObject.aspectRatio.y * 100) / 100

     if (thisObject.aspectRatio.y < MIN_Y_ASPECT_RATIO) {
       thisObject.aspectRatio.y = MIN_Y_ASPECT_RATIO
     }

     if (thisObject.aspectRatio.y > MAX_Y_ASPECT_RATIO) {
       thisObject.aspectRatio.y = MAX_Y_ASPECT_RATIO
     }

     thisObject.container.eventHandler.raiseEvent('Chart Aspect Ratio Changed', thisObject.aspectRatio)
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
     thisObject.container.frame.draw(false, false)

     if (canDrawIcon === false) { return }
     if (viewPort.isMinZoom() === false) { return } // We only show this button at the min zoom level.

     let breakpointsHeight = 15

     let imageHeight = 15
     let imageWidth = 15

     let imagePoint = {
       x: 10,
       y: thisObject.container.frame.height / 2 - imageHeight / 2 + breakpointsHeight
     }

     imagePoint = thisObject.container.frame.frameThisPoint(imagePoint)

     browserCanvasContext.drawImage(icon, imagePoint.x, imagePoint.y, imageWidth, imageHeight)
   }
 }
