function transformThisPoint(point, container) {
    /* We make the point relative to the current frame */

    point = container.frame.frameThisPoint(point)

    /* We pass this point through the canvas.chartingSpace.viewport lends, meaning we apply the canvas.chartingSpace.viewport zoom and displacement. */

    point = canvas.chartingSpace.viewport.transformThisPoint(point)

    return point
}

function unTransformThisPoint(point, container) {
    point = canvas.chartingSpace.viewport.unTransformThisPoint(point)
    point = container.frame.unframeThisPoint(point)

    return point
}
