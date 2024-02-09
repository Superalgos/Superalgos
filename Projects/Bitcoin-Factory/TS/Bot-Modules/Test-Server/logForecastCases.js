let networkCodeName = process.argv[2]
if (networkCodeName === undefined) {
    SA.logger.error('You need to provide a Network CodeName as a parameter to this script.')
    return
}

let initialForecastCaseId = process.argv[3]
if (initialForecastCaseId === undefined) {
    SA.logger.error('You need to provide a initialForecastCaseId as a parameter to this script.')
    return
}

let finalForecastCaseId = process.argv[4]
if (finalForecastCaseId === undefined) {
    SA.logger.error('You need to provide a finalForecastCaseId as a parameter to this script.')
    return
}

const UTILITIES_MODULE = require('./Utilities')
utilities = UTILITIES_MODULE.newUtilities()

run()

function run() {
    let forecastCasesArray
    let fileContent = utilities.loadFile(global.env.PATH_TO_BITCOIN_FACTORY + "/StateData/ForecastCases/Forecast-Cases-Array-" + networkCodeName + ".json")
    if (fileContent !== undefined) {
        forecastCasesArray = JSON.parse(fileContent)
    } else {
        SA.logger.error('Forecast Cases File NOT Found.')
        return
    }

    let logQueue = []
    for (let i = 0; i < forecastCasesArray.length; i++) {
        let forecastCase = forecastCasesArray[i]
        if (forecastCase.id >= initialForecastCaseId && forecastCase.id <= finalForecastCaseId){
            logQueue.push(forecastCase)
        }
    }
    console.table(logQueue)
}
