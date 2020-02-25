
exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage, STATUS_REPORT, EXCHANGE_API) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const MODULE_NAME = "User Bot";
    const OHLCVs_FOLDER_NAME = "OHLCVs";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger)
    let statusDependencies

    const ONE_DAY = 60000 * 24
    const MAX_OHLCVs_PER_EXECUTION = 100000
    const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
    const ccxt = require('ccxt')

    let allOHLCVs = []
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFileSaved
    let exchangeId
    let options = {}
    let firstId
    let rateLimit
    let exchange
    let uiStartDate = new Date(bot.uiStartDate)

    const limit = 1000

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
                        lastFileSaved = new Date(thisReport.file.lastFileSaved.year + "-" + thisReport.file.lastFileSaved.month + "-" + thisReport.file.lastFileSaved.days + " " + thisReport.file.lastFileSaved.hours + ":" + thisReport.file.lastFileSaved.minutes + GMT_SECONDS);
                    } else {  // This means this is the first time this process run.
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
                            if (lastFileSaved !== undefined) {
                                since = lastFileSaved.valueOf()
                                initialProcessTimestamp = lastFileSaved.valueOf()
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
                        const OHLCVs = await exchange.fetchOHLCVs(symbol, '1m', since, limit, params)

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

                    let fileContent = '['
                    let previousRecordDay = Math.trunc((initialProcessTimestamp - ONE_DAY) / ONE_DAY)
                    let currentRecordDay
                    let needSeparator = false
                    let error
                    let separator
                    let heartBeatCounter = 0

                    let i = -1

                    controlLoop()

                    function loop() {

                        let filesToCreate = 0
                        let filesCreated = 0

                        let record = allOHLCVs[i]
                        let OHLCV = {
                            timestamp: record[0],
                            open: record[1],
                            hight: record[2],
                            low: record[3],
                            close: record[4],
                            volume: record[5]
                        }

                        let processingDate = new Date(OHLCV.timestamp)
                        processingDate = processingDate.getUTCFullYear() + '-' + utilities.pad(processingDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(processingDate.getUTCDate(), 2);

                        /* Reporting we are doing well */
                        heartBeatCounter--
                        if (heartBeatCounter <= 0) {
                            heartBeatCounter = 1000
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                            bot.processHeartBeat("Saving " + i.toFixed(0) + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well
                        }

                        /* Saving the OHLCVs in Files*/
                        currentRecordDay = Math.trunc(OHLCV.timestamp / ONE_DAY)

                        if (
                            currentRecordDay !== previousRecordDay
                        ) {
                            /* There are no more OHLCVs at this minute or it is the last OHLCV, so we save the file.*/
                            saveFile(previousRecordDay)
                        }

                        if (needSeparator === false) {
                            needSeparator = true;
                            separator = '';
                        } else {
                            separator = ',';
                        }

                        /* Add the OHLCV to the file content.*/

                        let candle = {
                            begin: timestamp,
                            end: timestamp + 60000 - 1,
                            open: OHLCV.open,
                            close: OHLCV.close,
                            min: OHLCV.low,
                            max: OHLCV.hight
                        }

                        fileContent = fileContent + separator + '[' + candle.min + "," + candle.max + "," + candle.open + "," + candle.close + "," + candle.begin + "," + candle.end + "]";

                        if (i === allOHLCVs.length - 1) {
                            /* This is the last OHLCV, so we save the file.*/
                            saveFile(currentRecordDay)
                            /* It might happen that there are several days after the last OHLCV without OHLCVs. We need to record empty files for them.*/
                            if (allOHLCVs.length < MAX_OHLCVs_PER_EXECUTION) {
                                let currentTimeDay = Math.trunc((new Date()).valueOf() / ONE_DAY)
                                if (currentTimeDay - currentRecordDay > 1) {
                                    createMissingEmptyFiles(currentRecordDay, currentTimeDay)
                                }
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                            bot.processHeartBeat("Saving " + i.toFixed(0) + " OHLCVs from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                            return
                        }
                        previousRecordDay = currentRecordDay
                        if (error) {
                            callBackFunction(error);
                            return;
                        }
                        if (filesToCreate === 0) {
                            controlLoop()
                        }
                        function saveFile(day) {
                            fileContent = fileContent + ']'
                            if (currentRecordDay - previousRecordDay > 1) {
                                createMissingEmptyFiles(previousRecordDay, currentRecordDay)
                            }
                            let fileName = bot.market.baseAsset + '_' + bot.market.quotedAsset + '.json'
                            if (previousRecordDay >= initialProcessTimestamp / ONE_DAY) {
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(day * ONE_DAY) + '/' + fileName, fileContent + '\n', onFileCreated);
                            }
                            fileContent = '['
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
                                fileStorage.createTextFile(getFilePath(j * ONE_DAY) + '/' + fileName, "[]" + '\n', onFileCreated);

                            }
                        }
                        function onFileCreated(err) {
                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                error = err // This allows the loop to be breaked.
                                return;
                            }
                            filesCreated++
                            lastFileSaved = new Date((currentRecordDay * ONE_DAY))
                            if (filesCreated === filesToCreate) {
                                controlLoop()
                            }
                        }
                        function getFilePath(timestamp) {
                            let datetime = new Date(timestamp)
                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                utilities.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                utilities.pad(datetime.getUTCDate(), 2) + '/' +
                                utilities.pad(datetime.getUTCHours(), 2) + '/' +
                                utilities.pad(datetime.getUTCMinutes(), 2)
                            let filePath = bot.filePathRoot + "/Output/" + OHLCVs_FOLDER_NAME + '/' + dateForPath;
                            return filePath
                        }


                    }
                    function controlLoop() {
                        if (global.STOP_TASK_GRACEFULLY === true) {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return
                        }

                        i++
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
                    if (lastFileSaved === undefined) { return }
                    thisReport.file = {
                        lastFileSaved: {
                            year: lastFileSaved.getUTCFullYear(),
                            month: (lastFileSaved.getUTCMonth() + 1),
                            days: lastFileSaved.getUTCDate(),
                            hours: lastFileSaved.getUTCHours(),
                            minutes: lastFileSaved.getUTCMinutes()
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
