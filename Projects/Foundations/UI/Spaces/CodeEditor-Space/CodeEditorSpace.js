function newFoundationsCodeEditorSpace() {
    const MODULE_NAME = 'Code Editor Space'

    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        editorPage: undefined,
        isVisible: undefined,
        reset: reset,
        openSpaceArea: openSpaceArea,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    let isInitialized = false


    let browserResizedEventSubscriptionId
    let openingEventSubscriptionId
    let closingEventSubscriptionId

    return thisObject

    function finalize() {
        if (isInitialized === false) { return }

        thisObject.container.finalize()
        thisObject.container = undefined


        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)
        UI.projects.foundations.spaces.sideSpace.deleteSidePanelTab('Foundations', 'javascript-code', 'Code', 'right')

        thisObject.editorPage.finalize()
        thisObject.editorPage = undefined

        isInitialized = false
    }

    function initialize() {
        thisObject.container = newContainer()
        thisObject.container.name = MODULE_NAME
        thisObject.container.initialize()
        thisObject.container.isClickeable = true
        thisObject.container.isDraggeable = false
        thisObject.container.detectMouseOver = true
        thisObject.container.status = 'hidden'

        resize()

        thisObject.editorPage = newFoundationsCodeEditorEditorPage()
        thisObject.editorPage.initialize()

        thisObject.sidePanelTab = UI.projects.foundations.spaces.sideSpace.createSidePanelTab(thisObject.container, 'Foundations', 'javascript-code', 'Code', 'right')


        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)

        isInitialized = true

    }

    function openSpaceArea(originatingNode, codeEditorType) {

        thisObject.sidePanelTab.open()
        thisObject.editorPage.render(originatingNode, codeEditorType)
    }

    function reset() {
         finalize()
         initialize()
    }

    function physics() {
        if (isInitialized === false) {
            return
        }

        codeEditorDivPhysics()
    }

    function codeEditorDivPhysics() {
        let codeEditorSpaceDiv = document.getElementById('code-editor-space-div')

        let codeEditorDivPosition = {
            x: 0,
            y: 0
        }
        codeEditorDivPosition = thisObject.container.frame.frameThisPoint(codeEditorDivPosition)
        codeEditorSpaceDiv.style = '   ' +
            'overflow-y: scroll;' +
            'overflow-x: hidden;' +
            'position:fixed; top:' + codeEditorDivPosition.y + 'px; ' +
            'left:' + codeEditorDivPosition.x + 'px; z-index:1; ' +
            'width: ' + thisObject.container.frame.width + 'px;' +
            'height: ' + thisObject.container.frame.height + 'px'
    }

    function onOpening() {
        thisObject.isVisible = true
    }

    function onClosing() {
        thisObject.isVisible = false
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) {
            return
        }
        if (isInitialized === false) {
            return
        }
        borders()
    }

    function resize() {
        thisObject.container.frame.width = 900
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function getContainer(point, purpose) {
        if (thisObject.sidePanelTab === undefined) {
            return
        }
        let container

        container = thisObject.sidePanelTab.getContainer(point, purpose)
        if (container !== undefined) {
            return container
        }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function borders() {
        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        point3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        point4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.stroke()

        /* Shadow */

        if (thisObject.container.status !== 'hidden') {
            for (let i = 0; i <= 30; i++) {
                opacity = 1 - (i / 300) - 0.95

                browserCanvasContext.setLineDash([]) // Resets Line Dash
                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(point2.x + i, point2.y)
                browserCanvasContext.lineTo(point3.x + i, point3.y)
                browserCanvasContext.closePath()

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()
            }
        }
    }

}