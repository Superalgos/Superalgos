function newSidePanelTab() {
    const MODULE_NAME = 'Side Panel Tab'
    let thisObject = {
        screenside: undefined,
        pointerDirection: undefined,
        container: undefined,
        isOpen: false,
        isClosed: true,
        index: 0,
        open: open,
        close: close,
        resize: resize,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    }

    const TAB_WIDTH = 25
    const TAB_HEIGHT = TOP_SPACE_HEIGHT * 2
    const ANIMATION_STEP = 100

    let isInitialized = false
    let animation = 'none'
    let ORIGINAL_PARENT_POSITON
    let xOffset = 0

    thisObject.container = newContainer()
    thisObject.container.name = MODULE_NAME
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false

    return thisObject

    function initialize(screenside, index) {
        thisObject.screenside = screenside
        if (index !== undefined) {
            thisObject.index = index
        }
            
        switch (thisObject.screenside) {
            case 'left': {
                thisObject.pointerDirection = 'left'
                break
            }
            case 'right': {
                thisObject.pointerDirection = 'right'
                break
            }
        }
        thisObject.container.frame.width = TAB_WIDTH
        thisObject.container.frame.height = TAB_HEIGHT

        thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
        resize()
        isInitialized = true
    }

    function resize() {
        switch (thisObject.screenside) {
            case 'left': {
                thisObject.container.frame.position.x = 0 + thisObject.container.parentContainer.frame.width
                break
            }
            case 'right': {
                thisObject.container.frame.position.x = 0 - TAB_WIDTH
                break
            }
        }

        ORIGINAL_PARENT_POSITON = thisObject.container.parentContainer.frame.position.x
        setClosed()
    }

    function open() {
        animation = 'opening'
        thisObject.container.eventHandler.raiseEvent('opening')
    }

    function close() {
        animation = 'closing'
        thisObject.container.eventHandler.raiseEvent('closing')
    }

    function onMouseClick(event) {
        switch (thisObject.screenside) {
            case 'left': {
                if (thisObject.pointerDirection === 'left') {
                    animation = 'opening'
                    thisObject.container.eventHandler.raiseEvent('opening')
                } else {
                    animation = 'closing'
                    thisObject.container.eventHandler.raiseEvent('closing')
                }
                break
            }
            case 'right': {
                if (thisObject.pointerDirection === 'left') {
                    animation = 'closing'
                    thisObject.container.eventHandler.raiseEvent('closing')
                } else {
                    animation = 'opening'
                    thisObject.container.eventHandler.raiseEvent('opening')
                }
                break
            }
        }
    }

    function getContainer(point) {
        let container
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        if (isInitialized === false) { return }
        positionPhysics()
        animate()
    }

    function positionPhysics() {
        if (UI.projects.superalgos.spaces.chartingSpace.viewport !== undefined) {
            thisObject.container.frame.position.y = browserCanvas.height / 2 - TAB_HEIGHT / 2 //  TOP_SPACE_HEIGHT + UI.projects.superalgos.spaces.chartingSpace.viewport.marginAmount + TAB_HEIGHT * thisObject.index
        }
    }

    function draw() {
        if (isInitialized === false) { return }
        borders()
        arrow()
    }

    function animate() {

        if (animation === 'opening') {
            thisObject.isOpen = false
            thisObject.isClosed = false
            xOffset = xOffset + ANIMATION_STEP
            switch (thisObject.screenside) {
                case 'left': {
                    thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON + xOffset
                    break
                }
                case 'right': {
                    thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON - xOffset
                    break
                }
            }

            if (xOffset >= thisObject.container.parentContainer.frame.width) {
                setOpened()
                thisObject.container.eventHandler.raiseEvent('opened')
            }
        }

        if (animation === 'closing') {
            thisObject.isOpen = false
            thisObject.isClosed = false
            xOffset = xOffset - ANIMATION_STEP
            switch (thisObject.screenside) {
                case 'left': {
                    thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON + xOffset
                    break
                }
                case 'right': {
                    thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON - xOffset
                    break
                }
            }

            if (xOffset <= 0) {
                setClosed()
                thisObject.container.eventHandler.raiseEvent('closed')
            }
        }
    }

    function setOpened() {
        thisObject.isOpen = true
        animation = 'none'
        xOffset = thisObject.container.parentContainer.frame.width
        thisObject.container.parentContainer.status = 'visible'
        switch (thisObject.screenside) {
            case 'left': {
                thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON + xOffset
                thisObject.pointerDirection = 'right'
                break
            }
            case 'right': {
                thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON - xOffset
                thisObject.pointerDirection = 'left'
                break
            }
        }
    }
    function setClosed() {
        thisObject.isClosed = true
        animation = 'none'
        xOffset = 0
        thisObject.container.parentContainer.status = 'hidden'
        switch (thisObject.screenside) {
            case 'left': {
                thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON
                thisObject.pointerDirection = 'left'
                break
            }
            case 'right': {
                thisObject.container.parentContainer.frame.position.x = ORIGINAL_PARENT_POSITON
                thisObject.pointerDirection = 'right'
                break
            }
        }
    }

    function arrow() {
        let point1
        let point2
        let point3

        if (thisObject.pointerDirection === 'left') {
            point1 = {
                x: TAB_WIDTH * 3.5 / 10,
                y: TAB_HEIGHT * 12.5 / 30
            }

            point2 = {
                x: TAB_WIDTH * 6.5 / 10,
                y: TAB_HEIGHT * 15 / 30
            }

            point3 = {
                x: TAB_WIDTH * 3.5 / 10,
                y: TAB_HEIGHT * 17.5 / 30
            }
        } else {
            point1 = {
                x: TAB_WIDTH * 6.5 / 10,
                y: TAB_HEIGHT * 12.5 / 30
            }

            point2 = {
                x: TAB_WIDTH * 3.5 / 10,
                y: TAB_HEIGHT * 15 / 30
            }

            point3 = {
                x: TAB_WIDTH * 6.5 / 10,
                y: TAB_HEIGHT * 17.5 / 30
            }
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.fill()
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
            x: TAB_WIDTH,
            y: 0
        }

        point3 = {
            x: TAB_WIDTH,
            y: TAB_HEIGHT
        }

        point4 = {
            x: 0,
            y: TAB_HEIGHT
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        let opacity

        /* Shadow */

        for (let i = 0; i <= 5; i++) {
            opacity = 1 - (i / 100) - 0.93

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(point1.x + i, point1.y + i)
            browserCanvasContext.lineTo(point2.x + i, point2.y + i)
            browserCanvasContext.lineTo(point3.x + i, point3.y + i)
            browserCanvasContext.lineTo(point4.x + i, point4.y + i)
            browserCanvasContext.lineTo(point1.x + i, point1.y + i)
            browserCanvasContext.closePath()

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
            browserCanvasContext.lineWidth = 1
            browserCanvasContext.setLineDash([]) // Resets Line Dash
            browserCanvasContext.stroke()
        }

        /* Background and Border */

        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.stroke()
    }
}
