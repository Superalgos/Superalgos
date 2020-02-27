
exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage, STATUS_REPORT, EXCHANGE_API) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const MODULE_NAME = "User Bot";
    const CANDLES_FOLDER_NAME = "Candles/One-Min";
    const VOLUMES_FOLDER_NAME = "Volumes/One-Min";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger)
    let statusDependencies

    const ONE_MIN = 60000
    const ONE_DAY = ONE_MIN * 60 * 24
    
    const MAX_OHLCVs_PER_EXECUTION =   100000
    const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
    const ccxt = require('ccxt')

    let allOHLCVs = []
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let exchangeId
    let options = {}
    let firstId
    let rateLimit
    let exchange
    let uiStartDate = new Date(bot.uiStartDate)
    let fisrtTimeThisProcessRun = false
    let limit = 1000 // This is the default value

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            statusDependencies = pStatusDependencies;

            exchangeId = bot.exchange.toLowerCase()

            /* Applying the parameters defined by the user at the Exchange node */
            if (bot.exchangeNode.code.API !== undefined) {
                for (let i = 0; i < bot.exchangeNode.code.API.length; i++) {
                    if (bot.exchangeNode.code.API[i].method === 'fetchOHLCVs') {
                        if (bot.exchangeNode.code.API[i].class !== undefined) {
                            exchangeId = bot.exchangeNode.code.API[i].class
                        }
                        if (bot.exchangeNode.code.API[i].fetchOHLCVsMethod !== undefined) {
                            options = {
                                'fetchOHLCVsMethod': bot.exchangeNode.code.API[i].fetchOHLCVsMethod
                            }
                        }
                        if (bot.exchangeNode.code.API[i].firstId !== undefined) {
                            firstId = bot.exchangeNode.code.API[i].firstId
                        }
                        if (bot.exchangeNode.code.API[i].rateLimit !== undefined) {
                            rateLimit = bot.exchangeNode.code.API[i].rateLimit
                        }
                    }
                }
            }

            if (bot.code.fetchLimit !== undefined) {
                limit = bot.code.fetchLimit
            }

            let key = process.env.KEY
            let secret = process.env.SECRET

            if (key === "undefined") { key = undefined }
            if (secret === "undefined") { secret = undefined }


            const exchangeClass = ccxt[exchangeId]
            const exchangeConstructorParams = {
                'apiKey': key,
                'secret': secret,
                'timeout': 30000,
                'enableRateLimit': true,
                verbose: false,
                options: options
            }
            if (rateLimit !== undefined) {
                exchangeConstructorParams.rateLimit = rateLimit
            }

            exchange = new exchangeClass(exchangeConstructorParams)

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            if (global.STOP_TASK_GRACEFULLY === true) {
                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return
            }

            let abort = false
            begin()

            async function begin() {

                getContextVariables()
                if (abort === true) { return }
                await getOHLCVs()
                if (abort === true) { return }
                if (global.STOP_TASK_GRACEFULLY === true) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                    return
                }
                await saveOHLCVs()
            }

            function getContextVariables() {

                try {
                    let reportKey;

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Historic-OHLCVs" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.beginingOfMarket !== undefined) { // This means this is not the first time this process run.
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket.year + "-" + thisReport.file.beginingOfMarket.month + "-" + thisReport.file.beginingOfMarket.days + " " + thisReport.file.beginingOfMarket.hours + ":" + thisReport.file.beginingOfMarket.minutes + GMT_SECONDS);
                        lastFile = new Date(thisReport.file.lastFile.year + "-" + thisReport.file.lastFile.month + "-" + thisReport.file.lastFile.days + " " + thisReport.file.lastFile.hours + ":" + thisReport.file.lastFile.minutes + GMT_SECONDS);
                    } else {  // This means this is the first time this process run.
                        fisrtTimeThisProcessRun = true
                        beginingOfMarket = new Date(uiStartDate.valueOf())
                    }

                    defineSince()
                    function defineSince() {
                        if (thisReport.file.uiStartDate === undefined) {
                            thisReport.file.uiStartDate = uiStartDate
                        } else {
                            thisReport.file.uiStartDate = new Date(thisReport.file.uiStartDate)
                        }

                        if (uiStartDate.valueOf() !== thisReport.file.uiStartDate.valueOf()) {
                            since = uiStartDate.valueOf()
                            initialProcessTimestamp = since
                            beginingOfMarket = new Date(uiStartDate.valueOf())
                        } else {
                            if (lastFile !== undefined) {
                                since = lastFile.valueOf()
                                initialProcessTimestamp = lastFile.valueOf()
                            } else {
                                since = uiStartDate.valueOf()
                                initialProcessTimestamp = uiStartDate.valueOf()
                            }
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            async function getOHLCVs() {

                try {
                    let lastOHLCVKey = ''
                    let params = undefined
                    let previousSince

                    while (true) {

                        /* Reporting we are doing well */
                        let processingDate = new Date(since)
                        processingDate = processingDate.getUTCFullYear() + '-' + utilities.pad(processingDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(processingDate.getUTCDate(), 2);
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> Fetching OHLCVs  @ " + processingDate + "-> exchange = " + bot.exchange + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit) }
                        bot.processHeartBeat("Fetching " + allOHLCVs.length.toFixed(0) + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                        /* Fetching the OHLCVs from the exchange.*/
                        const OHLCVs = await exchange.fetchOHLCV(symbol, '1m', since, limit, params)

                        /*
                        OHLCV Structure
                        The fetchOHLCV method shown above returns a list (a flat array) of OHLCV candles represented by the following structure:

                        [
                            [
                                1504541580000, // UTC timestamp in milliseconds, integer
                                4235.4,        // (O)pen price, float
                                4240.6,        // (H)ighest price, float
                                4230.0,        // (L)owest price, float
                                4230.7,        // (C)losing price, float
                                37.72941911    // (V)olume (in terms of the base currency), float
                            ],
                            ...
                        ]
                        */

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched = " + OHLCVs.length) }
                        if (OHLCVs.length > 0) {
                            let beginDate = new Date(OHLCVs[0].timestamp)
                            let endDate = new Date(OHLCVs[OHLCVs.length - 1].timestamp)
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched From " + beginDate) }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched to " + endDate) }

                            if (fisrtTimeThisProcessRun === true) {
                                let OHLCV = OHLCVs[0]

                                initialProcessTimestamp = OHLCV[0]  // 'timestamp'
                                beginingOfMarket = new Date(Math.trunc (OHLCV[0] / ONE_DAY) * ONE_DAY)  // 'timestamp'
                                fisrtTimeThisProcessRun = false
                            }
                        }

                        if (OHLCVs.length > 1) {
                            previousSince = since
                            since = OHLCVs[OHLCVs.length - 1][0] // 'timestamp'
                            if (since === previousSince) {
                                since++ // this prevents requesting in a loop OHLCVs with the same timestamp, that can happen when all the records fetched comes with exactly the same timestamp.
                            }

                            for (let i = 0; i < OHLCVs.length; i++) {
                                
                                let OHLCV = OHLCVs[i]         

                                let OHLCVKey = OHLCV[0] + '-' + OHLCV[1].toFixed(16) + '-' + OHLCV[2].toFixed(16) + '-' + OHLCV[3].toFixed(16) + '-' + OHLCV[4].toFixed(16) + '-' + OHLCV[5].toFixed(16)
                                if (OHLCVKey !== lastOHLCVKey) {
                                    allOHLCVs.push(OHLCV)
                                }
                                lastOHLCVKey = OHLCVKey
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> Fetching OHLCVs  @ " + processingDate + "-> exchange = " + bot.exchange + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit) }
                            bot.processHeartBeat("Fetching " + allOHLCVs.length.toFixed(0) + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                        }

                        if (
                            OHLCVs.length < limit - 1 ||
                            global.STOP_TASK_GRACEFULLY === true ||
                            allOHLCVs.length >= MAX_OHLCVs_PER_EXECUTION
                        ) {
                            break
                        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getOHLCVs -> Retrying Later -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                    abort = true
                }
            }

            async function saveOHLCVs() {

                try {

                    let candlesFileContent = '['
                    let volumesFileContent = '['
                    let previousDay = Math.trunc((initialProcessTimestamp - ONE_DAY) / ONE_DAY)
                    let currentDay = Math.trunc((initialProcessTimestamp - ONE_DAY) / ONE_DAY)
                    let needSeparator = false
                    let error
                    let separator
                    let heartBeatCounter = 0
                    let lastCandle = {
                        begin: 0,
                        end: 0,
                        open: 0,
                        close: 0,
                        min: 0,
                        max: 0
                    }
                    let lastVolume = {
                        begin: 0,
                        end: 0,
                        buy: 0,
                        sell: 0
                    }

                    let i = 0

                    controlLoop()

                    function loop() {

                        let filesToCreate = 0
                        let filesCreated = 0

                        /* Go through all possible 1 min candles of a day. */
                        for (let j = 0; j <   60 * 24; j++) {

                            let candle = {
                                begin: currentDay * ONE_DAY + ONE_MIN * j,
                                end: currentDay * ONE_DAY + ONE_MIN * j + ONE_MIN - 1,
                                open: lastCandle.close,
                                close: lastCandle.close,
                                min: lastCandle.close,
                                max: lastCandle.close
                            }
                            let volume = {
                                begin: currentDay * ONE_DAY + ONE_MIN * j,
                                end: currentDay * ONE_DAY + ONE_MIN * j + ONE_MIN - 1,
                                buy: lastVolume.buy,
                                sell: lastVolume.sell
                            }

                            let record = allOHLCVs[i]
                            let OHLCV = {
                                timestamp: record[0],
                                open: record[1],
                                hight: record[2],
                                low: record[3],
                                close: record[4],
                                volume: record[5]
                            }

                            if (OHLCV.open === 11478 || OHLCV.hight === 11478 || OHLCV.low === 11478 || OHLCV.close === 11478) {
                                console.log('FROM HERE')
                            }

                            let candleMinute = Math.trunc(candle.begin / ONE_MIN)
                            let OHLCVMinute  

                            checkOHLCVMinute()

                            function checkOHLCVMinute() {
                                /*
                                Some exchanges return inconsistent data. It is not guaranteed that each candle will have a timeStamp exactly at the begining of an
                                UTC minute. It is also not guaranteed that the distance between timestamps will be the same. To fix this, we will do this.
                                */

                                OHLCVMinute = Math.trunc(OHLCV.timestamp / ONE_MIN)

                                if (OHLCVMinute < candleMinute) {
                                    i++
                                    record = allOHLCVs[i]
                                    OHLCV = {
                                        timestamp: record[0],
                                        open: record[1],
                                        hight: record[2],
                                        low: record[3],
                                        close: record[4],
                                        volume: record[5]
                                    }
                                    checkOHLCVMinute()
                                }
                            }

                            /* Reporting we are doing well */
                            let processingDate = new Date(candle.begin)
                            processingDate = processingDate.getUTCFullYear() + '-' + utilities.pad(processingDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(processingDate.getUTCDate(), 2);                            
                            heartBeatCounter--
                            if (heartBeatCounter <= 0) {
                                heartBeatCounter = 1440
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                                bot.processHeartBeat("Saving " + i.toFixed(0) + " / " + allOHLCVs.length + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well
                            }
                            /* End Reporting */

                            if (candleMinute === OHLCVMinute) {
                                candle.open = OHLCV.open 
                                candle.close = OHLCV.close 
                                candle.min = OHLCV.low 
                                candle.max = OHLCV.hight
                                volume.buy = OHLCV.volume / 2
                                volume.sell = OHLCV.volume / 2
                                i++
                            }
                            lastCandle = candle

                            if (needSeparator === false) {
                                needSeparator = true;
                                separator = '';
                            } else {
                                separator = ',';
                            }

                            /* Add the candle to the file content.*/

                            candlesFileContent = candlesFileContent + separator + '[' + candle.min + "," + candle.max + "," + candle.open + "," + candle.close + "," + candle.begin + "," + candle.end + "]";
                            volumesFileContent = volumesFileContent + separator + '[' + volume.buy + "," + volume.sell + "," + volume.begin + "," + volume.end + "]";

                            if (i === allOHLCVs.length) {
                                /* This was the last OHLCV, so we save the file.*/
                                saveFile(currentDay)
                                /* It might happen that there are several days after the last OHLCV without OHLCVs. We need to record empty files for them.*/
                                if (allOHLCVs.length < MAX_OHLCVs_PER_EXECUTION) {
                                    let currentTimeDay = Math.trunc((new Date()).valueOf() / ONE_DAY)
                                    if (currentTimeDay - currentDay > 1) {
                                        createMissingEmptyFiles(currentDay, currentTimeDay)
                                    }
                                }

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                                bot.processHeartBeat("Saving " + i.toFixed(0) + " / " + allOHLCVs.length  + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                                return
                            }
                        }

                        saveFile(currentDay)
                        previousDay = currentDay
                        if (error) {
                            callBackFunction(error);
                            return;
                        }

                        function saveFile(day) {
                            candlesFileContent = candlesFileContent + ']'
                            volumesFileContent = volumesFileContent + ']'
                            if (currentDay - previousDay > 1) {
                                createMissingEmptyFiles(previousDay, currentDay)
                            }
                            let fileName = bot.market.baseAsset + '_' + bot.market.quotedAsset + '.json'
                             
                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * ONE_DAY, CANDLES_FOLDER_NAME) + '/' + fileName, candlesFileContent + '\n', onFileCreated);

                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * ONE_DAY, VOLUMES_FOLDER_NAME) + '/' + fileName, volumesFileContent + '\n', onFileCreated);

                            candlesFileContent = '['
                            volumesFileContent = '['
                            needSeparator = false

                        }
                        function createMissingEmptyFiles(begin, end) {

                            /*
                            If this range is too wide, we will consider this means that the begin is before the begining of this market at this exchange.
                            In that case we will change the begin and the beginingOfMarket
                            */

                            if ((end - begin) > 7) {
                                begin = end
                                beginingOfMarket = new Date(end * ONE_DAY)
                            }

                            for (let j = begin + 1; j < end; j++) {
                                let fileName = bot.market.baseAsset + '_' + bot.market.quotedAsset + '.json'
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(j * ONE_DAY, CANDLES_FOLDER_NAME) + '/' + fileName, "[]" + '\n', onFileCreated);
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(j * ONE_DAY, VOLUMES_FOLDER_NAME) + '/' + fileName, "[]" + '\n', onFileCreated);
                            }
                        }
                        function onFileCreated(err) {
                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                error = err // This allows the loop to be breaked.
                                return;
                            }
                            filesCreated++
                            lastFile = new Date((currentDay * ONE_DAY))
                            if (filesCreated === filesToCreate) {
                                controlLoop()
                            }
                        }
                        function getFilePath(timestamp, folderName) {
                            let datetime = new Date(timestamp)
                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                utilities.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                utilities.pad(datetime.getUTCDate(), 2) 
                            let filePath = bot.filePathRoot + "/Output/" + folderName + '/' + dateForPath;
                            return filePath
                        }


                    }

                    function controlLoop() {
                        if (global.STOP_TASK_GRACEFULLY === true) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return
                        }

                        currentDay++
                        if (i < allOHLCVs.length) {
                            setImmediate(loop)
                        } else {
                            writeStatusReport()
                        }
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function writeStatusReport() {
                try {
                    if (lastFile === undefined) { return }
                    thisReport.file = {
                        lastFile: {
                            year: lastFile.getUTCFullYear(),
                            month: (lastFile.getUTCMonth() + 1),
                            days: lastFile.getUTCDate(),
                            hours: lastFile.getUTCHours(),
                            minutes: lastFile.getUTCMinutes()
                        },
                        beginingOfMarket: {
                            year: beginingOfMarket.getUTCFullYear(),
                            month: (beginingOfMarket.getUTCMonth() + 1),
                            days: beginingOfMarket.getUTCDate(),
                            hours: beginingOfMarket.getUTCHours(),
                            minutes: beginingOfMarket.getUTCMinutes()
                        },
                        uiStartDate: uiStartDate.toUTCString()
                    };

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
