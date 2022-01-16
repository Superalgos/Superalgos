function newUpDownButton() {
    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        parentContainer: undefined,
        status: undefined,
        setStatus: setStatus,
        physics: physics,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    let isInitialized = false
    /* Container stuff */

    thisObject.container = newContainer()
    thisObject.container.name = 'Up Down Button'
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.frame.containerName = 'Up Down Button'

    thisObject.status = 'up'
    let upPosition = {}
    let downPosition = {}
    let transitionPosition = {}

    let onMouseClickEventSuscriptionId
    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.parentContainer = undefined

        thisObject.status = undefined
        upPosition = undefined
        downPosition = undefined
        transitionPosition = undefined
    }

    function initialize() {
        thisObject.container.frame.width = 12
        thisObject.container.frame.height = 12

        let position = {
            x: thisObject.container.frame.parentFrame.width * 5.75 / 8 - thisObject.container.frame.width / 2,
            y: 40 * 4 / 8 - thisObject.container.frame.height / 2
        }

        thisObject.container.frame.position = position

        upPosition.x = thisObject.parentContainer.frame.position.x
        upPosition.y = thisObject.parentContainer.frame.position.y

        downPosition.x = thisObject.parentContainer.frame.position.x
        downPosition.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y

        transitionPosition.x = upPosition.x
        transitionPosition.y = upPosition.y

        /* Lets listen to our own events to react when we have a Mouse Click */
        onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

        isInitialized = true
    }

    function setStatus(value) {
        if (value === 'up' && thisObject.status === 'down') {
            thisObject.status = 'going up'
        }
        if (value === 'down' && thisObject.status === 'up') {
            thisObject.status = 'going down'
        }
    }

    function onMouseClick(event) {
        if (thisObject.status === 'up') {
            transitionPosition.x = upPosition.x
            transitionPosition.y = upPosition.y

            thisObject.status = 'going down'
        } else {
            transitionPosition.x = downPosition.x
            transitionPosition.y = downPosition.y

            thisObject.status = 'going up'
        }
    }

    function physics() {
        if (isInitialized === false) { return }

        upPosition.x = thisObject.parentContainer.frame.position.x
        upPosition.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight.y

        downPosition.x = thisObject.parentContainer.frame.position.x
        downPosition.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y

        if (thisObject.status === 'going down') {
            if (transitionPosition.y < downPosition.y) {
                transitionPosition.y = transitionPosition.y + 50
                thisObject.parentContainer.frame.position.y = transitionPosition.y
            } else {
                thisObject.parentContainer.frame.position.y = downPosition.y
                thisObject.status = 'down'
            }
        }
        if (thisObject.status === 'going up') {
            if (transitionPosition.y > upPosition.y) {
                transitionPosition.y = transitionPosition.y - 50
                thisObject.parentContainer.frame.position.y = transitionPosition.y
            } else {
                thisObject.parentContainer.frame.position.y = upPosition.y
                thisObject.status = 'up'
            }
        }
    }

    function draw() {
        if (isInitialized === false) { return }

        drawButton()
    }

    function getContainer(point, purpose) {
        let container
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function drawButton() {
        let point1
        let point2
        let point3

        switch (thisObject.status) {
            case 'up': {
                point1 = {
                    x: 3,
                    y: 3
                }

                point2 = {
                    x: thisObject.container.frame.width - 3,
                    y: 3
                }

                point3 = {
                    x: thisObject.container.frame.width / 2,
                    y: thisObject.container.frame.height - 3
                }
                break
            }

            case 'going down': {
                point1 = {
                    x: 4,
                    y: 4
                }

                point2 = {
                    x: thisObject.container.frame.width - 4,
                    y: 4
                }

                point3 = {
                    x: thisObject.container.frame.width / 2,
                    y: thisObject.container.frame.height - 4
                }
                break
            }

            case 'going up': {
                point1 = {
                    x: 4,
                    y: thisObject.container.frame.height - 4
                }

                point2 = {
                    x: thisObject.container.frame.width - 4,
                    y: thisObject.container.frame.height - 4
                }

                point3 = {
                    x: thisObject.container.frame.width / 2,
                    y: 4
                }
                break
            }

            case 'down': {
                point1 = {
                    x: 3,
                    y: thisObject.container.frame.height - 3
                }

                point2 = {
                    x: thisObject.container.frame.width - 3,
                    y: thisObject.container.frame.height - 3
                }

                point3 = {
                    x: thisObject.container.frame.width / 2,
                    y: 3
                }
                break
            }
        }

        /* Now the transformations. */

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)

        if (thisObject.fitFunction !== undefined) {
            point1 = thisObject.fitFunction(point1)
            point2 = thisObject.fitFunction(point2)
            point3 = thisObject.fitFunction(point3)
        }

        /* Lets start the drawing. */

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(250, 250, 250, 1)'
        browserCanvasContext.lineWidth = 1
        browserCanvasContext.stroke()

        browserCanvasContext.fillStyle = 'rgba(250, 250, 250, 1)'
        browserCanvasContext.fill()
    }
}
