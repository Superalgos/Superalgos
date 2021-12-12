
function newFrame() {
    const PANEL_CORNERS_RADIUS = 5
    const TITLE_BAR_HEIGHT = 15 // this must be grater than radius

    let thisObject = {
        type: 'Rectangle',
        containerName: '',                  // This is for debugging purposes only.
        parentFrame: undefined,             // Here we store the parent container zoom object.
        radius: 0,
        offset: undefined,
        position: undefined,
        container: undefined,
        width: browserCanvas.width,
        height: browserCanvas.height,
        getBodyHeight: getBodyHeight,
        draw: draw,
        fitIntoFrame: fitIntoFrame,
        frameThisPoint: frameThisPoint,     // This function changes the actual frame coordinate system to the screen coordinate system.
        unframeThisPoint: unframeThisPoint,
        isThisPointHere: isThisPointHere,   // This function return true is the point received as parameter lives within this frame.
        isThisScreenPointHere: isThisScreenPointHere,
        isInViewPort: isInViewPort,
        isCenterInViewPort: isCenterInViewPort,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.parentFrame = undefined
        thisObject.position = undefined
        thisObject.offset = undefined
    }

    function initialize(pType) {
        if (pType !== undefined) { thisObject.type = pType }

        thisObject.position = {
            x: 0,
            y: 0
        }

        thisObject.offset = {
            x: 0,
            y: 0
        }
    }

    function getBodyHeight() {
        return thisObject.height - TITLE_BAR_HEIGHT
    }

    function isInViewPort() {
        /* This function is useful to know if the object who has this frame is currently appearing at least in part at the UI.projects.foundations.spaces.chartingSpace.viewport */

        point1 = {
            x: 0,
            y: 0
        }

        point3 = {
            x: thisObject.width,
            y: thisObject.height
        }

        /* Now the transformations. */

        point1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point1, thisObject.container)
        point3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point3, thisObject.container)

        if (point1.x < UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight.x && point1.y < UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y && point3.x > UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x && point3.y > UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft.y) {
            return true
        } else {
            return false
        }
    }

    function isCenterInViewPort() {
        /* This function is useful to know if the object who has this frame is currently appearing at least in part at the UI.projects.foundations.spaces.chartingSpace.viewport */

        point1 = {
            x: thisObject.width * 40 / 100,
            y: thisObject.height * 40 / 100
        }

        point3 = {
            x: thisObject.width * 40 / 100,
            y: thisObject.height * 40 / 100
        }

        /* Now the transformations. */

        point1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point1, thisObject.container)
        point3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point3, thisObject.container)

        if (point1.x < UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight.x && point1.y < UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y && point3.x > UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x && point3.y > UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft.y) {
            return true
        } else {
            return false
        }
    }

    function frameThisPoint(point) {
        /* We need not to modify the point received, so me make a copy of it. */

        let checkPoint = {
            x: point.x,
            y: point.y
        }

        let parentPoint = {
            x: 0,
            y: 0
        }

        let returnPoint = {
            x: 0,
            y: 0
        }

        if (thisObject.parentFrame !== undefined) {
            parentPoint = thisObject.parentFrame.frameThisPoint(checkPoint)

            returnPoint.x = parentPoint.x + thisObject.position.x + thisObject.offset.x
            returnPoint.y = parentPoint.y + thisObject.position.y + thisObject.offset.y
        } else {
            returnPoint.x = checkPoint.x + thisObject.position.x + thisObject.offset.x
            returnPoint.y = checkPoint.y + thisObject.position.y + thisObject.offset.y
        }

        return returnPoint
    }

    function unframeThisPoint(point) {
        /* We need not to modify the point received, so me make a copy of it. */

        let checkPoint = {
            x: point.x,
            y: point.y
        }

        let parentPoint = {
            x: 0,
            y: 0
        }

        let returnPoint = {
            x: 0,
            y: 0
        }

        if (thisObject.parentFrame !== undefined) {
            parentPoint = thisObject.parentFrame.unframeThisPoint(checkPoint)

            returnPoint.x = parentPoint.x - thisObject.position.x
            returnPoint.y = parentPoint.y - thisObject.position.y
        } else {
            returnPoint.x = checkPoint.x - thisObject.position.x
            returnPoint.y = checkPoint.y - thisObject.position.y
        }

        return returnPoint
    }

    function fitIntoFrame(point) {
        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

        if (point.x > thisObject.width) {
            point.x = thisObject.width
        }

        if (point.x < 0) {
            point.x = 0
        }

        if (point.y > thisObject.height) {
            point.y = thisObject.height
        }

        if (point.y < 0) {
            point.y = 0
        }

        return point
    }

    function isThisPointHere(point, outsideViewPort, dontTransform, padding) {
        // The second parameter is useful when you want to check a point that you already know is outside the viewport.
        // The padding is a distance to the borders of the container. Can be either negative (outside, to increase the container size) or positive (inside to decrease the container size)

        if (padding === undefined) { padding = 0 }

        /* We need not to modify the point received, so me make a copy of it. */
        let checkPoint = {
            x: point.x,
            y: point.y
        }

        /* The point received is on the screen coordinates system, which already has zoom and displacement applied. We need to remove the zoom and displacement
        in order to have the point on the containers coordinate system and be able to compare it with its dimensions. */
        if (dontTransform === false || dontTransform === undefined) {
            if (outsideViewPort === true) {
                checkPoint = thisObject.container.frame.unframeThisPoint(checkPoint)
            } else {
                checkPoint = UI.projects.foundations.utilities.coordinateTransformations.unTransformThisPoint(checkPoint, thisObject.container)
            }
        }

        /* Now we check if the resulting point is within the current Frame. */
        if (isNaN(checkPoint.x) || isNaN(checkPoint.y)) { return false }
        if (thisObject.type === 'Circle') {
            let distance = Math.sqrt(Math.pow(thisObject.position.x - checkPoint.x, 2) + Math.pow(thisObject.position.y - checkPoint.y, 2))

            if (distance < thisObject.radius) {
                return true
            } else {
                return false
            }
        }

        if (thisObject.type === 'Rectangle') {
            if (checkPoint.x < 0 + padding || checkPoint.y < 0 + padding || checkPoint.x > thisObject.width - padding || checkPoint.y > thisObject.height - padding) {
                return false
            } else {
                return true
            }
        }
    }

    function isThisScreenPointHere(point) {
        let checkPoint = {
            x: point.x,
            y: point.y
        }

        let thisPoint = {
            x: thisObject.position.x,
            y: thisObject.position.y
        }

        if (thisObject.parentFrame !== undefined) {
            thisPoint = thisObject.parentFrame.frameThisPoint(thisPoint)
        }

        /* Now we check if the resulting point is within the current Frame. */

        if (thisObject.type === 'Circle') {
            let distance = Math.sqrt(Math.pow(thisPoint.x - checkPoint.x, 2) + Math.pow(thisPoint.y - checkPoint.y, 2))

            if (distance < thisObject.radius) {
                return true
            } else {
                return false
            }
        }

        if (thisObject.type === 'Rectangle') {
            if (checkPoint.x < 0 || checkPoint.y < 0 || checkPoint.x > thisObject.width || checkPoint.y > thisObject.height) {
                return false
            } else {
                return true
            }
        }
    }

    function draw(drawGrid, drawBorders, drawBackground, fitFunction, style) {
        if (drawBorders === true) {
            borders(fitFunction, style)
        }

        if (drawGrid === true) {
            grid(fitFunction)
        }

        if (drawBackground === true) {
            background(fitFunction)
        }
    }

    function background(fitFunction) {
        let params = {
            cornerRadius: 5,
            lineWidth: 0.1,
            opacity: 0.75,
            container: thisObject.container,
            borderColor: UI_COLOR.DARK,
            backgroundColor: UI_COLOR.WHITE,
            fitFunction: fitFunction
        }

        UI.projects.foundations.utilities.drawPrint.roundedCornersBackground(params)

        titleBarPoint1 = {
            x: 0,
            y: TITLE_BAR_HEIGHT
        }

        titleBarPoint2 = {
            x: thisObject.width,
            y: TITLE_BAR_HEIGHT
        }

        /* Now the transformations. */

        titleBarPoint1 = frameThisPoint(titleBarPoint1)
        titleBarPoint2 = frameThisPoint(titleBarPoint2)

        if (fitFunction !== undefined) {
            titleBarPoint1 = fitFunction(titleBarPoint1)
            titleBarPoint2 = fitFunction(titleBarPoint2)
        }

        /* We paint the title bar now */

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'
        browserCanvasContext.beginPath()

        browserCanvasContext.moveTo(titleBarPoint1.x, titleBarPoint1.y)
        browserCanvasContext.lineTo(borderPoint1.x - PANEL_CORNERS_RADIUS, borderPoint1.y)
        browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, PANEL_CORNERS_RADIUS, 1.0 * Math.PI, 1.5 * Math.PI)
        browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - PANEL_CORNERS_RADIUS)
        browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, PANEL_CORNERS_RADIUS, 1.5 * Math.PI, 2.0 * Math.PI)
        browserCanvasContext.lineTo(titleBarPoint2.x, titleBarPoint2.y)

        browserCanvasContext.closePath()
        browserCanvasContext.fill()

        browserCanvasContext.lineWidth = 0.1
        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MANGANESE_PURPLE + ', 0.75)'
        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.stroke()

        /* print the title */

        let labelPoint
        let fontSize = 10

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        let label = thisObject.containerName

        let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO
        let yOffset = (TITLE_BAR_HEIGHT - fontSize) / 2 + 2

        labelPoint = {
            x: thisObject.width / 2 - xOffset,
            y: TITLE_BAR_HEIGHT - yOffset
        }

        labelPoint = thisObject.frameThisPoint(labelPoint)

        if (fitFunction !== undefined) {
            labelPoint = fitFunction(labelPoint)
        }

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }

    function borders(fitFunction, style) {
        /* Lest get the important points of the drawing so as to apply the needed transformations. */

        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.width,
            y: 0
        }

        point3 = {
            x: thisObject.width,
            y: thisObject.height
        }

        point4 = {
            x: 0,
            y: thisObject.height
        }

        /* Now the transformations. */
        point1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point1, thisObject.container)
        point2 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point2, thisObject.container)
        point3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point3, thisObject.container)
        point4 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point4, thisObject.container)

        if (fitFunction !== undefined) {
            point1 = fitFunction(point1)
            point2 = fitFunction(point2)
            point3 = fitFunction(point3)
            point4 = fitFunction(point4)
        }

        /* Lets start the drawing. */
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = 'rgba(' + style.color + ', ' + style.opacity + ')'
        browserCanvasContext.lineWidth = style.lineWidth
        browserCanvasContext.setLineDash(style.lineDash)
        browserCanvasContext.stroke()
        browserCanvasContext.closePath()
        browserCanvasContext.setLineDash([]) // Resets Line Dash
    }

    function grid(fitFunction, smallLines) {
        if (smallLines === true) {
            /* Small Lines */

            let step = thisObject.width / 100

            browserCanvasContext.beginPath()

            for (let i = 0; i < thisObject.width; i = i + step) {
                for (let j = 0; j < thisObject.height; j = j + step) {
                    let point1 = {
                        x: 0,
                        y: j
                    }

                    let point2 = {
                        x: thisObject.width,
                        y: j
                    }

                    point1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point1, thisObject.container)
                    point2 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point2, thisObject.container)

                    if (fitFunction !== undefined) {
                        point1 = fitFunction(point1)
                        point2 = fitFunction(point2)
                    }

                    browserCanvasContext.moveTo(point1.x, point1.y)
                    browserCanvasContext.lineTo(point2.x, point2.y)
                }

                let point3 = {
                    x: thisObject.width,
                    y: thisObject.height
                }

                let point4 = {
                    x: 0,
                    y: thisObject.height
                }

                point3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point3, thisObject.container)
                point4 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point4, thisObject.container)

                if (fitFunction !== undefined) {
                    point3 = fitFunction(point3)
                    point4 = fitFunction(point4)
                }

                browserCanvasContext.moveTo(point3.x, point3.y)
                browserCanvasContext.lineTo(point4.x, point4.y)
            }
            browserCanvasContext.closePath()
            browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.1)'
            browserCanvasContext.lineWidth = 1
            browserCanvasContext.setLineDash([]) // Resets Line Dash
            browserCanvasContext.stroke()
        }

        /* Main Lines */

        let step = thisObject.width / 20

        browserCanvasContext.beginPath()

        for (let i = 0; i < thisObject.width; i = i + step) {
            for (let j = 0; j < thisObject.height; j = j + step) {
                let point1 = {
                    x: 0,
                    y: j
                }

                let point2 = {
                    x: thisObject.width,
                    y: j
                }

                point1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point1, thisObject.container)
                point2 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point2, thisObject.container)

                if (fitFunction !== undefined) {
                    point1 = fitFunction(point1)
                    point2 = fitFunction(point2)
                }

                browserCanvasContext.moveTo(point1.x, point1.y)
                browserCanvasContext.lineTo(point2.x, point2.y)
            }

            let point3 = {
                x: i,
                y: 0
            }

            let point4 = {
                x: i,
                y: thisObject.height
            }

            point3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point3, thisObject.container)
            point4 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(point4, thisObject.container)

            if (fitFunction !== undefined) {
                point3 = fitFunction(point3)
                point4 = fitFunction(point4)
            }

            browserCanvasContext.moveTo(point3.x, point3.y)
            browserCanvasContext.lineTo(point4.x, point4.y)
        }
        browserCanvasContext.closePath()
        browserCanvasContext.strokeStyle = 'rgba(100, 100, 100, 0.2)'
        browserCanvasContext.lineWidth = 1
        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.stroke()
    }
}
