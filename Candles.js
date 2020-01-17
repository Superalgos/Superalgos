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
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
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

    let coordinateSystem = newCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

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
                    let newMarketFile = marketFiles.getFile(pTimeFrame);
                    if (newMarketFile !== undefined) {
                        marketFile = newMarketFile;
                        recalculate();
                    }

                } else {
                    let newFileCursor = dailyFiles.getFileCursor(pTimeFrame);
                    if (newFileCursor !== undefined) {
                        fileCursor = newFileCursor;
                        recalculate();
                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimeFrame -> err = " + err.stack); }
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

                    targetPoint = coordinateSystem.transformThisPoint(targetPoint);
                    targetPoint = transformThisPoint(targetPoint, thisObject.container);

                    let targetMax = {
                        x: value,
                        y: candles[i].max
                    };

                    targetMax = coordinateSystem.transformThisPoint(targetMax);
                    targetMax = transformThisPoint(targetMax, thisObject.container);

                    let targetMin = {
                        x: value,
                        y: candles[i].min
                    };

                    targetMin = coordinateSystem.transformThisPoint(targetMin);
                    targetMin = transformThisPoint(targetMin, thisObject.container);

                    let center = {
                        x: (canvas.chartSpace.viewport.visibleArea.bottomRight.x - canvas.chartSpace.viewport.visibleArea.bottomLeft.x) / 2,
                        y: (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topRight.y) / 2
                    };

                    if (targetMax.y < canvas.chartSpace.viewport.visibleArea.topLeft.y || targetMin.y > canvas.chartSpace.viewport.visibleArea.bottomRight.y) {

                        let displaceVector = {
                            x: 0,
                            y: center.y - targetPoint.y
                        };

                        canvas.chartSpace.viewport.displaceTarget(displaceVector);

                    }

                    let displaceVector = {
                        x: center.x - targetPoint.x,
                        y: 0
                    };

                    canvas.chartSpace.viewport.displace(displaceVector);

                    return;
                }
            }

            if (candleFound === false) {

                let targetPoint = {
                    x: value,
                    y: lastClose
                };

                targetPoint = coordinateSystem.transformThisPoint(targetPoint);
                targetPoint = transformThisPoint(targetPoint, thisObject.container);

                let center = {
                    x: (canvas.chartSpace.viewport.visibleArea.bottomRight.x - canvas.chartSpace.viewport.visibleArea.bottomLeft.x) / 2,
                    y: (canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topRight.y) / 2
                };

                let displaceVector = {
                    x: center.x - targetPoint.x,
                    y: center.y - targetPoint.y
                };

                canvas.chartSpace.viewport.displace(displaceVector);

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

            if (timeFrame >= _1_HOUR_IN_MILISECONDS) {

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

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

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
                                thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentCandle);

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

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

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
                        thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentCandle);

                    }
                }
            }

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

            if (candles.length > 0) {

                /* Now we calculate all the points. */
                for (let i = 0; i < candles.length; i++) {

                    candle = candles[i];

                    candle.candlePoint1 = {
                        x: candle.begin + timeFrame / 7 * 1.5,
                        y: candle.open
                    };

                    candle.candlePoint2 = {
                        x: candle.begin + timeFrame / 7 * 5.5,
                        y: candle.open
                    };

                    candle.candlePoint3 = {
                        x: candle.begin + timeFrame / 7 * 5.5,
                        y: candle.close
                    };

                    candle.candlePoint4 = {
                        x: candle.begin + timeFrame / 7 * 1.5,
                        y: candle.close
                    };

                    candle.candlePoint1 = coordinateSystem.transformThisPoint(candle.candlePoint1);
                    candle.candlePoint2 = coordinateSystem.transformThisPoint(candle.candlePoint2);
                    candle.candlePoint3 = coordinateSystem.transformThisPoint(candle.candlePoint3);
                    candle.candlePoint4 = coordinateSystem.transformThisPoint(candle.candlePoint4);

                    candle.candlePoint1 = transformThisPoint(candle.candlePoint1, thisObject.container);
                    candle.candlePoint2 = transformThisPoint(candle.candlePoint2, thisObject.container);
                    candle.candlePoint3 = transformThisPoint(candle.candlePoint3, thisObject.container);
                    candle.candlePoint4 = transformThisPoint(candle.candlePoint4, thisObject.container);

                    candle.candlePoint1 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.candlePoint1);
                    candle.candlePoint2 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.candlePoint2);
                    candle.candlePoint3 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.candlePoint3);
                    candle.candlePoint4 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.candlePoint4);

                    candle.candlePoint1 = thisObject.fitFunction(candle.candlePoint1);
                    candle.candlePoint2 = thisObject.fitFunction(candle.candlePoint2);
                    candle.candlePoint3 = thisObject.fitFunction(candle.candlePoint3);
                    candle.candlePoint4 = thisObject.fitFunction(candle.candlePoint4);

                    candle.stickPoint1 = {
                        x: candle.begin + timeFrame / 7 * 3.2,
                        y: candle.max
                    };

                    candle.stickPoint2 = {
                        x: candle.begin + timeFrame / 7 * 3.8,
                        y: candle.max
                    };

                    candle.stickPoint3 = {
                        x: candle.begin + timeFrame / 7 * 3.8,
                        y: candle.min
                    };

                    candle.stickPoint4 = {
                        x: candle.begin + timeFrame / 7 * 3.2,
                        y: candle.min
                    };

                    candle.stickPoint1 = coordinateSystem.transformThisPoint(candle.stickPoint1);
                    candle.stickPoint2 = coordinateSystem.transformThisPoint(candle.stickPoint2);
                    candle.stickPoint3 = coordinateSystem.transformThisPoint(candle.stickPoint3);
                    candle.stickPoint4 = coordinateSystem.transformThisPoint(candle.stickPoint4);

                    candle.stickPoint1 = transformThisPoint(candle.stickPoint1, thisObject.container);
                    candle.stickPoint2 = transformThisPoint(candle.stickPoint2, thisObject.container);
                    candle.stickPoint3 = transformThisPoint(candle.stickPoint3, thisObject.container);
                    candle.stickPoint4 = transformThisPoint(candle.stickPoint4, thisObject.container);

                    candle.stickPoint1 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.stickPoint1);
                    candle.stickPoint2 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.stickPoint2);
                    candle.stickPoint3 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.stickPoint3);
                    candle.stickPoint4 = canvas.chartSpace.viewport.fitIntoVisibleArea(candle.stickPoint4);

                    candle.stickPoint1 = thisObject.fitFunction(candle.stickPoint1);
                    candle.stickPoint2 = thisObject.fitFunction(candle.stickPoint2);
                    candle.stickPoint3 = thisObject.fitFunction(candle.stickPoint3);
                    candle.stickPoint4 = thisObject.fitFunction(candle.stickPoint4);

                }

                /* On screen candles */
                let onScreenCandles = []
                let mouseCandle

                for (let i = 0; i < candles.length; i++) {
                    
                    candle = candles[i];

                    if (candle.candlePoint2.x < canvas.chartSpace.viewport.visibleArea.bottomLeft.x || candle.candlePoint1.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x) {
                        continue
                    }

                    if (onScreenCandles.length < 5000) {
                        onScreenCandles.push(candle)
                    }

                    if (userPositionDate >= candle.begin && userPositionDate <= candle.end) {
                        mouseCandle = candle
                    }
                }

                /* We draw the sticks */
                browserCanvasContext.beginPath();

                for (let i = 0; i < onScreenCandles.length; i++) {

                    candle = onScreenCandles[i];

                    browserCanvasContext.moveTo(candle.stickPoint1.x, candle.stickPoint1.y);
                    browserCanvasContext.lineTo(candle.stickPoint2.x, candle.stickPoint2.y);
                    browserCanvasContext.lineTo(candle.stickPoint3.x, candle.stickPoint3.y);
                    browserCanvasContext.lineTo(candle.stickPoint4.x, candle.stickPoint4.y);
                }

                browserCanvasContext.closePath();
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
                browserCanvasContext.fill();

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT + ', 1)';
                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.setLineDash([0, 0])
                browserCanvasContext.stroke();

                /* The stick at the mouse candle */
                if (mouseCandle) {
                    browserCanvasContext.beginPath();

                    candle = mouseCandle

                    browserCanvasContext.moveTo(candle.stickPoint1.x, candle.stickPoint1.y);
                    browserCanvasContext.lineTo(candle.stickPoint2.x, candle.stickPoint2.y);
                    browserCanvasContext.lineTo(candle.stickPoint3.x, candle.stickPoint3.y);
                    browserCanvasContext.lineTo(candle.stickPoint4.x, candle.stickPoint4.y);

                    browserCanvasContext.closePath();
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
                    browserCanvasContext.fill();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.stroke();
                }


                /* We draw the candles. */
                drawCandlesByDirection('up')
                drawCandlesByDirection('down')
                drawCandlesByDirection('side')

                function drawCandlesByDirection(direction) {

                    browserCanvasContext.beginPath();

                    for (let i = 0; i < onScreenCandles.length; i++) {

                        candle = onScreenCandles[i];

                        if (candle.direction !== direction) { continue }

                        browserCanvasContext.moveTo(candle.candlePoint1.x, candle.candlePoint1.y);
                        browserCanvasContext.lineTo(candle.candlePoint2.x, candle.candlePoint2.y);
                        browserCanvasContext.lineTo(candle.candlePoint3.x, candle.candlePoint3.y);
                        browserCanvasContext.lineTo(candle.candlePoint4.x, candle.candlePoint4.y);
                    }

                    browserCanvasContext.closePath();

                    if (direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)'; }
                    if (direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', 1)'; }
                    if (direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                    if (direction === 'up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'; }
                    if (direction === 'down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'; }
                    if (direction === 'side') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                    browserCanvasContext.fill();

                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.stroke();
                }

                /* Draw mouse candel and Raise Event. */
                if (mouseCandle) {

                    /* highlight the current candle */

                    browserCanvasContext.beginPath();

                    candle = mouseCandle

                    browserCanvasContext.moveTo(candle.candlePoint1.x, candle.candlePoint1.y);
                    browserCanvasContext.lineTo(candle.candlePoint2.x, candle.candlePoint2.y);
                    browserCanvasContext.lineTo(candle.candlePoint3.x, candle.candlePoint3.y);
                    browserCanvasContext.lineTo(candle.candlePoint4.x, candle.candlePoint4.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current candle accroding to time

                    browserCanvasContext.fill();

                    let currentCandle = {
                        bodyWidth: candle.candlePoint2.x - candle.candlePoint1.x,
                        bodyHeight: candle.candlePoint3.y - candle.candlePoint2.y,
                        stickHeight: candle.stickPoint4.y - candle.stickPoint2.y,
                        stickWidth: candle.stickPoint2.x - candle.stickPoint1.x,
                        stickStart: candle.candlePoint2.y - candle.stickPoint2.y,
                        period: timeFrame,
                        innerCandle: candle
                    };
                    thisObject.container.eventHandler.raiseEvent("Current Record Changed", currentCandle);
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }


    function onViewportZoomChanged(event) {

        try {

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportZoomChanged -> err = " + err.stack); }
        }
    }

    function onViewportPositionChanged(event) {

        try {

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

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}





