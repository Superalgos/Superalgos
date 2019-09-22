function newAAMastersPlottersCandlesVolumesCandles() {

    const MODULE_NAME = "Candles Plotter";
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

        currentCandle: undefined,
        positionAtDatetime: positionAtDatetime
    };

    /* this is part of the module template */

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Periods.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let candles = [];                   // Here we keep the candles to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            /* Destroyd References */

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

            let container;

            /* First we check if this point is inside this space. */

            if (thisObject.container.frame.isThisPointHere(point) === true) {

                return thisObject.container;

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
                    let newMarketFile = marketFiles.getFile(pTimePeriod);
                    if (newMarketFile !== undefined) {
                        marketFile = newMarketFile;
                        recalculate();
                    }

                } else {
                    let newFileCursor = dailyFiles.getFileCursor(pTimePeriod);
                    if (newFileCursor !== undefined) {
                        fileCursor = newFileCursor;
                        recalculate();
                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {

        datetime = pDatetime;

    }

    function positionAtDatetime(newDatetime) {

        try {

            value = newDatetime.valueOf();

            /* Now we calculate which candle has this new time, because it will give us the y coordinate. */

            let candleFound = false;
            let lastClose;

            for (let i = 0; i < candles.length; i++) {

                lastClose = candles[i].close;

                if (value >= candles[i].begin && value <= candles[i].end) {

                    candleFound = true;

                    let targetPoint = {
                        x: value,
                        y: candles[i].open
                    };

                    targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint);
                    targetPoint = transformThisPoint(targetPoint, thisObject.container);

                    let targetMax = {
                        x: value,
                        y: candles[i].max
                    };

                    targetMax = timeLineCoordinateSystem.transformThisPoint(targetMax);
                    targetMax = transformThisPoint(targetMax, thisObject.container);

                    let targetMin = {
                        x: value,
                        y: candles[i].min
                    };

                    targetMin = timeLineCoordinateSystem.transformThisPoint(targetMin);
                    targetMin = transformThisPoint(targetMin, thisObject.container);

                    let center = {
                        x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
                        y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
                    };

                    if (targetMax.y < viewPort.visibleArea.topLeft.y || targetMin.y > viewPort.visibleArea.bottomRight.y) {

                        let displaceVector = {
                            x: 0,
                            y: center.y - targetPoint.y
                        };

                        viewPort.displaceTarget(displaceVector);

                    }

                    let displaceVector = {
                        x: center.x - targetPoint.x,
                        y: 0
                    };

                    viewPort.displace(displaceVector);

                    return;
                }
            }

            if (candleFound === false) {

                let targetPoint = {
                    x: value,
                    y: lastClose
                };

                targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint);
                targetPoint = transformThisPoint(targetPoint, thisObject.container);

                let center = {
                    x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
                    y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
                };

                let displaceVector = {
                    x: center.x - targetPoint.x,
                    y: center.y - targetPoint.y
                };

                viewPort.displace(displaceVector);

                return;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] positionAtDatetime -> err = " + err.stack); }
        }
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

            thisObject.container.frame.draw();

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err.stack); }
        }
    }

    function recalculate() {

        try {

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Candles Changed", candles);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            candles = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let candle = {
                            open: undefined,
                            close: undefined,
                            min: 10000000000000,
                            max: 0,
                            begin: undefined,
                            end: undefined,
                            direction: undefined
                        };

                        candle.min = dailyFile[i][0];
                        candle.max = dailyFile[i][1];

                        candle.open = dailyFile[i][2];
                        candle.close = dailyFile[i][3];

                        candle.begin = dailyFile[i][4];
                        candle.end = dailyFile[i][5];

                        if (candle.open > candle.close) { candle.direction = 'down'; }
                        if (candle.open < candle.close) { candle.direction = 'up'; }
                        if (candle.open === candle.close) { candle.direction = 'side'; }

                        if (candle.begin >= farLeftDate.valueOf() && candle.end <= farRightDate.valueOf()) {

                            candles.push(candle);

                            if (datetime.valueOf() >= candle.begin && datetime.valueOf() <= candle.end) {

                                thisObject.currentCandle = candle;
                                thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by candles. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (candles.length > 0) {
                if (candles[0].begin > lowerEnd || candles[candles.length - 1].end < upperEnd) {
                    setTimeout(recalculate, 2000);
                }
            }
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

            candles = [];

            for (let i = 0; i < marketFile.length; i++) {

                let candle = {
                    open: undefined,
                    close: undefined,
                    min: 10000000000000,
                    max: 0,
                    begin: undefined,
                    end: undefined,
                    direction: undefined
                };

                candle.min = marketFile[i][0];
                candle.max = marketFile[i][1];

                candle.open = marketFile[i][2];
                candle.close = marketFile[i][3];

                candle.begin = marketFile[i][4];
                candle.end = marketFile[i][5];

                if (candle.open > candle.close) { candle.direction = 'down'; }
                if (candle.open < candle.close) { candle.direction = 'up'; }
                if (candle.open === candle.close) { candle.direction = 'side'; }

                if (candle.begin >= leftDate.valueOf() && candle.end <= rightDate.valueOf()) {

                    candles.push(candle);

                    if (datetime.valueOf() >= candle.begin && datetime.valueOf() <= candle.end) {

                        thisObject.currentCandle = candle;
                        thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

                    }
                }
            }

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

            if (candles.length > 0) {

                /* Now we calculate and plot the candles */

                for (let i = 0; i < candles.length; i++) {

                    candle = candles[i];

                    let candlePoint1 = {
                        x: candle.begin + timePeriod / 7 * 1.5,
                        y: candle.open
                    };

                    let candlePoint2 = {
                        x: candle.begin + timePeriod / 7 * 5.5,
                        y: candle.open
                    };

                    let candlePoint3 = {
                        x: candle.begin + timePeriod / 7 * 5.5,
                        y: candle.close
                    };

                    let candlePoint4 = {
                        x: candle.begin + timePeriod / 7 * 1.5,
                        y: candle.close
                    };

                    candlePoint1 = timeLineCoordinateSystem.transformThisPoint(candlePoint1);
                    candlePoint2 = timeLineCoordinateSystem.transformThisPoint(candlePoint2);
                    candlePoint3 = timeLineCoordinateSystem.transformThisPoint(candlePoint3);
                    candlePoint4 = timeLineCoordinateSystem.transformThisPoint(candlePoint4);

                    candlePoint1 = transformThisPoint(candlePoint1, thisObject.container);
                    candlePoint2 = transformThisPoint(candlePoint2, thisObject.container);
                    candlePoint3 = transformThisPoint(candlePoint3, thisObject.container);
                    candlePoint4 = transformThisPoint(candlePoint4, thisObject.container);

                    if (candlePoint2.x < viewPort.visibleArea.bottomLeft.x || candlePoint1.x > viewPort.visibleArea.bottomRight.x) {
                        continue;
                    }

                    candlePoint1 = viewPort.fitIntoVisibleArea(candlePoint1);
                    candlePoint2 = viewPort.fitIntoVisibleArea(candlePoint2);
                    candlePoint3 = viewPort.fitIntoVisibleArea(candlePoint3);
                    candlePoint4 = viewPort.fitIntoVisibleArea(candlePoint4);

                    let stickPoint1 = {
                        x: candle.begin + timePeriod / 7 * 3.2,
                        y: candle.max
                    };

                    let stickPoint2 = {
                        x: candle.begin + timePeriod / 7 * 3.8,
                        y: candle.max
                    };

                    let stickPoint3 = {
                        x: candle.begin + timePeriod / 7 * 3.8,
                        y: candle.min
                    };

                    let stickPoint4 = {
                        x: candle.begin + timePeriod / 7 * 3.2,
                        y: candle.min
                    };

                    stickPoint1 = timeLineCoordinateSystem.transformThisPoint(stickPoint1);
                    stickPoint2 = timeLineCoordinateSystem.transformThisPoint(stickPoint2);
                    stickPoint3 = timeLineCoordinateSystem.transformThisPoint(stickPoint3);
                    stickPoint4 = timeLineCoordinateSystem.transformThisPoint(stickPoint4);

                    stickPoint1 = transformThisPoint(stickPoint1, thisObject.container);
                    stickPoint2 = transformThisPoint(stickPoint2, thisObject.container);
                    stickPoint3 = transformThisPoint(stickPoint3, thisObject.container);
                    stickPoint4 = transformThisPoint(stickPoint4, thisObject.container);

                    stickPoint1 = viewPort.fitIntoVisibleArea(stickPoint1);
                    stickPoint2 = viewPort.fitIntoVisibleArea(stickPoint2);
                    stickPoint3 = viewPort.fitIntoVisibleArea(stickPoint3);
                    stickPoint4 = viewPort.fitIntoVisibleArea(stickPoint4);

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(stickPoint1.x, stickPoint1.y);
                    browserCanvasContext.lineTo(stickPoint2.x, stickPoint2.y);
                    browserCanvasContext.lineTo(stickPoint3.x, stickPoint3.y);
                    browserCanvasContext.lineTo(stickPoint4.x, stickPoint4.y);

                    browserCanvasContext.closePath();
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
                    browserCanvasContext.fill();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT + ', 1)';

                    if (userPositionDate >= candle.begin && userPositionDate <= candle.end) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current candle accroding to time
                    }

                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.stroke();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(candlePoint1.x, candlePoint1.y);
                    browserCanvasContext.lineTo(candlePoint2.x, candlePoint2.y);
                    browserCanvasContext.lineTo(candlePoint3.x, candlePoint3.y);
                    browserCanvasContext.lineTo(candlePoint4.x, candlePoint4.y);

                    browserCanvasContext.closePath();

                    if (candle.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)'; }
                    if (candle.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', 1)'; }
                    if (candle.direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                    if (candle.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'; }
                    if (candle.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'; }
                    if (candle.direction === 'side') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                    if (userPositionDate >= candle.begin && userPositionDate <= candle.end) {

                        /* highlight the current candle */

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current candle accroding to time

                        let currentCandle = {
                            bodyWidth: candlePoint2.x - candlePoint1.x,
                            bodyHeight: candlePoint3.y - candlePoint2.y,
                            stickHeight: stickPoint4.y - stickPoint2.y,
                            stickWidth: stickPoint2.x - stickPoint1.x,
                            stickStart: candlePoint2.y - stickPoint2.y,
                            period: timePeriod,
                            innerCandle: candle
                        };
                        thisObject.container.eventHandler.raiseEvent("Current Candle Changed", currentCandle);
                    }

                    if (
                        candlePoint1.x < viewPort.visibleArea.topLeft.x + 50
                        ||
                        candlePoint1.x > viewPort.visibleArea.bottomRight.x - 50
                    ) {
                        // we leave this candles without fill.
                    } else {
                        browserCanvasContext.fill();
                    }

                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.stroke();


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


