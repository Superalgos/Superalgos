function newAAMastersPlottersTradingSimulationFinalResults() {

    const MODULE_NAME = "Final Results Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,
        recalculateScale: recalculateScale,
        currentRecord: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let dataFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let singleFile;                      // This object will provide the different Market Files at different Time Periods.

    /* these are module specific variables: */

    let records = [];                   // Here we keep the records to be ploted every time the Draw() function is called by the AAWebPlatform.

    let imageStopLossPhase;
    let imageTakeProfitPhase;
    let imageRecord;

    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let filesUpdatedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */

            viewPort.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            viewPort.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            singleFile.eventHandler.stopListening(filesUpdatedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)

            /* icons */

            imageStopLossPhase = undefined;
            imageTakeProfitPhase = undefined;
            imageRecord = undefined;

            /* Destroy References */

            singleFile = undefined;

            datetime = undefined;
            timePeriod = undefined;

            dataFile = undefined;
            fileCursor = undefined;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            /* Store the information received. */

            singleFile = pStorage.singleFile;

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            dataFile = singleFile.getFile(timePeriod);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            filesUpdatedEventSubscriptionId = singleFile.eventHandler.listenToEvent("Files Updated", onFilesUpdated);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            /* Get ready for plotting. */

            recalculate();

            /* Ready for when dimmension changes. */

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculate();
            })

            callBackFunction();

        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function getContainer(point) {
        let container;
        /* First we check if this point is inside this space. */
        if (this.container.frame.isThisPointHere(point) === true) {
            return this.container;
        } else {
            /* This point does not belong to this space. */
            return undefined;
        }
    }

    function onFilesUpdated() {
        try {
            dataFile = singleFile.getFile(timePeriod);
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onFilesUpdated -> err = " + err.stack); }
        }
    }

    function setTimePeriod(pTimePeriod) {
        try {
            if (timePeriod !== pTimePeriod) {
                timePeriod = pTimePeriod;
                dataFile = singleFile.getFile(timePeriod);
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {
        datetime = pDatetime;
    }

    function draw() {
        try {
            // Nothing to draw for now
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err.stack); }
        }
    }

    function recalculate() {

        try {

            records = []

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Records Changed", records);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculate() {

        try {

            if (dataFile === undefined) { return; } // Initialization not complete yet.

            records = [];

            for (let i = 0; i < dataFile.length; i++) {

                let record = {};

                record.begin = dataFile[i][0];
                record.end = dataFile[i][1];
                record.type = dataFile[i][2];
                record.rate = dataFile[i][3];
                record.amount = dataFile[i][4];
                record.balanceA = dataFile[i][5];
                record.balanceB = dataFile[i][6];
                record.profit = dataFile[i][7];
                record.lastTradeProfitLoss = dataFile[i][8];
                record.stopLoss = dataFile[i][9];
                record.roundtrips = dataFile[i][10];
                record.hits = dataFile[i][11];
                record.fails = dataFile[i][12];
                record.hitRatio = dataFile[i][13];
                record.ROI = dataFile[i][14];
                record.periods = dataFile[i][15];
                record.days = dataFile[i][16];
                record.anualizedRateOfReturn = dataFile[i][17];
                record.sellRate = dataFile[i][18];
                record.lastTradeROI = dataFile[i][19];
                record.strategy = dataFile[i][20];
                record.strategyPhase = dataFile[i][21];
                record.takeProfit = dataFile[i][22];
                record.stopLossPhase = dataFile[i][23];
                record.takeProfitPhase = dataFile[i][24];
                record.positionSize = dataFile[i][26]; // 25 is the message for the executor
                record.initialBalanceA = dataFile[i][27];
                record.minimunBalanceA = dataFile[i][28];
                record.maximunBalanceA = dataFile[i][29];
                record.initialBalanceB = dataFile[i][30];
                record.minimunBalanceB = dataFile[i][31];
                record.maximunBalanceB = dataFile[i][32];
                record.baseAsset = dataFile[i][33];
                record.positionPeriods = dataFile[i][34];
                record.positionDays = dataFile[i][35];

                thisObject.currentRecord = record;
                thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentRecord);
            }

        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateScale() {
        try {
            // No scale needed
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> err = " + err.stack); }
        }
    }

    function plotChart() {
        try {
            let userPosition = getUserPosition()
            let userPositionDate = userPosition.point.x

            let record;

            /* Now we calculate and plot the records */
            for (let i = 0; i < records.length; i++) { // We do not start in 0 so as to be able to read the previous record i - 1

                record = records[i];

                /* Send the current record to the panel */

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    let eventRecords = {
                        currentRecord: record,
                        lastRecord: records[records.length - 1]
                    };
                    thisObject.container.eventHandler.raiseEvent("Current Record Changed", eventRecords);
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }

    function onZoomChanged(event) {
        try {
            recalculate();
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onZoomChanged -> err = " + err.stack); }
        }
    }

    function onOffsetChanged() {
        try {
            if (Math.random() * 100 > 95) {
                recalculate()
            };
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onOffsetChanged -> err = " + err.stack); }
        }
    }

    function onDragFinished() {
        try {
            recalculate();
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}





































