
let browserCanvasContext          // The context of the canvas object.

let stepsInitializationCounter = 0         // This counter the initialization steps required to be able to turn off the splash screen.
let marketInitializationCounter = 0        // This counter the initialization of markets required to be able to turn off the splash screen.

function newCanvas() {
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
        sideSpace: undefined,
        docSpace: undefined,
        tutorialSpace: undefined,
        chartingSpace: undefined,
        floatingSpace: undefined,
        panelsSpace: undefined,
        cockpitSpace: undefined,
        designSpace: undefined,
        splashScreen: undefined,
        animation: undefined,
        mouse: undefined,
        shorcutNumbers: new Map(),
        onKeyDown: onKeyDown,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.eventHandler = newEventHandler()

    let lastContainerMouseOver

    thisObject.mouse = {
        position: {
            x: 0,
            y: 0
        },
        action: ''
    }

    return thisObject

    function finalize() {
        try {
            thisObject.tutorialSpace.finalize()
            thisObject.docSpace.finalize()
            thisObject.sideSpace.finalize()
            thisObject.chartingSpace.finalize()
            thisObject.floatingSpace.finalize()
            thisObject.shorcutNumbers = undefined

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
            browserCanvas.removeEventListener('keyup', onKeyUp, false)

            thisObject.splashScreen = undefined
            lastContainerMouseOver = undefined

            hisObject.mouse = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
        }
    }

    function initialize() {
        try {
            browserResized()
            initializeBrowserCanvas()
            addCanvasEvents()

            /* Instantiate all the children spaces of Canvas object */
            thisObject.floatingSpace = newFloatingSpace()
            thisObject.floatingSpace.initialize()

            thisObject.topSpace = newTopSpace()
            thisObject.topSpace.initialize()

            thisObject.cockpitSpace = newCockpitSpace()
            thisObject.cockpitSpace.initialize()

            thisObject.designSpace = newDesignSpace()
            thisObject.designSpace.initialize()

            thisObject.panelsSpace = newPanelsSpace()
            thisObject.panelsSpace.initialize()

            thisObject.chartingSpace = newChartingSpace()
            thisObject.chartingSpace.initialize()

            thisObject.sideSpace = newSideSpace()
            thisObject.sideSpace.initialize()

            thisObject.docSpace = newDocSpace()
            thisObject.docSpace.initialize()

            thisObject.tutorialSpace = newTutorialSpace()
            thisObject.tutorialSpace.initialize()

            thisObject.splashScreen = newSplashScreen()

            let animation = newAnimation()
            animation.initialize()

            thisObject.animation = animation

            /* Spcaces Physics */
            animation.addCallBackFunction('CockpitSpace Physics', thisObject.cockpitSpace.physics)
            animation.addCallBackFunction('Floating Space Physics', thisObject.floatingSpace.physics)
            animation.addCallBackFunction('Charting Space Physics', thisObject.chartingSpace.physics)
            animation.addCallBackFunction('Design Space Physics', thisObject.designSpace.physics)
            animation.addCallBackFunction('Panels Space Physics', thisObject.panelsSpace.physics)
            animation.addCallBackFunction('Side Space Physics', thisObject.sideSpace.physics)
            animation.addCallBackFunction('Doc Space Physics', thisObject.docSpace.physics)
            animation.addCallBackFunction('Tutorial Space Physics', thisObject.tutorialSpace.physics)

            /* Spcaces Drawing */
            animation.addCallBackFunction('Floating Space Draw', thisObject.floatingSpace.draw)
            animation.addCallBackFunction('Charting Space Draw', thisObject.chartingSpace.draw)
            animation.addCallBackFunction('Panels Space', thisObject.panelsSpace.draw)
            animation.addCallBackFunction('CockpitSpace Draw', thisObject.cockpitSpace.draw)
            animation.addCallBackFunction('Design Space Draw', thisObject.designSpace.draw)
            animation.addCallBackFunction('Top Space Draw', thisObject.topSpace.draw)
            animation.addCallBackFunction('Side Space Draw', thisObject.sideSpace.draw)
            animation.addCallBackFunction('Doc Space Draw', thisObject.docSpace.draw)
            animation.addCallBackFunction('Tutorial Space Draw', thisObject.tutorialSpace.draw)
            animation.addCallBackFunction('Splash Screen Draw', thisObject.splashScreen.draw)
            animation.start()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
        }
    }

    function initializeBrowserCanvas() {
        try {
            browserCanvasContext = browserCanvas.getContext('2d')
            browserCanvasContext.font = 'Saira Condensed'
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initializeBrowserCanvas -> err = ' + err.stack) }
        }
    }

    function addCanvasEvents() {
        try {
            canvas.eventHandler.listenToEvent('Browser Resized', browserResized)

            /* Keyboard events */
            window.addEventListener('keydown', onKeyDown, true)
            window.addEventListener('keyup', onKeyUp, true)

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

    function browserResized() {
        browserCanvas = document.getElementById('canvas')

        browserCanvas.width = window.innerWidth
        browserCanvas.height = window.innerHeight - CURRENT_TOP_MARGIN
        browserCanvas.style = "position:absolute; top:0px; left:0px; z-index:1"
    }

    function checkMediaRecording(event) {
        if ((event.ctrlKey === true || event.metaKey === true)) {
            let constructorParams
            switch (event.keyCode) {
                case 113: { //  F2
                    browserCanvas.width = 400 * 3
                    browserCanvas.height = 580 * 3
                    centerCanvar()
                    return
                    break
                }
                case 114: { //  F2
                    browserCanvas.width = 400 * 2
                    browserCanvas.height = 580 * 2
                    centerCanvar()
                    return
                    break
                }
                case 115: { //  F3
                    browserCanvas.width = 400 * 1.5
                    browserCanvas.height = 580 * 1.5
                    centerCanvar()
                    return
                    break
                }
                case 116: { //  F5
                    browserCanvas.width = 400 * 1
                    browserCanvas.height = 580 * 1
                    centerCanvar()
                    return
                    break
                }
                case 117: { //  F6
                    browserCanvas.width = window.innerWidth
                    browserCanvas.height = window.innerHeight - CURRENT_TOP_MARGIN
                    centerCanvar()
                    return
                    break
                }
                case 118: { //  F7
                    downloadPanorama('Superalgos.Market.Panorama')
                    return
                    break
                }
                case 119: { //  F8
                    downloadCanvas('Superalgos.Image.Capture', browserCanvas)
                    return
                    break
                }
                case 120: { //  F9
                    constructorParams = { format: 'gif', workersPath: 'externalScripts/', framerate: 8, name: 'Superalgos.Video.Capture' }
                    break
                }
                case 121: { //  F10
                    constructorParams = { format: 'webm', framerate: 8, name: 'Superalgos.Video.Capture' }
                    break
                }
                default: return
            }

            if (ARE_WE_RECORDING_A_VIDEO === false) {
                console.log('RECORDING', constructorParams.format)
                mediaRecorder = new CCapture(constructorParams)
                mediaRecorder.start()
                ARE_WE_RECORDING_A_VIDEO = true
            } else {
                console.log('SAVING', constructorParams.format)
                ARE_WE_RECORDING_A_VIDEO = false
                mediaRecorder.stop()
                mediaRecorder.save()
            }
        }

        function centerCanvar() {
            return
            let top = (window.innerHeight - browserCanvas.height) / 2
            let left = (window.innerWidth - browserCanvas.width) / 2
            browserCanvas.style = "position:absolute; top:"+ top + "px; left:"+ left + "px; z-index:1"
        }
    }

    function onKeyUp(event) {
        thisObject.mouse.event = event
        thisObject.mouse.action = 'key up'
    }

    function onKeyDown(event) {
        if (EDITOR_ON_FOCUS === true) { return }
        thisObject.mouse.event = event
        thisObject.mouse.action = 'key down'

        checkMediaRecording(event)
        canvas.chartingSpace.onKeyPressed(event)

        /* Shourcuts to Menu Items */
        if ((event.keyCode >= 48 && event.keyCode <= 57)) {
            let number = event.key
            if (MENU_ITEM_ON_FOCUS !== undefined) {
                let menuItem = thisObject.shorcutNumbers.get(number)
                if (menuItem !== undefined) {
                    menuItem.shorcutNumber = undefined
                }
                thisObject.shorcutNumbers.set(number, MENU_ITEM_ON_FOCUS)
                MENU_ITEM_ON_FOCUS.shorcutNumber = number
            } else {
                let menuItem = thisObject.shorcutNumbers.get(number)
                if (menuItem !== undefined) {
                    menuItem.internalClick()
                }
            }
        }

        if (event.key === 'Escape' && canvas.floatingSpace.inMapMode === true) {
            canvas.floatingSpace.exitMapMode()
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && (event.key === 'M' || event.key === 'm')) {
            canvas.floatingSpace.toggleMapMode()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && (event.key === 'R' || event.key === 'r')) {
            canvas.floatingSpace.toggleDrawReferenceLines()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && (event.key === 'C' || event.key === 'c')) {
            canvas.floatingSpace.toggleDrawChainLines()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && (event.key === 'S' || event.key === 's')) {
            canvas.designSpace.workspace.save()
            if (event.preventDefault !== undefined) {
                event.preventDefault()
            }
            return
        }

        let nodeOnFocus = canvas.designSpace.workspace.getNodeThatIsOnFocus()
        if (nodeOnFocus !== undefined) {
            if (nodeOnFocus.payload.uiObject.codeEditor !== undefined) {
                if (nodeOnFocus.payload.uiObject.codeEditor.visible === true) {
                    return
                }
            }
            if (nodeOnFocus.payload.uiObject.configEditor !== undefined) {
                if (nodeOnFocus.payload.uiObject.configEditor.visible === true) {
                    return
                }
            }
            if (nodeOnFocus.payload.uiObject.formulaEditor !== undefined) {
                if (nodeOnFocus.payload.uiObject.formulaEditor.visible === true) {
                    return
                }
            }
            if (nodeOnFocus.payload.uiObject.conditionEditor !== undefined) {
                if (nodeOnFocus.payload.uiObject.conditionEditor.visible === true) {
                    return
                }
            }
            if (nodeOnFocus.payload.uiObject.uiObjectTitle !== undefined) {
                if (nodeOnFocus.payload.uiObject.uiObjectTitle.editMode === true) {
                    return
                }
            }
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.altKey === true && event.shiftKey === true && event.keyCode === 123) { // Dev Tool when used with F12
            if (nodeOnFocus !== undefined) {
                console.log(nodeOnFocus)
                return
            }
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.altKey === true && event.shiftKey === true && event.keyCode === 122) { // Dev Tool when used with F11
            if (SHOW_ANIMATION_PERFORMACE === false) {
                SHOW_ANIMATION_PERFORMACE = true
            } else {
                SHOW_ANIMATION_PERFORMACE = false
            }
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowUp') {
            thisObject.cockpitSpace.toTop()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowDown') {
            thisObject.cockpitSpace.toBottom()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowLeft') {
            thisObject.cockpitSpace.moveUp()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowRight') {
            thisObject.cockpitSpace.moveDown()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowLeft') {
            canvas.chartingSpace.oneScreenLeft()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowRight') {
            canvas.chartingSpace.oneScreenRight()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowUp') {
            canvas.chartingSpace.oneScreenUp()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowDown') {
            canvas.chartingSpace.oneScreenDown()
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowLeft') {
            let displaceVector = canvas.floatingSpace.oneScreenLeft()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowRight') {
            let displaceVector = canvas.floatingSpace.oneScreenRight()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowUp') {
            let displaceVector = canvas.floatingSpace.oneScreenUp()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowDown') {
            let displaceVector = canvas.floatingSpace.oneScreenDown()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if (event.code === 'Period') {
            if (nodeOnFocus !== undefined) {
                nodeOnFocus.payload.uiObject.setValue('Id: ' + nodeOnFocus.id)
                return
            }
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.altKey === true) {
            /* Shortcuts to nodes */
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90)) {
                /* From here we prevent the default behaviour. Putting it earlier prevents imput box and text area to receive keystrokes */
                event.preventDefault()

                let nodeUsingThisKey = canvas.designSpace.workspace.getNodeByShortcutKey(event.key)

                if (nodeOnFocus === undefined && nodeUsingThisKey !== undefined) {
                    /* Then we displace the whole workspace to center it at the node using this key */
                    nodeUsingThisKey = canvas.floatingSpace.positionAtNode(nodeUsingThisKey)
                    return
                }

                /* If there is a node in focus, we try to assign the key to it. */
                if (nodeUsingThisKey !== undefined && nodeOnFocus !== undefined) {
                    if (nodeUsingThisKey.id === nodeOnFocus.id) {
                        nodeOnFocus.payload.uiObject.shortcutKey = ''
                        nodeOnFocus.payload.uiObject.setValue('Shortcut Key Removed ')
                        return
                    } else {
                        /* After the warning, we allow the key to be re-assigned */
                        nodeUsingThisKey.payload.uiObject.shortcutKey = ''
                        nodeUsingThisKey === undefined
                        nodeOnFocus.payload.uiObject.shortcutKey = event.key
                        nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + Alt + ' + event.key)
                    }
                }
                return
            }
        }

        if (event.ctrlKey === true && event.altKey === true && nodeOnFocus !== undefined) {
            if (nodeOnFocus.payload.uiObject.shortcutKey !== undefined && nodeOnFocus.payload.uiObject.shortcutKey !== '') {
                nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + Alt + ' + nodeOnFocus.payload.uiObject.shortcutKey)
            }
        }
    }

    function onDragEnter(event) {
        try {
            event.preventDefault()
            event.stopPropagation()
            thisObject.cockpitSpace.toTop()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDragEnter -> err = ' + err.stack) }
        }
    }

    function onDragLeave(event) {
        try {
            event.preventDefault()
            event.stopPropagation()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDragLeave -> err = ' + err.stack) }
        }
    }

    function onDragOver(event) {
        try {
            event.preventDefault()
            event.stopPropagation()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDragOver -> err = ' + err.stack) }
        }
    }

    function onDragDrop(event) {
        try {
            event.preventDefault()
            event.stopPropagation()

            let files = event.dataTransfer.files

            handleFiles(files)
            function handleFiles(files) {
                ([...files]).forEach(loadFileData)
            }

            function loadFileData(file) {
                let reader = new FileReader()
                reader.readAsText(file)
                reader.onloadend = function () {
                    let mousePosition = {
                        x: event.x,
                        y: event.y
                    }
                    thisObject.designSpace.workspace.spawn(reader.result, mousePosition)
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDragDrop -> err = ' + err.stack) }
        }
    }

    function onMouseDown(event) {
        try {
            thisObject.mouse.event = event
            thisObject.mouse.position.x = event.pageX
            thisObject.mouse.position.y = event.pageY - CURRENT_TOP_MARGIN
            switch (event.buttons) {
                case 1: {
                    thisObject.mouse.action = 'clicking with left button'
                    break
                }
                case 2: {
                    thisObject.mouse.action = 'clicking with right button'
                    break
                }
            }

            let point = event
            point.x = event.pageX
            point.y = event.pageY - CURRENT_TOP_MARGIN

            dragVector.downX = point.x
            dragVector.downY = point.y

            let container

            /* We check if the mouse is over an element of the Doc Space / */
            container = thisObject.tutorialSpace.getContainer(point)

            if (container !== undefined && container.isDraggeable === true) {
                containerBeingDragged = container
                containerDragStarted = true
                containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                return
            }

            if (container !== undefined && container.isDraggeable === false) {
                return
            }

            /* We check if the mouse is over an element of the Doc Space / */
            container = thisObject.docSpace.getContainer(point)

            if (container !== undefined && container.isDraggeable === true) {
                containerBeingDragged = container
                containerDragStarted = true
                containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                return
            }

            if (container !== undefined && container.isDraggeable === false) {
                return
            }

            /* We check if the mouse is over an element of the Side Space / */
            container = thisObject.sideSpace.getContainer(point)

            if (container !== undefined && container.isDraggeable === true) {
                containerBeingDragged = container
                containerDragStarted = true
                containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                return
            }

            if (container !== undefined && container.isDraggeable === false) {
                return
            }

            /* We check if the mouse is over an element of the Design Space / */
            container = thisObject.designSpace.getContainer(point)

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
            container = thisObject.panelsSpace.getContainer(point, GET_CONTAINER_PURPOSE.DRAGGING)

            if (container !== undefined && event.shiftKey === false) {
                if (container.isDraggeable === true) {
                    containerBeingDragged = container
                    containerDragStarted = true
                    containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                    return
                } else {
                    return
                }
            }

            if (container !== undefined && container.isClickeable === true) {
                /* We dont want to mess up with the click */
                return
            }

            /*  we check if it is over any of the existing containers at the Charting Space. */
            container = thisObject.chartingSpace.getContainer(point, GET_CONTAINER_PURPOSE.DRAGGING)

            if (container !== undefined) {
                if (container.isDraggeable === true) {
                    containerBeingDragged = container
                    containerDragStarted = true
                    containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                    return
                } else {
                    if (container.isClickeable === false) {
                        if (event.buttons === 2) {
                            viewPortBeingDragged = true
                        }
                    }
                    return
                }
            }

            container = thisObject.floatingSpace.getContainer(point)

            if (container !== undefined && container.isDraggeable === true) {
                containerBeingDragged = container
                containerDragStarted = true
                floatingObjectDragStarted = true
                containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)

                if (event.candelDragging === true) {
                    containerBeingDragged = undefined
                    containerDragStarted = false
                    floatingObjectDragStarted = false
                }
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

    function onMouseClick(event) {
        try {
            if (ignoreNextClick === true) {
                ignoreNextClick = false
                return
            }

            let point = event
            point.x = event.pageX
            point.y = event.pageY - CURRENT_TOP_MARGIN

            let container

            /* We check if the mouse is over an element of the Tutorial Space / */
            container = thisObject.tutorialSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

            if (container !== undefined && container.isClickeable === true) {
                container.eventHandler.raiseEvent('onMouseClick', point)
                return
            }

            /* We check if the mouse is over an element of the Doc Space / */
            container = thisObject.docSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

            if (container !== undefined && container.isClickeable === true) {
                container.eventHandler.raiseEvent('onMouseClick', point)
                return
            }

            /* We check if the mouse is over an element of the Side Space / */
            container = thisObject.sideSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

            if (container !== undefined && container.isClickeable === true) {
                container.eventHandler.raiseEvent('onMouseClick', point)
                return
            }

            /* We check if the mouse is over an element of the Design Space / */
            container = thisObject.designSpace.getContainer(point)

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
            container = thisObject.panelsSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

            if (container !== undefined && container.isClickeable === true) {
                container.eventHandler.raiseEvent('onMouseClick', point)
                return
            }

            /* If it is not, then we check if it is over any of the existing containers at the Charting Space. */
            container = thisObject.chartingSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

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

    function onMouseOut(event) {
        deactivateDragging(event)

        /* When the mouse leaves the canvas, our elements needs to react to the fact that the mouse is over a far away place */
        let thisEvent = {
            pageX: VERY_LARGE_NUMBER,
            pageY: VERY_LARGE_NUMBER
        }
        onMouseOver(thisEvent)
    }

    function onMouseUp(event) {
        deactivateDragging(event)
    }

    function onMouseMove(event) {
        try {
            thisObject.mouse.event = event
            thisObject.mouse.position.x = event.pageX
            thisObject.mouse.position.y = event.pageY - CURRENT_TOP_MARGIN
            thisObject.mouse.action = 'moving'

            /* Processing the event */
            let point = event
            point.x = event.pageX
            point.y = event.pageY - CURRENT_TOP_MARGIN

            if (canvas.chartingSpace.viewport !== undefined) {
                canvas.chartingSpace.viewport.mousePosition.x = point.x
                canvas.chartingSpace.viewport.mousePosition.y = point.y
            }

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
            }
            onMouseOver(event)
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onMouseMove -> err = ' + err.stack) }
        }
    }

    function onMouseOver(event) {
        try {
            let point = event
            point.x = event.pageX
            point.y = event.pageY - CURRENT_TOP_MARGIN

            if (containerDragStarted === true) {
                containerBeingDragged.eventHandler.raiseEvent('onMouseOver', point)
                return
            }

            /* Then we check who is the current object underneeth the mounse. */

            let container

            /* We check if the mouse is over an element of the Tutorial Space / */
            if (thisObject.tutorialSpace !== undefined) {
                container = thisObject.tutorialSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

                if (container !== undefined && container.detectMouseOver === true) {
                    containerFound()
                    return
                }
            }

            /* We check if the mouse is over an element of the Doc Space / */
            if (thisObject.docSpace !== undefined) {
                container = thisObject.docSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

                if (container !== undefined && container.detectMouseOver === true) {
                    containerFound()
                    return
                }
            }

            /* We check if the mouse is over an element of the Side Space / */
            if (thisObject.sideSpace !== undefined) {
                container = thisObject.sideSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

                if (container !== undefined && container.detectMouseOver === true) {
                    containerFound()
                    return
                }
            }

            /* We check if the mouse is over an element of the Designe Space / */
            if (thisObject.designSpace !== undefined) {
                container = thisObject.designSpace.getContainer(point)

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
                container = thisObject.panelsSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

                if (container !== undefined && container.detectMouseOver === true) {
                    containerFound()
                    return
                }
            }

            /* If it is not, then we check if it is over any of the existing containers at the Charting Space. */
            if (thisObject.chartingSpace !== undefined) {
                container = thisObject.chartingSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

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

            function containerFound() {
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

    function onMouseWheel(event) {
        try {
            thisObject.mouse.event = event
            thisObject.mouse.position.x = event.pageX
            thisObject.mouse.position.y = event.pageY - CURRENT_TOP_MARGIN
            thisObject.mouse.action = 'wheel'

            // cross-browser wheel delta
            var event = window.event || event // old IE support
            event.delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail))
            if (IS_MAC) {
                event.delta = event.delta / MAC_AMOUNT_FACTOR
            }

            /* We try first with panels. */

            let point = {
                x: event.pageX,
                y: event.pageY - CURRENT_TOP_MARGIN
            }

            event.mousePosition = point
            let container

            /* Doc Space */
            container = canvas.tutorialSpace.getContainer({ x: point.x, y: point.y })

            if (container !== undefined && container.isWheelable === true) {
                container.eventHandler.raiseEvent('onMouseWheel', event)
                return false  // This instructs the browser not to take the event and scroll the page.
            }

            /* Doc Space */
            container = canvas.docSpace.getContainer({ x: point.x, y: point.y })

            if (container !== undefined && container.isWheelable === true) {
                container.eventHandler.raiseEvent('onMouseWheel', event)
                return false  // This instructs the browser not to take the event and scroll the page.
            }

            /* Side Space */
            container = canvas.sideSpace.getContainer({ x: point.x, y: point.y })

            if (container !== undefined && container.isWheelable === true) {
                container.eventHandler.raiseEvent('onMouseWheel', event)
                return false  // This instructs the browser not to take the event and scroll the page.
            }

            /* Panel Space */
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

            /*   Charting Space. */
            container = canvas.chartingSpace.getContainer({ x: point.x, y: point.y }, GET_CONTAINER_PURPOSE.MOUSE_WHEEL)
            if (container !== undefined && container.isWheelable === true) {
                container.eventHandler.raiseEvent('onMouseWheel', event)
                return false  // This instructs the browser not to take the event and scroll the page.
            }

            if (container !== undefined) {
                canvas.chartingSpace.viewport.onMouseWheel(event)
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

    function deactivateDragging(event) {
        try {
            if (containerDragStarted || viewPortBeingDragged || floatingObjectDragStarted) {
                thisObject.eventHandler.raiseEvent('Drag Finished', undefined)
            }

            if (
                containerDragStarted ||
                floatingObjectDragStarted ||
                viewPortBeingDragged
            ) {
                ignoreNextClick = false
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

    function checkDrag(event) {
        try {
            if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
                if (event !== undefined) {
                    thisObject.mouse.event = event
                    thisObject.mouse.position.x = event.pageX
                    thisObject.mouse.position.y = event.pageY - CURRENT_TOP_MARGIN
                    thisObject.mouse.action = 'dragging'
                }

                browserCanvas.style.cursor = 'grabbing'
                thisObject.eventHandler.raiseEvent('Dragging', undefined)

                if (viewPortBeingDragged) {
                    let displaceVector = {
                        x: dragVector.upX - dragVector.downX,
                        y: dragVector.upY - dragVector.downY
                    }

                    canvas.chartingSpace.viewport.displace(displaceVector)
                }
                if (containerDragStarted) {
                    if (containerBeingDragged !== undefined) {
                        if (containerBeingDragged.space === 'Charting Space') {
                            let downCopy = {
                                x: dragVector.downX,
                                y: dragVector.downY
                            }

                            let downNoZoom
                            downNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(downCopy)

                            let upCopy = {
                                x: dragVector.upX,
                                y: dragVector.upY
                            }

                            let upNoZoom
                            upNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(upCopy)

                            displaceVector = {
                                x: upNoZoom.x - downNoZoom.x,
                                y: upNoZoom.y - downNoZoom.y
                            }

                            let moveSucceed = containerBeingDragged.displace(displaceVector)
                            if (moveSucceed === false) {
                                deactivateDragging(event)
                            }
                        } else {
                            let displaceVector = {
                                x: dragVector.upX - dragVector.downX,
                                y: dragVector.upY - dragVector.downY
                            }
                            let moveSucceed = containerBeingDragged.displace(displaceVector)
                            if (moveSucceed === false) {
                                deactivateDragging(event)
                            }
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
