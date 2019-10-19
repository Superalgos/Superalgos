
let browserCanvasContext          // The context of the canvas object.

let stepsInitializationCounter = 0         // This counter the initialization steps required to be able to turn off the splash screen.
let marketInitializationCounter = 0        // This counter the initialization of markets required to be able to turn off the splash screen.
let splashScreenNeeded = true

function newCanvas () {
  const MODULE_NAME = 'Canvas'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

   /* Mouse event related variables. */

  let containerDragStarted = false
  let floatingObjectDragStarted = false
  let floatingObjectBeingDragged
  let containerBeingDragged
  let viewPortBeingDragged = false
  let ignoreNextClick = false

  let dragVector = {
    downX: 0,
    downY: 0,
    upX: 0,
    upY: 0
  }

   /* canvas object */

  let thisObject = {
    eventHandler: undefined,
    topSpace: undefined,
    chartSpace: undefined,
    floatingSpace: undefined,
    panelsSpace: undefined,
    cockpitSpace: undefined,
    bottomSpace: undefined,
    strategySpace: undefined,
    animation: undefined,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.eventHandler = newEventHandler()

  let splashScreen
  let lastContainerMouseOver
  return thisObject

  function finalize () {
    try {
      thisObject.chartSpace.finalize()
      thisObject.floatingSpace.finalize()

      browserCanvas.removeEventListener('mousedown', onMouseDown, false)
      browserCanvas.removeEventListener('mouseup', onMouseUp, false)
      browserCanvas.removeEventListener('mousemove', onMouseMove, false)
      browserCanvas.removeEventListener('click', onMouseClick, false)
      browserCanvas.removeEventListener('mouseout', onMouseOut, false)

      if (browserCanvas.removeEventListener) {
        browserCanvas.removeEventListener('mousewheel', onMouseWheel, false)// IE9, Chrome, Safari, Opera
        browserCanvas.removeEventListener('DOMMouseScroll', onMouseWheel, false) // Firefox
      } else browserCanvas.detachEvent('onmousewheel', onMouseWheel)  // IE 6/7/8

      browserCanvas.removeEventListener('dragenter', onDragEnter, false)
      browserCanvas.removeEventListener('dragleave', onDragLeave, false)
      browserCanvas.removeEventListener('dragover', onDragOver, false)
      browserCanvas.removeEventListener('drop', onDragDrop, false)

      browserCanvas.removeEventListener('keydown', onKeyDown, false)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  async function initialize () {
    try {
      initializeBrowserCanvas()

      addCanvasEvents()

           /* Instantiate all the children spaces of Canvas object */

      thisObject.floatingSpace = newFloatingSpace()
      thisObject.floatingSpace.initialize()

      thisObject.topSpace = newTopSpace()
      await thisObject.topSpace.initialize()

      thisObject.strategySpace = newStrategySpace()
      await thisObject.strategySpace.initialize()

      thisObject.cockpitSpace = newCockpitSpace()
      thisObject.cockpitSpace.initialize()

      thisObject.panelsSpace = newPanelsSpace()
      thisObject.panelsSpace.initialize()

      thisObject.chartSpace = newChartSpace()
      thisObject.chartSpace.initialize(onCharSpaceInitialized)

      thisObject.bottomSpace = thisObject.cockpitSpace

      function onCharSpaceInitialized (err) {
        try {
          viewPort.raiseEvents() // These events will impacts on objects just initialized.
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onCharSpaceInitialized -> err = ' + err.stack) }
        }
      }
      splashScreen = newSplashScreen()
      splashScreen.initialize()

      let animation = newAnimation()
      animation.initialize()

      thisObject.animation = animation

      animation.addCallBackFunction('Floating Space Physics', thisObject.floatingSpace.physics)
      animation.addCallBackFunction('Chart Space Physics', thisObject.chartSpace.physics)
      animation.addCallBackFunction('CockpitSpace Physics', thisObject.cockpitSpace.physics)
      animation.addCallBackFunction('Strategy Space Physics', thisObject.strategySpace.physics)
      animation.addCallBackFunction('Panels Space Physics', thisObject.panelsSpace.physics)

      animation.addCallBackFunction('Floating Space Draw', thisObject.floatingSpace.draw)
      animation.addCallBackFunction('Chart Space Background', thisObject.chartSpace.drawBackground)
      animation.addCallBackFunction('Chart Space Draw', thisObject.chartSpace.draw)
      animation.addCallBackFunction('Panels Space', thisObject.panelsSpace.draw)
      animation.addCallBackFunction('ViewPort Animate', viewPort.animate)
      animation.addCallBackFunction('CockpitSpace Draw', thisObject.cockpitSpace.draw)
      animation.addCallBackFunction('Top Space Draw', thisObject.topSpace.draw)
      animation.addCallBackFunction('Strategy Space Draw', thisObject.strategySpace.draw)
      animation.addCallBackFunction('Splash Screen Draw', splashScreen.draw)
      animation.start()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function initializeBrowserCanvas () {
    try {
      browserCanvasContext = browserCanvas.getContext('2d')
      browserCanvasContext.font = 'Saira'

      viewPort.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeBrowserCanvas -> err = ' + err.stack) }
    }
  }

  function addCanvasEvents () {
    try {
      /* Keyboard events */
      window.addEventListener('keydown', onKeyDown, true)

      /* Mouse Events */

      browserCanvas.addEventListener('mousedown', onMouseDown, false)
      browserCanvas.addEventListener('mouseup', onMouseUp, false)
      browserCanvas.addEventListener('mousemove', onMouseMove, false)
      browserCanvas.addEventListener('click', onMouseClick, false)
      browserCanvas.addEventListener('mouseout', onMouseOut, false)

      if (browserCanvas.addEventListener) {
        browserCanvas.addEventListener('mousewheel', onMouseWheel, false) // IE9, Chrome, Safari, Opera
        browserCanvas.addEventListener('DOMMouseScroll', onMouseWheel, false)  // Firefox
      } else browserCanvas.attachEvent('onmousewheel', onMouseWheel)// IE 6/7/8

      /* Dragging Files Over the Canvas */

      browserCanvas.addEventListener('dragenter', onDragEnter, false)
      browserCanvas.addEventListener('dragleave', onDragLeave, false)
      browserCanvas.addEventListener('dragover', onDragOver, false)
      browserCanvas.addEventListener('drop', onDragDrop, false)

      //  Disables the context menu when you right mouse click the canvas.
      browserCanvas.oncontextmenu = function (e) {
        e.preventDefault()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] addCanvasEvents -> err = ' + err.stack) }
    }
  }

  function onKeyDown (event) {
    let nodeOnFocus = canvas.strategySpace.workspace.getNodeThatIsOnFocus()
    if (nodeOnFocus !== undefined) {
      if (nodeOnFocus.payload.uiObject.codeEditor !== undefined) {
        if (nodeOnFocus.payload.uiObject.codeEditor.visible === true) {
          return
        }
      }
      if (nodeOnFocus.payload.uiObject.partTitle !== undefined) {
        if (nodeOnFocus.payload.uiObject.partTitle.editMode === true) {
          return
        }
      }
    }

    if (event.altKey === true && event.code === 'ArrowUp') {
      thisObject.cockpitSpace.toTop()
      return
    }

    if (event.altKey === true && event.code === 'ArrowDown') {
      thisObject.cockpitSpace.toBottom()
      return
    }

    if (event.shiftKey === true && event.code === 'ArrowLeft') {
      canvas.chartSpace.oneScreenLeft()
      return
    }

    if (event.shiftKey === true && event.code === 'ArrowRight') {
      canvas.chartSpace.oneScreenRight()
      return
    }

    if (event.shiftKey === true && event.code === 'ArrowUp') {
      canvas.chartSpace.oneScreenUp()
      return
    }

    if (event.shiftKey === true && event.code === 'ArrowDown') {
      canvas.chartSpace.oneScreenDown()
      return
    }

    if ((event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowLeft') {
      canvas.floatingSpace.oneScreenLeft()
      return
    }

    if ((event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowRight') {
      canvas.floatingSpace.oneScreenRight()
      return
    }

    if ((event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowUp') {
      canvas.floatingSpace.oneScreenUp()
      return
    }

    if ((event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowDown') {
      canvas.floatingSpace.oneScreenDown()
      return
    }

    if (event.code === 'Period') {
      if (nodeOnFocus !== undefined) {
        nodeOnFocus.payload.uiObject.setValue('Id: ' + nodeOnFocus.id)
        return
      }
    }

    if ((event.ctrlKey === true || event.metaKey === true)) {
      if (event.keyCode >= 65 && event.keyCode <= 90) {
        let nodeUsingThisKey = canvas.strategySpace.workspace.getNodeByShortcutKey(event.key)

        if (nodeOnFocus === undefined && nodeUsingThisKey !== undefined) {
          /* Then we displace the whole workspace to center it at the node using this key */
          nodeUsingThisKey = canvas.floatingSpace.positionAtNode(nodeUsingThisKey)
          return
        }

        /* From here we prevent the default behaviour */
        event.preventDefault()

        /* If there is a node in focus, we try to assign the key to it. */
        if (nodeUsingThisKey !== undefined && nodeOnFocus !== undefined) {
          if (nodeUsingThisKey.id === nodeOnFocus.id) {
            nodeOnFocus.payload.uiObject.shortcutKey = ''
            nodeOnFocus.payload.uiObject.setValue('Shortcut Key Removed ')
            return
          } else {
            nodeOnFocus.payload.uiObject.setErrorMessage('Key already in use by ' + nodeUsingThisKey.type + ' ' + nodeUsingThisKey.name)
            return
          }
        }
        /* If there is not node using this key and a node in focus, we assign this key to this node */
        if (nodeUsingThisKey === undefined && nodeOnFocus !== undefined) {
          nodeOnFocus.payload.uiObject.shortcutKey = event.key
          nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + ' + event.key)
        }
        return
      }
    }

    if (event.ctrlKey === true && nodeOnFocus !== undefined) {
      if (nodeOnFocus.payload.uiObject.shortcutKey !== undefined && nodeOnFocus.payload.uiObject.shortcutKey !== '') {
        nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + ' + nodeOnFocus.payload.uiObject.shortcutKey)
      }
    }
  }

  function onDragEnter (event) {
    try {
      event.preventDefault()
      event.stopPropagation()
      thisObject.cockpitSpace.toTop()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragEnter -> err = ' + err.stack) }
    }
  }

  function onDragLeave (event) {
    try {
      event.preventDefault()
      event.stopPropagation()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragLeave -> err = ' + err.stack) }
    }
  }

  function onDragOver (event) {
    try {
      event.preventDefault()
      event.stopPropagation()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragOver -> err = ' + err.stack) }
    }
  }

  function onDragDrop (event) {
    try {
      event.preventDefault()
      event.stopPropagation()

      let files = event.dataTransfer.files

      handleFiles(files)
      function handleFiles (files) {
        ([...files]).forEach(loadFileData)
      }

      function loadFileData (file) {
        let reader = new FileReader()
        reader.readAsText(file)
        reader.onloadend = function () {
          let mousePosition = {
            x: event.x,
            y: event.y
          }
          thisObject.strategySpace.workspace.spawn(reader.result, mousePosition)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onDragDrop -> err = ' + err.stack) }
    }
  }

  function onMouseDown (event) {
    try {
      let point = {
        x: event.pageX,
        y: event.pageY - CURRENT_TOP_MARGIN,
        button: event.button
      }

      dragVector.downX = point.x
      dragVector.downY = point.y

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      container = thisObject.strategySpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
        return
      }

      if (container !== undefined && container.isDraggeable === false) {
        return
      }

           /* We check if the mouse is over an element of the Top Space / */

      container = thisObject.topSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
        return
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      container = thisObject.cockpitSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
        return
      }

      if (container !== undefined && container.isClickeable === true) {
       /* We dont want to mess up with the click */
        return
      }

           /* We check if the mouse is over a panel/ */

      container = thisObject.panelsSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true && event.button === 2) {
        containerBeingDragged = container
        containerDragStarted = true
        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
        return
      }

      if (container !== undefined && container.isClickeable === true) {
       /* We dont want to mess up with the click */
        return
      }

           /*  we check if it is over any of the existing containers at the Chart Space. */

      container = thisObject.chartSpace.getContainer(point)

      if (container !== undefined) {
        if (container.isDraggeable === true) {
          containerBeingDragged = container
          containerDragStarted = true
          containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
          return
        } else {
          viewPortBeingDragged = true
          return
        }
      }

      container = thisObject.floatingSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        floatingObjectDragStarted = true
        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
        return
      }

      if (container !== undefined && container.isClickeable === true) {
       /* We dont want to mess up with the click */
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseDown -> err = ' + err.stack) }
    }
  }

  function onMouseClick (event) {
    try {
      if (ignoreNextClick === true) {
        ignoreNextClick = false
        return
      }
      let point = {
        x: event.pageX,
        y: event.pageY - CURRENT_TOP_MARGIN
      }

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      container = thisObject.strategySpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over an element of the Top Space / */

      container = thisObject.topSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      container = thisObject.cockpitSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over a panel/ */

      container = thisObject.panelsSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

      container = thisObject.chartSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

      /* We check if the mouse is over a floatingObject/ */
      container = thisObject.floatingSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseClick -> err = ' + err.stack) }
    }
  }

  function onMouseOut (event) {
    deactivateDragging(event)

    /* When the mouse leaves the canvas, our elements needs to react to the fact that the mouse is over a far away place */
    let thisEvent = {
      pageX: VERY_LARGE_NUMBER,
      pageY: VERY_LARGE_NUMBER
    }
    onMouseOver(thisEvent)
  }

  function onMouseUp (event) {
    deactivateDragging(event)
  }

  function onMouseMove (event) {
    try {
      let point = {
        x: event.pageX,
        y: event.pageY - CURRENT_TOP_MARGIN
      }

      viewPort.mousePosition.x = point.x
      viewPort.mousePosition.y = point.y

      if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
        if (floatingObjectDragStarted === true) {
          let targetContainer = thisObject.floatingSpace.getContainer(point)
          if (targetContainer !== undefined) {
            if (targetContainer.id !== containerBeingDragged.id) {
              containerBeingDragged.eventHandler.raiseEvent('onDragFinished', point)
              containerBeingDragged = undefined
              containerDragStarted = false
              floatingObjectDragStarted = false
              browserCanvas.style.cursor = 'auto'
              ignoreNextClick = true
              return
            }
          } else {
            containerBeingDragged.eventHandler.raiseEvent('onDragFinished', point)
            containerDragStarted = false
            containerBeingDragged = undefined
            floatingObjectDragStarted = false
            browserCanvas.style.cursor = 'auto'
            ignoreNextClick = true
            return
          }
        }

        dragVector.upX = point.x
        dragVector.upY = point.y

        checkDrag(event)
      } else {
        onMouseOver(event)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseMove -> err = ' + err.stack) }
    }
  }

  function onMouseOver (event) {
    try {
           /* Then we check who is the current object underneeth the mounse. */

      let point = {
        x: event.pageX,
        y: event.pageY - CURRENT_TOP_MARGIN
      }

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      if (thisObject.strategySpace !== undefined) {
        container = thisObject.strategySpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over an element of the Top Space / */

      if (thisObject.topSpace !== undefined) {
        container = thisObject.topSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      if (thisObject.cockpitSpace !== undefined) {
        container = thisObject.cockpitSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over a panel/ */

      if (thisObject.panelsSpace !== undefined) {
        container = thisObject.panelsSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

      if (thisObject.chartSpace !== undefined) {
        container = thisObject.chartSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

      /* We check if the mouse is over a floatingObject/ */
      if (thisObject.floatingSpace !== undefined) {
        container = thisObject.floatingSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

      function containerFound () {
        if (lastContainerMouseOver !== undefined) {
          if (container.id !== lastContainerMouseOver.id) {
            lastContainerMouseOver.eventHandler.raiseEvent('onMouseNotOver', point)
          }
        }

        container.eventHandler.raiseEvent('onMouseOver', point)
        lastContainerMouseOver = container
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseOver -> err = ' + err.stack) }
    }
  }

  function onMouseWheel (event) {
    try {
           // cross-browser wheel delta
      var event = window.event || event // old IE support
      let delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail))

           /* We try first with panels. */

      let point = {
        x: event.pageX,
        y: event.pageY - CURRENT_TOP_MARGIN
      }

      event.mousePosition = point
      let container
      container = canvas.panelsSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

           /* We try the CockpitSpace. */

      container = canvas.cockpitSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

          /*   Chart Space. */

      container = canvas.chartSpace.getContainer({ x: point.x, y: point.y }, GET_CONTAINER_PURPOSE.MOUSE_WHEEL)
      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

      if (container !== undefined) {
        viewPort.applyZoom(delta)
        return false
      }

         /* We try second with floating objects. */

      container = canvas.floatingSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

      return false
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseWheel -> err = ' + err.stack) }
    }
  }

  function deactivateDragging (event) {
    try {
      if (containerDragStarted || viewPortBeingDragged || floatingObjectDragStarted) {
        thisObject.eventHandler.raiseEvent('Drag Finished', undefined)
      }

      if (
     containerDragStarted ||
     floatingObjectDragStarted ||
     viewPortBeingDragged
     ) {
        ignoreNextClick = true
      }
           /* Turn off all the possible things that can be dragged. */

      containerDragStarted = false
      floatingObjectDragStarted = false
      viewPortBeingDragged = false

      if (containerBeingDragged !== undefined) {
        containerBeingDragged.eventHandler.raiseEvent('onDragFinished', event)
        containerBeingDragged = undefined
      }

      browserCanvas.style.cursor = 'auto'
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] deactivateDragging -> err = ' + err.stack) }
    }
  }

  function checkDrag (event) {
    try {
      if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
        let point = {
          x: event.pageX,
          y: event.pageY - CURRENT_TOP_MARGIN
        }

        browserCanvas.style.cursor = 'grabbing'
        thisObject.eventHandler.raiseEvent('Dragging', undefined)

        if (containerDragStarted || viewPortBeingDragged) {
                   /* The parameters received have been captured with zoom applied. We must remove the zoom in order to correctly modify the displacement. */

          let downCopy = {
            x: dragVector.downX,
            y: dragVector.downY
          }

          let downCopyNoTransf
          downCopyNoTransf = viewPort.unzoomThisPoint(downCopy)
                   // downCopyNoTransf = containerBeingDragged.zoom.unzoomThisPoint(downCopyNoTransf);

          let upCopy = {
            x: dragVector.upX,
            y: dragVector.upY
          }

          let upCopyNoTranf
          upCopyNoTranf = viewPort.unzoomThisPoint(upCopy)

          let displaceVector = {
            x: dragVector.upX - dragVector.downX,
            y: dragVector.upY - dragVector.downY
          }

          if (viewPortBeingDragged) {
            viewPort.displace(displaceVector)
          }

          if (containerBeingDragged !== undefined) {
            let moveSucceed = containerBeingDragged.displace(displaceVector)
            if (moveSucceed === false) {
              deactivateDragging(event)
            }
          }
        }

               /* Finally we set the starting point of the new dragVector at this current point. */

        dragVector.downX = dragVector.upX
        dragVector.downY = dragVector.upY
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] checkDrag -> err = ' + err.stack) }
    }
  }
}
