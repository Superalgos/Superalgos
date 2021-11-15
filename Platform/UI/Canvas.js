
let browserCanvasContext          // The context of the canvas object.

function newCanvas() {
    const MODULE_NAME = 'Canvas'
    const ERROR_LOG = true
    const logger = newWebDebugLog()


    /* Mouse event related variables. */

    let containerDragStarted = false
    let floatingObjectDragStarted = false
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
            UI.projects.education.spaces.tutorialSpace.finalize()
            UI.projects.education.spaces.docsSpace.finalize()
            //thisObject.chatSpace.finalize()
            UI.projects.foundations.spaces.sideSpace.finalize()
            UI.projects.foundations.spaces.chartingSpace.finalize()
            UI.projects.foundations.spaces.floatingSpace.finalize()
            UI.projects.foundations.spaces.codeEditorSpace.finalize()
            thisObject.shorcutNumbers = undefined

            if (browserCanvas.removeEventListener) {
                browserCanvas.removeEventListener('mousewheel', onMouseWheel, false)// IE9, Chrome, Safari, Opera
                browserCanvas.removeEventListener('DOMMouseScroll', onMouseWheel, false) // Firefox
                browserCanvas.removeEventListener('mousedown', onMouseDown, false)
                browserCanvas.removeEventListener('mouseup', onMouseUp, false)
                browserCanvas.removeEventListener('mousemove', onMouseMove, false)
                browserCanvas.removeEventListener('click', onMouseClick, false)
                browserCanvas.removeEventListener('mouseout', onMouseOut, false)

                browserCanvas.removeEventListener('dragenter', onDragEnter, false)
                browserCanvas.removeEventListener('dragleave', onDragLeave, false)
                browserCanvas.removeEventListener('dragover', onDragOver, false)
                browserCanvas.removeEventListener('drop', onDragDrop, false)

                browserCanvas.removeEventListener('keydown', onKeyDown, false)
                browserCanvas.removeEventListener('keyup', onKeyUp, false)
            } else {
                browserCanvas.detachEvent('onmousewheel', onMouseWheel)  // IE 6/7/8
            }

            lastContainerMouseOver = undefined

            thisObject.mouse = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
        }
    }

    async function initialize() {
        try {

            browserResized()
            initializeBrowserCanvas()
            addCanvasEvents()

            thisObject.animation = newAnimation()
            thisObject.animation.initialize()

            /*
            Here we will setup the UI object, with all the
            projects and spaces.
            */
            for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                UI.projects[projectDefinition.propertyName] = {}
                let projectInstance = UI.projects[projectDefinition.propertyName]
                projectInstance.spaces = {}
                projectInstance.events = {}
                projectInstance.utilities = {}
                projectInstance.globals = {}
                projectInstance.functionLibraries = {}

                projectInstance.events.onMouseWheelMap = new Map()
                projectInstance.events.onMouseOverMap = new Map()
                projectInstance.events.onMouseClickMap = new Map()
                projectInstance.events.onMouseDownMap = new Map()

                let spaceInitializationMap = new Map()
                let spaceAnimationPhysicsMap = new Map()
                let spaceDefinitionPhysicsMap = new Map()
                let spaceAnimationDrawMap = new Map()
                let spaceDefinitionDrawMap = new Map()

                if (projectDefinition.UI === undefined) { continue }

                /* Set up Globals of this Project */
                if (projectDefinition.UI.globals !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.globals.length; j++) {
                        let globalDefinition = projectDefinition.UI.globals[j]

                        projectInstance.globals[globalDefinition.propertyName] = eval(globalDefinition.functionName + '()')
                    }
                }

                /* Set up Utilities of this Project */
                if (projectDefinition.UI.utilities !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.utilities.length; j++) {
                        let utilityDefinition = projectDefinition.UI.utilities[j]

                        projectInstance.utilities[utilityDefinition.propertyName] = eval(utilityDefinition.functionName + '()')
                    }
                }

                /* Set up Function Libraries of this Project */
                if (projectDefinition.UI.functionLibraries !== undefined) {
                    for (let j = 0; j < projectDefinition.UI.functionLibraries.length; j++) {
                        let functionLibraryDefinition = projectDefinition.UI.functionLibraries[j]

                        projectInstance.functionLibraries[functionLibraryDefinition.propertyName] = eval(functionLibraryDefinition.functionName + '()')
                    }
                }

                /* Space Instantiation */
                if (projectDefinition.UI.spaces === undefined) { continue }
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceDefinition = projectDefinition.UI.spaces[j]
                    projectInstance.spaces[spaceDefinition.propertyName] = eval(spaceDefinition.functionName + '()')
                    let spaceInstance = projectInstance.spaces[spaceDefinition.propertyName]
                    spaceInstance.definition = spaceDefinition

                    if (spaceDefinition.initializationIndex !== undefined) {
                        spaceInitializationMap.set(spaceDefinition.initializationIndex, spaceInstance)
                    }

                    if (spaceDefinition.animationPhysicsIndex !== undefined) {
                        spaceAnimationPhysicsMap.set(spaceDefinition.animationPhysicsIndex, spaceInstance)
                        spaceDefinitionPhysicsMap.set(spaceDefinition.animationPhysicsIndex, spaceDefinition)
                    }

                    if (spaceDefinition.animationDrawIndex !== undefined) {
                        spaceAnimationDrawMap.set(spaceDefinition.animationDrawIndex, spaceInstance)
                        spaceDefinitionDrawMap.set(spaceDefinition.animationDrawIndex, spaceDefinition)
                    }

                    /* Build the maps that defines the sequence of execution of different events. */
                    if (spaceDefinition.onMouseWheelIndex !== undefined) {
                        projectInstance.events.onMouseWheelMap.set(spaceDefinition.onMouseWheelIndex, spaceInstance)
                    }
                    if (spaceDefinition.onMouseOverIndex !== undefined) {
                        projectInstance.events.onMouseOverMap.set(spaceDefinition.onMouseOverIndex, spaceInstance)
                    }
                    if (spaceDefinition.onMouseOverIndex !== undefined) {
                        projectInstance.events.onMouseClickMap.set(spaceDefinition.onMouseClickIndex, spaceInstance)
                    }
                    if (spaceDefinition.onMouseDownIndex !== undefined) {
                        projectInstance.events.onMouseDownMap.set(spaceDefinition.onMouseDownIndex, spaceInstance)
                    }
                }

                /* Space Initialization */
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = spaceInitializationMap.get(j)
                    if (spaceInstance !== undefined) {
                        await spaceInstance.initialize()
                    }
                }

                /* Space Animation Physics */
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = spaceAnimationPhysicsMap.get(j)
                    let spaceDefinition = spaceDefinitionPhysicsMap.get(j)
                    if (spaceInstance === undefined || spaceDefinition === undefined) { continue }
                    if (spaceInstance.physics !== undefined) {
                        thisObject.animation.addCallBackFunction(spaceDefinition.name + ' ' + 'Physics', spaceInstance.physics)
                    }
                }

                /* Space Animation Drawing*/
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = spaceAnimationDrawMap.get(j)
                    let spaceDefinition = spaceDefinitionDrawMap.get(j)
                    if (spaceInstance === undefined || spaceDefinition === undefined) { continue }
                    if (spaceInstance.draw !== undefined) {
                        thisObject.animation.addCallBackFunction(spaceDefinition.name + ' ' + 'Draw', spaceInstance.draw)
                    }
                }
            }
            thisObject.animation.start()

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
            /* Keyboard events */
            window.addEventListener('keydown', onKeyDown, true)
            window.addEventListener('keyup', onKeyUp, true)

            if (browserCanvas.addEventListener) {
                canvas.eventHandler.listenToEvent('Browser Resized', browserResized)

                /* Mouse Events */
                browserCanvas.addEventListener('mousedown', onMouseDown, false)
                browserCanvas.addEventListener('mouseup', onMouseUp, false)
                browserCanvas.addEventListener('mousemove', onMouseMove, false)
                browserCanvas.addEventListener('click', onMouseClick, false)
                browserCanvas.addEventListener('mouseout', onMouseOut, false)

                browserCanvas.addEventListener('mousewheel', onMouseWheel, false) // IE9, Chrome, Safari, Opera
                browserCanvas.addEventListener('DOMMouseScroll', onMouseWheel, false)  // Firefox

                /* Dragging Files Over the Canvas */
                browserCanvas.addEventListener('dragenter', onDragEnter, false)
                browserCanvas.addEventListener('dragleave', onDragLeave, false)
                browserCanvas.addEventListener('dragover', onDragOver, false)
                browserCanvas.addEventListener('drop', onDragDrop, false)

            } else browserCanvas.attachEvent('onmousewheel', onMouseWheel)// IE 6/7/8

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
                    centerCanvas()
                    DISABLE_BROWSER_RESIZE_EVENT = true
                    return
                    break
                }
                case 114: { //  F2
                    browserCanvas.width = 400 * 2
                    browserCanvas.height = 580 * 2
                    centerCanvas()
                    DISABLE_BROWSER_RESIZE_EVENT = true
                    return
                    break
                }
                case 115: { //  F3
                    browserCanvas.width = 400 * 1.5
                    browserCanvas.height = 580 * 1.5
                    centerCanvas()
                    DISABLE_BROWSER_RESIZE_EVENT = true
                    return
                    break
                }
                case 116: { //  F5
                    browserCanvas.width = 400 * 1
                    browserCanvas.height = 580 * 1
                    centerCanvas()
                    DISABLE_BROWSER_RESIZE_EVENT = true
                    return
                    break
                }
                case 117: { //  F6
                    browserCanvas.width = window.innerWidth
                    browserCanvas.height = window.innerHeight - CURRENT_TOP_MARGIN
                    centerCanvas()
                    DISABLE_BROWSER_RESIZE_EVENT = false
                    return
                    break
                }
                case 118: { //  F7
                    UI.projects.foundations.utilities.download.downloadPanorama('Superalgos.Market.Panorama')
                    return
                    break
                }
                case 119: { //  F8
                    UI.projects.foundations.utilities.download.downloadCanvas('Superalgos.Image.Capture', browserCanvas)
                    return
                    break
                }
                case 120: { //  F9
                    console.log('Recording gid with framerate = ' + 24)
                    constructorParams = { format: 'gif', workersPath: 'externalScripts/', framerate: 24, name: 'Superalgos.Video.Capture' }
                    break
                }
                case 121: { //  F10
                    console.log('Recording gid with framerate = ' + 24)
                    constructorParams = { format: 'webm', framerate: 24, name: 'Superalgos.Video.Capture' }
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

        function centerCanvas() {
            return
            let top = (window.innerHeight - browserCanvas.height) / 2
            let left = (window.innerWidth - browserCanvas.width) / 2
            browserCanvas.style = "position:absolute; top:" + top + "px; left:" + left + "px; z-index:1"
        }
    }

    function onKeyUp(event) {
        thisObject.mouse.event = event
        thisObject.mouse.action = 'key up'
    }

    async function onKeyDown(event) {
        if (UI.projects.foundations.spaces.designSpace.workspace === undefined) { return }

        if (EDITOR_ON_FOCUS === true) {
            /*
             We will forward the event to whoever is
             controlling the editor.
            */
            if (window.editorController !== undefined) {
                window.editorController.onKeyDown(event)
            }
            return
        }
        /* When the Docs is Visible, we do not process key down events of the Designer Space. */
        if (UI.projects.education !== undefined && UI.projects.education.spaces.docsSpace.isVisible === true) {
            return
        }
        /* When the Code Editor is Visible, we do not process key down events of the Designer Space. */
        if (UI.projects.foundations.spaces.codeEditorSpace.isVisible === true) {
            return
        }

        thisObject.mouse.event = event
        thisObject.mouse.action = 'key down'

        checkMediaRecording(event)

        event.x = thisObject.mouse.position.x
        event.y = thisObject.mouse.position.y

        UI.projects.foundations.spaces.chartingSpace.onKeyPressed(event)

        /* Shortcuts to Menu Items */
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

        if (event.key === 'Escape' && UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            UI.projects.foundations.spaces.floatingSpace.exitMapMode()
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleMapMode || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleMapMode.toLowerCase())
        ) {
            UI.projects.foundations.spaces.floatingSpace.toggleMapMode()
            event.preventDefault()
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleDrawRelationshipLines || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleDrawRelationshipLines.toLowerCase())
        ) {
            UI.projects.foundations.spaces.floatingSpace.toggleDrawReferenceLines()
            event.preventDefault()
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleDrawParentLines || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.toggleDrawParentLines.toLowerCase())
        ) {
            UI.projects.foundations.spaces.floatingSpace.toggleDrawChainLines()
            event.preventDefault()
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.saveWorkspace || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.saveWorkspace.toLowerCase())
        ) {
            UI.projects.foundations.spaces.designSpace.workspace.save()
            if (event.preventDefault !== undefined) {
                event.preventDefault()
            }
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.saveFloatingObjectToBeMoved || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.saveFloatingObjectToBeMoved.toLowerCase())

        ) {
            UI.projects.foundations.spaces.floatingSpace.saveFloatingObjectToBeMoved()
            if (event.preventDefault !== undefined) {
                event.preventDefault()
            }
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.moveSavedFloatingObjectToMouse || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.moveSavedFloatingObjectToMouse.toLowerCase())

        ) {
            UI.projects.foundations.spaces.floatingSpace.moveSavedFloatingObjectToMouse(thisObject.mouse.position)
            if (event.preventDefault !== undefined) {
                event.preventDefault()
            }
            return
        }

        if (
            event.shiftKey === true &&
            (event.ctrlKey === true || event.metaKey === true) &&
            (event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.rescueFloatingObjectToMouse || event.key === UI.projects.foundations.spaces.floatingSpace.settings.shortcuts.rescueFloatingObjectToMouse.toLowerCase())

        ) {
            UI.projects.foundations.spaces.floatingSpace.rescueFloatingObjectToMouse(thisObject.mouse.position)
            if (event.preventDefault !== undefined) {
                event.preventDefault()
            }
            return
        }

        let nodeOnFocus = await UI.projects.foundations.spaces.designSpace.workspace.getNodeThatIsOnFocus()
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
            if (nodeOnFocus.payload.uiObject.listSelector !== undefined) {
                if (nodeOnFocus.payload.uiObject.listSelector.visible === true) {
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
                console.log('Node on Focus:')
                console.log(nodeOnFocus)
                if (nodeOnFocus.config !== undefined) {
                    console.log('Node on Focus Config:')
                    console.log(JSON.stringify(JSON.parse(nodeOnFocus.config)).replaceAll('"', '\"'))
                }
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
            UI.projects.foundations.spaces.cockpitSpace.toTop()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowDown') {
            UI.projects.foundations.spaces.cockpitSpace.toBottom()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowLeft') {
            UI.projects.foundations.spaces.cockpitSpace.moveUp()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === true || event.metaKey === true) && event.code === 'ArrowRight') {
            UI.projects.foundations.spaces.cockpitSpace.moveDown()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowLeft') {
            UI.projects.foundations.spaces.chartingSpace.oneScreenLeft()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowRight') {
            UI.projects.foundations.spaces.chartingSpace.oneScreenRight()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowUp') {
            UI.projects.foundations.spaces.chartingSpace.oneScreenUp()
            event.preventDefault()
            return
        }

        if (event.shiftKey === true && (event.ctrlKey === false && event.metaKey === false) && event.code === 'ArrowDown') {
            UI.projects.foundations.spaces.chartingSpace.oneScreenDown()
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowLeft') {
            let displaceVector = UI.projects.foundations.spaces.floatingSpace.oneScreenLeft()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowRight') {
            let displaceVector = UI.projects.foundations.spaces.floatingSpace.oneScreenRight()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowUp') {
            let displaceVector = UI.projects.foundations.spaces.floatingSpace.oneScreenUp()
            if (displaceVector !== undefined) {
                dragVector.downX = dragVector.downX + displaceVector.x
                dragVector.downY = dragVector.downY + displaceVector.y
                checkDrag()
            }
            event.preventDefault()
            return
        }

        if ((event.ctrlKey === true || event.metaKey === true) && event.shiftKey === false && event.code === 'ArrowDown') {
            let displaceVector = UI.projects.foundations.spaces.floatingSpace.oneScreenDown()
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
                nodeOnFocus.payload.uiObject.valueAtAngle = false
                nodeOnFocus.payload.uiObject.setValue('Id: ' + nodeOnFocus.id)
                return
            }
        }
        if ((event.ctrlKey === true || event.metaKey === true) && event.altKey === true) {
            /* Shortcuts to nodes */
            if ((event.keyCode >= 48 && event.keyCode <= 57) || (event.keyCode >= 65 && event.keyCode <= 90)) {
                /* From here we prevent the default behaviour. Putting it earlier prevents input box and text area to receive keystrokes */
                event.preventDefault()
                let nodeUsingThisKey = await UI.projects.foundations.spaces.designSpace.workspace.getNodeByShortcutKey(event.key)

                if (nodeUsingThisKey !== undefined) {
                    if (nodeOnFocus !== undefined) {
                        if (nodeUsingThisKey.id === nodeOnFocus.id) {
                            nodeOnFocus.payload.uiObject.shortcutKey = ''
                            nodeOnFocus.payload.uiObject.valueAtAngle = false
                            nodeOnFocus.payload.uiObject.setValue('Shortcut Key Removed ')
                        } else {
                            nodeUsingThisKey.payload.uiObject.shortcutKey = ''
                            nodeUsingThisKey = undefined
                            nodeOnFocus.payload.uiObject.shortcutKey = event.key
                            nodeOnFocus.payload.uiObject.valueAtAngle = false
                            nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + Alt + ' + event.key)
                        }
                    } else {
                        UI.projects.foundations.spaces.floatingSpace.positionAtNode(nodeUsingThisKey)
                    }
                    return
                } else {
                    if (nodeOnFocus !== undefined) {
                        nodeOnFocus.payload.uiObject.shortcutKey = event.key
                        nodeOnFocus.payload.uiObject.valueAtAngle = false
                        nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + Alt + ' + event.key)
                    }
                }
            }
        }
        if ((event.ctrlKey === true || event.metaKey === true) && event.altKey === true && nodeOnFocus !== undefined) {
            if (nodeOnFocus.payload.uiObject.shortcutKey !== undefined && nodeOnFocus.payload.uiObject.shortcutKey !== '') {
                nodeOnFocus.payload.uiObject.valueAtAngle = false
                nodeOnFocus.payload.uiObject.setValue('Shortcut Key: Ctrl + Alt + ' + nodeOnFocus.payload.uiObject.shortcutKey)
            }
        }
    }

    function onDragEnter(event) {
        try {
            event.preventDefault()
            event.stopPropagation()
            UI.projects.foundations.spaces.cockpitSpace.toTop()
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
                    UI.projects.foundations.spaces.designSpace.workspace.spawn(reader.result, mousePosition)
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
            /*
            We will go through all the spaces defined at the project schema for each project
            and we are going to query each space to see if they have the container that is at
            the mouse position. We will order first the spaces by the sequence order defined
            at the project schema specifically for this mouse event.

            The order of the projects for events evaluations has intentionally been inverted,
            because the latest project is drawn the last, on top of the others, that means that
            events should belong to the last first.
            */
            for (let i = PROJECTS_SCHEMA.length - 1; i >= 0; i--) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                let projectInstance = UI.projects[projectDefinition.propertyName]
                if (projectInstance === undefined) { continue }

                if (projectDefinition.UI === undefined) { continue }
                if (projectDefinition.UI.spaces === undefined) { continue }
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = projectInstance.events.onMouseDownMap.get(j)
                    if (spaceInstance === undefined) { continue }

                    /*
                    Here we manage a few exceptional behaviours. Specifically with the
                    charting space and the floating space, since they have a non standard
                    way of handling this event.
                    */
                    if (spaceInstance.definition.name === 'Charting Space') {
                        /*  we check if it is over any of the existing containers at the Charting Space. */
                        container = spaceInstance.getContainer(point, GET_CONTAINER_PURPOSE.DRAGGING)

                        if (container !== undefined) {
                            if (container.isDraggeable === true) {
                                containerBeingDragged = container
                                containerDragStarted = true
                                containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                                return
                            } else {
                                if (container.isClickeable === false) {
                                    viewPortBeingDragged = true
                                }
                                return
                            }
                        }
                        continue
                    }

                    if (spaceInstance.definition.name === 'Floating Space') {
                        /*  we check if it is over any of the existing containers at the Floating Space. */
                        container = spaceInstance.getContainer(point)

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
                        continue
                    }

                    /* Next is what happens to all non exceptional behaviour */
                    if (spaceInstance.getContainer === undefined) { continue }
                    container = spaceInstance.getContainer(point)

                    if (container !== undefined && container.isDraggeable === true) {
                        containerBeingDragged = container
                        containerDragStarted = true
                        containerBeingDragged.eventHandler.raiseEvent('onDragStarted', point)
                        return
                    }

                    if (container !== undefined && container.isDraggeable === false) {
                        return
                    }

                    if (container !== undefined && container.isClickeable === true) {
                        /* We dont want to mess up with the click */
                        return
                    }
                }
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
            /*
            We will go through all the spaces defined at the project schema for each project
            and we are going to query each space to see if they have the container that is at
            the mouse position. We will order first the spaces by the sequence order defined
            at the project schema specifically for this mouse event.

            The order of the projects for events evaluations has intentionally been inverted,
            because the latest project is drawn the last, on top of the others, that means that
            events should belong to the last first.
            */
            for (let i = PROJECTS_SCHEMA.length - 1; i >= 0; i--) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                let projectInstance = UI.projects[projectDefinition.propertyName]
                if (projectInstance === undefined) { continue }

                if (projectDefinition.UI === undefined) { continue }
                if (projectDefinition.UI.spaces === undefined) { continue }
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = projectInstance.events.onMouseClickMap.get(j)
                    if (spaceInstance === undefined) { continue }

                    if (spaceInstance.getContainer === undefined) { continue }
                    container = spaceInstance.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_CLICK)

                    if (container !== undefined && container.isClickeable === true) {
                        container.eventHandler.raiseEvent('onMouseClick', point)
                        return
                    }
                }
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

            if (UI.projects.foundations.spaces.chartingSpace.viewport !== undefined) {
                UI.projects.foundations.spaces.chartingSpace.viewport.mousePosition.x = point.x
                UI.projects.foundations.spaces.chartingSpace.viewport.mousePosition.y = point.y
            }

            if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
                if (floatingObjectDragStarted === true) {
                    let targetContainer = UI.projects.foundations.spaces.floatingSpace.getContainer(point)
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

            /* Then we check who is the current object underneath the mouse. */

            let container

            /*
            We will go through all the spaces defined at the project schema for each project
            and we are going to query each space to see if they have the container that is at
            the mouse position. We will order first the spaces by the sequence order defined
            at the project schema specifically for this mouse event.

            The order of the projects for events evaluations has intentionally been inverted,
            because the latest project is drawn the last, on top of the others, that means that
            events should belong to the last first.
            */
            for (let i = PROJECTS_SCHEMA.length - 1; i >= 0; i--) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                let projectInstance = UI.projects[projectDefinition.propertyName]
                if (projectInstance === undefined) { continue }

                if (projectDefinition.UI === undefined) { continue }
                if (projectDefinition.UI.spaces === undefined) { continue }
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = projectInstance.events.onMouseOverMap.get(j)
                    if (spaceInstance === undefined) { continue }

                    if (spaceInstance.getContainer === undefined) { continue }
                    container = spaceInstance.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

                    if (container !== undefined && container.detectMouseOver === true) {
                        containerFound()
                        return
                    }
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

            let point = {
                x: event.pageX,
                y: event.pageY - CURRENT_TOP_MARGIN
            }

            event.mousePosition = point
            let container

            /*
            We will go through all the spaces defined at the project schema for each project
            and we are going to query each space to see if they have the container that is at
            the mouse position. We will order first the spaces by the sequence order defined
            at the project schema specifically for this mouse event.

            The order of the projects for events evaluations has intentionally been inverted,
            because the latest project is drawn the last, on top of the others, that means that
            events should belong to the last first.
            */
            for (let i = PROJECTS_SCHEMA.length - 1; i >= 0; i--) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                let projectInstance = UI.projects[projectDefinition.propertyName]
                if (projectInstance === undefined) { continue }

                if (projectDefinition.UI === undefined) { continue }
                if (projectDefinition.UI.spaces === undefined) { continue }
                for (let j = 0; j < projectDefinition.UI.spaces.length; j++) {
                    let spaceInstance = projectInstance.events.onMouseWheelMap.get(j)
                    if (spaceInstance === undefined) { continue }

                    if (spaceInstance.getContainer === undefined) { continue }
                    container = spaceInstance.getContainer({ x: point.x, y: point.y }, GET_CONTAINER_PURPOSE.MOUSE_WHEEL)

                    if (container !== undefined && container.isWheelable === true) {
                        container.eventHandler.raiseEvent('onMouseWheel', event)
                        return false  // This instructs the browser not to take the event and scroll the page.
                    }
                }
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

                    UI.projects.foundations.spaces.chartingSpace.viewport.displace(displaceVector)
                }
                if (containerDragStarted) {
                    if (containerBeingDragged !== undefined) {
                        if (containerBeingDragged.space === 'Charting Space') {
                            let downCopy = {
                                x: dragVector.downX,
                                y: dragVector.downY
                            }

                            let downNoZoom
                            downNoZoom = UI.projects.foundations.spaces.chartingSpace.viewport.unTransformThisPoint(downCopy)

                            let upCopy = {
                                x: dragVector.upX,
                                y: dragVector.upY
                            }

                            let upNoZoom
                            upNoZoom = UI.projects.foundations.spaces.chartingSpace.viewport.unTransformThisPoint(upCopy)

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
