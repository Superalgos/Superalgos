function newAAMastersPlottersTradingSimulationTradingSimulation() {

    const MODULE_NAME = "Simulation Plotter";
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

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded,

        // Secondary functions and properties.

        currentRecord: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Periods.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let records = [];                   // Here we keep the records to be ploted every time the Draw() function is called by the AAWebPlatform.

    let imageStopLossPhase;
    let imageTakeProfitPhase;
    let imageRecord;

    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */

            viewPort.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            viewPort.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
            marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId);
            dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId);

            /* icons */

            imageStopLossPhase = undefined;
            imageTakeProfitPhase = undefined;
            imageRecord = undefined;

            /* Destroy References */

            marketFiles = undefined;
            dailyFiles = undefined;

            datetime = undefined;
            timePeriod = undefined;

            marketFile = undefined;
            fileCursor = undefined;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            /* Store the information received. */

            marketFiles = pStorage.marketFiles[0];
            dailyFiles = pStorage.dailyFiles[0];

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            recalculateScale();

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimePeriod);
            fileCursor = dailyFiles.getFileCursor(pTimePeriod);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);

            /* Get ready for plotting. */

            recalculate();

            /* Ready for when dimmension changes. */

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScale()
                recalculate();
            })

            /* Loading a few icons */

            imageStopLossPhase = canvas.strategySpace.iconByPartType.get('Stop');
            imageTakeProfitPhase = canvas.strategySpace.iconByPartType.get('Phase');
            imageRecord = canvas.strategySpace.iconByPartType.get('Trading System');

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

    function onMarketFilesUpdated() {
        try {
            let newMarketFile = marketFiles.getFile(timePeriod);
            if (newMarketFile !== undefined) {
                marketFile = newMarketFile;
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onMarketFilesUpdated -> err = " + err.stack); }
        }
    }

    function onDailyFilesUpdated() {
        try {
            let newFileCursor = dailyFiles.getFileCursor(timePeriod);
            if (newFileCursor !== undefined) {
                fileCursor = newFileCursor;
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFilesUpdated -> err = " + err.stack); }
        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            if (timePeriod !== pTimePeriod) {

                timePeriod = pTimePeriod;

                if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                    marketFile = marketFiles.getFile(pTimePeriod);

                    recalculate();

                } else {

                    let newFileCursor = dailyFiles.getFileCursor(pTimePeriod);

                    fileCursor = newFileCursor; // In this case, we explicitly want that if there is no valid cursor, we invalidate the data and show nothing.
                    recalculate();

                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {

        datetime = pDatetime;

    }

    function onDailyFileLoaded(event) {

        try {

            if (event.currentValue === event.totalValue) {

                /* This happens only when all of the files in the cursor have been loaded. */

                recalculate();

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFileLoaded -> err = " + err.stack); }
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            this.container.frame.draw();

            plotChart();

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

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) {
                records = [];
                return;
            } // We need to wait

            if (fileCursor.files.size === 0) {
                records = [];
                return;
            } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            records = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let record = {};

                        record.begin = dailyFile[i][0];
                        record.end = dailyFile[i][1];
                        record.type = dailyFile[i][2];
                        record.rate = dailyFile[i][3];
                        record.amount = dailyFile[i][4];
                        record.balanceA = dailyFile[i][5];
                        record.balanceB = dailyFile[i][6];
                        record.profit = dailyFile[i][7];
                        record.lastTradeProfitLoss = dailyFile[i][8];
                        record.stopLoss = dailyFile[i][9];
                        record.roundtrips = dailyFile[i][10];
                        record.hits = dailyFile[i][11];
                        record.fails = dailyFile[i][12];
                        record.hitRatio = dailyFile[i][13];
                        record.ROI = dailyFile[i][14];
                        record.periods = dailyFile[i][15];
                        record.days = dailyFile[i][16];
                        record.anualizedRateOfReturn = dailyFile[i][17];
                        record.sellRate = dailyFile[i][18];
                        record.lastTradeROI = dailyFile[i][19];
                        record.strategy = dailyFile[i][20];
                        record.strategyPhase = dailyFile[i][21];
                        record.takeProfit = dailyFile[i][22];
                        record.stopLossPhase = dailyFile[i][23];
                        record.takeProfitPhase = dailyFile[i][24];
                        record.positionSize = dailyFile[i][26]; // 25 is the message for the executor
                        record.initialBalanceA = dailyFile[i][27];
                        record.minimunBalanceA = dailyFile[i][28];
                        record.maximunBalanceA = dailyFile[i][29];
                        record.initialBalanceB = dailyFile[i][30];
                        record.minimunBalanceB = dailyFile[i][31];
                        record.maximunBalanceB = dailyFile[i][32];
                        record.baseAsset = dailyFile[i][33];
                        record.positionPeriods = dailyFile[i][34];
                        record.positionDays = dailyFile[i][35];

                        if (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) {

                            records.push(record);

                            if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                                thisObject.currentRecord = record;
                                thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentRecord);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by records. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            setTimeout(recalculate, 2000);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            records = [];

            for (let i = 0; i < marketFile.length; i++) {

                let record = {};

                record.begin = marketFile[i][0];
                record.end = marketFile[i][1];
                record.type = marketFile[i][2];
                record.rate = marketFile[i][3];
                record.amount = marketFile[i][4];
                record.balanceA = marketFile[i][5];
                record.balanceB = marketFile[i][6];
                record.profit = marketFile[i][7];
                record.lastTradeProfitLoss = marketFile[i][8];
                record.stopLoss = marketFile[i][9];
                record.roundtrips = marketFile[i][10];
                record.hits = marketFile[i][11];
                record.fails = marketFile[i][12];
                record.hitRatio = marketFile[i][13];
                record.ROI = marketFile[i][14];
                record.periods = marketFile[i][15];
                record.days = marketFile[i][16];
                record.anualizedRateOfReturn = marketFile[i][17];
                record.sellRate = marketFile[i][18];
                record.lastTradeROI = marketFile[i][19];
                record.strategy = marketFile[i][20];
                record.strategyPhase = marketFile[i][21];
                record.takeProfit = marketFile[i][22];
                record.stopLossPhase = marketFile[i][23];
                record.takeProfitPhase = marketFile[i][24];
                record.positionSize = marketFile[i][26]; // 25 is the message for the executor
                record.initialBalanceA = marketFile[i][27];
                record.minimunBalanceA = marketFile[i][28];
                record.maximunBalanceA = marketFile[i][29];
                record.initialBalanceB = marketFile[i][30];
                record.minimunBalanceB = marketFile[i][31];
                record.maximunBalanceB = marketFile[i][32];
                record.baseAsset = marketFile[i][33];
                record.positionPeriods = marketFile[i][34];
                record.positionDays = marketFile[i][35];

                if (record.begin >= leftDate.valueOf() && record.end <= rightDate.valueOf()) {

                    records.push(record);

                    if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                        thisObject.currentRecord = record;
                        thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentRecord);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total records generated : " + records.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function recalculateScale() {

        try {

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: MIN_PLOTABLE_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(USDT_BTC_HTH) / 4 // TODO: This 4 is temporary
            };

            timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            );

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
                        currentRecord: record
                    };
                    thisObject.container.eventHandler.raiseEvent("Current Record Changed", eventRecords);
                }

                let stopLossPhase = -1;
                let takeProfitPhase = -1;

                if (i > 0) {
                    if (record.stopLossPhase !== records[i - 1].stopLossPhase) {
                        stopLossPhase = record.stopLossPhase;
                    }

                    if (record.takeProfitPhase !== records[i - 1].takeProfitPhase) {
                        takeProfitPhase = record.takeProfitPhase;
                    }
                }

                let recordPoint1 = {
                    x: record.begin + timePeriod / 7 * 1.5,
                    y: thisObject.container.frame.height
                };

                let recordPoint2 = {
                    x: record.end + timePeriod / 7 * 5.5,
                    y: thisObject.container.frame.height
                };

                let recordPoint3 = {
                    x: recordPoint1.x + (recordPoint2.x - recordPoint1.x) / 2,
                    y: 0
                };

                let recordPoint4 = {
                    x: record.begin + timePeriod / 7 * 1.5,
                    y: thisObject.container.frame.height * 100
                };

                let recordPoint5 = {
                    x: record.begin,
                    y: record.stopLoss
                };

                let recordPoint6 = {
                    x: record.end,
                    y: record.stopLoss
                };

                if (record.stopLoss === 0) { // Put these points out of range if stopLoss is zero.

                    recordPoint5.x = 0;
                    recordPoint6.x = 0;
                }

                let recordPoint7 = {
                    x: record.begin,
                    y: record.sellRate
                };

                let recordPoint8 = {
                    x: record.end,
                    y: record.sellRate
                };

                if (record.sellRate === 0) { // Put these points out of range if sellRate is zero.

                    recordPoint7.x = 0;
                    recordPoint8.x = 0;
                }

                let recordPoint9 = {
                    x: record.begin,
                    y: record.takeProfit
                };

                let recordPoint10 = {
                    x: record.end,
                    y: record.takeProfit
                };

                if (record.takeProfit === 0) { // Put these points out of range if takeProfit is zero.

                    recordPoint9.x = 0;
                    recordPoint10.x = 0;
                }

                recordPoint1 = timeLineCoordinateSystem.transformThisPoint(recordPoint1);
                recordPoint2 = timeLineCoordinateSystem.transformThisPoint(recordPoint2);
                recordPoint3 = timeLineCoordinateSystem.transformThisPoint(recordPoint3);
                recordPoint4 = timeLineCoordinateSystem.transformThisPoint(recordPoint4);
                recordPoint5 = timeLineCoordinateSystem.transformThisPoint(recordPoint5);
                recordPoint6 = timeLineCoordinateSystem.transformThisPoint(recordPoint6);
                recordPoint7 = timeLineCoordinateSystem.transformThisPoint(recordPoint7);
                recordPoint8 = timeLineCoordinateSystem.transformThisPoint(recordPoint8);
                recordPoint9 = timeLineCoordinateSystem.transformThisPoint(recordPoint9);
                recordPoint10 = timeLineCoordinateSystem.transformThisPoint(recordPoint10);

                recordPoint1 = transformThisPoint(recordPoint1, thisObject.container);
                recordPoint2 = transformThisPoint(recordPoint2, thisObject.container);
                recordPoint3 = transformThisPoint(recordPoint3, thisObject.container);
                recordPoint4 = transformThisPoint(recordPoint4, thisObject.container);
                recordPoint5 = transformThisPoint(recordPoint5, thisObject.container);
                recordPoint6 = transformThisPoint(recordPoint6, thisObject.container);
                recordPoint7 = transformThisPoint(recordPoint7, thisObject.container);
                recordPoint8 = transformThisPoint(recordPoint8, thisObject.container);
                recordPoint9 = transformThisPoint(recordPoint9, thisObject.container);
                recordPoint10 = transformThisPoint(recordPoint10, thisObject.container);

                recordPoint1 = viewPort.fitIntoVisibleArea(recordPoint1);
                recordPoint2 = viewPort.fitIntoVisibleArea(recordPoint2);
                recordPoint3 = viewPort.fitIntoVisibleArea(recordPoint3);
                recordPoint4 = viewPort.fitIntoVisibleArea(recordPoint4);
                recordPoint5 = viewPort.fitIntoVisibleArea(recordPoint5);
                recordPoint6 = viewPort.fitIntoVisibleArea(recordPoint6);
                recordPoint7 = viewPort.fitIntoVisibleArea(recordPoint7);
                recordPoint8 = viewPort.fitIntoVisibleArea(recordPoint8);
                recordPoint9 = viewPort.fitIntoVisibleArea(recordPoint9);
                recordPoint10 = viewPort.fitIntoVisibleArea(recordPoint10);

                recordPoint1 = thisObject.fitFunction(recordPoint1);
                recordPoint2 = thisObject.fitFunction(recordPoint2);
                recordPoint3 = thisObject.fitFunction(recordPoint3);
                recordPoint4 = thisObject.fitFunction(recordPoint4);
                recordPoint5 = thisObject.fitFunction(recordPoint5);
                recordPoint6 = thisObject.fitFunction(recordPoint6);
                recordPoint7 = thisObject.fitFunction(recordPoint7);
                recordPoint8 = thisObject.fitFunction(recordPoint8);
                recordPoint9 = thisObject.fitFunction(recordPoint9);
                recordPoint10 = thisObject.fitFunction(recordPoint10);

                /* Image representing a Record */

                let imageOffset = {
                    x: 0,
                    y: -30
                }
                let imageSize = (recordPoint2.x - recordPoint1.x) / 2;
                let recordLabel = record.periods.toLocaleString()
                if (imageSize < 8) {
                    if (recordLabel[recordLabel.length - 1] !== '0' || imageSize < 4)
                        recordLabel = ''
                }
                let labelOffset = {
                    x: 0 - imageSize / 2 + 3 + imageOffset.x,
                    y: -2 - imageOffset.y
                }

                let imagePosition = {
                    x: recordPoint4.x + imageOffset.x,
                    y: recordPoint4.y + imageOffset.y
                }

                imagePosition = thisObject.fitFunction(imagePosition)

                if (imageRecord.canDrawIcon === true) {
                    browserCanvasContext.drawImage(imageRecord, imagePosition.x, imagePosition.y, imageSize, imageSize);
                    browserCanvasContext.save();
                    browserCanvasContext.translate(recordPoint3.x + labelOffset.x, recordPoint3.y + labelOffset.y);
                    browserCanvasContext.rotate(-Math.PI / 2);
                    printLabel(recordLabel, 0, 0, '1', 8);
                    browserCanvasContext.restore();
                }

                if (recordPoint5.x < viewPort.visibleArea.bottomLeft.x || recordPoint5.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                /* Next we are drawing the position Rate */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(recordPoint7.x, recordPoint7.y);
                browserCanvasContext.lineTo(recordPoint8.x, recordPoint8.y);

                browserCanvasContext.closePath();

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MANGANESE_PURPLE + ', 1)';
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.setLineDash([1, 4])

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([3, 4])

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.stroke()
                browserCanvasContext.setLineDash([0, 0])

                imageSize = 20;
                let imageToDraw;

                /* Depending on what is on top, it is also the text and image of the take profit / stop loss */

                let yOffset = 0
                if (record.takeProfit > record.stopLoss) { yOffset = imageSize * 2 }

                /* Next we are drawing the stopLoss floor / ceilling */

                browserCanvasContext.beginPath();


                browserCanvasContext.moveTo(recordPoint5.x, recordPoint5.y);
                browserCanvasContext.lineTo(recordPoint6.x, recordPoint6.y);


                browserCanvasContext.closePath();

                let opacity = 1

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + '';

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()


                if (imageStopLossPhase.canDrawIcon === true && stopLossPhase > -1) {
                    browserCanvasContext.drawImage(imageStopLossPhase, recordPoint6.x - imageSize, recordPoint6.y - imageSize * 1.25 + yOffset, imageSize, imageSize);
                    printLabel(stopLossPhase, recordPoint6.x - imageSize / 2 - 3, recordPoint6.y - imageSize * 1.5 + yOffset * 2, '1', 9);
                }

                /* Next we are drawing the Take Profit */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(recordPoint9.x, recordPoint9.y);
                browserCanvasContext.lineTo(recordPoint10.x, recordPoint10.y);

                browserCanvasContext.closePath();

                opacity = 1

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + '';

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()

                if (imageTakeProfitPhase.canDrawIcon === true && takeProfitPhase > -1) {
                    browserCanvasContext.drawImage(imageTakeProfitPhase, recordPoint10.x - imageSize * 2 / 3, recordPoint10.y + imageSize / 4 - yOffset, imageSize, imageSize);
                    printLabel(takeProfitPhase, recordPoint10.x - imageSize * 1 / 3, recordPoint10.y + imageSize * 1.9 - yOffset * 2, '1', 9);
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






































