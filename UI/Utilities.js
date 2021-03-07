function getSchemaDocument(node, project) {
    if (node === null || node === undefined) {
        console.log('[Error] Can not get the schema document of a null or undefined node ')
        return
    }
    if (project === undefined) { project = node.project }

    let APP_SCHEMA = SCHEMAS_BY_PROJECT.get(project)
    if (APP_SCHEMA !== undefined) {
        return SCHEMAS_BY_PROJECT.get(project).map.appSchema.get(node.type)
    } else {
        console.log('[Error] Could not get APP Scchema for project ' + node.project)
    }
}

function dynamicDecimals(value, minDecimals) {
    if (minDecimals === undefined) {
        minDecimals = 0
    }
    let decimals = 0
    if (value < 1) { decimals = 3 }
    else if (value < 10) { decimals = 2 }
    else if (value < 100) { decimals = 1 }
    else if (Math.abs(Math.trunc(value * 10)) < 1) { decimals = 4 }
    else if (Math.abs(Math.trunc(value * 100)) < 1) { decimals = 5 }
    else if (Math.abs(Math.trunc(value * 1000)) < 1) { decimals = 6 }
    else if (Math.abs(Math.trunc(value * 10000)) < 1) { decimals = 7 }
    else if (Math.abs(Math.trunc(value * 100000)) < 1) { decimals = 8 }
    else if (Math.abs(Math.trunc(value * 1000000)) < 1) { decimals = 9 }
    else if (Math.abs(Math.trunc(value * 10000000)) < 1) { decimals = 10 }
    else if (Math.abs(Math.trunc(value * 100000000000)) < 1) { value = 0; decimals = 0 }

    if (decimals < minDecimals) { decimals = minDecimals }

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

    /* Put this point in the coordinate system of the UI.projects.superalgos.spaces.chartingSpace.viewport */
    targetPoint = coordinateSystem.transformThisPoint(targetPoint)
    targetPoint = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(targetPoint, container)

    let displaceVector

    let targetNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(targetPoint)
    let mouseNoZoom = UI.projects.superalgos.spaces.chartingSpace.viewport.unTransformThisPoint(mousePosition)

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

function splitTextIntoPhrases(text, wordsPerLine) {
    let splittedLabel = text.split(' ')
    let phrases = []
    let phrase = ''
    let wordCount = 0
    for (let i = 0; i < splittedLabel.length; i++) {
        phrase = phrase + splittedLabel[i]
        wordCount++

        if (i < splittedLabel.length - 1 && wordCount < wordsPerLine) {
            phrase = phrase + ' '
        }
        if (wordCount >= wordsPerLine) {
            phrases.push(phrase)
            phrase = ''
            wordCount = 0
        }
    }
    if (wordCount > 0) {
        phrases.push(phrase)
    }
    return phrases
}

function getTextWidth(text) {
    var metrics = browserCanvasContext.measureText(text);
    return metrics.width;
}