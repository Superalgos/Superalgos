function newMastersPlottersCandlesVolumesCandles() {

    const MODULE_NAME = "Candles Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        container: undefined,
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        setCoordinateSystem: setCoordinateSystem,
        draw: draw,
        onDailyFileLoaded: onDailyFileLoaded,
        currentCandle: undefined
    };

    /* this is part of the module template */

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let coordinateSystem

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    /* these are module specific variables: */

    let candles = [];                   // Here we keep the candles to be ploted every time the Draw() function is called by the AAWebPlatform.

    let onMouseOverEventSuscriptionId
    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId
    let scaleChangedEventSubscriptionId

    let userPositionDate
    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */
            thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
            UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId);
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

            finalizeCoordinateSystem()
            coordinateSystem = undefined
        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pDatetime, pTimeFrame, pCoordinateSystem, callBackFunction) {

        try {

            /* Store the information received. */

            marketFiles = pStorage.marketFiles[0];
            dailyFiles = pStorage.dailyFiles[0];

            datetime = pDatetime;
            timeFrame = pTimeFrame;
            coordinateSystem = pCoordinateSystem
            initializeCoordinateSystem()

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimeFrame);
            fileCursor = dailyFiles.getFileCursor(pTimeFrame);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);
            onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

            /* Get ready for plotting. */

            recalculate();

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculate();
            })

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function initializeCoordinateSystem() {
        scaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
    }

    function finalizeCoordinateSystem() {
        coordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)
    }

    function onScaleChanged() {
        recalculate();
    }

    function onMouseOver(event) {
        let userPosition = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
        userPositionDate = userPosition.valueOf()
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

    function setCoordinateSystem(pCoordinateSystem) {
        finalizeCoordinateSystem()
        coordinateSystem = pCoordinateSystem
        initializeCoordinateSystem()
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

            return plotChart();

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

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            candles = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2);

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

                        /* Contributing to Auto-Scale*/
                        if (i === 0) {
                            coordinateSystem.reportXValue(candle.begin)
                        }
                        if (i === dailyFile.length - 1) {
                            coordinateSystem.reportXValue(candle.end)
                        }

                        if (
                            (candle.begin >= farLeftDate.valueOf() && candle.end <= farRightDate.valueOf()) &&
                            (candle.begin >= coordinateSystem.min.x && candle.end <= coordinateSystem.max.x)
                        ) {

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

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

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

                /* Contributing to Auto-Scale*/
                if (i === 0) {
                    coordinateSystem.reportXValue(candle.begin)
                }
                if (i === marketFile.length - 1) {
                    coordinateSystem.reportXValue(candle.end)
                }

                if (
                    (candle.begin >= leftDate.valueOf() && candle.end <= rightDate.valueOf()) &&
                    (candle.begin >= coordinateSystem.min.x && candle.end <= coordinateSystem.max.x)
                ) {

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

    function plotChart() {

        try {
            let elementsPlotted = 0
            let lowResolution = false
            if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomTargetLevel < UI.projects.superalgos.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_PLOTTING_IN_LOW_RESOLUTION) {
                if (candles.length > 100) {
                    lowResolution = true
                }
            }

            if (candles.length > 0) {

                /* On screen candles */
                let onScreenCandles = []
                let mouseCandle

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

                    candle.candlePoint1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.candlePoint1, thisObject.container);
                    candle.candlePoint2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.candlePoint2, thisObject.container);
                    candle.candlePoint3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.candlePoint3, thisObject.container);
                    candle.candlePoint4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.candlePoint4, thisObject.container);

                    /* Skip the first candle with zero at open */
                    if (candle.open === 0) { continue }

                    if (candle.candlePoint2.x < UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x || candle.candlePoint1.x > UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.x) {
                        continue
                    }

                    addToOnScreenCandles(candle)

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

                    candle.stickPoint1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.stickPoint1, thisObject.container);
                    candle.stickPoint2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.stickPoint2, thisObject.container);
                    candle.stickPoint3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.stickPoint3, thisObject.container);
                    candle.stickPoint4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(candle.stickPoint4, thisObject.container);

                    if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomTargetLevel < UI.projects.superalgos.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_PACKING_OBJECTS_AT_THE_BOTTOM_OR_TOP_OF_VIEWPORT) {
                        let diffA = candle.stickPoint3.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y
                        if (diffA > 0) {
                            candle.candlePoint1.y = candle.candlePoint1.y - diffA
                            candle.candlePoint2.y = candle.candlePoint2.y - diffA
                            candle.candlePoint3.y = candle.candlePoint3.y - diffA
                            candle.candlePoint4.y = candle.candlePoint4.y - diffA

                            candle.stickPoint1.y = candle.stickPoint1.y - diffA
                            candle.stickPoint2.y = candle.stickPoint2.y - diffA
                            candle.stickPoint3.y = candle.stickPoint3.y - diffA
                            candle.stickPoint4.y = candle.stickPoint4.y - diffA
                        }

                        let diffB = candle.stickPoint1.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft.y
                        if (diffB < 0) {
                            candle.candlePoint1.y = candle.candlePoint1.y - diffB
                            candle.candlePoint2.y = candle.candlePoint2.y - diffB
                            candle.candlePoint3.y = candle.candlePoint3.y - diffB
                            candle.candlePoint4.y = candle.candlePoint4.y - diffB

                            candle.stickPoint1.y = candle.stickPoint1.y - diffB
                            candle.stickPoint2.y = candle.stickPoint2.y - diffB
                            candle.stickPoint3.y = candle.stickPoint3.y - diffB
                            candle.stickPoint4.y = candle.stickPoint4.y - diffB
                        }
                    }

                    candle.candlePoint1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.candlePoint1);
                    candle.candlePoint2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.candlePoint2);
                    candle.candlePoint3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.candlePoint3);
                    candle.candlePoint4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.candlePoint4);

                    candle.candlePoint1 = thisObject.fitFunction(candle.candlePoint1);
                    candle.candlePoint2 = thisObject.fitFunction(candle.candlePoint2);
                    candle.candlePoint3 = thisObject.fitFunction(candle.candlePoint3);
                    candle.candlePoint4 = thisObject.fitFunction(candle.candlePoint4);

                    candle.stickPoint1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.stickPoint1);
                    candle.stickPoint2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.stickPoint2);
                    candle.stickPoint3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.stickPoint3);
                    candle.stickPoint4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(candle.stickPoint4);

                    candle.stickPoint1 = thisObject.fitFunction(candle.stickPoint1);
                    candle.stickPoint2 = thisObject.fitFunction(candle.stickPoint2);
                    candle.stickPoint3 = thisObject.fitFunction(candle.stickPoint3);
                    candle.stickPoint4 = thisObject.fitFunction(candle.stickPoint4);
                }



                function addToOnScreenCandles(candle) {

                    /* Contributing to Auto-Scale*/
                    coordinateSystem.reportYValue(candle.max)
                    coordinateSystem.reportYValue(candle.min)


                    //if (onScreenCandles.length < 15000) {
                    onScreenCandles.push(candle)
                    //}

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

                if (lowResolution === false) {
                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
                    browserCanvasContext.fill();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT + ', 1)';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                    browserCanvasContext.stroke();

                }

                /* The stick at the mouse candle */
                if (mouseCandle) {
                    browserCanvasContext.beginPath();

                    candle = mouseCandle

                    browserCanvasContext.moveTo(candle.stickPoint1.x, candle.stickPoint1.y);
                    browserCanvasContext.lineTo(candle.stickPoint2.x, candle.stickPoint2.y);
                    browserCanvasContext.lineTo(candle.stickPoint3.x, candle.stickPoint3.y);
                    browserCanvasContext.lineTo(candle.stickPoint4.x, candle.stickPoint4.y);

                    browserCanvasContext.closePath();

                    if (lowResolution === false) {
                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
                        browserCanvasContext.fill();
                    }

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
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
                        browserCanvasContext.lineTo(candle.candlePoint1.x, candle.candlePoint1.y);

                        elementsPlotted++
                    }

                    browserCanvasContext.closePath();

                    if (lowResolution === false) {

                        if (direction === 'up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'; }
                        if (direction === 'down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'; }
                        if (direction === 'side') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                        browserCanvasContext.fill();
                    }

                    if (direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)'; }
                    if (direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', 1)'; }
                    if (direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'; }

                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
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
            return elementsPlotted
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





