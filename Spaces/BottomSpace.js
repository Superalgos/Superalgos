
 function newBottomSpace () {
   const MODULE_NAME = 'Bottom Space'
   const ERROR_LOG = true

   let thisObject = {
     container: undefined,
     draw: draw,
     physics: physics,
     getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
     createNewControl: createNewControl,
     destroyControl: destroyControl,
     getControl: getControl,
     finalize: finalize,
     initialize: initialize
   }

   thisObject.container = newContainer()
   thisObject.container.initialize(MODULE_NAME)
   thisObject.container.isClickeable = false
   thisObject.container.isDraggeable = true
   thisObject.container.notDraggingOnX = true

   controlsMap = new Map()
   resize()

   let selfMouseClickEventSubscriptionId
   let canvasBrowserResizedEventSubscriptionId

   return thisObject

   function finalize () {
     thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
     thisObject.container.eventHandler.stopListening(canvasBrowserResizedEventSubscriptionId)

     thisObject.container.finalize()
     thisObject.container = undefined
   }

   function initialize () {
     canvasBrowserResizedEventSubscriptionId = window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
     selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
   }

   function onMouseClick (event) {
     // canvas.strategySpace.investmentPlanWorkspace.showUp()
   }

   function resize () {
     thisObject.container.frame.position.x = 0
     thisObject.container.frame.position.y = viewPort.visibleArea.bottomLeft.y

     thisObject.container.frame.width = browserCanvas.width
     thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT
   }

   function physics () {

   }

   function createNewControl (pType, pDrawFunction, pOwner) {
     let control

     switch (pType) {

       case 'Over The Line':
         {
           control = newUIControl()
           control.initialize()
           control.drawFunction = pDrawFunction
           break
         }
     }

     let controlArray = controlsMap.get(pOwner)
     if (controlArray === undefined) {
       controlArray = []
       controlsMap.set(pOwner, controlArray)
     }

     controlArray.push(control)

     control.handle = Math.floor((Math.random() * 10000000) + 1)

     return control.handle
   }

   function destroyControl (pControlHandle) {
     thisObject.controls = controlsMap.get('Global')
     if (thisObject.controls !== undefined) {
       for (let i = 0; i < thisObject.controls.length; i++) {
         let control = thisObject.controls[i]
         if (control.handle === pControlHandle) {
           thisObject.controls.splice(i, 1)  // Delete item from array.
           return
         }
       }
     }

     thisObject.controls = controlsMap.get(window.CHART_ON_FOCUS)
     if (thisObject.controls !== undefined) {
       for (let i = 0; i < thisObject.controls.length; i++) {
         let control = thisObject.controls[i]
         if (control.handle === pControlHandle) {
           thisObject.controls.splice(i, 1)  // Delete item from array.
           return
         }
       }
     }
   }

   function getControl (pControlHandle, pOwner) {
     thisObject.controls = controlsMap.get(pOwner)
     if (thisObject.controls != undefined) {
       for (let i = 0; i < thisObject.controls.length; i++) {
         let control = thisObject.controls[i]

         if (control.handle === pControlHandle) {
           return control
         }
       }
     }
   }

   function getContainer (point) {
     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       return thisObject.container
     } else {
       return undefined
     }
   }

   function draw () {
     thisObject.container.frame.draw(false, false)

     drawBackground()

     thisObject.controls = controlsMap.get('Global')
     if (thisObject.controls !== undefined) {
       for (let i = 0; i < thisObject.controls.length; i++) {
         let control = thisObject.controls[i]
         control.draw()
       }
     }

     thisObject.controls = controlsMap.get(window.CHART_ON_FOCUS)
     if (thisObject.controls !== undefined) {
       for (let i = 0; i < thisObject.controls.length; i++) {
         let control = thisObject.controls[i]
         control.draw()
       }
     }
   }

   function drawBackground () {
     let opacity = 1

     let zeroPoint = {
       x: 0,
       y: 0
     }

     zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint)

     let breakpointsHeight = 15
     const RED_LINE_HIGHT = 5

     browserCanvasContext.beginPath()
     browserCanvasContext.rect(zeroPoint.x, zeroPoint.y + breakpointsHeight, thisObject.container.frame.width, thisObject.container.frame.height)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')'
     browserCanvasContext.closePath()
     browserCanvasContext.fill()

     browserCanvasContext.beginPath()
     browserCanvasContext.rect(zeroPoint.x, zeroPoint.y + breakpointsHeight, thisObject.container.frame.width, RED_LINE_HIGHT)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
     browserCanvasContext.closePath()
     browserCanvasContext.fill()
   }
 }
