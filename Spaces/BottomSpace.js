 ﻿
function newBottomSpace () {
  let thisObject = {

    container: undefined,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    createNewControl: createNewControl,
    destroyControl: destroyControl,
    getControl: getControl,
    initialize: initialize
  }

  var container = newContainer()
  container.initialize()
  thisObject.container = container

  container.isDraggeable = false

  controlsMap = new Map()
  resize()

  return thisObject

  function initialize () {
    window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
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

  function resize () {
    container.frame.position.x = 0
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y

    thisObject.container.frame.width = browserCanvas.width
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT
  }

  function getContainer (point) {
    let container

    return thisObject.container
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
