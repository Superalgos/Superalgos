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

        console.log((new Date()).toISOString(), '[DEBUG] {BitcoinFactoryServer} Updating DataMine with new results')

        let bestPredictions

        try {
            bestPredictions = JSON.parse(bestPredictionsData)
        } catch (err) {
            console.log((new Date()).toISOString(), '[WARN] {BitcoinFactoryServer} Error parsing JSON data ' + err.stack)
            return {
                result: 'JSON Parse error'
            }            
        }

        //if there is only one bestPredictions, we need to build an array "over" it to make the ongoing code to work
        if (bestPredictions.length == undefined) bestPredictions = [bestPredictions]

        for (let j = 0; j < bestPredictions.length; j++) {
            let bestPrediction = bestPredictions[j]
            console.log((new Date()).toISOString(), '[DEBUG] {BitcoinFactoryServer} Updating No', j+1 ,'Prediction now')

            let newForcastedCandles = []
            let newRLPredictions = []
            //LSTM
            if (bestPrediction.percentageErrorRMSE != undefined) { 
                console.log((new Date()).toISOString(), '[DEBUG] {BitcoinFactoryServer} It is LSTM')

                let forcastedCandlesFileContent
                let percentageError = Number(bestPrediction.percentageErrorRMSE)
                let newForcastedCandle = {
                    begin: bestPrediction.forcastedCandle.begin,
                    end: bestPrediction.forcastedCandle.end,
                    open: bestPrediction.forcastedCandle.open,
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
                    forcastedCandlesFileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Client/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forcasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/Data.json')   
                    let forcastedCandlesFile = JSON.parse(forcastedCandlesFileContent)    
                    let updated = false
    
                    for (let i = 0; i < forcastedCandlesFile.length; i++) {
                        let forcastedCandleArray = forcastedCandlesFile[i]
                        let forcastedCandle = {
                            begin: forcastedCandleArray[0],
                            end: forcastedCandleArray[1],
                            open: forcastedCandleArray[2],
                            min: forcastedCandleArray[3],
                            minPlusError: forcastedCandleArray[4],
                            minMinusError: forcastedCandleArray[5],
                            max: forcastedCandleArray[6],
                            maxPlusError: forcastedCandleArray[7],
                            maxMinusError: forcastedCandleArray[8],
                            close: forcastedCandleArray[9],
                            closePlusError: forcastedCandleArray[10],
                            closeMinusError: forcastedCandleArray[11]
                        }
    
                        if (forcastedCandle.begin < bestPrediction.forcastedCandle.begin) {
                            newForcastedCandles.push(forcastedCandle)
                        }
                        if (forcastedCandle.begin === bestPrediction.forcastedCandle.begin) {
                            newForcastedCandles.push(newForcastedCandle)
                            updated = true
                        }
                    }
                    if (updated === false) {
                        newForcastedCandles.push(newForcastedCandle)
                    }
                } catch (err) {
                    if (err.code === "ENOENT" || err.message.indexOf('Unexpected token') >= 0) {
                        /*
                        If the file does not exist or it is not a valid JSON object, it is ok, probably this process was never ran before or ran with a bug that corrupted the file.
                        */
                        newForcastedCandles.push(newForcastedCandle)
                    } else {
                        console.log("[ERROR] Cound not update Superalgos. " + err.stack)
                        return
                    }
                }  
                /*
                Write Updated File into Superalgos Storage
                */
                let newForcastedCandlesFileContent = ""
                newForcastedCandlesFileContent = newForcastedCandlesFileContent + "["
                for (let i = 0; i < newForcastedCandles.length; i++) {
                    let newForcastedCandle = newForcastedCandles[i]
                    if (i > 0) {
                        newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    }
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + "["
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.begin
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.end
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.open
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.min
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.minPlusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.minMinusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.max
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.maxPlusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.maxMinusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.close
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.closePlusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + ","
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + newForcastedCandle.closeMinusError
                    newForcastedCandlesFileContent = newForcastedCandlesFileContent + "]"
                }
                newForcastedCandlesFileContent = newForcastedCandlesFileContent + "]"
                let filePath = global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Test-Client/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forcasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/'
                SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath)
                SA.nodeModules.fs.writeFileSync(filePath + 'Data.json', newForcastedCandlesFileContent)

            //RL      
            } else if (bestPrediction.ratio_validate != undefined) {     
                console.log((new Date()).toISOString(), '[DEBUG] {BitcoinFactoryServer} It is RL')

                let RLPredictionsFileContent 
                let newRLPrediction = {
                    begin: bestPrediction.forcastedCandle.begin,
                    end: bestPrediction.forcastedCandle.end,
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
                        console.log((new Date()).toISOString(), '[ERROR] {BitcoinFactoryServer} Cound not update Superalgos. Error-Code: ' +err.code)
                        console.log((new Date()).toISOString(), '[ERROR] {BitcoinFactoryServer} Error-Stack' + err.stack)
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
            console.log((new Date()).toISOString(), "[ERROR] Cannot access directory for Bitcoin Factory Reports: ./Bitcoin-Factory/Reports/")
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
                    console.log((new Date()).toISOString(), "[ERROR] Unable to open Governance Rewards File ./Bitcoin-Factory/Reports/" + reportsDirectory[f])
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
                    console.log((new Date()).toISOString(), "[WARN] Bitcoin Factory Rewards File", reportsDirectory[f], "contains malformed records - e.g. line", parsingError, ", discarding")
                    continue
                }             
                /* Check if file contains mandatory columns */             
                if (!headers.includes("assignedTimestamp") || !headers.includes("testedByProfile") || !headers.includes("status")) {
                    console.log((new Date()).toISOString(), "[WARN] Bitcoin Factory Rewards File", reportsDirectory[f], "with unexpected syntax, discarding")
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
                        console.log((new Date()).toISOString(), "[INFO] Governance Rewards File", reportsDirectory[f], "does not contain any records for this period")
                    } else {
                        console.log((new Date()).toISOString(), "[INFO] Governance Rewards File", reportsDirectory[f], "contains", recordsCounter, "valid records")
                    }
                }
            }
        }
        if (debugMode === true) {
            console.log((new Date()).toISOString(), "[INFO] Total executed Bitcoin Factory Test Cases per User:", testsPerUser)
        }
        return {
            result: 'Ok',
            executedTests: testsPerUser
        }
    }

}