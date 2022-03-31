exports.newBitcoinFactoryServer = function newBitcoinFactoryServer() {

    let thisObject = {
        getTestClientInstanceId: getTestClientInstanceId,
        updateForecastedCandles: updateForecastedCandles,
        getUserProfileFilesList: getUserProfileFilesList,
        getUserProfileFile: getUserProfileFile,
        getIndicatorFile: getIndicatorFile,
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

    function updateForecastedCandles(forcastedCandles) {

        let bestPredictions = JSON.parse(forcastedCandles)

        for (let j = 0; j < bestPredictions.length; j++) {
            let bestPrediction = bestPredictions[j]
            let forcastedCandlesFileContent
            let newForcastedCandles = []
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
                forcastedCandlesFileContent = SA.nodeModules.fs.readFileSync(global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Forecasts/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forcasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/Data.json')

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
            let filePath = global.env.PATH_TO_DATA_STORAGE + '/Project/Data-Mining/Data-Mine/Bitcoin-Factory/Forecasts/binance/' + bestPrediction.mainAsset + '-USDT/Output/Forcasted-Candles/Multi-Time-Frame-Market/' + bestPrediction.mainTimeFrame + '/'
            SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath)
            SA.nodeModules.fs.writeFileSync(filePath + 'Data.json', newForcastedCandlesFileContent)
        }

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
}