
function newProductStorage(name) {
    const MODULE_NAME = 'Product Storage'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    /*

    This object will initialize children objects that will end up loading the data of each set defined at each product of the bot received at initialization.
    Once all the underlying objects are fully initialized it will callback.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user.

    Product Storage
         |
         |-----> SingleFile
         |
         |-----> FileSequence
         |
         |-----> DailyFiles  -----> FileCursor
         |
         |-----> MarketFiles

    */

    let thisObject = {
        eventHandler: undefined,
        marketFiles: [],
        dailyFiles: [],
        singleFile: [],
        fileSequences: [],
        setDatetime: setDatetime,
        setTimeFrame: setTimeFrame,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.eventHandler = newEventHandler()

    /* We name the event Handler to easy debugging. */

    thisObject.eventHandler.name = 'Storage-' + name

    let datetime
    let timeFrame

    return thisObject

    function finalize() {
        try {
            for (let i = 0; i < thisObject.marketFiles.length; i++) {
                let marketFile = thisObject.marketFiles[i]
                marketFile.finalize()
            }

            thisObject.marketFiles = undefined

            for (let i = 0; i < thisObject.dailyFiles.length; i++) {
                let dailyFile = thisObject.dailyFiles[i]
                dailyFile.finalize()
            }

            thisObject.dailyFiles = undefined

            for (let i = 0; i < thisObject.fileSequences.length; i++) {
                let fileSequence = thisObject.fileSequences[i]
                fileSequence.finalize()
            }

            thisObject.fileSequences = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
        }
    }

    function initialize(mine, bot, session, product, exchange, market, pDatetime, pTimeFrame, host, port, eventsServerClient, callBackFunction, scheme='http') {
        try {
            datetime = pDatetime
            timeFrame = pTimeFrame

            let dataSetsToLoad = 0
            let dataSetsLoaded = 0

            for (let i = 0; i < product.datasets.length; i++) {
                let dataset = product.datasets[i]

                switch (dataset.config.type) {
                    case 'Market Files': {
                        dataSetsToLoad++

                        let marketFiles = newMarketFiles()
                        marketFiles.initialize(mine, bot, session, product, dataset, exchange, market, host, port, eventsServerClient, onMarketFileReady, scheme)
                        thisObject.marketFiles.push(marketFiles)
                    }
                        break

                    case 'Daily Files': {
                        dataSetsToLoad++

                        let dailyFiles = newDailyFiles()
                        dailyFiles.initialize(mine, bot, session, product, dataset, exchange, market, pDatetime, pTimeFrame, host, port, eventsServerClient, onDailyFileReady, scheme)
                        thisObject.dailyFiles.push(dailyFiles)
                    }
                        break

                    case 'Single File': {
                        dataSetsToLoad++

                        let singleFile = newSingleFile()
                        singleFile.initialize(mine, bot, session, product, dataset, exchange, market, host, port, eventsServerClient, onSingleFileReady, scheme)
                        thisObject.singleFile.push(singleFile)
                    }
                        break

                    case 'File Sequence': {
                        dataSetsToLoad++

                        let fileSequences = newFileSequence()
                        fileSequences.initialize(mine, bot, session, product, dataset, exchange, market, host, port, eventsServerClient, onFileSequenceReady, scheme)
                        thisObject.fileSequences.push(fileSequences)
                    }
                        break
                    default:
                        if (ERROR_LOG === true) { logger.write('[WARN] initialize -> dataset with no type defined or type not supported -> dataset.config.type = ' + dataset.config.type) }
                }

                function onMarketFileReady(err, pCaller) {
                    try {
                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                                break
                            }
                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                                return
                            }
                        }
                        let event = {
                            totalValue: pCaller.getExpectedFiles(),
                            currentValue: pCaller.getFilesLoaded(),
                            filesNotLoaded: pCaller.getFilesNotLoaded()
                        }

                        thisObject.eventHandler.raiseEvent('Market File Loaded', event)

                        if (event.filesNotLoaded === event.totalValue) {
                            dataSetsToLoad--
                            checkInitializeComplete()
                            return
                        }

                        if (event.currentValue + event.filesNotLoaded === event.totalValue) {
                            dataSetsLoaded++
                            checkInitializeComplete()
                        }
                    } catch (err) {
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    }
                }

                function onDailyFileReady(err, pCaller) {
                    try {
                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                                break
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                                return
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                                if (err.message === 'Dataset Unavailable.') {
                                    dataSetsToLoad--
                                    checkInitializeComplete()
                                    return
                                } else {
                                    callBackFunction(err)
                                    return
                                }
                            }
                            default: {
                                callBackFunction(err)
                                return
                            }
                        }

                        let event = {
                            totalValue: pCaller.getExpectedFiles(),
                            currentValue: pCaller.getFilesLoaded()
                        }

                        thisObject.eventHandler.raiseEvent('Daily File Loaded', event)

                        if (event.currentValue === event.totalValue) {
                            dataSetsLoaded++
                            checkInitializeComplete()
                        }
                    } catch (err) {
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    }
                }

                function onSingleFileReady(err, pCaller) {
                    try {
                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                                break
                            }

                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                                return
                            }

                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                                callBackFunction(err)
                                return
                            }

                            default: {
                                callBackFunction(err)
                                return
                            }
                        }
                        let event = {
                            totalValue: 1,
                            currentValue: 1
                        }
                        thisObject.eventHandler.raiseEvent('Single File Loaded', event)

                        if (event.currentValue === event.totalValue) {
                            dataSetsLoaded++
                            checkInitializeComplete()
                        }
                    } catch (err) {
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    }
                }

                function onFileSequenceReady(err, pCaller) {
                    try {
                        switch (err.result) {
                            case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                                break
                            }
                            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                                return
                            }
                            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {
                                callBackFunction(err)
                                return
                            }
                            default: {
                                callBackFunction(err)
                                return
                            }
                        }
                        let event
                        if (pCaller !== undefined) {
                            event = {
                                totalValue: pCaller.getExpectedFiles(),
                                currentValue: pCaller.getFilesLoaded()
                            }
                        } else { // When there are no data the reference to the caller wont arrive here.
                            event = {
                                totalValue: 1,
                                currentValue: 1
                            }
                        }

                        thisObject.eventHandler.raiseEvent('File Sequence Loaded', event)

                        if (event.currentValue === event.totalValue) {
                            dataSetsLoaded++
                            checkInitializeComplete()
                        }
                    } catch (err) {
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    }
                }

                function checkInitializeComplete() {
                    try {
                        if (dataSetsLoaded === dataSetsToLoad) {
                            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
                        }
                    } catch (err) {
                        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> checkInitializeComplete -> err = ' + err.stack) }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                    }
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
    }

    function setDatetime(pDatetime) {
        /* If there is a change in the day, then we take some actions, otherwise, we dont. */

        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS)
        let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS)

        datetime = new Date(pDatetime)

        if (currentDate !== newDate) {
            if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
                for (let i = 0; i < thisObject.dailyFiles.length; i++) {
                    thisObject.dailyFiles[i].setDatetime(pDatetime)
                }
            }
        }
    }

    function setTimeFrame(pTimeFrame) {
        /* We are going to filter out the cases in which the timeFrame received is the same that the one we already know. */

        if (timeFrame !== pTimeFrame) {
            timeFrame = pTimeFrame

            if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
                for (let i = 0; i < thisObject.dailyFiles.length; i++) {
                    thisObject.dailyFiles[i].setTimeFrame(pTimeFrame, datetime)
                }
            }
        }
    }
}
