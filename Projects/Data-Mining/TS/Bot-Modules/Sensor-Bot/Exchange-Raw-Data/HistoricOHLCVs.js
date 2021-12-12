exports.newDataMiningBotModulesHistoricOHLCVs = function (processIndex) {

    const MODULE_NAME = "Historic OHLCVs";
    const CANDLES_FOLDER_NAME = "Candles/One-Min";
    const VOLUMES_FOLDER_NAME = "Volumes/One-Min";
    const OHLCVS_FOLDER_NAME = "OHLCVs/One-Min";

    let thisObject = {
        initialize: initialize,
        start: start
    };

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies

    const MAX_OHLCVs_PER_EXECUTION = 10000000
    const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
    const ccxt = SA.nodeModules.ccxt
    /*
    This next is required when using an exchange that uses fetchTrades in place of fetchOHLCVs
    in order to be able to access the method that builds the OHLCVs, and this method is inside the CCTX library.
    */
    const ccxtMisc = SA.nodeModules.ccxtMisc

    let fetchType = "by Time"
    let lastId
    let firstId
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let exchangeId
    let options = {}
    let rateLimit = 500
    let exchange
    let uiStartDate = new Date(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.startDate)
    let firstTimeThisProcessRun = false
    let limit = 1000 // This is the default value
    let hostname
    let lastCandleOfTheDay
    /*
    The following variables are used for exchanges that do not provide any method in their API to retrieve OHLCV data.
    In the CCTX library, such exchanges have the fetchOHLCV method as being "emulated", and as such, you can only
    retrieve raw trade data using the fetchTrades method, and then you have to manually aggregate the received trades
    into OHLCV data.
    An example of such an exchange is Luno (codeName:luno).
    To ensure that the code for other exchanges is not impacted, it is necessary to add into the desired exchange's
    UI API settings, the two items shown below.  It is also important to set the "rateLimit" in the API correctly to
    match what the exchange is prepared to offer when fetching trades. Furthermore, the "limit" in the API also needs
    to be set to a value that allows the UI to update at regular intervals (e.g. 200).  Finally, do not forget to put
    in the UI API settings the "method": "fetch_ohlcv", otherwise none of these other settings will work !

    useFetchTradesForFetchOHLCVs - this must be set to true to indicate that the code will be using fetchTrades instead
                                   of fetchOHLCVs (or similar exchange-specific method).
    maxTradesPerFetch - this is set to a number that indicates the maximum number of trades the exchange will return in
                        the fetchTrades method (e.g. for the Luno exchange, this number is 100).
    */
    let useFetchTradesForFetchOHLCVs = false
    let maxTradesPerFetch = 100

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        let exchangeClass
        /*
        This is what we are going to do hereL

        1. Parameters set by SA user at the Crypto Exchange node are extracted. There might be parameters for each supported method at the CCXT library.
        2. The CCXT class for the configured exchange is instantiated, with whatever options where configured.

        This gives the SA user a lot of control over the underlying CCXT gateway to exchanges.
        */
        try {
            statusDependencies = pStatusDependencies;

            exchangeId = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName
		/*
		maxRate - sets the  maximum number of OHCLV that is pulled before the data is saved.
		This is only to be used when the exchange is kicking out the data-mine randomly and alows the user to
		save the data more often allowing for the data mining to move forward.
		*/
		maxRate = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.maxRate

            /* Applying the parameters defined by the user at the Exchange Node Config */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API !== undefined) {
                /*
                The config allows us to define for the API different parameters for different
                methods calls. At this point we are only interested in the parameters for the
                fetch_ohlcv method, so we ignore the rest.
                */
                for (let i = 0; i < TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API.length; i++) {
                    let API = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.API[i]
                    if (API.method === 'fetch_ohlcv') {
                        if (API.class !== undefined) {
                            exchangeId = API.class
                        }
                        if (API.fetchOHLCVsMethod !== undefined) {
                            options = {
                                'fetchOHLCVsMethod': API.fetchOHLCVsMethod
                            }
                        }
                        if (API.firstId !== undefined) {
                            firstId = API.firstId
                        }
                        if (API.rateLimit !== undefined) {
                            rateLimit = API.rateLimit
                        }
                        if (API.limit !== undefined) {
                            limit = API.limit
                        }
                        if (API.hostname !== undefined) {
                            hostname = API.hostname
                        }
                        if (API.fetchType !== undefined) {
                            fetchType = API.fetchType
                        }
                        if (API.useFetchTradesForFetchOHLCVs !== undefined) {
                            useFetchTradesForFetchOHLCVs = API.useFetchTradesForFetchOHLCVs
                            if (API.maxTradesPerFetch !== undefined) {
                                maxTradesPerFetch = API.maxTradesPerFetch
                            }
                        }
                    }
                }
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

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);

            /* CCXT Supported Exchanges */
            console.log('CCXT Library current supported exchanges:')
            for (const property in ccxt) {
                console.log(`${property}`);
            }
            console.log('For more info please check: https://github.com/ccxt/ccxt/wiki/Manual')
            console.log('Exchange Class ' + exchangeId)
            console.log(exchangeClass)

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {
            /* 
            Initialize the array where we are going to receive the 
            data from the exchange. 
            */
            let rawDataArray = []
            let mustLoadRawData = false

            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
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
                if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    return
                }
                await saveOHLCVs()
            }

            function getContextVariables() {

                try {
                    let reportKey

                    reportKey = 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependency Status Report is corrupt. ");
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    /* Check if the uiStartDate is Invalid, if so lets set it to the Epoch and let the getMarketStart function later take care of it */
                    if(isNaN(uiStartDate)) {
                        uiStartDate = new Date(0)
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.beginingOfMarket !== undefined) { // This means this is not the first time this process has run.
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket.year + "-" + thisReport.file.beginingOfMarket.month + "-" + thisReport.file.beginingOfMarket.days + " " + thisReport.file.beginingOfMarket.hours + ":" + thisReport.file.beginingOfMarket.minutes + SA.projects.foundations.globals.timeConstants.GMT_SECONDS);
                        lastFile = new Date(thisReport.file.lastFile.year + "-" + thisReport.file.lastFile.month + "-" + thisReport.file.lastFile.days + " " + thisReport.file.lastFile.hours + ":" + thisReport.file.lastFile.minutes + SA.projects.foundations.globals.timeConstants.GMT_SECONDS);
                        lastId = thisReport.file.lastId
                        lastCandleOfTheDay = thisReport.file.lastCandleOfTheDay
                    } else {  // This means this is the first time this process has run.
                        firstTimeThisProcessRun = true
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
                            firstTimeThisProcessRun = true
                            beginingOfMarket = new Date(uiStartDate.valueOf())
                        } else {
                            if (lastFile !== undefined) {
                                since = lastFile.valueOf()
                                initialProcessTimestamp = lastFile.valueOf()
                                if (thisReport.file.mustLoadRawData !== undefined) {
                                    mustLoadRawData = thisReport.file.mustLoadRawData
                                }
                            } else {
                                since = uiStartDate.valueOf()
                                initialProcessTimestamp = uiStartDate.valueOf()
                            }
                        }
                        if (mustLoadRawData) {  // there is raw data to load
                            getRawDataArray()   // so fetch it from the file where it was saved on the last run of this process
                        }
                        function getRawDataArray() {
                            mustLoadRawData = false
                            let fileName = "Data.json"
                            let datetime = new Date(lastFile.valueOf())
                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + OHLCVS_FOLDER_NAME + '/' + dateForPath;
                            let fullFileName = filePath + '/' + fileName
                            fileStorage.getTextFile(fullFileName, onFileReceived)

                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getRawDataArray -> from file = " + fullFileName)

                            function onFileReceived(err, text) {
                                try {
                                    if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        try {
                                            rawDataArray = JSON.parse(text);
                                            let dataLength = rawDataArray.length
                                            if (dataLength > 1) {
                                                since = rawDataArray[dataLength - 2][0]  // set the beginning of the fetch back to the start of the second last ohlcv received
                                                rawDataArray.pop()  // ditch the last ohlcv received since it may be incomplete
                                            } else {
                                                rawDataArrayFile = []  // we got less than two ohlcvs so we might as well start again from the beginning of the day
                                            }
                                        } catch (err) {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> getRawDataArray -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN] start -> getRawDataArray -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                            return
                                        }
                                    } else {
                                        if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN] start -> getRawDataArray -> onFileReceived -> File not found -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN] start -> getRawDataArray -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                            return
                                        } else {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR] start -> getRawDataArray -> onFileReceived -> Error Received -> err = " + err.stack)
                                            callBackFunction(err);
                                            return
                                        }
                                    }
                                } catch (err) {
                                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> getRawDataArray -> onFileReceived -> err = " + err.stack);
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                    }
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
                    let changeToMarketStart = false

                    while (true) {

                        let invalidSince = false

                        /* Reporting we are doing well */
                        function heartBeat(noNewInternalLoop) {
                            let processingDate = new Date(since)
                            processingDate = processingDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getOHLCVs -> Fetching OHLCVs  @ " + processingDate + "-> exchange = " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " -> symbol = " + symbol + " -> since = " + since + " -> limit = " + limit)
                            let heartBeatText = "Fetching " + rawDataArray.length.toFixed(0) + " OHLCVs from " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate
                            let currentDate = new Date(since)
                            let percentage = TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, heartBeatText, percentage) // tell the world we are alive and doing well
                            if (TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                                if (noNewInternalLoop !== true) {
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage);
                                }
                            }
                        }

                        /* Defining if we will query the exchange by Date or Id */
                        if (fetchType === "by Id") {
                            /*
                            params = {
                                'fromId': lastId
                            }
                            */
                            since = lastId
                        }

                        /*
                        If this is the first time the process has run, check if to see if the start date the user
                        has entered is before the start of the Market on the Exchange. If this is the case, jump
                        forward to the start date of the Market.
                         */
                        if(firstTimeThisProcessRun && changeToMarketStart === false && useFetchTradesForFetchOHLCVs === false) {
                            let marketStartSince

                            marketStartSince = await findMarketStart()

                            if (initialProcessTimestamp < marketStartSince) {
                                since = marketStartSince
                                fromDate = new Date(since)
                                changeToMarketStart = true
                            }
                        }

                        heartBeat()

                        /* Fetching the OHLCVs from the exchange.*/
                        await new Promise(resolve => setTimeout(resolve, rateLimit)) // rate limit
                        const OHLCVs = useFetchTradesForFetchOHLCVs ?
                            await fetchTradesForOHLCV(symbol, '1m', since, limit, params) :
                            await exchange.fetchOHLCV(symbol, '1m', since, limit, params)


                        if (OHLCVs.length === 0 && new Date(since).valueOf() !== (new Date).setSeconds(0,0)) {

                            /*
                            If OHLCVs is empty and we're not at the current minute we might
                            be dealing with extended maintenance longer than our OHLCV limit.
                            If this is the case jump forward to the next valid OHLCV record.
                             */

                            since = await findNextValidOHLCV()
                        }

                        /*
                        CCXT for certain Exchanges will return an empty or partial array if the since date is too
                        far in the past if this occurs this function will recursively step backwards in the Exchange
                        and Market in 1D intervals until it finds the earliest date with values.
                        */

                        async function findMarketStart() {

                            let earliestMarketSince = undefined
                            let foundDate = false
                            let searchSize = limit
                            let previousMarketSince = undefined
                            while (foundDate !== true) {

                                await new Promise(resolve => setTimeout(resolve, rateLimit)) // rate limit
                                const earlyOHLCVs = useFetchTradesForFetchOHLCVs ?
                                    await fetchTradesForOHLCV(symbol, '1d', earliestMarketSince, searchSize, params) :
                                    await exchange.fetchOHLCV(symbol, '1d', earliestMarketSince, searchSize, params)

                                if (earlyOHLCVs.length === searchSize && previousMarketSince !== earlyOHLCVs[0][0]) { // If array is full, and the date returned isn't the same then we are still working in valid data, search further back
                                    earliestMarketSince = (earlyOHLCVs[0][0] - (SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS * searchSize))
                                    previousMarketSince = earlyOHLCVs[0][0]

                                } else if (earlyOHLCVs.length === searchSize && previousMarketSince === earlyOHLCVs[0][0]) { // If array is full, but the first OHLCV date is the same as last time then we've found our Market Start
                                    foundDate = true
                                    invalidSince = true
                                    return earlyOHLCVs[0][0]

                                } else if (earlyOHLCVs.length < searchSize && earlyOHLCVs.length > 0) { // If the array is partially filled then, take the earliest data and we've found our Market Start
                                    foundDate = true
                                    invalidSince = true
                                    return earlyOHLCVs[0][0]

                                } else if ((earlyOHLCVs.length === 0 && searchSize !== 1)) { // If array is empty, we've gone too far, half the search size and retry
                                    earliestMarketSince = (earliestMarketSince + (SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS * searchSize))
                                    if (searchSize > 1) {
                                        searchSize = Math.floor(searchSize / 2)
                                    }

                                } else { // Otherwise, the array is empty and we're at the lowest searchSize then we've found our Market Start
                                    foundDate = true
                                    invalidSince = true
                                    return earliestMarketSince

                                }

                                let processingDate = new Date(earliestMarketSince)
                                processingDate = processingDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "Invalid or No Start Date. Finding Market Start @ " + processingDate, 0)
                            }
                        }

                        /*
                        CCXT will return an empty array if there are no OHLCVs for the limit.
                        This can happen when the Exchange has extended maintenance i.e. over
                        1,000 minutes (example see Binance on 2018-02-08). This function will
                        return the next valid returned OHLCV.
                        */

                        async function findNextValidOHLCV() {

                            let foundDate = false

                            while (foundDate !== true) {

                                if (new Date(since).valueOf() >= (new Date).setSeconds(0,0)) {
                                    return OHLCVs
                                }

                                await new Promise(resolve => setTimeout(resolve, rateLimit)) // rate limit
                                const nextValidOHLCVs = useFetchTradesForFetchOHLCVs ?
                                    await fetchTradesForOHLCV(symbol, '1m', since, limit, params) :
                                    await exchange.fetchOHLCV(symbol, '1m', since, limit, params)

                                if (nextValidOHLCVs.length === 0) {
                                    since = (since + (SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * limit))

                                } else {
                                    foundDate = true
                                    invalidSince = true
                                    return nextValidOHLCVs[0][0]
                                }

                                let processingDate = new Date(since)
                                processingDate = processingDate.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "No Data Found. Fast-Forwarding to Next Data @ " + processingDate, 0)
                            }
                        }

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

                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getOHLCVs -> OHLCVs Fetched = " + OHLCVs.length)
                        if (OHLCVs.length > 0) {
                            let beginDate = new Date(OHLCVs[0][0])
                            let endDate = new Date(OHLCVs[OHLCVs.length - 1][0])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getOHLCVs -> OHLCVs Fetched From " + beginDate + " -> timestamp = " + OHLCVs[0][0])
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getOHLCVs -> OHLCVs Fetched to " + endDate + " -> timestamp = " + OHLCVs[OHLCVs.length - 1][0])

                            if (firstTimeThisProcessRun === true) {
                                let OHLCV = OHLCVs[0]

                                initialProcessTimestamp = OHLCV[0]  // 'timestamp'
                                beginingOfMarket = new Date(Math.trunc(OHLCV[0] / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)  // 'timestamp'
                                fromDate = new Date(beginingOfMarket.valueOf())
                                firstTimeThisProcessRun = false
                            }

                            previousSince = since
                            since = OHLCVs[OHLCVs.length - 1][0] // 'timestamp'
                            if (since === previousSince) {
                                since++ // this prevents requesting in a loop OHLCVs with the same timestamp, that can happen when all the records fetched come with exactly the same timestamp.
                            }

                            lastId = OHLCVs[OHLCVs.length - 1]['id']

                            for (let i = 0; i < OHLCVs.length; i++) {

                                let OHLCV = OHLCVs[i]

                                let OHLCVKey = OHLCV[0] + '-' + OHLCV[1].toFixed(16) + '-' + OHLCV[2].toFixed(16) + '-' + OHLCV[3].toFixed(16) + '-' + OHLCV[4].toFixed(16) + '-' + OHLCV[5].toFixed(16)
                                if (OHLCVKey !== lastOHLCVKey) {
                                    rawDataArray.push(OHLCV)
                                }
                                lastOHLCVKey = OHLCVKey
                            }

                            heartBeat(true)
                        }

                        let currentDate = new Date(since)

                        /*
			maxRate - sets the  maximum number of OHCLV that is pulled before the data is saved.
			maxRate should only be used when the exchange is kicking out the data-mine randomly and alows the user to
			save the data more often allowing for the data mining to move forward.
                        Check if we don't have a maxRate parameter and use global parameter instead
                        */
                        if (!maxRate) {
                            maxRate = MAX_OHLCVs_PER_EXECUTION
                        }

                        /*
                        If we've pulled less OHLCVs than the limit, this either means:
                        (1) we reached the current date and are now pulling the latest
                        (2) there was exchange maintenance on the date being processed
                        (3) we've found zero records as the start date was way in the past

                        If (1) is the case, or if we're stopping the task or have hit the max
                        limit. then break and stop till the next loop.
                         */
                        if (
                            (OHLCVs.length < limit - 1 && invalidSince === false && TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date())) ||
                            TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true ||
                            rawDataArray.length >= MAX_OHLCVs_PER_EXECUTION
                        ) {
                            break
                        }
                    }
                } catch (err) {
                    if (err.stack.toString().indexOf('ERR_RATE_LIMIT') >= 0) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is saying you are requesting data too often. I will retry the request later, no action is required. To avoid this happening again please increase the rateLimit at the Exchange node config. You might continue seeing this if you are retrieving data from multiple markets at the same time. In this case I tried to get 1 min OHLCVs from " + symbol);
                        return
                    }

                    if (err.stack.toString().indexOf('RequestTimeout') >= 0) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is not responding at the moment. I will save the data already fetched and try to reconnect later to fetch the rest of the missing data.");
                        return
                    }

                    if (err.stack.toString().indexOf('ExchangeNotAvailable') >= 0) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getOHLCVs -> Retrying Later -> The Exchange " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " is not available at the moment. I will save the data already fetched and try to reconnect later to fetch the rest of the missing data.");
                        return
                    }

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getOHLCVs -> Retrying Later -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                    abort = true
                    return
                }
            }

            async function fetchTradesForOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
                let ohlcvcArray = []  //  the array where the trades will be accumulated into ohlcvs
                let startOfFetchTrades = since
                let endOfFetchTrades
                if (lastFile === undefined) {
                    endOfFetchTrades = (Math.trunc(since / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
                } else {
                    endOfFetchTrades = lastFile.valueOf()
                }
                endOfFetchTrades += SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                while (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING !== true) {
                    var trades = await exchange.fetchTrades(symbol, startOfFetchTrades, limit, params)
                    if (trades.length > 0) {
                        let lastRetrievedTrade = trades[trades.length - 1]
                        startOfFetchTrades = lastRetrievedTrade.timestamp + 1
                        const ohlcvc = ccxtMisc.buildOHLCVC (trades, timeframe, since, limit)
                        ohlcvcArray = ohlcvcArray.concat(ohlcvc)  //  add the latest ohlcvs to the accumulation array
                        if (startOfFetchTrades > endOfFetchTrades) {
                            break  //  end of the day
                        } else {
                            if (trades.length < maxTradesPerFetch) {
                                break  //  end of the market
                            } else {
                                if (ohlcvcArray.length > limit) {
                                    break  //  got enough ohlcvs for this process loop
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, rateLimit))  //  wait for exchange's rateLimit before requesting again
                                }
                            }
                        }
                    } else {
                        break  //  exchange has no more trades
                    }
                }
                return ohlcvcArray.map ((c) => c.slice (0, -1))
            }

            async function saveOHLCVs() {
                /* 
                What we are going to do in this function is to save all the candles 
                received from the exchange. We need to partition the batch of candles
                into 1 day files. At the same time we need to take care of the situation
                that some exchanges send inconsistent data. We have detected some cases
                where candles do not begin at second 0 of the minute but are a little
                bit shifted. We will try to detect this and fix it as we go. 

                We have the data received from the exchange at the array rawDataArray
                */
                try {

                    let candlesFileContent = '['
                    let volumesFileContent = '['
                    let needSeparator = false
                    let error
                    let separator
                    let heartBeatCounter = 0
                    let savingProcedureFinished = false
                    let endOfTheOHLCVArrayReached = false
                    let currentDay = Math.trunc((initialProcessTimestamp - SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

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

                    let ohlcvArrayIndex = 0
                    lastId = undefined

                    if (lastCandleOfTheDay !== undefined) {
                        lastCandle = JSON.parse(JSON.stringify(lastCandleOfTheDay))
                    }

                    /* 
                    At a macro level, we will be creating one file per day, so we will
                    run into a loop that each run will represent one day.
                    */
                    controlLoop()

                    function loop() {
                        /*
                        Here we will try to match the OHLCVs received with each possible
                        candle of a single day.
                        */

                        let filesToCreate = 0
                        let filesCreated = 0

                        /* 
                        We will loop around all the possible 1 minute candles that have been found
                        on a single day. For each minute of the day, we will try to find
                        the matching OHLCV. This would be an easy task if the exchanges 
                        would always return consistent data, but that is not the case.
                        Sometimes, some candles are missing. We have seen also candles that
                        do not start at an UTC minute, they are shifted in time some seconds. 
                        In order to address all these inconsistencies the process gets a little 
                        bit complicated.
                        */
                        for (let minuteOfTheDay = 0; minuteOfTheDay < 60 * 24; minuteOfTheDay++) {

                            /* 
                            We initialize our candle and volume objecs positioning them
                            at the current minute of the day of the current day. We also
                            initialize them with the last candle and volume property values.
                            The reason we do this last thing is because we don't know if 
                            we are going to find or not a matching OHLCV. If we do find one
                            these property values will be overwritten, and if not, they will 
                            hold at least the last know value.
                            */
                            let candle = {
                                begin: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay,
                                end: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS - 1,
                                open: lastCandle.close,
                                close: lastCandle.close,
                                min: lastCandle.close,
                                max: lastCandle.close
                            }

                            let volume = {
                                begin: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay,
                                end: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS - 1,
                                buy: lastVolume.buy,
                                sell: lastVolume.sell
                            }

                            /* 
                            Here we will check that the current candle is not going into the future.
                            Remember we are looping around all possible minutes of a day, and when 
                            that day is the current actual day, and the current minute is in the future,
                            it make no more sense to continue inside this loop since we are not going
                            to find more OHLCVs matchings.

                            At the same time, we are going to check that we haven't processed the whole
                            OHLCV array. Once we reached the end of it, it makes no sense to continue
                            inside this loop.
                            */
                            if (
                                candle.begin > (new Date()).valueOf() ||
                                endOfTheOHLCVArrayReached === true
                            ) {
                                /* We stop when the current candle is pointing to a time in the future.*/
                                savingProcedureFinished = true
                                /* 
                                This will be our last file saved.
                                */
                                saveFile(currentDay)

                                /*
                                We will produce our last log and heartbeat, since we have just 
                                reached the head of the market.
                                */
                                logAndHeartBeat()

                                /* We exit the loop and we ain't coming back*/
                                return
                            }

                            /* 
                             We initialize here the OHLCV object. These initial 
                             values should be overridden unless there are no 
                             OHLVCs fetched from the exchange. We need the 
                             timestamp in order to calculate OHLCVMinute.
                            */
                            let OHLCV = {
                                timestamp: (new Date()).valueOf() + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS,
                                open: 0,
                                hight: 0,
                                low: 0,
                                close: 0,
                                volume: 0
                            }

                            let record = rawDataArray[ohlcvArrayIndex]

                            /* 
                            We will check that we can have a record to 
                            analyze. It might happen that we don't have one
                            in the situation that we could not get a single
                            record from the exchange. We still want to be
                            here so that everything is properly logged.
                            */
                            if (record !== undefined) {
                                OHLCV = {
                                    timestamp: record[0],
                                    open: record[1],
                                    hight: record[2],
                                    low: record[3],
                                    close: record[4],
                                    volume: record[5]
                                }
                            }

                            let candleMinute = Math.trunc(candle.begin / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                            let OHLCVMinute
                            /*
                            Some exchanges return inconsistent data. It is not guaranteed 
                            that each candle will have a timeStamp exactly at the beginning of an
                            UTC minute. It is also not guaranteed that the distance
                            between timestamps will be the same. To fix this, we will do this.
                            */

                            OHLCVMinute = Math.trunc(OHLCV.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)

                            /*
                            If the minute of the record item received from the exchange is
                            less than the minute of the current minute in our loop, 
                            that means that we need to reposition the inded at the rawDataArray 
                            array, moving it one record forward, and that is what we are
                            doing here. 
                            */
                            while (OHLCVMinute < candleMinute) {

                                /* Move forward at the rawDataArray array. */
                                ohlcvArrayIndex++

                                /* Check that we have not passed the end of the array */
                                if (ohlcvArrayIndex > rawDataArray.length - 1) {
                                    /* 
                                    We run out of OHLCVs, we can not move to the next OHLCV, 
                                    we need to leave this loop. 
                                    */
                                    break
                                }

                                record = rawDataArray[ohlcvArrayIndex]

                                /*
                                Once this loop is broken, this is the OHLCV that needs 
                                to be considered. All the ones in the past are ignored.
                                */
                                OHLCV = {
                                    timestamp: record[0],
                                    open: record[1],
                                    hight: record[2],
                                    low: record[3],
                                    close: record[4],
                                    volume: record[5],
                                    id: record[6]
                                }

                                /* Recalculate this to see if we need to break the loop*/
                                OHLCVMinute = Math.trunc(OHLCV.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                            }

                            /*
                            If the candleMinute and the OHLCVMinute matches, then
                            we transfer the properties of the OHLCV into the 
                            candle object and the volume object. Two things to 
                            consider here:

                            1. If they do not match, at this point it could only means
                            that the OHLCVMinute is in the future, in which case the
                            candle and volume will keep their initialization values
                            which in turn are equal to the latest candle and volumes.
                            
                            2. They might be equal even though the OHLCV timestamp
                            did not match exactly the UTC minute, but since we are 
                            comparing truncated values, then we force the matching
                            and we correct the shifting in time that sometimes happens
                            with exchange data.
                            */
                            if (candleMinute === OHLCVMinute) {
                                candle.open = OHLCV.open
                                candle.close = OHLCV.close
                                candle.min = OHLCV.low
                                candle.max = OHLCV.hight
                                volume.buy = OHLCV.volume / 2
                                volume.sell = OHLCV.volume / 2

                                /* 
                                Since we extracted this OHLCV value, we move 
                                forward our array index.
                                */
                                if (ohlcvArrayIndex < rawDataArray.length - 1) {
                                    ohlcvArrayIndex++
                                } else {
                                    endOfTheOHLCVArrayReached = true
                                }

                                lastId = OHLCV.id
                            }

                            /*
                            Here we remember the last candle and volume, in case
                            we need it.
                            */
                            lastCandle = candle
                            lastVolume = volume

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
                            if (minuteOfTheDay === 1440 - 1) {
                                lastCandleOfTheDay = JSON.parse(JSON.stringify(candle))
                            }

                            /* Reporting we are doing well */
                            heartBeatCounter--
                            if (heartBeatCounter <= 0) {
                                heartBeatCounter = 1440
                                logAndHeartBeat()
                            }

                            function logAndHeartBeat() {
                                /* We need the processing date for logging purposes only */
                                let processingDate = new Date(candle.begin)
                                processingDate =
                                    processingDate.getUTCFullYear() + '-' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);

                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> saveOHLCVs -> Before Fetch -> Saving OHLCVs  @ " + processingDate + " -> ohlcvArrayIndex = " + ohlcvArrayIndex + " -> total = " + rawDataArray.length)
                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + (ohlcvArrayIndex + 1).toFixed(0) + " / " + rawDataArray.length + " OHLCVs from " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well                                
                            }
                        }

                        /* 
                        When the bot is processing historical information, it
                        happens that during the whole processing of one day
                        it did not reach either the head of the market (a future time)
                        nor the end of the Raw Data Array. In this situation
                        we still need to save the full day of content, and 
                        we do it only if at least one candle has been processed.
                        */
                        if (ohlcvArrayIndex > 0) {
                            saveFile(currentDay)
                            return
                        }

                        controlLoop()

                        function saveFile(day) {
                            candlesFileContent = candlesFileContent + ']'
                            volumesFileContent = volumesFileContent + ']'
                            ohlcvsFileContent = getRawDataToSave(day)

                            let fileName = 'Data.json'

                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, CANDLES_FOLDER_NAME) + '/' + fileName, candlesFileContent + '\n', onFileCreated);

                            filesToCreate++
                            fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, VOLUMES_FOLDER_NAME) + '/' + fileName, volumesFileContent + '\n', onFileCreated);

                            if (ohlcvsFileContent !== undefined) {
                                filesToCreate++
                                fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, OHLCVS_FOLDER_NAME) + '/' + fileName, ohlcvsFileContent + '\n', onFileCreated);
                                mustLoadRawData = true
                            } else {
                                mustLoadRawData = false
                            }

                            candlesFileContent = '['
                            volumesFileContent = '['
                            needSeparator = false
                        }

                        function getRawDataToSave(day) {
                            /*
                            What we are doing here is determining whether the currently accumulated raw OHCLV's should be saved or not,
                            so that the next time the bot process runs, it must continue from where the raw OHLCV's ended.
                            If the current end of the array contains elements beyond the day being processed, it means that the full
                            day has been successfully downloaded, so it is not necessary to save this data.
                            */
                            let rawDataFileData
                            let dataLength = rawDataArray.length
                            if (dataLength > 0) {
                                // first get the start of the day after this day we are checking
                                let timestamp = (day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) +
                                    SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                if (rawDataArray[dataLength - 1][0] < timestamp) {
                                    // there is no data for the next day, so now trim this day's data to remove anything before it
                                    timestamp -= SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                    let dataIndex = 0
                                    while (dataIndex < dataLength - 1) {
                                        if (rawDataArray[dataIndex][0] < timestamp) {  // this data is from a previous day
                                            dataIndex++
                                        } else {
                                            break  // found the beginning of this day's data
                                        }
                                    }
                                    if (dataIndex > 0) {
                                        rawDataArray = rawDataArray.slice(dataIndex, dataLength)  // remove data from previous days
                                        dataLength = rawDataArray.length
                                    }
                                    if (dataLength > 0) {
                                        rawDataFileData = JSON.stringify(rawDataArray)  // finally we have what we need to save
                                    }
                                }
                            }
                            return rawDataFileData
                        }

                        function onFileCreated(err) {
                            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                error = err // This allows the loop to be broken.
                                return;
                            }
                            filesCreated++
                            lastFile = new Date((currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS))
                            if (filesCreated === filesToCreate) {
                                controlLoop()
                            }
                        }

                        function getFilePath(timestamp, folderName) {
                            let datetime = new Date(timestamp)
                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + folderName + '/' + dateForPath;
                            return filePath
                        }
                    }

                    function controlLoop() {
                        /* 
                        This loop advances one day, and if it does not need to stop
                        for any reason, it will execute the loop function so as to process
                        the next day. 
                        */
                        currentDay++

                        /*
                        It might have happened that the User is stopping the Task. If that
                        is the case, we need to stop this processing here.
                        */
                        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                            return
                        }

                        /* 
                        If we had any problem saving the latest file, we will also abort 
                        this process here, so that we can record our progress until it stopped
                        working.
                        */
                        if (error) {
                            callBackFunction(error);
                            return;
                        }

                        /*
                        One possible exit is when we reached the amount of candles downloaded. 
                        This does not necessary happens at the end of the market
                        if the process was canceled for any reason at the middle, 
                        or the exchange became unavailable.
                        */
                        if (ohlcvArrayIndex >= rawDataArray.length - 1) {
                            writeStatusReport()
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> saveOHLCVs -> controlLoop -> Exit because i reached the end of the rawDataArray array. ")
                            return
                        }

                        /* 
                        The most common exit is at the end of the market. There is 
                        nothing else to save, so we finish here. 
                        */
                        if (savingProcedureFinished === true) {
                            writeStatusReport()
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> saveOHLCVs -> controlLoop -> Exit because we reached the end of the market. ")
                            return
                        }

                        /*
                        If there is no reason to exit, we will process the next day.
                        */
                        setImmediate(loop)
                    }

                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
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
                        lastCandleOfTheDay: lastCandleOfTheDay,
                        mustLoadRawData: mustLoadRawData
                    };

                    if (fetchType === "by Id") {
                        thisReport.file.lastId = lastId
                    }

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
};
