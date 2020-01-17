function newAAMastersPlottersTradingSimulationTrades() {

    const MODULE_NAME = "Trades Plotter";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
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

    let coordinateSystem = newCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    /* these are module specific variables: */

    let trades = [];
    let headers;

    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            if (INFO_LOG === true) { logger.write("[INFO] finalize -> Entering function."); }

            /* Stop listening to the necesary events. */

            canvas.chartSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            canvas.chartSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
            marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId);
            dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId);

            /* Destroyd References */

            marketFiles = undefined;
            dailyFiles = undefined;

            datetime = undefined;
            timeFrame = undefined;

            marketFile = undefined;
            fileCursor = undefined;

            thisObject.fitFunction = undefined
        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pDatetime, pTimeFrame, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /* Store the information received. */

            marketFiles = pStorage.marketFiles[0];
            dailyFiles = pStorage.dailyFiles[0];

            datetime = pDatetime;
            timeFrame = pTimeFrame;

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            recalculateScale();

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimeFrame);
            fileCursor = dailyFiles.getFileCursor(pTimeFrame);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
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

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function getContainer(point) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getContainer -> Entering function."); }

            let container;

            /* First we check if this point is inside this space. */

            if (this.container.frame.isThisPointHere(point) === true) {

                return this.container;

            } else {

                /* This point does not belong to this space. */

                return undefined;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err = " + err.stack); }
        }
    }

    function onMarketFilesUpdated() {
        try {
            let newMarketFile = marketFiles.getFile(timeFrame);
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
            let newFileCursor = dailyFiles.getFileCursor(timeFrame);
            if (newFileCursor !== undefined) {
                fileCursor = newFileCursor;
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFilesUpdated -> err = " + err.stack); }
        }
    }

    function setTimeFrame(pTimeFrame) {

        try {

            if (timeFrame !== pTimeFrame) {

                timeFrame = pTimeFrame;

                if (timeFrame >= _1_HOUR_IN_MILISECONDS) {

                    marketFile = marketFiles.getFile(pTimeFrame);

                    recalculate();

                } else {

                    let newFileCursor = dailyFiles.getFileCursor(pTimeFrame);

                    fileCursor = newFileCursor; // In this case, we explicitly want that if there is no valid cursor, we invalidate the data and show nothing.
                    recalculate();

                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimeFrame -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        datetime = pDatetime;

    }

    function onDailyFileLoaded(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDailyFileLoaded -> Entering function."); }

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

            trades = []

            if (timeFrame >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Trades Changed", trades);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingDailyFiles -> Entering function."); }

            if (fileCursor === undefined) {
                trades = [];
                return;
            } // We need to wait

            if (fileCursor.files.size === 0) {
                trades = [];
                return;
            } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            trades = [];



            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let record = {};

                        record.begin = dailyFile[i][0];
                        record.end = dailyFile[i][1];
                        record.status = dailyFile[i][2];
                        record.lastTradeROI = dailyFile[i][3];
                        record.beginRate = dailyFile[i][4];
                        record.endRate = dailyFile[i][5];
                        record.exitType = dailyFile[i][6];

                        if (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) {

                            trades.push(record);

                            if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                                thisObject.currentRecord = record;
                                thisObject.container.eventHandler.raiseEvent("Current Trade Changed", thisObject.currentRecord);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by trades. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            setTimeout(recalculate, 2000);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingMarketFiles -> Entering function."); }

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            trades = [];

            for (let i = 0; i < marketFile.length; i++) {

                let record = {};

                record.begin = marketFile[i][0];
                record.end = marketFile[i][1];
                record.status = marketFile[i][2];
                record.lastTradeROI = marketFile[i][3];
                record.beginRate = marketFile[i][4];
                record.endRate = marketFile[i][5];
                record.exitType = marketFile[i][6];

                if (record.begin >= leftDate.valueOf() && record.end <= rightDate.valueOf()) {

                    trades.push(record);

                    if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                        thisObject.currentRecord = record;
                        thisObject.container.eventHandler.raiseEvent("Current Trade Changed", thisObject.currentRecord);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total trades generated : " + trades.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function recalculateScale() {

        try {

            if (coordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: MIN_PLOTABLE_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(USDT_BTC_HTH) / 4 // TODO: This 4 is temporary
            };


            coordinateSystem.initialize(
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

            thisObject.container.eventHandler.raiseEvent("Current Trade Record Changed", undefined);

            let record;

            for (let i = 0; i < trades.length; i++) {

                record = trades[i];

                /* Send the current record to the panel */

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    let currentRecord = {
                    };
                    thisObject.container.eventHandler.raiseEvent("Current Trade Record Changed", currentRecord);
                }

                let recordPoint1 = {
                    x: record.begin,
                    y: record.beginRate
                };

                let recordPoint2 = {
                    x: record.end,
                    y: record.beginRate
                };

                let recordPoint3 = {
                    x: record.end,
                    y: record.endRate
                };

                recordPoint1 = coordinateSystem.transformThisPoint(recordPoint1);
                recordPoint2 = coordinateSystem.transformThisPoint(recordPoint2);
                recordPoint3 = coordinateSystem.transformThisPoint(recordPoint3);

                recordPoint1 = transformThisPoint(recordPoint1, thisObject.container);
                recordPoint2 = transformThisPoint(recordPoint2, thisObject.container);
                recordPoint3 = transformThisPoint(recordPoint3, thisObject.container);

                if (recordPoint2.x < canvas.chartSpace.viewport.visibleArea.bottomLeft.x || recordPoint1.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x) {
                    continue;
                }

                recordPoint1 = canvas.chartSpace.viewport.fitIntoVisibleArea(recordPoint1);
                recordPoint2 = canvas.chartSpace.viewport.fitIntoVisibleArea(recordPoint2);
                recordPoint3 = canvas.chartSpace.viewport.fitIntoVisibleArea(recordPoint3);

                recordPoint1 = thisObject.fitFunction(recordPoint1);
                recordPoint2 = thisObject.fitFunction(recordPoint2);
                recordPoint3 = thisObject.fitFunction(recordPoint3);

                let line1 = '';
                let line2 = '';

                if (record.status === 1) {
                    switch (record.exitType) {
                        case 1: {
                            line1 = 'Exit: STOP';
                            break;
                        }
                        case 2: {
                            line1 = 'Exit: TP';
                            break;
                        }
                    }
                } else {
                    line1 = 'Open Position';
                }

                if (record.lastTradeROI < 0) {
                    line2 = 'ROI:' + (record.lastTradeROI).toFixed(2) + ' %';
                } else {
                    line2 = 'ROI:' + (record.lastTradeROI).toFixed(2) + ' %';
                }

                /* Draw the triangle  that represents the trade. */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(recordPoint1.x, recordPoint1.y);
                browserCanvasContext.lineTo(recordPoint2.x, recordPoint2.y);
                browserCanvasContext.lineTo(recordPoint3.x, recordPoint3.y);

                browserCanvasContext.closePath();

                let opacity = '0.25';

                if (record.lastTradeROI > 0) {
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')';
                } else {
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';
                }

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';
                }

                browserCanvasContext.fill();

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.setLineDash([0, 0])
                browserCanvasContext.stroke();

                let point = {}

                if (record.beginRate > record.endRate) {
                    point.x = recordPoint3.x
                    point.y = recordPoint3.y + 100
                } else {
                    point.x = recordPoint3.x
                    point.y = recordPoint3.y - 100
                }

                point = canvas.chartSpace.viewport.fitIntoVisibleArea(point);
                point = thisObject.fitFunction(point, undefined, 50);

                if (
                    recordPoint3.x < canvas.chartSpace.viewport.visibleArea.topLeft.x + 250
                    ||
                    recordPoint3.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x - 250
                    ||
                    recordPoint3.y > canvas.chartSpace.viewport.visibleArea.bottomRight.y - 150
                    ||
                    recordPoint3.y < canvas.chartSpace.viewport.visibleArea.topLeft.y + 150
                ) {
                    // we do not write any text
                } else {


                    printLabel(line1, recordPoint2.x - (recordPoint2.x - recordPoint1.x) / 2 - line1.length * FONT_ASPECT_RATIO, point.y, '1', 12);
                    printLabel(line2, recordPoint2.x - (recordPoint2.x - recordPoint1.x) / 2 - line2.length * FONT_ASPECT_RATIO, point.y + 15, '1', 12);


                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }


    function onViewportZoomChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onViewportZoomChanged -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportZoomChanged -> err = " + err.stack); }
        }
    }

    function onViewportPositionChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onViewportPositionChanged -> Entering function."); }

            if (event !== undefined) {
                if (event.recalculate === true) {
                    recalculate()
                    return
                }
            }
            if (Math.random() * 100 > 95) {
                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportPositionChanged -> err = " + err.stack); }
        }
    }

    function onDragFinished() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDragFinished -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}





















