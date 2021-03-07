/*

This Object object is responsible for defining the coordinate system in a TimeLine.

The scale on the X axis depends on the time.
The scale on the Y axis depends on the data that wants to be plotted. Usually we need the Max amount on that data to generate a proper scale.

*/

function newCoordinateSystem() {
    let thisObject = {
        min: undefined,
        max: undefined,
        parentMin: undefined,
        parentMax: undefined,
        childrenMin: undefined,
        childrenMax: undefined,
        maxHeight: undefined,
        maxWidth: undefined,
        scale: undefined,
        eventHandler: undefined,
        autoMinXScale: true,
        autoMaxXScale: true,
        autoMinYScale: true,
        autoMaxYScale: true,
        HORIZONTAL_MARGIN_FACTOR: 1,
        VERTICAL_MARGIN_FACTOR: 1,
        HORIZONTAL_MARGIN_INVERSE_FACTOR: 0,
        VERTICAL_MARGIN_INVERSE_FACTOR: 0,
        physics: physics,
        reportParentXValue: reportParentXValue,
        reportParentYValue: reportParentYValue,
        reportXValue: reportXValue,
        reportYValue: reportYValue,
        zoomX: zoomX,
        zoomY: zoomY,
        recalculateScale: recalculateScale,
        transformThisPoint: transformThisPoint,
        transformThisPoint2: transformThisPoint2,
        unInverseTransform: unInverseTransform,
        inverseTransformUncappedY: inverseTransformUncappedY,
        initializeX: initializeX,
        initializeY: initializeY,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.min = {
        x: 0,
        y: 0
    }
    thisObject.max = {
        x: 0,
        y: 0
    }
    thisObject.parentMin = {
        x: 0,
        y: 0
    }
    thisObject.parentMax = {
        x: 0,
        y: 0
    }
    thisObject.childrenMin = {
        x: 0,
        y: 0
    }
    thisObject.childrenMax = {
        x: 0,
        y: 0
    }

    thisObject.scale = {
        x: 0,
        y: 0
    }

    thisObject.eventHandler = newEventHandler()
    thisObject.eventHandler.name = 'Coordinate System'

    let newXMax = -VERY_LARGE_NUMBER
    let newXMin = VERY_LARGE_NUMBER

    let newYMax = -VERY_LARGE_NUMBER
    let newYMin = VERY_LARGE_NUMBER

    let parentMinChanged = false
    let parentMaxChanged = false

    return thisObject

    function finalize() {
        thisObject.eventHandler.finalize()
        thisObject.eventHandler = undefined
    }

    function initialize(minValue, maxValue, maxWidth, maxHeight) {
        /* Defines the min and max value of rate that we are going to transport to the available screen at the center position. */
        thisObject.min.x = minValue.x
        thisObject.max.x = maxValue.x

        thisObject.min.y = minValue.y
        thisObject.max.y = maxValue.y

        thisObject.maxWidth = maxWidth
        thisObject.maxHeight = maxHeight

        recalculateScale()
    }

    function reportXValue(value) {
        if (thisObject.autoMinXScale === true) {
            if (value < newXMin && value !== 0) {
                newXMin = value
            }
        }
        if (thisObject.autoMaxXScale === true) {
            if (value > newXMax && value !== 0) {
                newXMax = value
            }
        }
    }

    function reportYValue(value) {
        /* We will try to create a margin on the y axis so that in auto mode the charts dont get into the scales */
        const TOP_MARGIN_FACTOR = 1.01
        const BOTTOM_MARGIN_FACTOR = 0.99

        if (thisObject.autoMinYScale === true) {
            if (value  * BOTTOM_MARGIN_FACTOR < newYMin) {
                newYMin = value * BOTTOM_MARGIN_FACTOR
            }
        }
        if (thisObject.autoMaxYScale === true) {
            if (value * TOP_MARGIN_FACTOR> newYMax) {
                newYMax = value * TOP_MARGIN_FACTOR
            }
        }
    }

    function reportParentXValue(min, max) {
        if (thisObject.autoMinXScale === true) {
            if (thisObject.parentMin.x !== min) {
                thisObject.parentMin.x = min
            }
        }
        if (thisObject.autoMaxXScale === true) {
            if (thisObject.parentMax.x !== max) {
                thisObject.parentMax.x = max
            }
        }
    }

    function reportParentYValue(min, max) {
        if (thisObject.autoMinYScale === true) {
            if (thisObject.parentMin.y !== min) {
                thisObject.parentMin.y = min
            }
        }
        if (thisObject.autoMaxYScale === true) {
            if (thisObject.parentMax.y !== max) {
                thisObject.parentMax.y = max
            }
        }
    }

    function physics() {
        let mustRecalculate = false

        if ((thisObject.autoMinXScale === true || thisObject.autoMaxXScale === true)) {
            if (thisObject.autoMaxXScale === true && thisObject.childrenMax.x !== newXMax && newXMax !== -VERY_LARGE_NUMBER) {
                thisObject.childrenMax.x = newXMax
            }

            if (thisObject.autoMaxXScale === true) {
                newXMax = -VERY_LARGE_NUMBER
            }

            if (thisObject.autoMinXScale === true && thisObject.childrenMin.x !== newXMin && newXMin !== VERY_LARGE_NUMBER) {
                thisObject.childrenMin.x = newXMin
                newXMin = VERY_LARGE_NUMBER
            }

            if (thisObject.autoMinXScale === true) {
                newXMin = VERY_LARGE_NUMBER
            }
        }

        if ((thisObject.autoMinYScale === true || thisObject.autoMaxYScale === true)) {
            if (thisObject.autoMaxYScale === true && thisObject.childrenMax.y !== newYMax && newYMax !== -VERY_LARGE_NUMBER) {
                thisObject.childrenMax.y = newYMax
            }

            if (thisObject.autoMaxYScale === true) {
                newYMax = -VERY_LARGE_NUMBER
            }

            if (thisObject.autoMinYScale === true && thisObject.childrenMin.y !== newYMin && newYMin !== VERY_LARGE_NUMBER) {
                thisObject.childrenMin.y = newYMin
                newYMin = VERY_LARGE_NUMBER
            }

            if (thisObject.autoMinYScale === true) {
                newYMin = VERY_LARGE_NUMBER
            }
        }

        /* Here we will see if any of the children or parent values modify the current status quo */
        /* Min */
        let minX = Math.min(thisObject.childrenMin.x, thisObject.parentMin.x)
        let minY = Math.min(thisObject.childrenMin.y, thisObject.parentMin.y)
        let maxX = Math.max(thisObject.childrenMax.x, thisObject.parentMax.x)
        let maxY = Math.max(thisObject.childrenMax.y, thisObject.parentMax.y)

        if (thisObject.parentMin.x === 0) {
            minX = thisObject.childrenMin.x
        }

        if (thisObject.parentMin.y === 0) {
            minY = thisObject.childrenMin.y
        }

        if (thisObject.parentMax.x === 0) {
            maxX = thisObject.childrenMax.x
        }

        if (thisObject.parentMax.y === 0) {
            maxY = thisObject.childrenMax.y
        }

        if (minX !== 0 && thisObject.min.x !== minX && thisObject.autoMinXScale === true) {
            thisObject.min.x = minX
            mustRecalculate = true
        }

        if (minY !== 0 && thisObject.min.y !== minY && thisObject.autoMinYScale === true) {
            thisObject.min.y = minY
            mustRecalculate = true
        }

        if (maxX !== 0 && thisObject.max.x !== maxX && thisObject.autoMaxXScale === true) {
            thisObject.max.x = maxX
            mustRecalculate = true
        }

        if (maxY !== 0 && thisObject.max.y !== maxY && thisObject.autoMaxYScale === true) {
            thisObject.max.y = maxY
            mustRecalculate = true
        }

        if (mustRecalculate === true) {
            recalculateScale()
        }
    }

    function recalculateScale(event) {
        thisObject.scale.x = thisObject.maxWidth * thisObject.HORIZONTAL_MARGIN_FACTOR / (thisObject.max.x - thisObject.min.x)
        thisObject.scale.y = thisObject.maxHeight * thisObject.VERTICAL_MARGIN_FACTOR / (thisObject.max.y - thisObject.min.y)

        thisObject.eventHandler.raiseEvent('Scale Changed', event)
    }

    function zoomX(factor, mousePosition, container) {
        let mouseAtCointainer = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(mousePosition, container)
        let leftDistance = mouseAtCointainer.x
        let rightDistance = container.frame.width - mouseAtCointainer.x
        let diff = thisObject.max.x - thisObject.min.x
        let min = thisObject.min.x + diff * factor * leftDistance / (container.frame.width / 2)
        let max = thisObject.max.x - diff * factor * rightDistance / (container.frame.width / 2)

        if (min < max) {
            let mustRecalculate = false
            if (thisObject.autoMinXScale === false) {
                thisObject.min.x = min
                mustRecalculate = true
            }
            if (thisObject.autoMaxXScale === false) {
                thisObject.max.x = max
                mustRecalculate = true
            }
            if (mustRecalculate === true) {
                thisObject.recalculateScale()
            }
        }
    }

    function zoomY(factor, mousePosition, container) {
        let mouseAtCointainer = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(mousePosition, container)
        let topDistance = mouseAtCointainer.y
        let bottomDistance = container.frame.height - mouseAtCointainer.y
        let diff = thisObject.max.y - thisObject.min.y
        let min = thisObject.min.y + diff * factor * bottomDistance / (container.frame.height / 2)
        let max = thisObject.max.y - diff * factor * topDistance / (container.frame.height / 2)

        if (min < max) {
            let mustRecalculate = false
            if (thisObject.autoMinYScale === false) {
                thisObject.min.y = min
                mustRecalculate = true
            }
            if (thisObject.autoMaxYScale === false) {
                thisObject.max.y = max
                mustRecalculate = true
            }
            if (mustRecalculate === true) {
                thisObject.recalculateScale()
            }
        }
    }

    function initializeX(minValue, maxValue, maxWidth) {
        thisObject.min.x = minValue.x // * 0.999; // 0.1% less
        thisObject.max.x = maxValue.x // * 1.001; // 0.1% more

        thisObject.scale.x = thisObject.maxWidth / (thisObject.max.x - thisObject.min.x)
    }

    function initializeY(minValue, maxValue, pMaxHeight) {
        thisObject.min.y = minValue.y // * 0.999; // 0.1% less
        thisObject.max.y = maxValue.y // * 1.001; // 0.1% more

        thisObject.scale.y = pMaxHeight / (thisObject.max.y - thisObject.min.y)

        thisObject.maxHeight = pMaxHeight
    }

    function transformThisPoint(point) {
        /*

        This is the straigh fordward transformation this object provides. The input is a point on the data set that wants to be plotted in a timeline.
        The x value of the point must be a datetime.valueOf() and is going to be transformed into an x value on the coordinate system of the timeline.
        The y value should be a value in the dataset at that moment in time. Depending on how this coordinate system was initialized then are the
        possible values y can have. For sure it must be in the range between the min and max y declared at initialization. The y value has a special
        treatment since the browser canvas object used, has a zero y value at the top, while the timeline we use has a zero y value at the botton,
        for that reason y is flipped.

        Besides this, what we do is to multiply by the scale, which in turn is calculated at initialization time depending on the values provided.

        */

        point = {
            x: (point.x - thisObject.min.x) * thisObject.scale.x + thisObject.maxWidth * thisObject.HORIZONTAL_MARGIN_INVERSE_FACTOR / 2,
            y: thisObject.maxHeight - (point.y - thisObject.min.y) * thisObject.scale.y - thisObject.maxHeight * thisObject.VERTICAL_MARGIN_INVERSE_FACTOR / 2
        }

        return point
    }

    function transformThisPoint2(point) {
        point = {
            x: (point.x - thisObject.min.x) * thisObject.scale.x + thisObject.maxWidth * thisObject.HORIZONTAL_MARGIN_INVERSE_FACTOR / 2,
            y: (thisObject.maxHeight - point.y - thisObject.min.y) * thisObject.scale.y - thisObject.maxHeight * thisObject.VERTICAL_MARGIN_INVERSE_FACTOR / 2
        }

        return point
    }

    function unInverseTransform(point, inverseY) {
        point = {
            x: ((point.x - thisObject.maxWidth * thisObject.HORIZONTAL_MARGIN_INVERSE_FACTOR / 2) / thisObject.scale.x) + thisObject.min.x,
            y: (inverseY * thisObject.VERTICAL_MARGIN_FACTOR - point.y + thisObject.maxHeight * thisObject.VERTICAL_MARGIN_INVERSE_FACTOR / 2) / thisObject.scale.y + thisObject.min.y
        }

        return point
    }

    function inverseTransformUncappedY(point, inverseY) {
        point = {
            x: (point.x - thisObject.min.x) * thisObject.scale.x + thisObject.maxWidth * thisObject.HORIZONTAL_MARGIN_INVERSE_FACTOR / 2,
            y: (inverseY * thisObject.VERTICAL_MARGIN_FACTOR - point.y) * thisObject.scale.y - thisObject.maxHeight * thisObject.VERTICAL_MARGIN_INVERSE_FACTOR / 2
        }

        return point
    }
}
