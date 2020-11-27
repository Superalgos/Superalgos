function newSuperalgosUtilitiesDateRateTransformations() {
    thisObject = {
        getDateFromPointAtBrowserCanvas: getDateFromPointAtBrowserCanvas,
        getDateFromPointAtChartsSpace: getDateFromPointAtChartsSpace,
        getDateFromPointAtContainer: getDateFromPointAtContainer,
        getRateFromPointAtBrowserCanvas: getRateFromPointAtBrowserCanvas,
        getRateFromPointAtChartingSpace: getRateFromPointAtChartingSpace,
        getRateFromPointAtContainer: getRateFromPointAtContainer,
        getMilisecondsFromPoint: getMilisecondsFromPoint
    }

    return thisObject

    function getDateFromPointAtBrowserCanvas(point, container, coordinateSystem) {
        point = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(point, container)
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        let date = new Date(point.x)

        return date
    }

    function getDateFromPointAtChartsSpace(point, container, coordinateSystem) {
        point = container.frame.unframeThisPoint(point)
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        let date = new Date(point.x)

        return date
    }

    function getDateFromPointAtContainer(point, container, coordinateSystem) {
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        let date = new Date(point.x)

        return date
    }

    function getRateFromPointAtBrowserCanvas(point, container, coordinateSystem) {
        point = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(point, container)
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        return point.y
    }

    function getRateFromPointAtChartingSpace(point, container, coordinateSystem) {
        point = container.frame.unframeThisPoint(point)
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        return point.y
    }

    function getRateFromPointAtContainer(point, container, coordinateSystem) {
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        return point.y
    }

    function getMilisecondsFromPoint(point, container, coordinateSystem) {
        point = UI.projects.superalgos.utilities.coordinateTransformations.unTransformThisPoint(point, container)
        point = coordinateSystem.unInverseTransform(point, container.frame.height)

        return point.x
    }
}
