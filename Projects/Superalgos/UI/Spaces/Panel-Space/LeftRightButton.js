function newLeftRightButton() {
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
    /* Cointainer stuff */

    thisObject.container = newContainer()
    thisObject.container.name = 'Left Right Button'
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.frame.containerName = 'Left Right Button'

    thisObject.status = 'left'
    let leftPosition = {}
    let rightPosition = {}
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
        leftPosition = undefined
        rightPosition = undefined
        transitionPosition = undefined
    }

    function initialize() {
        thisObject.container.frame.width = 12
        thisObject.container.frame.height = 12

        let position = {
            x: thisObject.container.frame.parentFrame.width * 2.25 / 8 - thisObject.container.frame.width / 2,
            y: 40 * 4 / 8 - thisObject.container.frame.height / 2
        }

        thisObject.container.frame.position = position

        leftPosition.x = thisObject.parentContainer.frame.position.x
        leftPosition.y = thisObject.parentContainer.frame.position.y

        rightPosition.x = thisObject.parentContainer.frame.position.x
        rightPosition.y = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.y

        transitionPosition.x = leftPosition.x
        transitionPosition.y = leftPosition.y

        /* Lets listen to our own events to react when we have a Mouse Click */
        onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

        isInitialized = true
    }

    function setStatus(value) {
        if (value === 'left' && thisObject.status === 'right') {
            thisObject.status = 'going left'
        }
        if (value === 'right' && thisObject.status === 'left') {
            thisObject.status = 'going right'
        }
    }

    function onMouseClick(event) {
        if (thisObject.status === 'left') {
            transitionPosition.x = leftPosition.x
            transitionPosition.y = leftPosition.y

            thisObject.status = 'going right'
        } else {
            transitionPosition.x = rightPosition.x
            transitionPosition.y = rightPosition.y

            thisObject.status = 'going left'
        }
    }

    function physics() {
        if (isInitialized === false) { return }

        leftPosition.x = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft.x
        leftPosition.y = thisObject.parentContainer.frame.position.y

        rightPosition.x = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.x
        rightPosition.y = thisObject.parentContainer.frame.position.y

        if (thisObject.status === 'going right') {
            if (transitionPosition.x < rightPosition.x) {
                transitionPosition.x = transitionPosition.x + 50
                thisObject.parentContainer.frame.position.x = transitionPosition.x
            } else {
                thisObject.parentContainer.frame.position.x = rightPosition.x
                thisObject.status = 'right'
            }
        }
        if (thisObject.status === 'going left') {
            if (transitionPosition.x > leftPosition.x) {
                transitionPosition.x = transitionPosition.x - 50
                thisObject.parentContainer.frame.position.x = transitionPosition.x
            } else {
                thisObject.parentContainer.frame.position.x = leftPosition.x
                thisObject.status = 'left'
            }
        }
    }

    function draw() {
        if (isInitialized === false) { return }

        drawButton()
    }

    function getContainer(point, purpose) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function drawButton() {
        let point1
        let point2
        let point3

        switch (thisObject.status) {
            case 'left': {
                point1 = {
                    x: 3,
                    y: 3
                }

                point2 = {
                    x: 3,
                    y: thisObject.container.frame.height - 3
                }

                point3 = {
                    x: thisObject.container.frame.width - 3,
                    y: thisObject.container.frame.height / 2
                }
                break
            }

            case 'going right': {
                point1 = {
                    x: 4,
                    y: 4
                }

                point2 = {
                    x: 4,
                    y: thisObject.container.frame.height - 4
                }

                point3 = {
                    x: thisObject.container.frame.width - 4,
                    y: thisObject.container.frame.height / 2
                }
                break
            }

            case 'going left': {
                point1 = {
                    x: thisObject.container.frame.width - 4,
                    y: 4
                }

                point2 = {
                    x: thisObject.container.frame.width - 4,
                    y: thisObject.container.frame.height - 4
                }

                point3 = {
                    x: 4,
                    y: thisObject.container.frame.height / 2
                }
                break
            }

            case 'right': {
                point1 = {
                    x: thisObject.container.frame.width - 3,
                    y: 3
                }

                point2 = {
                    x: thisObject.container.frame.width - 3,
                    y: thisObject.container.frame.height - 3
                }

                point3 = {
                    x: 3,
                    y: thisObject.container.frame.height / 2
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
