exports.newSuperalgosGlobalsTimeFrames = function () {

    let thisObject = {
        marketFilesPeriods: marketFilesPeriods,
        dailyFilePeriods: dailyFilePeriods
    }

    return thisObject

    function marketFilesPeriods() {

        let marketFilesPeriods =
            '[' +
            '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
            '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
            '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
            '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
            '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
            '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
            '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
            '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']'

        return JSON.parse(marketFilesPeriods)
    }

    function dailyFilePeriods() {

        let dailyFilePeriods =
            '[' +
            '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
            '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
            '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
            '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
            '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
            '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
            '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
            '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
            '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
            '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
            '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']'

        return JSON.parse(dailyFilePeriods)
    }
}