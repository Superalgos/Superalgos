
function newStorage() {

    /*

    This object will initialize children objects that will end up loading the data of each set defined at each product of the bot received at initialization.
    Once all the underlaying objects are fully initialized it will callback.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user. 

    */

    thisObject = {

        fileCache: undefined,
        fileCursorCache: undefined,
        file: undefined,

        eventHandler: undefined,
        initialize: initialize

    }

    thisObject.eventHandler = newEventHandler();
            
    return thisObject;

}

function initialize(pDevTeam, pBot, pProduct, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

    /* We name the event Handler to easy debugging. */

    thisObject.eventHandler.name = "Storage" + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName

    let dataSetsToLoad = 0;
    let dataSetsLoaded = 0;

    for (i = 0; i < pProduct.sets.length; i++) {

        let thisSet = pProduct.sets[i];

        switch (thisSet.type) {
            case 'Market Files': {

                thisObject.fileCache = newFileCache();
                thisObject.fileCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onCacheFileReady);
                dataSetsToLoad++;

            }
                break;

            case 'Daily Files': {

                thisObject.fileCursorCache = newFileCursorCache();
                thisObject.fileCursorCache.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, pDatetime, pTimePeriod, onFileCursorReady);
                dataSetsToLoad++;

            }
                break;

            case 'Single File': {

                thisObject.file = newFile();
                thisObject.file.initialize(pDevTeam, pBot, pProduct, thisSet, pExchange, pMarket, onSingleFileReady);
                dataSetsToLoad++;

            }
                break;

        }
    }

    function onCacheFileReady() {

        let event = {
            totalValue: thisObject.fileCache.getExpectedFiles(),
            currentValue: thisObject.fileCache.getFilesLoaded()
        }

        thisObject.eventHandler.raiseEvent('Storage File Ready', event);

        if (event.currentValue === event.totalValue) {

            dataSetsLoaded++;

            checkInitializeComplete();
        }
    }

    function onFileCursorReady() {

        let event = {
            totalValue: thisObject.fileCursorCache.getExpectedFiles(),
            currentValue: thisObject.fileCursorCache.getFilesLoaded()
        }

        thisObject.eventHandler.raiseEvent('Storage File Ready', event);

        if (event.currentValue === event.totalValue) {

            dataSetsLoaded++;

            checkInitializeComplete();
        }
    }

    function onSingleFileReady() {

        let event = {
            totalValue: 1,
            currentValue: 1
        }

        thisObject.eventHandler.raiseEvent('Storage File Ready', event);

        if (event.currentValue === event.totalValue) {

            dataSetsLoaded++;

            checkInitializeComplete();
        }
    }

    function checkInitializeComplete() {

        if (dataSetsLoaded === dataSetsToLoad) {

            callBackFunction();

        }
    }
}