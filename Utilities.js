function getNodeDefinition(node) {
    let key = node.type
    return APP_SCHEMA_MAP.get(key)
}

function dynamicDecimals(value, minDecimals) {
    if (minDecimals === undefined) {
        minDecimals = 0
    }
    let decimals = 2
    if (value < 1) { decimals = 4 }
    if (Math.abs(Math.trunc(value * 100)) < 1) { decimals = 6 }
    if (Math.abs(Math.trunc(value * 10000)) < 1) { decimals = 8 }
    if (Math.abs(Math.trunc(value * 1000000)) < 1) { decimals = 10 }
    if (Math.abs(Math.trunc(value * 100000000)) < 1) { decimals = 12 }
    if (Math.abs(Math.trunc(value * 10000000000)) < 1) { value = 0; decimals = 0 }
    if (Math.trunc(value) === value) { decimals = minDecimals }
    let returnValue = Number(value).toFixed(decimals)
    return returnValue
}

function convertTimeFrameToName(pTimeFrame) {
    for (let i = 0; i < dailyFilePeriods.length; i++) {
        let period = dailyFilePeriods[i]
        if (period[0] === pTimeFrame) {
            return period[1]
        }
    }

    for (let i = 0; i < marketFilesPeriods.length; i++) {
        let period = marketFilesPeriods[i]
        if (period[0] === pTimeFrame) {
            return period[1]
        }
    }
}

function nextPorwerOf10(number) {
    for (let i = -10; i <= 10; i++) {
        if (number < Math.pow(10, i)) {
            return Math.pow(10, i)
        }
    }
}

function pad(str, max) {
    str = str.toString()
    return str.length < max ? pad('0' + str, max) : str
}

function moveToUserPosition(container, currentDate, currentRate, coordinateSystem, ignoreX, ignoreY, mousePosition, fitFunction) {
    let targetPoint = {
        x: currentDate.valueOf(),
        y: currentRate
    }

    /* Put this point in the coordinate system of the canvas.chartingSpace.viewport */
    targetPoint = coordinateSystem.transformThisPoint(targetPoint)
    targetPoint = transformThisPoint(targetPoint, container)

    let displaceVector

    let targetNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(targetPoint)
    let mouseNoZoom = canvas.chartingSpace.viewport.unTransformThisPoint(mousePosition)

    displaceVector = {
        x: mouseNoZoom.x - targetNoZoom.x,
        y: mouseNoZoom.y - targetNoZoom.y
    }

    if (ignoreX) { displaceVector.x = 0 }
    if (ignoreY) { displaceVector.y = 0 }

    container.displace(displaceVector)
}

function removeTime(datetime) {
    if (datetime === undefined) { return }

    let dateOnly = new Date(Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)

    return dateOnly
}

function newUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
