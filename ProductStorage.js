
function newProductStorage(pName) {

    const CONSOLE_LOG = false;

    /*

    This object will initialize children objects that will end up loading the data of each set defined at each product of the bot received at initialization.
    Once all the underlaying objects are fully initialized it will callback.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user. 

    */

    let thisObject = {

        fileCache: undefined,
        fileCursorCache: undefined,
        file: undefined,

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

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        if (CONSOLE_LOG === true) {

            console.log("Product storage initialize for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

        }

        let dataSetsToLoad = 0;
        let dataSetsLoaded = 0;

        for (let i = 0; i < pProduct.dataSets.length; i++) {

            let thisSet = pProduct.dataSets[i];

            switch (thisSet.type) {
                case 'Market Files': {

                    thisObject.fileCache = newFileCache();
                    thisObject.fileCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onCacheFileReady);
                    dataSetsToLoad++;

                    if (CONSOLE_LOG === true) {

                        console.log("Product storage initialize Market Files for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                    }
                }
                    break;

                case 'Daily Files': {

                    thisObject.fileCursorCache = newFileCursorCache();
                    thisObject.fileCursorCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, pDatetime, pTimePeriod, onFileCursorReady);
                    dataSetsToLoad++;

                    if (CONSOLE_LOG === true) {

                        console.log("Product storage initialize Daily Files for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                    }
                }
                    break;

                case 'Single File': {

                    thisObject.file = newFile();
                    thisObject.file.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onSingleFileReady);
                    dataSetsToLoad++;

                    if (CONSOLE_LOG === true) {

                        console.log("Product storage initialize Single File for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                    }
                }
                    break;

                case 'File Sequence': {

                    thisObject.file = newFileSequence();
                    thisObject.file.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onSingleFileReady);
                    dataSetsToLoad++;

                    if (CONSOLE_LOG === true) {

                        console.log("Product storage initialize File Sequence for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                    }
                }
                    break;
            }

            function onCacheFileReady() {

                if (CONSOLE_LOG === true) {

                    console.log("Product storage initialize onCacheFileReady for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                }

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

                if (CONSOLE_LOG === true) {

                    console.log("Product storage initialize onFileCursorReady for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                }

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

                if (CONSOLE_LOG === true) {

                    console.log("Product storage initialize onSingleFileReady for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                }

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

            function checkInitializeComplete() {

                if (CONSOLE_LOG === true) {

                    console.log("Product storage initialize checkInitializeComplete for " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName);

                }

                if (dataSetsLoaded === dataSetsToLoad) {

                    callBackFunction();

                }
            }
        }
    }

    function setDatetime(pDatetime) {

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

