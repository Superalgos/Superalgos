
function getSideDays(timeFrame) {
    let daysOnSides

    if (timeFrame < _1_HOUR_IN_MILISECONDS) {
        daysOnSides = 1
    }

    if (timeFrame === _1_HOUR_IN_MILISECONDS) {
        daysOnSides = 9
    }

    if (timeFrame === _2_HOURS_IN_MILISECONDS) {
        daysOnSides = 10
    }

    if (timeFrame === _3_HOURS_IN_MILISECONDS) {
        daysOnSides = 12
    }

    if (timeFrame === _4_HOURS_IN_MILISECONDS) {
        daysOnSides = 20
    }

    if (timeFrame === _6_HOURS_IN_MILISECONDS) {
        daysOnSides = 35
    }

    if (timeFrame === _8_HOURS_IN_MILISECONDS) {
        daysOnSides = 44
    }

    if (timeFrame === _12_HOURS_IN_MILISECONDS) {
        daysOnSides = 56
    }

    if (timeFrame === ONE_DAY_IN_MILISECONDS) {
        daysOnSides = 154
    }

    return daysOnSides
}

function getCondenseFactor(timeFrame) {
    switch (timeFrame) {
        case _1_MINUTE_IN_MILISECONDS: return 1
        case _5_MINUTES_IN_MILISECONDS: return 5
        case _10_MINUTES_IN_MILISECONDS: return 10
        case _30_MINUTES_IN_MILISECONDS: return 50
        case _1_HOUR_IN_MILISECONDS: return 100
    }
}

function getTransparenceFactor(timeFrame) {
    switch (timeFrame) {
        case _1_MINUTE_IN_MILISECONDS: return '0.12'
        case _5_MINUTES_IN_MILISECONDS: return '0.10'
        case _10_MINUTES_IN_MILISECONDS: return '0.08'
        case _30_MINUTES_IN_MILISECONDS: return '0.06'
        case _1_HOUR_IN_MILISECONDS: return '0.04'
    }
}

function recalculatePeriod(zoomLevel) {
    // console.log('NEW ZOOM LEVEL', zoomLevel)
    if (zoomLevel > 400) {
        return _1_MINUTE_IN_MILISECONDS
    }

    if (zoomLevel > 360) {
        return _2_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 330) {
        return _3_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 300) {
        return _4_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 270) {
        return _5_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 250) {
        return _10_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 230) {
        return _15_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 210) {
        return _20_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 190) {
        return _30_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 170) {
        return _40_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 150) {
        return _45_MINUTES_IN_MILISECONDS
    }

    if (zoomLevel > 130) {
        return _1_HOUR_IN_MILISECONDS
    }

    if (zoomLevel > 110) {
        return _2_HOURS_IN_MILISECONDS
    }

    if (zoomLevel > 80) {
        return _3_HOURS_IN_MILISECONDS
    }

    if (zoomLevel > 50) {
        return _4_HOURS_IN_MILISECONDS
    }

    if (zoomLevel > 35) {
        return _6_HOURS_IN_MILISECONDS
    }

    if (zoomLevel > 20) {
        return _8_HOURS_IN_MILISECONDS
    }

    if (zoomLevel > 10) {
        return _12_HOURS_IN_MILISECONDS
    }

    return ONE_DAY_IN_MILISECONDS
}
