
function newSuperalgosFloatingSpace() {
    const MODULE_NAME = 'Floating Space'
    const ERROR_LOG = true
    /*
    The Floating Space is the place where floating elements like floatingObjects, live and are rendered.
    This space has its own physics which helps with the animation of these objects and also preventing them to overlap.
    */

    let thisObject = {
        floatingLayer: undefined,               // This is the array of floatingObjects being displayed
        uiObjectConstructor: undefined,
        container: undefined,
        inMapMode: false,
        drawReferenceLines: false,
        drawChainLines: true,
        style: undefined,
        settings: undefined,
        toggleDrawChainLines: toggleDrawChainLines,
        toggleDrawReferenceLines: toggleDrawReferenceLines,
        toggleMapMode: toggleMapMode,
        enterMapMode: enterMapMode,
        exitMapMode: exitMapMode,
        transformPointToMap: transformPointToMap,
        transformRadiusToMap: transformRadiusToMap,
        transformImagesizeToMap: transformImagesizeToMap,
        oneScreenUp: oneScreenUp,
        oneScreenDown: oneScreenDown,
        oneScreenLeft: oneScreenLeft,
        oneScreenRight: oneScreenRight,
        positionAtNode: positionAtNode,
        fitIntoVisibleArea: fitIntoVisibleArea,
        isThisPointVisible: isThisPointVisible,
        isItFar: isItFar,
        makeVisible: makeVisible,
        makeInvisible: makeInvisible,
        draw: draw,
        physics: physics,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isClickeable = false
    thisObject.container.isDraggeable = true
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true
    thisObject.container.isClickeable = false
    thisObject.container.frame.radius = 0

    let devicePixelRatio = window.devicePixelRatio
    const SPACE_SIZE = 50000

    thisObject.container.frame.width = SPACE_SIZE
    thisObject.container.frame.height = SPACE_SIZE
    thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
    thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2

    let visible = false
    let floatingObjetOnFocus

    const PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT = 25
    let onDragStartedEventSubscriptionId
    let spaceFocusAquiredEventSubscriptionId

    /* Default Style */
    thisObject.style = {
        backgroundColor: UI_COLOR.BLACK,
        node: {
            imageSize: 96,
            fontSize: 18,
            type: {
                fontColor: UI_COLOR.WHITE
            },
            name: {
                fontColor: UI_COLOR.WHITE
            },
            menuItem: {
                backgroundColor: UI_COLOR.BLACK,
                fontColor: UI_COLOR.WHITE,
                fontSize: 15,
                imageSize: 50
            }
        }
    }

    /* Default Settings */
    thisObject.settings = {
        node: {
            distancePercentage: 100,
            radiusPercentage: 100,
            massPercentage: 100,
            animationSteps: 2,
            menuItem: {
                widthPercentage: 100,
                heightPercentage: 100,
                radiusPercentage: 100
            }
        },
        physics: true,
        detachUsingMouse: false
    }

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onDragStartedEventSubscriptionId)
        UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.stopListening(spaceFocusAquiredEventSubscriptionId)

        thisObject.floatingLayer.finalize()
        thisObject.uiObjectConstructor.finalize()
        thisObject.container.finalize()

        thisObject.floatingLayer = undefined
        thisObject.uiObjectConstructor = undefined
        thisObject.container = undefined

        floatingObjetOnFocus = undefined
    }

    function initialize(callBackFunction) {
        thisObject.floatingLayer = newFloatingLayer()
        thisObject.floatingLayer.initialize()

        thisObject.uiObjectConstructor = newUiObjectConstructor()
        thisObject.uiObjectConstructor.initialize(thisObject.floatingLayer)

        onDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
        spaceFocusAquiredEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocusAquired', someoneAquiredFocus)
    }

    function someoneAquiredFocus(floatingObject) {
        if (floatingObject === undefined || floatingObject.container === undefined) {
            return
        }
        floatingObjetOnFocus = floatingObject
    }

    function toggleDrawReferenceLines() {
        if (thisObject.drawReferenceLines === true) {
            thisObject.drawReferenceLines = false
        } else {
            thisObject.drawReferenceLines = true
        }
    }

    function toggleDrawChainLines() {
        if (thisObject.drawChainLines === true) {
            thisObject.drawChainLines = false
        } else {
            thisObject.drawChainLines = true
        }
    }

    function transformPointToMap(point) {
        let returnPoint = {
            x: point.x - thisObject.container.frame.position.x,
            y: point.y - thisObject.container.frame.position.y
        }
        returnPoint.x = returnPoint.x / SPACE_SIZE * browserCanvas.width
        returnPoint.y = returnPoint.y / SPACE_SIZE * browserCanvas.height
        return returnPoint
    }

    function transformRadiusToMap(radius) {
        const RADIUS_REDUCTION_FACTOR = 2
        return radius / RADIUS_REDUCTION_FACTOR
    }

    function transformImagesizeToMap(imageSize) {
        const IMAGE_REDUCTION_FACTOR = 3
        return imageSize / IMAGE_REDUCTION_FACTOR
    }

    function enterMapMode() {
        thisObject.inMapMode = true
    }

    function exitMapMode() {
        thisObject.inMapMode = false
    }

    function toggleMapMode() {
        if (thisObject.inMapMode === false) {
            enterMapMode()
        } else {
            exitMapMode()
        }
    }

    function onDragStarted(event) {
        if (thisObject.inMapMode === false) {
            if (event.buttons !== 2) { return }
            event.candelDragging = true
            enterMapMode()
        } else {
            if (event.buttons !== 1) {
                event.candelDragging = true
                return
            }

            let mousePosition = {
                x: event.x,
                y: event.y
            }

            let mouseAtSpace = {
                x: mousePosition.x / browserCanvas.width * SPACE_SIZE,
                y: mousePosition.y / browserCanvas.height * SPACE_SIZE
            }
            /* Let's see if we can snap to some of the root nodes that are Hierarchy Head and Project Heads */
            let snapCandidateNodes = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeads()
            snapCandidateNodes = snapCandidateNodes.concat(UI.projects.superalgos.spaces.designSpace.workspace.getProjectsHeads())

            for (let i = 0; i < snapCandidateNodes.length; i++) {
                let node = snapCandidateNodes[i]
                let nodePosition = {
                    x: node.payload.floatingObject.container.frame.position.x,
                    y: node.payload.floatingObject.container.frame.position.y
                }
                // nodePosition = node.payload.floatingObject.container.frame.frameThisPoint(nodePosition)

                let distance = Math.sqrt(Math.pow(mouseAtSpace.x - nodePosition.x, 2) + Math.pow(mouseAtSpace.y - nodePosition.y, 2))
                const SNAP_THREASHOLD = 1000
                if (distance < SNAP_THREASHOLD) {
                    mousePosition.x = nodePosition.x / SPACE_SIZE * browserCanvas.width
                    mousePosition.y = nodePosition.y / SPACE_SIZE * browserCanvas.height
                }
            }

            /* Movign the Floating Space to where the mouse is. */
            thisObject.container.frame.position.x = -mousePosition.x / browserCanvas.width * SPACE_SIZE + browserCanvas.width / 2
            thisObject.container.frame.position.y = -mousePosition.y / browserCanvas.height * SPACE_SIZE + browserCanvas.height / 2

            exitMapMode()
        }
    }

    function isItFar(payload, dontCheckParent) {
        /* If for any reason the paylaod is undefined we return false */
        if (payload === undefined) { return false }
        if (thisObject.inMapMode === true) { return false }

        let radarFactor = 2 // How big is the margin

        /* If the chain parent is not far, they we dont consither this far. */
        if (dontCheckParent !== true) {
            if (payload.chainParent !== undefined) {
                if (isItFar(payload.chainParent.payload, true) === false) { return false }
            }
        }

        /* Exceptions that are never considered far. */
        if (
            payload.node.type === 'Trading System' ||
            payload.node.type === 'Learning System' ||
            payload.node.type === 'Trading Engine' ||
            payload.node.type === 'Learning Engine' ||
            payload.node.type === 'Network' ||
            payload.node.type === 'Crypto Ecosystem' ||
            payload.node.type === 'Charting Space' ||
            payload.node.type === 'Data Mine' ||
            payload.node.type === 'Trading Mine' ||
            payload.node.type === 'Learning Mine'
        ) {
            return false
        }

        /* Another exception are the ones who have reference parents */
        if (payload.referenceParent !== undefined) { return false }

        /* Here we will check the position of a floatingobject to see if it is outside the screen, with a margin of one screen around. */
        let point = thisObject.container.frame.frameThisPoint(payload.position)

        if (point.x > browserCanvas.width + browserCanvas.width * radarFactor) {
            return true
        }

        if (point.x < 0 - browserCanvas.width * radarFactor) {
            return true
        }

        let bottom = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT
        let heightDiff = browserCanvas.height - bottom
        if (point.y < bottom - heightDiff * radarFactor) {
            return true
        }

        if (point.y > browserCanvas.height + heightDiff * radarFactor) {
            return true
        }
        return false
    }

    function fitIntoVisibleArea(point) {
        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

        let returnPoint = {
            x: point.x,
            y: point.y
        }

        if (point.x > browserCanvas.width) {
            returnPoint.x = browserCanvas.width
        }

        if (point.x < 0) {
            returnPoint.x = 0
        }

        if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
            returnPoint.y = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT
        }

        if (point.y > browserCanvas.height) {
            returnPoint.y = browserCanvas.height
        }

        return returnPoint
    }

    function oneScreenUp() {
        if (visible === false) { return }
        let displaceVector = {
            x: 0,
            y: browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
        }

        thisObject.container.displace(displaceVector)
        return displaceVector
    }

    function oneScreenDown() {
        if (visible === false) { return }
        let displaceVector = {
            x: 0,
            y: -browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
        }

        thisObject.container.displace(displaceVector)
        return displaceVector
    }

    function oneScreenLeft() {
        if (visible === false) { return }
        let displaceVector = {
            x: browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
            y: 0
        }

        thisObject.container.displace(displaceVector)
        return displaceVector
    }

    function oneScreenRight() {
        if (visible === false) { return }
        let displaceVector = {
            x: -browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
            y: 0
        }

        thisObject.container.displace(displaceVector)
        return displaceVector
    }

    function positionAtNode(node, xOffset, yOffset) {
        if (xOffset === undefined) { xOffset = 0 }
        if (yOffset === undefined) { yOffset = 0 }

        let position = thisObject.container.frame.frameThisPoint(node.payload.position)

        let displaceVector = {
            x: browserCanvas.width / 2 - position.x + xOffset,
            y: (COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) + (browserCanvas.height - (COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT)) / 2 - position.y + yOffset
        }

        thisObject.container.displace(displaceVector)
    }

    function isThisPointVisible(point) {
        if (point.x > browserCanvas.width) {
            return false
        }

        if (point.x < 0) {
            return false
        }

        if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
            return false
        }

        if (point.y > browserCanvas.height) {
            return false
        }

        return true
    }

    function makeVisible() {
        visible = true
    }

    function makeInvisible() {
        visible = false
    }

    function getContainer(point) {
        if (visible === false) { return }

        let container

        if (floatingObjetOnFocus !== undefined) {
            container = floatingObjetOnFocus.getContainer(point)
            if (container !== undefined) {
                container.space = 'Floating Space'
                return container
            }
        }

        container = thisObject.floatingLayer.getContainer(point)
        if (container !== undefined) {
            container.space = 'Floating Space'
            return container
        }

        if (visible === true) {
            thisObject.container.space = 'Floating Space'
            return thisObject.container
        }
    }

    function physics() {
        if (visible === false) { return }
        syncStylePhysics()
        syncSettingsPhysics()
        browserZoomPhysics()
        positionContraintsPhysics()
        thisObject.floatingLayer.physics()
    }

    function syncStylePhysics() {
        if (UI.projects.superalgos.spaces.designSpace === undefined) { return }
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }
        let designSpaceNode = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByType('Design Space')
        if (designSpaceNode === undefined) { return }
        if (designSpaceNode.spaceStyle === undefined) { return }
        let configStyle
        try {
            configStyle = JSON.parse(designSpaceNode.spaceStyle.config)
        } catch (err) {
            if (thisObject.payload !== undefined) {
                thisObject.payload.uiObject.setErrorMessage(err.message)
            }
            return
        }
        if (configStyle.backgroundColor !== undefined) {
            thisObject.style.backgroundColor = eval(configStyle.backgroundColor)
        }
        if (configStyle.node !== undefined) {
            if (configStyle.node.fontSize !== undefined) {
                thisObject.style.node.fontSize = configStyle.node.fontSize
            }
            if (configStyle.node.imageSize !== undefined) {
                thisObject.style.node.imageSize = configStyle.node.imageSize
            }
            if (configStyle.node.name !== undefined) {
                if (configStyle.node.name.fontColor !== undefined) {
                    thisObject.style.node.name.fontColor = eval(configStyle.node.name.fontColor)
                }
            }
            if (configStyle.node.type !== undefined) {
                if (configStyle.node.type.fontColor !== undefined) {
                    thisObject.style.node.type.fontColor = eval(configStyle.node.type.fontColor)
                }
            }
            if (configStyle.node.menuItem !== undefined) {
                if (configStyle.node.menuItem.fontColor !== undefined) {
                    thisObject.style.node.menuItem.fontColor = eval(configStyle.node.menuItem.fontColor)
                }
                if (configStyle.node.menuItem.backgroundColor !== undefined) {
                    thisObject.style.node.menuItem.backgroundColor = eval(configStyle.node.menuItem.backgroundColor)
                }
                if (configStyle.node.menuItem.fontSize !== undefined) {
                    thisObject.style.node.menuItem.fontSize = configStyle.node.menuItem.fontSize
                }
                if (configStyle.node.menuItem.imageSize !== undefined) {
                    thisObject.style.node.menuItem.imageSize = configStyle.node.menuItem.imageSize
                }
            }
        }
    }

    function syncSettingsPhysics() {
        if (UI.projects.superalgos.spaces.designSpace === undefined) { return }
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }
        let designSpaceNode = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByType('Design Space')
        if (designSpaceNode === undefined) { return }
        if (designSpaceNode.spaceSettings === undefined) { return }
        let configSettings
        try {
            configSettings = JSON.parse(designSpaceNode.spaceSettings.config)
        } catch (err) {
            if (thisObject.payload !== undefined) {
                thisObject.payload.uiObject.setErrorMessage(err.message)
            }
            return
        }
        if (configSettings.node !== undefined) {
            if (configSettings.node.distancePercentage !== undefined) {
                thisObject.settings.node.distancePercentage = configSettings.node.distancePercentage
            }
            if (configSettings.node.radiusPercentage !== undefined) {
                thisObject.settings.node.radiusPercentage = configSettings.node.radiusPercentage
            }
            if (configSettings.node.massPercentage !== undefined) {
                thisObject.settings.node.massPercentage = configSettings.node.massPercentage
            }
            if (configSettings.node.animationSteps !== undefined) {
                thisObject.settings.node.animationSteps = configSettings.node.animationSteps
            }
            if (configSettings.node.menuItem !== undefined) {
                if (configSettings.node.menuItem.widthPercentage !== undefined) {
                    thisObject.settings.node.menuItem.widthPercentage = configSettings.node.menuItem.widthPercentage
                }
                if (configSettings.node.menuItem.heightPercentage !== undefined) {
                    thisObject.settings.node.menuItem.heightPercentage = configSettings.node.menuItem.heightPercentage
                }
                if (configSettings.node.menuItem.radiusPercentage !== undefined) {
                    thisObject.settings.node.menuItem.radiusPercentage = configSettings.node.menuItem.radiusPercentage
                }
            }
        }

        if (configSettings.physics !== undefined) {
            thisObject.settings.physics = configSettings.physics
        }
        if (configSettings.detachUsingMouse !== undefined) {
            thisObject.settings.detachUsingMouse = configSettings.detachUsingMouse
        }
    }

    function positionContraintsPhysics() {
        if (thisObject.container.frame.position.x > 0) {
            thisObject.container.frame.position.x = 0
        }
        if (thisObject.container.frame.position.y > 0) {
            thisObject.container.frame.position.y = 0
        }
        if (thisObject.container.frame.position.x + thisObject.container.frame.width < browserCanvas.width) {
            thisObject.container.frame.position.x = browserCanvas.width - thisObject.container.frame.width
        }
        if (thisObject.container.frame.position.y + thisObject.container.frame.height < browserCanvas.height) {
            thisObject.container.frame.position.y = browserCanvas.height - thisObject.container.frame.height
        }
    }

    function browserZoomPhysics() {
        if (devicePixelRatio !== window.devicePixelRatio) {
            devicePixelRatio = window.devicePixelRatio

            thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
            thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (visible === false) { return }
        drawBackground()
        thisObject.floatingLayer.draw()
    }

    function drawBackground() {
        browserCanvasContext.beginPath()

        browserCanvasContext.rect(thisObject.container.frame.position.x, thisObject.container.frame.position.y, thisObject.container.frame.width, thisObject.container.frame.height)
        browserCanvasContext.fillStyle = 'rgba(' + thisObject.style.backgroundColor + ', 1)'

        browserCanvasContext.closePath()
        browserCanvasContext.fill()
    }
}
