function newListView() {
    const MODULE_NAME = 'List View'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        listItems: [],
        payload: undefined,
        isVisible: false,
        resize: resize,
        turnOn: turnOn,
        turnOff: turnOff,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize()
    thisObject.container.isDraggeable = false
    thisObject.container.isWheelable = true
    thisObject.container.detectMouseOver = true

    let isInitialized = false

    let listItemsMap = new Map()
    let visibleListItems = []
    let firstVisibleListItem

    let headerHeight = 40
    let footerHeight = 30
    let listItemHeight = SIDE_PANEL_WIDTH * 0.75

    let posibleVisibleListItems

    let itemSeparation

    let onMouseWheelEventSuscriptionId

    let wheelDeltaDirection
    let wheelDeltaCounter = 0

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseWheelEventSuscriptionId)

        listItemsMap = undefined
        visibleListItems = undefined

        thisObject.container.finalize()
        thisObject.container = undefined

        thisObject.payload = undefined
        thisObject = undefined
    }

    function initialize() {
        thisObject.container.name = MODULE_NAME
        thisObject.container.frame.containerName = thisObject.container.name
        thisObject.container.frame.width = SIDE_PANEL_WIDTH * 0.75

        let position = { // Default position
            x: SIDE_PANEL_WIDTH * 0.25 / 2,
            y: 20
        }

        thisObject.container.frame.position = position

        onMouseWheelEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)

        resize()
        turnOn()
    }

    function resize() {
        thisObject.container.frame.height = browserCanvas.height - thisObject.container.frame.position.y * 2

        let spaceForListItems = (thisObject.container.frame.height - headerHeight - footerHeight)
        posibleVisibleListItems = Math.trunc(spaceForListItems / (listItemHeight))
        if ((posibleVisibleListItems - 1) !== 0) {
            itemSeparation = (spaceForListItems - listItemHeight * posibleVisibleListItems) / (posibleVisibleListItems - 1)
        } else {
            itemSeparation = 0
        }
    }

    function turnOn() {
        firstVisibleListItem = 1

        httpRequest(undefined, 'ListWorkspaces', onResponse)

        function onResponse(err, text) {
            if (err && err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Could not load the list of your workspaces from the client.  ') }
                return
            }

            let workspacelist = JSON.parse(text)
            thisObject.listItems = []
            for (let i = 0; i < workspacelist.length; i++) {
                let project = workspacelist[i][0]
                let workspace = workspacelist[i][1].replace('.json', '')
                let listItem = newListItem()
                listItem.initialize(workspace, project, 'Workspace')
                listItem.container.connectToParent(thisObject.container, false, false)

                thisObject.listItems.push(listItem)
            }
            calculateVisbleListItems()
            isInitialized = true
            thisObject.isVisible = true
        }
    }

    function turnOff() {
        thisObject.isVisible = false
    }

    function onMouseWheel(event) {

        if (IS_MAC) {
            let sensitivity
            if (event.delta < 0) {
                if (event.shiftKey === true) {
                    sensitivity = MAC_SCROLL_SENSITIVITY
                } else {
                    sensitivity = MAC_ZOOM_SENSITIVITY
                }
                if (wheelDeltaDirection === -1) {
                    wheelDeltaCounter++
                    if (wheelDeltaCounter < sensitivity) {
                        return
                    } else {
                        wheelDeltaCounter = 0
                    }
                } else {
                    wheelDeltaCounter = 0
                    wheelDeltaDirection = -1
                    return
                }
            } else {
                if (event.shiftKey === true) {
                    sensitivity = MAC_SCROLL_SENSITIVITY
                } else {
                    sensitivity = MAC_ZOOM_SENSITIVITY
                }
                if (wheelDeltaDirection === 1) {
                    wheelDeltaCounter++
                    if (wheelDeltaCounter < sensitivity) {
                        return
                    } else {
                        wheelDeltaCounter = 0
                    }
                } else {
                    wheelDeltaCounter = 0
                    wheelDeltaDirection = 1
                    return
                }
            }
            event.delta = - event.delta 
        }

        firstVisibleListItem = firstVisibleListItem - event.delta

        calculateVisbleListItems()
    }

    function calculateVisbleListItems() {
        let availableSlots = Math.trunc(posibleVisibleListItems)

        if (firstVisibleListItem < 1) { firstVisibleListItem = 1 }
        if (firstVisibleListItem > (thisObject.listItems.length - availableSlots + 1)) { firstVisibleListItem = thisObject.listItems.length - availableSlots + 1 }

        visibleListItems = []

        for (let i = 0; i < thisObject.listItems.length; i++) {
            if (i + 1 >= firstVisibleListItem && i + 1 < firstVisibleListItem + availableSlots) {
                let listItem = thisObject.listItems[i]

                listItem.container.frame.position.x = 0
                listItem.container.frame.position.y = (listItemHeight + itemSeparation) * visibleListItems.length + headerHeight

                /* Add to Visible Product Array */
                visibleListItems.push(listItem)
            }
        }
    }

    function getContainer(point, purpose) {
        if (isInitialized === false || thisObject.isVisible === false) { return }
        let container

        /* First we check if thisObject point is inside thisObject space. */
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            /* Now we see which is the inner most container that has it */
            for (let i = 0; i < visibleListItems.length; i++) {
                container = visibleListItems[i].getContainer(point)

                if (container !== undefined) {
                    if (container.isForThisPurpose(purpose) === true) {
                        return container
                    }
                }
            }

            return thisObject.container
        }
    }

    function childrenPhysics() {
        for (let i = 0; i < thisObject.listItems.length; i++) {
            let listItem = thisObject.listItems[i]
            listItem.physics()
        }
    }

    function physics() {
        if (isInitialized === false || thisObject.isVisible === false) { return }
        childrenPhysics()
    }

    function draw() {
        if (isInitialized === false || thisObject.isVisible === false) { return }

        drawBackground()
        drawChildren()
        drawScrollBar()
    }

    function drawChildren() {
        for (let i = 0; i < visibleListItems.length; i++) {
            let listItem = visibleListItems[i]
            if (listItem !== undefined) {
                listItem.draw()
            }
        }
    }

    function drawBackground() {
        let label = 'Available Workspaces'

        let backgroundColor = UI_COLOR.WHITE
        let params = {
            cornerRadius: 5,
            lineWidth: 1,
            container: thisObject.container,
            borderColor: UI_COLOR.RUSTED_RED,
            castShadow: false,
            backgroundColor: backgroundColor,
            opacity: 1
        }

        UI.projects.superalgos.utilities.drawPrint.roundedCornersBackground(params)

        UI.projects.superalgos.utilities.drawPrint.drawLabel(label, 1 / 2, 0, 0, 25, 15, thisObject.container, UI_COLOR.BLACK)
    }

    function drawScrollBar() {
        if (thisObject.listItems.length > posibleVisibleListItems && posibleVisibleListItems > 0) {
            let xOffset = 4
            let barTopPoint = {
                x: thisObject.container.frame.width - xOffset,
                y: headerHeight
            }
            let barBottomPoint = {
                x: thisObject.container.frame.width - xOffset,
                y: thisObject.container.frame.height - footerHeight
            }
            let ratio = (posibleVisibleListItems * listItemHeight + (posibleVisibleListItems - 1) * itemSeparation) / (thisObject.listItems.length * listItemHeight + (thisObject.listItems.length - 1) * itemSeparation)
            let handleHeight = posibleVisibleListItems * (listItemHeight * ratio) + (posibleVisibleListItems - 1) * itemSeparation * ratio
            let handleTopPoint = {
                x: thisObject.container.frame.width - xOffset,
                y: headerHeight + (listItemHeight * ratio * (firstVisibleListItem - 1) + itemSeparation * ratio * (firstVisibleListItem - 1))
            }
            let handleBottomPoint = {
                x: thisObject.container.frame.width - xOffset,
                y: handleTopPoint.y + handleHeight
            }
            barTopPoint = thisObject.container.frame.frameThisPoint(barTopPoint)
            barBottomPoint = thisObject.container.frame.frameThisPoint(barBottomPoint)
            handleTopPoint = thisObject.container.frame.frameThisPoint(handleTopPoint)
            handleBottomPoint = thisObject.container.frame.frameThisPoint(handleBottomPoint)

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(barTopPoint.x, barTopPoint.y)
            browserCanvasContext.lineTo(barBottomPoint.x, barBottomPoint.y)
            browserCanvasContext.closePath()
            browserCanvasContext.setLineDash([]) // Resets Line Dash
            browserCanvasContext.lineWidth = 1
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + 1 + ')'
            browserCanvasContext.stroke()

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(handleTopPoint.x, handleTopPoint.y)
            browserCanvasContext.lineTo(handleBottomPoint.x, handleBottomPoint.y)
            browserCanvasContext.closePath()
            browserCanvasContext.setLineDash([]) // Resets Line Dash
            browserCanvasContext.lineWidth = 4
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + 1 + ')'
            browserCanvasContext.stroke()
        }
    }
}
