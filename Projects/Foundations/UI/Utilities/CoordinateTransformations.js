function newFoundationsUtilitiesCoordinateTransformations() {
    let thisObject = {
        transformThisPoint: transformThisPoint,
        unTransformThisPoint: unTransformThisPoint
    }

    return thisObject

    function transformThisPoint(point, container) {
        /* We make the point relative to the current frame */

        point = container.frame.frameThisPoint(point)

        /* We pass this point through the UI.projects.foundations.spaces.chartingSpace.viewport lends, meaning we apply the UI.projects.foundations.spaces.chartingSpace.viewport zoom and displacement. */

        point = UI.projects.foundations.spaces.chartingSpace.viewport.transformThisPoint(point)
        return point
    }

    function unTransformThisPoint(point, container) {
        point = UI.projects.foundations.spaces.chartingSpace.viewport.unTransformThisPoint(point)

        point = container.frame.unframeThisPoint(point)
        return point
    }
}

exports.newFoundationsUtilitiesCoordinateTransformations = newFoundationsUtilitiesCoordinateTransformations