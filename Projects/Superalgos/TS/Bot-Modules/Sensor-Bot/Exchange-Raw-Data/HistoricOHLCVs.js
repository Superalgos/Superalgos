
exports.newSuperalgosBotModulesHistoricOHLCVs = function (processIndex) {

    const FULL_LOG = true;
    const GMT_SECONDS = ':00.000 GMT+0000';
    const MODULE_NAME = "Historic OHLCVs";
    const CANDLES_FOLDER_NAME = "Candles/One-Min";
    const VOLUMES_FOLDER_NAME = "Volumes/One-Min";

    thisObject = {
        initialize: initialize,
        start: start
    };

    
    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies

    const ONE_MIN = 60000
    const ONE_DAY = ONE_MIN * 60 * 24

    const MAX_OHLCVs_PER_EXECUTION = 10000000
    const symbol = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    const ccxt = require('ccxt')

    let fetchType = "by Time"
    let lastId
    let firstId
    let allOHLCVs = []
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let exchangeId
    let options = {}
    let rateLimit = 500
    let exchange
    let uiStartDate = new Date(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.config.startDate)
    let fisrtTimeThisProcessRun = false
    let limit = 1000 // This is the default value
    let hostname
    let lastCandleOfTheDay

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        let exchangeClass

        try {
            statusDependencies = pStatusDependencies;

            exchangeId = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name.toLowerCase().replace(' ', '')

            /* Applying the parameters defined by the user at the Exchange Node Config */
            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API !== undefined) {
                for (let i = 0; i < TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API.length; i++) {
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].method === 'fetch_ohlcv') {
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].class !== undefined) {
                            exchangeId = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].class
                        }
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].fetchOHLCVsMethod !== undefined) {
                            options = {
                                'fetchOHLCVsMethod': TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].fetchOHLCVsMethod
                            }
                        }
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].firstId !== undefined) {
                            firstId = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].firstId
                        }
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].rateLimit !== undefined) {
                            rateLimit = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].rateLimit
                        }
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].hostname !== undefined) {
                            hostname = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].hostname
                        }
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].fetchType !== undefined) {
                            fetchType = TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i].fetchType
                        }
                    }
                }
            }

            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.config.fetchLimit !== undefined) {
                limit = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.config.fetchLimit
            }

            let key 
            let secret 

            exchangeClass = ccxt[exchangeId]
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
            if (hostname !== undefined) {
                exchangeConstructorParams.hostname = hostname
            }

            exchange = new exchangeClass(exchangeConstructorParams)

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);

            /* CCXT Supported Exchanges */
            console.log('CCXT Library current supported exchanges:')
            for (const property in ccxt) {
                console.log(`${property}`);
            }
            console.log('For more info please check: https://github.com/ccxt/ccxt/wiki/Manual')
            console.log('Exchange Class ' + exchangeId)
            console.log(exchangeClass)

            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            let abort = false
            begin()

            async function begin() {

                getContextVariables()
                if (abort === true) { return }
                await getFirstId()
                await getOHLCVs()
                if (abort === true) { return }
                if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    return
                }
                await saveOHLCVs()
            }

            function getContextVariables() {

                try {
                    let reportKey;

                    reportKey = "Masters" + "-" + "Exchange-Raw-Data" + "-" + "Historic-OHLCVs"
                    if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.beginingOfMarket !== undefined) { // This means this is not the first time this process run.
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket.year + "-" + thisReport.file.beginingOfMarket.month + "-" + thisReport.file.beginingOfMarket.days + " " + thisReport.file.beginingOfMarket.hours + ":" + thisReport.file.beginingOfMarket.minutes + GMT_SECONDS);
                        lastFile = new Date(thisReport.file.lastFile.year + "-" + thisReport.file.lastFile.month + "-" + thisReport.file.lastFile.days + " " + thisReport.file.lastFile.hours + ":" + thisReport.file.lastFile.minutes + GMT_SECONDS);
                        lastId = thisReport.file.lastId
                        lastCandleOfTheDay = thisReport.file.lastCandleOfTheDay
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
                            fisrtTimeThisProcessRun = true
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
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
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
                    lastId = 0

                    return
                    /*
                    const limit = 1
                    const exchangeClass = ccxt[exchangeId]
                    const exchange = new exchangeClass({
                        'timeout': 30000,
                        'enableRateLimit': true,
                        verbose: false
                    })

                    const OHLCVs = await exchange.fetchOHLCV(symbol, '1m', since, limit, undefined)

                    let lastRecord = OHLCVs[OHLCVs.length - 1]
                    lastId = lastRecord.info[firstId]
                    */
                } catch (err) {
                    /* If something fails trying to get an id close to since, we just will continue without an id.*/
                }
            }

            async function getOHLCVs() {

                try {
                    let lastOHLCVKey = ''
                    let params = undefined
                    let previousSince
                    let fromDate = new Date(since)
                    let lastDate = new Date()

                    while (true) {

                        /* Reporting we are doing well */
                        function heartBeat(noNewInternalLoop) {
                            let processingDate = new Date(since)
                            processingDate = processingDate.getUTCFullYear() + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
                            if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> Fetching OHLCVs  @ " + processingDate + "-> exchange = " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit) }
                            let heartBeatText = "Fetching " + allOHLCVs.length.toFixed(0) + " OHLCVs from " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate
                            let currentDate = new Date(since)
                            let percentage = TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                            TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, heartBeatText, percentage) // tell the world we are alive and doing well
                            if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                                if (noNewInternalLoop !== true) {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.newInternalLoop(currentDate, percentage);
                                }
                            }
                        }

                        heartBeat()

                        /* Defining if we will query the exchange by Date or Id */
                        if (fetchType === "by Id") {
                            /*
                            params = {
                                'fromId': lastId
                            }
                            */
                            since = lastId
                        }

                        /* Fetching the OHLCVs from the exchange.*/
                        await new Promise(resolve => setTimeout(resolve, rateLimit)) // rate limit
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

                        if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched = " + OHLCVs.length) }
                        if (OHLCVs.length > 0) {
                            let beginDate = new Date(OHLCVs[0].timestamp)
                            let endDate = new Date(OHLCVs[OHLCVs.length - 1].timestamp)
                            if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched From " + beginDate + " -> timestamp = " + OHLCVs[0].timestamp) }
                            if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> getOHLCVs -> OHLCVs Fetched to " + endDate + " -> timestamp = " + OHLCVs[OHLCVs.length - 1].timestamp) }

                            if (fisrtTimeThisProcessRun === true) {
                                let OHLCV = OHLCVs[0]

                                initialProcessTimestamp = OHLCV[0]  // 'timestamp'
                                beginingOfMarket = new Date(Math.trunc(OHLCV[0] / ONE_DAY) * ONE_DAY)  // 'timestamp'
                                fromDate = new Date(beginingOfMarket.valueOf())
                                fisrtTimeThisProcessRun = false
                            }
                        }

                        if (OHLCVs.length > 1) {
                            previousSince = since
                            since = OHLCVs[OHLCVs.length - 1][0] // 'timestamp'
                            if (since === previousSince) {
                                since++ // this prevents requesting in a loop OHLCVs with the same timestamp, that can happen when all the records fetched comes with exactly the same timestamp.
                            }


                            lastId = OHLCVs[OHLCVs.length - 1]['id']

                            for (let i = 0; i < OHLCVs.length; i++) {

                                let OHLCV = OHLCVs[i]

                                let OHLCVKey = OHLCV[0] + '-' + OHLCV[1].toFixed(16) + '-' + OHLCV[2].toFixed(16) + '-' + OHLCV[3].toFixed(16) + '-' + OHLCV[4].toFixed(16) + '-' + OHLCV[5].toFixed(16)
                                if (OHLCVKey !== lastOHLCVKey) {
                                    allOHLCVs.push(OHLCV)
                                }
                                lastOHLCVKey = OHLCVKey
                            }

                            heartBeat(true)
                        }

                        if (
                            OHLCVs.length < limit - 1 ||
                            TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true ||
                            allOHLCVs.length >= MAX_OHLCVs_PER_EXECUTION
                        ) {
                            break
                        }
                    }
                } catch (err) {
                    if (err.stack.toString().indexOf('ERR_RATE_LIMIT') >= 0) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is saying you are requesting data too often. I will retry the request later, no action is required. To avoid this happening again please increase the rateLimit at the Exchange node config. You might continue seeing this if you are retrieving data from multiple markets at the same time. In this case I tried to get 1 min OHLCVs from " + symbol);
                        return
                    }

                    if (err.stack.toString().indexOf('RequestTimeout') >= 0) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is not responding at the moment. I will save the data already fetched and try to reconnect later to fetch the rest of the missing data.");
                        return
                    }

                    if (err.stack.toString().indexOf('ExchangeNotAvailable') >= 0) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is not available at the moment. I will save the data already fetched and try to reconnect later to fetch the rest of the missing data.");
                        return
                    }

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> getOHLCVs -> Retrying Later -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                    abort = true
                    return
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
                    let headOfTheMarketReached = false

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
                    lastId = undefined

                    if (lastCandleOfTheDay !== undefined) {
                        lastCandle = JSON.parse(JSON.stringify(lastCandleOfTheDay))
                    }

                    controlLoop()

                    function loop() {

                        let filesToCreate = 0
                        let filesCreated = 0

                        /* Go through all possible 1 min candles of a day. */
                        for (let j = 0; j < 60 * 24; j++) {

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

                            let processingDate = new Date(candle.begin)
                            processingDate = processingDate.getUTCFullYear() + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);

                            if (candle.begin > (new Date()).valueOf()) {
                                /* We stop when the current candle is pointing to a time in the future.*/
                                headOfTheMarketReached = true
                                saveFile(currentDay)

                                if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> Before Fetch -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                                TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + i.toFixed(0) + " / " + allOHLCVs.length + " OHLCVs from " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well

                                /* We exit the loop and we aint comming back*/
                                return
                            }

                            let OHLCV = { // these values should be overrided unless there are no OHLVCs fetched from the exchange.
                                timestamp: (new Date()).valueOf() + ONE_MIN,
                                open: 0,
                                hight: 0,
                                low: 0,
                                close: 0,
                                volume: 0
                            }

                            let record = allOHLCVs[i]

                            if (record !== undefined) { // can be undefined if there is no candle fetched from the exchange
                                OHLCV = {
                                    timestamp: record[0],
                                    open: record[1],
                                    hight: record[2],
                                    low: record[3],
                                    close: record[4],
                                    volume: record[5]
                                }
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
                                    if (i >= allOHLCVs.length - 1) {
                                        /* We run out of OHLCVs, we can not move to the next OHLCV, we leave this function. */
                                        return
                                    }

                                    i++
                                    record = allOHLCVs[i]
                                    OHLCV = {
                                        timestamp: record[0],
                                        open: record[1],
                                        hight: record[2],
                                        low: record[3],
                                        close: record[4],
                                        volume: record[5],
                                        id: record[6]
                                    }
                                    checkOHLCVMinute()
                                }
                            }

                            /* Reporting we are doing well */
                            heartBeatCounter--
                            if (heartBeatCounter <= 0) {
                                heartBeatCounter = 1440
                                if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> After Fetch -> Saving OHLCVs  @ " + processingDate + " -> i = " + i + " -> total = " + allOHLCVs.length) }
                                TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + i.toFixed(0) + " / " + allOHLCVs.length + " OHLCVs from " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well
                            }
                            /* End Reporting */

                            if (candleMinute === OHLCVMinute) {
                                candle.open = OHLCV.open
                                candle.close = OHLCV.close
                                candle.min = OHLCV.low
                                candle.max = OHLCV.hight
                                volume.buy = OHLCV.volume / 2
                                volume.sell = OHLCV.volume / 2

                                if (i < allOHLCVs.length - 1) {
                                    i++
                                }

                                lastId = OHLCV.id

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

                            /* We store the last candle of the day in order to have a previous candles during next execution. */
                            if (j === 1440 - 1) {
                                lastCandleOfTheDay = JSON.parse(JSON.stringify(candle))
                            }
                        }

                        previousDay = currentDay

                        if (i > 0) { // Only start saving at the day of the first candle.
                            saveFile(currentDay)
                            return
                        }

                        controlLoop()

                        function saveFile(day) {
                            candlesFileContent = candlesFileContent + ']'
                            volumesFileContent = volumesFileContent + ']'

                            let fileName = 'Data.json'

                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * ONE_DAY, CANDLES_FOLDER_NAME) + '/' + fileName, candlesFileContent + '\n', onFileCreated);

                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * ONE_DAY, VOLUMES_FOLDER_NAME) + '/' + fileName, volumesFileContent + '\n', onFileCreated);

                            candlesFileContent = '['
                            volumesFileContent = '['
                            needSeparator = false

                        }

                        function onFileCreated(err) {
                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
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
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                TS.projects.superalgos.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                            let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + folderName + '/' + dateForPath;
                            return filePath
                        }
                    }

                    function controlLoop() {
                        if (TS.projects.superalgos.globals.taskVariables.IS_TASK_STOPPING === true) {
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                            return
                        }

                        if (error) {
                            callBackFunction(error);
                            return;
                        }

                        currentDay++

                        /*
                        One possible exit is when we reached the amount of candles downloaded. This not necesary happens at the end of the market
                        if the process was canceled for any reason at the middle.
                        */

                        if (i >= allOHLCVs.length - 1) {
                            writeStatusReport()
                            if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> controlLoop -> Exit because i reached the end of the candles array. ") }
                            return
                        }


                        /* The natural exit is at the end of the market */
                        if (headOfTheMarketReached === false) {
                            setImmediate(loop)
                        } else {
                            if (FULL_LOG === true) { TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[INFO] start -> saveOHLCVs -> controlLoop -> Exit because we reached the end of the market. ") }
                            writeStatusReport()
                        }
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
                        uiStartDate: uiStartDate.toUTCString(),
                        lastCandleOfTheDay: lastCandleOfTheDay
                    };

                    if (fetchType === "by Id") {
                        thisReport.file.lastId = lastId
                    }

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
