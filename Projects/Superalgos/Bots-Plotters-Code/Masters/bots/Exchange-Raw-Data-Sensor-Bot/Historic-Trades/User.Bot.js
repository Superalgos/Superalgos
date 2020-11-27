
exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, FILE_STORAGE, STATUS_REPORT, EXCHANGE_API) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const MODULE_NAME = "User Bot";
    const TRADES_FOLDER_NAME = "Trades";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger);
    let statusDependencies

    const ONE_MINUTE = 60000
    const MAX_TRADES_PER_EXECUTION = 100000
    const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
    const ccxt = require('ccxt')

    let allTrades = []
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFileSaved
    let exchangeId 
    let options = {}
    let fetchType = "by Time"
    let lastId
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
            if (bot.exchangeNode.config.API !== undefined) {
                for (let i = 0; i < bot.exchangeNode.config.API.length; i++) {
                    if (bot.exchangeNode.config.API[i].method === 'fetchTrades') {
                        if (bot.exchangeNode.config.API[i].class !== undefined) {
                            exchangeId = bot.exchangeNode.config.API[i].class
                        }
                        if (bot.exchangeNode.config.API[i].fetchType !== undefined) {
                            fetchType = bot.exchangeNode.config.API[i].fetchType
                        }
                        if (bot.exchangeNode.config.API[i].fetchTradesMethod !== undefined) {
                            options = {
                                'fetchTradesMethod': bot.exchangeNode.config.API[i].fetchTradesMethod
                            }
                        }
                        if (bot.exchangeNode.config.API[i].firstId !== undefined) {
                            firstId = bot.exchangeNode.config.API[i].firstId
                        }
                        if (bot.exchangeNode.config.API[i].rateLimit !== undefined) {
                            rateLimit = bot.exchangeNode.config.API[i].rateLimit
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

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            if (global.STOP_TASK_GRACEFULLY === true) {
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            let abort = false
            begin()

            async function begin() {

                getContextVariables()
                if (abort === true) { return }
                await getFirstId()
                await getTrades()
                if (abort === true) { return}
                if (global.STOP_TASK_GRACEFULLY === true) {
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    return
                }
                await saveTrades()
            }

            function getContextVariables() {

                try {
                    let reportKey;

                    reportKey = "Masters" + "-" + "Exchange-Raw-Data" + "-" + "Historic-Trades" 
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.beginingOfMarket !== undefined) { // This means this is not the first time this process run.
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket.year + "-" + thisReport.file.beginingOfMarket.month + "-" + thisReport.file.beginingOfMarket.days + " " + thisReport.file.beginingOfMarket.hours + ":" + thisReport.file.beginingOfMarket.minutes + GMT_SECONDS);
                        lastFileSaved = new Date(thisReport.file.lastFileSaved.year + "-" + thisReport.file.lastFileSaved.month + "-" + thisReport.file.lastFileSaved.days + " " + thisReport.file.lastFileSaved.hours + ":" + thisReport.file.lastFileSaved.minutes + GMT_SECONDS);
                        lastId = thisReport.file.lastId
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
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            async function getFirstId() {
                try {
                    /* We need the first id only when we are going to fetch trades based on id and it is the first time the process runs*/
                    if (fetchType !== "by Id") { return }
                    if (lastId !== undefined) { return }

                    const limit = 1
                    const exchangeClass = ccxt[exchangeId]
                    const exchange = new exchangeClass({
                        'timeout': 30000,
                        'enableRateLimit': true,
                        verbose: false
                    })

                    const trades = await exchange.fetchTrades(symbol, since, limit, undefined)

                    let lastRecord = trades[trades.length - 1]
                    lastId = lastRecord.info[firstId] 
                } catch (err) {
                    /* If something fails trying to get an id close to since, we just will continue without an id.*/
                }
            }

            async function getTrades() {

                try {
                    let lastTradeKey = ''
                    let params = undefined
                    let previousSince

                    while (true) {

                        /* Reporting we are doing well */
                        let processingDate = new Date(since)
                        processingDate = processingDate.getUTCFullYear() + '-' + utilities.pad(processingDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(processingDate.getUTCDate(), 2);
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getTrades -> Fetching Trades  @ " + processingDate + "-> exchange = " + bot.exchange + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit ) }
                        bot.processHeartBeat("Fetching " + allTrades.length.toFixed(0) + " trades from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                        if (fetchType === "by Id") {
                            params = {
                                'fromId': lastId 
                            }
                            since = undefined
                        }

                        /* Fetching the trades from the exchange.*/
                        const trades = await exchange.fetchTrades(symbol, since, limit, params)

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getTrades -> Trades Fetched = " + trades.length) }
                        if (trades.length > 0) {
                            let beginDate = new Date(trades[0].timestamp)
                            let endDate = new Date(trades[trades.length - 1].timestamp)
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getTrades -> Trades Fetched From " + beginDate) }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getTrades -> Trades Fetched to " + endDate) }
                        }

                        if (trades.length > 1) {
                            previousSince = since
                            since = trades[trades.length - 1]['timestamp']
                            if (since === previousSince) { 
                                since++ // this prevents requesting in a loop trades with the same timestamp, that can happen when all the records fetched comes with exactly the same timestamp.
                            }

                            lastId = trades[trades.length - 1]['id']

                            for (let i = 0; i < trades.length; i++) {
                                let trade = trades[i]
                                let tradeKey = trade.id + '-' + trade.timestamp + '-' + trade.side + '-' + trade.price.toFixed(16) + '-' + trade.amount.toFixed(16)
                                if (tradeKey !== lastTradeKey) {
                                    allTrades.push([trade.timestamp, trade.side, trade.price, trade.amount, trade.id])
                                }
                                lastTradeKey = tradeKey
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getTrades -> Fetching Trades  @ " + processingDate + "-> exchange = " + bot.exchange + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit) }
                            bot.processHeartBeat("Fetching " + allTrades.length.toFixed(0) + " trades from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                        }

                        if (
                            trades.length < limit - 1 ||
                            global.STOP_TASK_GRACEFULLY === true ||
                            allTrades.length >= MAX_TRADES_PER_EXECUTION
                            ) {
                            break
                        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getTrades -> Retrying Later -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                    abort = true
                }
            }

            async function saveTrades() {

                try {

                    let fileContent = '['
                    let previousRecordMinute = Math.trunc((initialProcessTimestamp - ONE_MINUTE) / ONE_MINUTE)  
                    let currentRecordMinute
                    let needSeparator = false
                    let error
                    let separator
                    let heartBeatCounter = 0

                    let i = -1
                    lastId = undefined
                    controlLoop()

                    function loop() {

                        let filesToCreate = 0
                        let filesCreated = 0

                        let record = allTrades[i]
                        let trade = {
                            timestamp: record[0],
                            side: record[1],
                            price: record[2],
                            amount: record[3]
                        }

                        if (lastId === undefined) {
                            lastId = record[4]
                        }

                        let processingDate = new Date(trade.timestamp)
                        processingDate = processingDate.getUTCFullYear() + '-' + utilities.pad(processingDate.getUTCMonth() + 1, 2) + '-' + utilities.pad(processingDate.getUTCDate(), 2);

                        /* Reporting we are doing well */
                        heartBeatCounter--
                        if (heartBeatCounter <= 0) {
                            heartBeatCounter = 1000
                             if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveTrades -> Saving Trades  @ " + processingDate + " -> i = " + i + " -> total = " + allTrades.length) }
                            bot.processHeartBeat("Saving " + i.toFixed(0) + " trades from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well
                        }

                        /* Saving the trades in Files*/
                        currentRecordMinute = Math.trunc(trade.timestamp / ONE_MINUTE)

                        if (
                            currentRecordMinute !== previousRecordMinute
                        ) {
                            /* There are no more trades at this minute or it is the last trade, so we save the file.*/
                            saveFile(previousRecordMinute)
                            lastId = undefined
                        }

                        if (needSeparator === false) {
                            needSeparator = true;
                            separator = '';
                        } else {
                            separator = ',';
                        }

                        /* Add the trade to the file content.*/
                        fileContent = fileContent + separator + '[' + trade.timestamp + ',"' + trade.side + '",' + trade.price + ',' + trade.amount + ']';

                        if (i === allTrades.length - 1) {
                            /* This is the last trade, so we save the file.*/
                            saveFile(currentRecordMinute)
                            /* It might happen that there are several minutes after the last trade without trades. We need to record empty files for them.*/
                            if (allTrades.length < MAX_TRADES_PER_EXECUTION) {
                                let currentTimeMinute = Math.trunc((new Date()).valueOf() / ONE_MINUTE)
                                if (currentTimeMinute - currentRecordMinute > 1) {
                                    createMissingEmptyFiles(currentRecordMinute, currentTimeMinute)
                                }
                            }

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> saveTrades -> Saving Trades  @ " + processingDate + " -> i = " + i + " -> total = " + allTrades.length) }
                            bot.processHeartBeat("Saving " + i.toFixed(0) + " trades from " + bot.exchange + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                            return
                        }
                        previousRecordMinute = currentRecordMinute
                        if (error) {
                            callBackFunction(error);
                            return;
                        }
                        if (filesToCreate === 0) {
                            controlLoop()
                        }
                        function saveFile(minute) {
                            fileContent = fileContent + ']'
                            if (currentRecordMinute - previousRecordMinute > 1) {
                                createMissingEmptyFiles(previousRecordMinute, currentRecordMinute)
                            }
                            let fileName =  'Data.json'
                            if (previousRecordMinute >= initialProcessTimestamp / ONE_MINUTE) {
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(minute * ONE_MINUTE) + '/' + fileName, fileContent + '\n', onFileCreated);
                            }
                            fileContent = '['
                            needSeparator = false

                        }
                        function createMissingEmptyFiles(begin, end) {

                            /*
                            If this range is too wide, we will consider this means that the begin is before the begining of this market at this exchange.
                            In that case we will change the begin and the beginingOfMarket
                            */

                            if ((end - begin) / 60 / 24 > 7) {
                                begin = end
                                beginingOfMarket = new Date(end * ONE_MINUTE)
                            }

                            for (let j = begin + 1; j < end; j++) {
                                let fileName =  'Data.json'
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(j * ONE_MINUTE) + '/' + fileName, "[]" + '\n', onFileCreated);

                            }
                        }
                        function onFileCreated(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] start -> tradesReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                error = err // This allows the loop to be breaked.
                                return;
                            }
                            filesCreated++
                            lastFileSaved = new Date((currentRecordMinute * ONE_MINUTE))
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
                            let filePath = bot.filePathRoot + "/Output/" + TRADES_FOLDER_NAME + '/' + dateForPath;
                            return filePath
                        }


                    }
                    function controlLoop() {
                        if (global.STOP_TASK_GRACEFULLY === true) {
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                            return
                        }

                        i++
                        if (i < allTrades.length) {
                            setImmediate(loop)
                        } else {
                            writeStatusReport()
                        }
                    }
 
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> saveTrades -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function writeStatusReport() {
                try {
                    if (lastFileSaved === undefined) {return}
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

                    if (fetchType === "by Id") {
                        thisReport.file.lastId = lastId
                    }

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
