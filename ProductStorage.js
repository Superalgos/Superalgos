
function newProductStorage(pName) {

    const MODULE_NAME = "Product Storage";
    const FULL_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    /*

    This object will initialize children objects that will end up loading the data of each set defined at each product of the bot received at initialization.
    Once all the underlaying objects are fully initialized it will callback.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user. 

    */

    let thisObject = {

        fileCache: undefined,
        fileCursorCache: undefined,
        file: undefined,
        fileSequence: undefined,

        setDatetime: setDatetime,
        setTimePeriod: setTimePeriod,

        eventHandler: undefined,
        initialize: initialize

    }

    thisObject.eventHandler = newEventHandler();

    /* We name the event Handler to easy debugging. */

    thisObject.eventHandler.name = "Storage-" + pName;

    let datetime;
    let timePeriod;

    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
        if (FULL_LOG === true) { logger.write("[INFO] initialize -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        let dataSetsToLoad = 0;
        let dataSetsLoaded = 0;

        for (let i = 0; i < pProduct.dataSets.length; i++) {

            let thisSet = pProduct.dataSets[i];

            switch (thisSet.type) {
                case 'Market Files': {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> Market Files -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                    thisObject.fileCache = newFileCache();
                    thisObject.fileCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onCacheFileReady);
                    dataSetsToLoad++;
                }
                    break;

                case 'Daily Files': {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> Daily Files -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                    thisObject.fileCursorCache = newFileCursorCache();
                    thisObject.fileCursorCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, pDatetime, pTimePeriod, onFileCursorReady);
                    dataSetsToLoad++;
                }
                    break;

                case 'Single File': {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> Single File -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                    thisObject.file = newFile();
                    thisObject.file.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onSingleFileReady);
                    dataSetsToLoad++;
                }
                    break;

                case 'File Sequence': {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> File Sequence -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                    thisObject.fileSequence = newFileSequence();
                    thisObject.fileSequence.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onFileSequenceReady);
                    dataSetsToLoad++;
                }
                    break;
            }

            function onCacheFileReady() {

                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onCacheFileReady -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onCacheFileReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                let event = {
                    totalValue: thisObject.fileCache.getExpectedFiles(),
                    currentValue: thisObject.fileCache.getFilesLoaded()
                }

                thisObject.eventHandler.raiseEvent('Market File Loaded', event);

                if (event.currentValue === event.totalValue) {

                    dataSetsLoaded++;

                    checkInitializeComplete();
                }
            }

            function onFileCursorReady() {

                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileCursorReady -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileCursorReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                let event = {
                    totalValue: thisObject.fileCursorCache.getExpectedFiles(),
                    currentValue: thisObject.fileCursorCache.getFilesLoaded()
                }

                thisObject.eventHandler.raiseEvent('Daily File Loaded', event);

                if (event.currentValue === event.totalValue) {

                    dataSetsLoaded++;

                    checkInitializeComplete();
                }
            }

            function onSingleFileReady() {

                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onSingleFileReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                let event = {
                    totalValue: 1,
                    currentValue: 1
                }

                thisObject.eventHandler.raiseEvent('Single File Loaded', event);

                if (event.currentValue === event.totalValue) {

                    dataSetsLoaded++;

                    checkInitializeComplete();
                }
            }

            function onFileSequenceReady(err) {

                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                switch (err.result) {
                    case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received OK Response."); }
                        break;
                    }

                    case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received FAIL Response."); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received CUSTOM FAIL Response."); }
                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> err.message = " + err.message); }

                        callBackFunction(err);
                        return;
                    }

                    default: {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> onFileSequenceReady -> Received Unexpected Response."); }
                        callBackFunction(err);
                        return;
                    }
                }

                let event = {
                    totalValue: thisObject.fileSequence.getExpectedFiles(),
                    currentValue: thisObject.fileSequence.getFilesLoaded()
                }

                thisObject.eventHandler.raiseEvent('File Sequence Loaded', event);

                if (event.currentValue === event.totalValue) {

                    dataSetsLoaded++;

                    checkInitializeComplete();
                }
            }

            function checkInitializeComplete() {

                if (FULL_LOG === true) { logger.write("[INFO] checkInitializeComplete -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] checkInitializeComplete -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                if (dataSetsLoaded === dataSetsToLoad) {

                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);

                }
            }
        }
    }

    function setDatetime(pDatetime) {

        if (FULL_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        /* If there is a change in the day, then we take some actions, otherwise, we dont. */

        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS);
        let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS);

        datetime = pDatetime;

        if (currentDate !== newDate) {

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                thisObject.fileCursorCache.setDatetime(pDatetime);

            }
        }
    }

    function setTimePeriod(pTimePeriod) {

        if (FULL_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

        /* We are going to filter out the cases in which the timePeriod received is the same that the one we already know. */

        if (timePeriod !== pTimePeriod) {

            timePeriod = pTimePeriod;

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                if (thisObject.fileCursorCache !== undefined) {

                    thisObject.fileCursorCache.setTimePeriod(pTimePeriod, datetime);
                }
            }
        }
    }
}

