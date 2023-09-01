exports.newBitcoinFactoryServer = function newBitcoinFactoryServer() {

    let thisObject = {
        getTestClientInstanceId: getTestClientInstanceId,
        updateForecastedCandles: updateForecastedCandles,
        getUserProfileFilesList: getUserProfileFilesList,
        getUserProfileFile: getUserProfileFile,
        getIndicatorFile: getIndicatorFile,
        getRewardsFile: getRewardsFile,
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {

    }

    function updateForecastedCandles(bestPredictionsData) {

        SA.logger.debug('{BitcoinFactoryServer} Updating DataMine with new results')

        let bestPredictions

        try {
            bestPredictions = JSON.parse(bestPredictionsData)
        } catch (err) {
            SA.logger.warn('{BitcoinFactoryServer} Error parsing JSON data ' + err.stack)
            return {
                result: 'JSON Parse error'
            }            
        }

        //if there is only one bestPredictions, we need to build an array "over" it to make the ongoing code to work
        if (bestPredictions.length == undefined) bestPredictions = [bestPredictions]

        for (let j = 0; j < bestPredictions.length; j++) {
            let bestPrediction = bestPredictions[j]
            SA.logger.debug('{BitcoinFactoryServer} Updating No', j+1 ,'Prediction now')

            let newForecastedCandles = []
            let newRLPredictions = []
            //LSTM
            if (bestPrediction.percentageErrorRMSE != undefined) { 
                SA.logger.debug('{BitcoinFactoryServer} It is LSTM')

                let forecastedCandlesFileContent
                let percentageError = Number(bestPrediction.percentageErrorRMSE)
                let newForecastedCandle = {
                    begin: bestPrediction.forecastedCandle.begin,
                    end: bestPrediction.forecastedCandle.end,
                    open: bestPrediction.forecastedCandle.open,
                    min: bestPrediction.predictions[1],
                    minPlusError: bestPrediction.predictions[1] + bestPrediction.predictions[1] * percentageError / 100,
                    minMinusError: bestPrediction.predictions[1] - bestPrediction.predictions[1] * percentageError / 100,
                    max: bestPrediction.predictions[0],
                    maxPlusError: bestPrediction.predictions[0] + bestPrediction.predictions[0] * percentageError / 100,
                    maxMinusError: bestPrediction.predictions[0] - bestPrediction.predictions[0] * percentageError / 100,
                    close: bestPrediction.predictions[2],
                    closePlusError: bestPrediction.predictions[2] + bestPrediction.predictions[2] * percentageError / 100,
                    closeMinusError: bestPrediction.predictions[2] - bestPrediction.predictions[2] * percentageError / 100
                }
                try {
                    /*
                    Read Current File from Superalgos Storage
                    */
                    forecastedCandlesFileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Client/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forecasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/Data.json')   
                    let forecastedCandlesFile = JSON.parse(forecastedCandlesFileContent)    
                    let updated = false
    
                    for (let i = 0; i < forecastedCandlesFile.length; i++) {
                        let forecastedCandleArray = forecastedCandlesFile[i]
                        let forecastedCandle = {
                            begin: forecastedCandleArray[0],
                            end: forecastedCandleArray[1],
                            open: forecastedCandleArray[2],
                            min: forecastedCandleArray[3],
                            minPlusError: forecastedCandleArray[4],
                            minMinusError: forecastedCandleArray[5],
                            max: forecastedCandleArray[6],
                            maxPlusError: forecastedCandleArray[7],
                            maxMinusError: forecastedCandleArray[8],
                            close: forecastedCandleArray[9],
                            closePlusError: forecastedCandleArray[10],
                            closeMinusError: forecastedCandleArray[11]
                        }
    
                        if (forecastedCandle.begin < bestPrediction.forecastedCandle.begin) {
                            newForecastedCandles.push(forecastedCandle)
                        }
                        if (forecastedCandle.begin === bestPrediction.forecastedCandle.begin) {
                            newForecastedCandles.push(newForecastedCandle)
                            updated = true
                        }
                    }
                    if (updated === false) {
                        newForecastedCandles.push(newForecastedCandle)
                    }
                } catch (err) {
                    if (err.code === "ENOENT" || err.message.indexOf('Unexpected token') >= 0) {
                        /*
                        If the file does not exist or it is not a valid JSON object, it is ok, probably this process was never ran before or ran with a bug that corrupted the file.
                        */
                        newForecastedCandles.push(newForecastedCandle)
                    } else {
                        SA.logger.error('Cound not update Superalgos. ' + err.stack)
                        return
                    }
                }  
                /*
                Write Updated File into Superalgos Storage
                */
                let newForecastedCandlesFileContent = ""
                newForecastedCandlesFileContent = newForecastedCandlesFileContent + "["
                for (let i = 0; i < newForecastedCandles.length; i++) {
                    let newForecastedCandle = newForecastedCandles[i]
                    if (i > 0) {
                        newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    }
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + "["
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.begin
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.end
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.open
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.min
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.minPlusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.minMinusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.max
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.maxPlusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.maxMinusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.close
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.closePlusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + ","
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + newForecastedCandle.closeMinusError
                    newForecastedCandlesFileContent = newForecastedCandlesFileContent + "]"
                }
                newForecastedCandlesFileContent = newForecastedCandlesFileContent + "]"
                let filePath = global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Client/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forecasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/'
                SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath)
                SA.nodeModules.fs.writeFileSync(filePath + 'Data.json', newForecastedCandlesFileContent)

            //RL      
            } else if (bestPrediction.ratio_validate != undefined) {     
                SA.logger.debug('{BitcoinFactoryServer} It is RL')

                let RLPredictionsFileContent 
                let newRLPrediction = {
                    begin: bestPrediction.forecastedCandle.begin,
                    end: bestPrediction.forecastedCandle.end,
                    positiontype: bestPrediction.predictions.type,
                    ordertype: bestPrediction.predictions.type,
                    limit: bestPrediction.predictions.limit,
                    amount: bestPrediction.predictions.amount
                }      
                try {   
                    /*
                    Read Current File from Superalgos Storage
                    */
                    RLPredictionsFileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Server/binance/' + bestPrediction.mainAsset + '-USDT/Output/RL-Predictions/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/Data.json')
                    let RLPredictionsFile = JSON.parse(RLPredictionsFileContent)
                    let updated = false
                    for (let i = 0; i < RLPredictionsFile.length; i++) {
                        let RLPredictionsArray = RLPredictionsFile[i]
                        let RLPrediction = {
                            begin: RLPredictionsArray[0],
                            end: RLPredictionsArray[1],
                            positiontype: RLPredictionsArray[2],
                            ordertype: RLPredictionsArray[3],
                            limit: RLPredictionsArray[4],
                            amount: RLPredictionsArray[5]
                        }
                        if (RLPrediction.begin < newRLPrediction.begin) {
                            newRLPredictions.push(RLPrediction)
                        } else if (RLPrediction.begin === newRLPrediction.begin) {
                            newRLPredictions.push(newRLPrediction)
                            updated = true
                        } else if (RLPrediction.begin > newRLPrediction.begin) {
                            newRLPredictions.push(RLPrediction)
                        }                        
                    }
                    if (updated === false) {
                        newRLPredictions.push(newRLPrediction)
                    }                    

                } catch (err) {
                    if (err.code === "ENOENT" || err.message.indexOf('Unexpected token') >= 0 || err.message.indexOf('Unexpected end of JSON input') >= 0) {
                        /*
                        If the file does not exist or it is not a valid JSON object, it is ok, probably this process was never ran before or ran with a bug that corrupted the file.
                        */
                        newRLPredictions.push(newRLPrediction)
                    } else {
                        SA.logger.error('{BitcoinFactoryServer} Cound not update Superalgos. Error-Code: ' +err.code)
                        SA.logger.error('{BitcoinFactoryServer} Error-Stack' + err.stack)
                        return
                    }
                }
                /*
                Write Updated File into Superalgos Storage
                */
                let newRLPredictionsFileContent = ""      
                newRLPredictionsFileContent += "["        
                for (let i = 0; i < newRLPredictions.length; i++) {
                    let newRLPrediction = newRLPredictions[i]
                    if (i > 0) {
                        newRLPredictionsFileContent += ","
                    }
                    newRLPredictionsFileContent += "["
                    newRLPredictionsFileContent += newRLPrediction.begin
                    newRLPredictionsFileContent += ","
                    newRLPredictionsFileContent += newRLPrediction.end
                    newRLPredictionsFileContent += ","
                    newRLPredictionsFileContent += newRLPrediction.positiontype
                    newRLPredictionsFileContent += ","
                    newRLPredictionsFileContent += newRLPrediction.ordertype
                    newRLPredictionsFileContent += ","
                    newRLPredictionsFileContent += newRLPrediction.limit
                    newRLPredictionsFileContent += ","
                    newRLPredictionsFileContent += newRLPrediction.amount
                    newRLPredictionsFileContent += "]"
                }
                newRLPredictionsFileContent += "]"
                let filePath = global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Server/binance/' + bestPrediction.mainAsset + '-USDT/Output/RL-Predictions/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/'
                SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath)
                SA.nodeModules.fs.writeFileSync(filePath + 'Data.json', newRLPredictionsFileContent)
            }
        } // end for loop over elements of bestpredictions array

        return {
            result: 'Ok'
        }
    }

    function getTestClientInstanceId(networkCodeName, userProfileName, clientName) {

        let userProfilePluginFile = SA.nodeModules.fs.readFileSync('./Plugins/Governance/User-Profiles/' + userProfileName + '.json')
        let userProfile = JSON.parse(userProfilePluginFile)
        if (
            userProfile.forecastsProviders !== undefined &&
            userProfile.forecastsProviders.bitcoinFactoryForecasts !== undefined
        ) {
            for (let i = 0; i < userProfile.forecastsProviders.bitcoinFactoryForecasts.length; i++) {
                let network = userProfile.forecastsProviders.bitcoinFactoryForecasts[i]
                if (network.name === networkCodeName) {
                    for (let j = 0; j < network.testClientInstances.length; j++) {
                        let testClientInstance = network.testClientInstances[j]
                        if (testClientInstance.name === clientName) {
                            return {
                                result: 'Ok',
                                clientId: testClientInstance.id
                            }
                        }
                    }
                    for (let j = 0; j < network.forecastClientInstances.length; j++) {
                        let forecastClientInstance = network.forecastClientInstances[j]
                        if (forecastClientInstance.name === clientName) {
                            return {
                                result: 'Ok',
                                clientId: forecastClientInstance.id
                            }
                        }
                    }
                }
            }
        }
        return {
            result: 'Not Ok'
        }
    }

    function getUserProfileFilesList() {

        let userProfileFIleList = SA.nodeModules.fs.readdirSync('./Plugins/Governance/User-Profiles')

        return {
            result: 'Ok',
            userProfileFIleList: userProfileFIleList
        }
    }

    function getUserProfileFile(fileName) {

        let userProfilePluginFile = SA.nodeModules.fs.readFileSync('./Plugins/Governance/User-Profiles/' + fileName)

        return {
            result: 'Ok',
            userProfilePluginFile: userProfilePluginFile.toString()
        }
    }

    function getIndicatorFile(
        dataMine,
        indicator,
        product,
        exchange,
        baseAsset,
        quotedAsset,
        dataset,
        timeFrameLabel
    ) {

        let fileContent = SA.nodeModules.fs.readFileSync('./Platform/My-Data-Storage/Project/Data-Mining/Data-Mine/' + dataMine + '/' + indicator + '/' + exchange + '/' + baseAsset + '-' + quotedAsset + '/Output/' + product + '/' + dataset + '/' + timeFrameLabel + '/Data.json')

        return {
            result: 'Ok',
            fileContent: fileContent.toString()
        }
    }

    function getRewardsFile(firstTimestamp, lastTimestamp) {
        let rewardsFile = ""
        let reportsDirectory = []
        const testsPerUser = {}
        let recordsCounter = 0
        /* Debug Mode provides more verbose output about each processed Rewards File on the Console */
        const debugMode = false
        try {
            reportsDirectory = SA.nodeModules.fs.readdirSync('./Bitcoin-Factory/Reports')
        }
        catch(err) {
            SA.logger.warn("Cannot access directory for Bitcoin Factory Reports: ./Bitcoin-Factory/Reports/")
            return {
                result: 'Not Ok'
            }
        }
        /* Iterate all files in reportsDirectory */
        for (let f = 0; f < reportsDirectory.length; f++) {
            /* Check if file name matches pattern Testnet*.csv for processing Test Client rewards */
            rewardsFile = ""
            recordsCounter = 0
            if (/^Testnet[\w\s-]*\.csv$/gi.test(reportsDirectory[f]) === false) { 
                continue
            } else {
                try {
                    rewardsFile = SA.nodeModules.fs.readFileSync('./Bitcoin-Factory/Reports/' + reportsDirectory[f])
                }
                catch(err) {
                    SA.logger.error("Unable to open Governance Rewards File ./Bitcoin-Factory/Reports/" + reportsDirectory[f])
                    continue
                }

                /* Parse CSV file, convert to JSON objects */
                const csvToJsonResult = []
                let parsingError = 0
                let cleanResult = rewardsFile.toString().replace(/\r/g, "")
                let array = cleanResult.split("\n")
                const headers = array[0].split(",")
                for (let i = 1; i < array.length - 1; i++) {
                    const jsonObject = {}
                    const currentArrayString = array[i]
                    let string = ''
                    /* Escape quotation marks, convert , to | */
                    let quoteFlag = 0
                    for (let character of currentArrayString) {
                        if (character === '"' && quoteFlag === 0) {
                            quoteFlag = 1
                        }
                        else if (character === '"' && quoteFlag == 1) quoteFlag = 0
                        if (character === ',' && quoteFlag === 0) character = '|'
                        if (character !== '"') string += character
                    }
                    let jsonProperties = string.split("|")
                    try {
                        for (let j in headers) {
                            if (jsonProperties[j].includes(",")) {
                            jsonObject[headers[j]] = jsonProperties[j]
                                .split(",").map(item => item.trim())
                            }
                            else jsonObject[headers[j]] = jsonProperties[j]
                        }
                    } catch(err) {
                        if (parsingError === 0) { parsingError = i + 1 }
                    }
                    /* Push the genearted JSON object to result array */
                    csvToJsonResult.push(jsonObject)
                }
                /* Check if file contained any malformed lines */
                if (parsingError > 0) {
                    SA.logger.warn("Bitcoin Factory Rewards File", reportsDirectory[f], "contains malformed records - e.g. line", parsingError, ", discarding")
                    continue
                }             
                /* Check if file contains mandatory columns */             
                if (!headers.includes("assignedTimestamp") || !headers.includes("testedByProfile") || !headers.includes("status")) {
                    SA.logger.warn("Bitcoin Factory Rewards File", reportsDirectory[f], "with unexpected syntax, discarding")
                    continue
                }

                /* Filter results for timestamp range */
                let uploadTimestamp = 0

                for (let x = 0; x < csvToJsonResult.length; x++) {
                    if (isNaN(csvToJsonResult[x].assignedTimestamp) === false) {
                        uploadTimestamp = parseInt(csvToJsonResult[x].assignedTimestamp)
                    }
                    let profile = csvToJsonResult[x].testedByProfile
                    if (csvToJsonResult[x].status === "Tested" && uploadTimestamp >= parseInt(firstTimestamp) && uploadTimestamp <= parseInt(lastTimestamp)) {
                        if (testsPerUser[profile] !== undefined) {
                            testsPerUser[profile] = testsPerUser[profile] + 1
                        } else {
                            testsPerUser[profile] = 1
                        }
                        recordsCounter++
                    }
                }
                if (debugMode === true) {
                    if (recordsCounter === 0) {
                        SA.logger.info("Governance Rewards File", reportsDirectory[f], "does not contain any records for this period")
                    } else {
                        SA.logger.info("Governance Rewards File", reportsDirectory[f], "contains", recordsCounter, "valid records")
                    }
                }
            }
        }
        if (debugMode === true) {
            SA.logger.info("Total executed Bitcoin Factory Test Cases per User:", testsPerUser)
        }
        return {
            result: 'Ok',
            executedTests: testsPerUser
        }
    }

}