/*

The chart space is where all the charts live. What this space contains is a type of object we call Time Machine. A Time Machine is a cointainer of
charts objects. The idea is simple, all the chart objects are ploted according to the time of the Time Machine object. When the time of the Time Machine
changes, then all charts in it are replotted with the corresponging data.

*/

function newSuperalgosChartingSpace() {
    const MODULE_NAME = 'Charting Space'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    let thisObject = {
        visible: false,
        container: undefined,
        inViewport: undefined,
        timeMachines: undefined,
        viewport: undefined,
        payload: undefined,
        findTimeMachine: findTimeMachine,
        onKeyPressed: onKeyPressed,
        reset: reset,
        oneScreenUp: oneScreenUp,
        oneScreenDown: oneScreenDown,
        oneScreenLeft: oneScreenLeft,
        oneScreenRight: oneScreenRight,
        fitFunction: fitFunction,
        isThisPointVisible: isThisPointVisible,
        physics: physics,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    let canvasBrowserResizedEventSubscriptionId
    let timeMachinesMap
    let syncWithDesignerLoop

    const PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT = 25

    initialSetup()

    let isInitialized = false

    return thisObject

    function reset() {
        finalize()
        initialSetup()
        isInitialized = false
        initialize()
    }

    function initialSetup() {
        thisObject.timeMachines = []
        thisObject.visible = true
        timeMachinesMap = new Map()
        syncWithDesignerLoop = 0
        thisObject.inViewport = new Map()

        thisObject.container = newContainer()
        thisObject.container.initialize(MODULE_NAME)

        thisObject.container.isDraggeable = false
        thisObject.container.isWheelable = false
    }

    function finalize() {
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[i]
            timeMachine.finalize()
        }

        thisObject.inViewport = undefined
        thisObject.timeMachines = undefined
        timeMachinesMap = undefined

        thisObject.container.eventHandler.stopListening(canvasBrowserResizedEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined

        if (thisObject.viewport !== undefined) {
            thisObject.viewport.finalize()
            thisObject.viewport = undefined
        }

        thisObject.payload = undefined
    }

    function initialize() {
        if (isInitialized === true) { return }
        if (UI.projects.superalgos.spaces.designSpace === undefined) { return }
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }
        if (UI.projects.superalgos.spaces.designSpace.workspace.isInitialized !== true) { return }

        let rootNodes = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode.rootNodes
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode !== null) {
                if (rootNode.type === 'Charting Space') {
                    thisObject.payload = rootNode.payload
                }
            }
        }

        if (thisObject.payload === undefined) {
            // if (ERROR_LOG === true) { logger.write('[WARN] initialize -> There must exist a Charting Space at the Design Space in order to enable Charts. PLease create one and refreash your browser. ') }
            return
        }

        thisObject.viewport = newViewport()
        if (thisObject.payload.node.viewport === undefined) {
            if (ERROR_LOG === true) { logger.write('[WARN] initialize -> There must exist a Viewport node attached to the Charting Space node in order for the Viewport save its properties. ') }
            return
        } else {
            thisObject.viewport.payload = thisObject.payload.node.viewport.payload
        }

        thisObject.viewport.initialize()

        canvasBrowserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)

        isInitialized = true
    }

    function getContainer(point, purpose) {
        if (thisObject.visible !== true) { return }
        if (thisObject.viewport === undefined) { return }
        if (thisObject.viewport.isThisPointInViewport(point) === false) { return }

        let container

        /* This first step is not actually to get the container but to allow things to be turned off in case there is a switch of focus from one time machine to another */
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            container = thisObject.timeMachines[i].container
            if (purpose === GET_CONTAINER_PURPOSE.MOUSE_OVER) {
                container.eventHandler.raiseEvent('onMouseNotOver')
            }
        }

        /*
        Now we see which is the inner most container that has it.
        In this case we will ask all the time machines even if one of them already returned a matching container.
        This will help the others know they are not on ofcus
        */
        let containerFound
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            container = thisObject.timeMachines[i].getContainer(point, purpose)
            if (container !== undefined) {
                if (purpose !== undefined) {
                    if (containerFound === undefined) {
                        containerFound = container
                    }
                } else {
                    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
                        if (containerFound === undefined) {
                            containerFound = container
                        }
                    }
                }
            }
        }
        if (containerFound !== undefined) {
            containerFound.space = 'Charting Space'
            if (purpose === GET_CONTAINER_PURPOSE.MOUSE_WHEEL && containerFound.isWheelable !== true) {
                UI.projects.superalgos.spaces.chartingSpace.viewport.onMouseWheel(event)
                return
            }
            return containerFound
        }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = 'Charting Space'
            if (purpose === GET_CONTAINER_PURPOSE.MOUSE_WHEEL && thisObject.container.isWheelable !== true) {
                UI.projects.superalgos.spaces.chartingSpace.viewport.onMouseWheel(event)
                return
            }
            return thisObject.container
        } else {
            return undefined
        }
    }

    function resize() {
        thisObject.viewport.resize()
        thisObject.container.frame.width = browserCanvas.width
        thisObject.container.frame.height = COCKPIT_SPACE_POSITION
    }

    function oneScreenUp() {
        if (thisObject.visible === false) { return }
        let displaceVector = {
            x: 0,
            y: browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
        }

        UI.projects.superalgos.spaces.chartingSpace.viewport.displace(displaceVector)
    }

    function oneScreenDown() {
        if (thisObject.visible === false) { return }
        let displaceVector = {
            x: 0,
            y: -browserCanvas.height * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100
        }

        UI.projects.superalgos.spaces.chartingSpace.viewport.displace(displaceVector)
    }

    function oneScreenLeft() {
        if (thisObject.visible === false) { return }
        let displaceVector = {
            x: browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
            y: 0
        }

        UI.projects.superalgos.spaces.chartingSpace.viewport.displace(displaceVector, true)
    }

    function oneScreenRight() {
        if (thisObject.visible === false) { return }
        let displaceVector = {
            x: -browserCanvas.width * PERCENTAGE_OF_SCREEN_FOR_DISPLACEMENT / 100,
            y: 0
        }

        UI.projects.superalgos.spaces.chartingSpace.viewport.displace(displaceVector, true)
    }

    function fitFunction(point, fullVisible) {
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

        if (fullVisible === true) {
            if (point.y > COCKPIT_SPACE_POSITION) {
                returnPoint.y = COCKPIT_SPACE_POSITION
            }
        } else {
            if (point.y > COCKPIT_SPACE_POSITION ) {
                returnPoint.y = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT / 2
            }
        }

        if (point.y < TOP_SPACE_HEIGHT) {
            returnPoint.y = TOP_SPACE_HEIGHT
        }

        return returnPoint
    }

    function isThisPointVisible(point) {
        if (point.x > browserCanvas.width) {
            return false
        }

        if (point.x < 0) {
            return false
        }

        if (point.y > COCKPIT_SPACE_POSITION) {
            return false
        }

        if (point.y < 0) {
            return false
        }

        return true
    }

    function physics() {
        initialize()
        thisObjectPhysics()
        if (thisObject.visible !== true) { return }
        if (thisObject.viewport !== undefined) {
            thisObject.viewport.physics()
        }
        childrenPhysics()
        syncWithDesigner()
    }

    function onKeyPressed(event) {
        if (thisObject.visible !== true) { return }
        for (let j = 0; j < thisObject.timeMachines.length; j++) {
            let timeMachine = thisObject.timeMachines[j]
            if (timeMachine.onFocus === true) {
                timeMachine.onKeyPressed(event)
            }
        }
    }

    function findTimeMachine(node) {
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[i]
            if (timeMachine.payload.node.id === node.id) {
                return timeMachine
            }
        }
    }

    function syncWithDesigner() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.node === undefined) { return }
        syncWithDesignerLoop = syncWithDesignerLoop + 0.00000000001

        for (let k = 0; k < thisObject.payload.node.projectDashboards.length; k++) {
            let projectDashboards = thisObject.payload.node.projectDashboards[k]
            if (projectDashboards.dashboards !== undefined) {
                for (let i = 0; i < projectDashboards.dashboards.length; i++) {
                    let dashboard = projectDashboards.dashboards[i]
                    if (dashboard.timeMachines !== undefined) {
                        for (let j = 0; j < dashboard.timeMachines.length; j++) {
                            let node = dashboard.timeMachines[j]
                            let timeMachine = timeMachinesMap.get(node.id)
                            if (timeMachine === undefined) {
                                /* The time machine node is new, thus we need to initialize a new timeMachine */
                                initializeTimeMachine(node, syncWithDesignerLoop)
                            } else {
                                /* The time machine already exists, we tag it as existing at the current loop. */
                                timeMachine.syncWithDesignerLoop = syncWithDesignerLoop
                            }
                        }
                    }
                }
            }
        }

        /* We check all the timeMachines we have to see if we need to remove any of them */
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[i]
            if (timeMachine.syncWithDesignerLoop < syncWithDesignerLoop) {
                /* Must be removed */
                timeMachine.finalize()
                timeMachinesMap.delete(timeMachine.nodeId)
                thisObject.timeMachines.splice(i, 1)
                /* We remove one at the time */
                return
            }
        }

        function initializeTimeMachine(node, syncWithDesignerLoop) {
            if (node.payload === undefined) { return } // not ready to consider this Time Machine
            if (node.payload.uiObject === undefined) { return }

            let timeMachine = newTimeMachine()
            timeMachine.syncWithDesignerLoop = syncWithDesignerLoop
            timeMachine.payload = node.payload
            timeMachine.nodeId = node.id

            timeMachinesMap.set(node.id, timeMachine)
            timeMachine.payload.uiObject.setValue('Loading...')

            /* Setting up the new time machine. */
            timeMachine.initialize(onTimeMachineInitialized)

            function onTimeMachineInitialized() {
                thisObject.timeMachines.push(timeMachine)
                timeMachine.payload.uiObject.setValue('')
                if (UI.projects.superalgos.spaces.chartingSpace.viewport !== undefined) {
                    UI.projects.superalgos.spaces.chartingSpace.viewport.raiseEvents() // These events will impacts on objects just initialized.
                }
            }
        }
    }

    function thisObjectPhysics() {
        thisObject.container.frame.height = COCKPIT_SPACE_POSITION

        if (thisObject.container.frame.height <= TOP_SPACE_HEIGHT) {
            thisObject.visible = false
            if (thisObject.viewport !== undefined) {
                thisObject.viewport.visible = false
            }
        } else {
            thisObject.visible = true
            if (thisObject.viewport !== undefined) {
                thisObject.viewport.visible = true
            }
        }

        if (UI.projects.superalgos.spaces.chartingSpace.viewport !== undefined) {
            UI.projects.superalgos.spaces.chartingSpace.viewport.resize()
        }
    }

    function childrenPhysics() {
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[i]
            if (timeMachine.payload.node === undefined) {
                continue
            }

            if (timeMachine.container.frame.isInViewPort()) {
                thisObject.inViewport.set(timeMachine.payload.node.id, timeMachine)
            } else {
                thisObject.inViewport.delete(timeMachine.payload.node.id)
            }
            timeMachine.physics()
        }
    }

    function drawBackground() {
        if (thisObject.visible === false) { return }
        drawSpaceBackground()

        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[thisObject.timeMachines.length - i - 1]
            timeMachine.drawBackground()
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (thisObject.visible === false) { return }
        drawBackground()

        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[thisObject.timeMachines.length - i - 1]
            timeMachine.draw()
        }

        drawForeground()
    }

    function drawForeground() {
        for (let i = 0; i < thisObject.timeMachines.length; i++) {
            let timeMachine = thisObject.timeMachines[thisObject.timeMachines.length - i - 1]
            timeMachine.drawForeground()
        }
    }

    function drawSpaceBackground() {
        let opacity = '1'
        let fromPoint = {
            x: 0,
            y: 0
        }

        let toPoint = {
            x: browserCanvas.width,
            y: COCKPIT_SPACE_POSITION
        }

        browserCanvasContext.beginPath()
        browserCanvasContext.rect(fromPoint.x, fromPoint.y, toPoint.x - fromPoint.x, toPoint.y - fromPoint.y)
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')'
        browserCanvasContext.closePath()
        browserCanvasContext.fill()
    }
}
