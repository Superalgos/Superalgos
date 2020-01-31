function newAAMastersPlottersStairsPatternsCandleStairs() {

    const MODULE_NAME = "AAMasters Plotters Stairs Patterns Candle Stairs";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded, 

        // Main functions and properties.

        container: undefined,
        initialize: initialize,
        finalize: finalize,
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        setCoordinateSystem: setCoordinateSystem,
        recalculateScale: recalculateScale, 
        draw: draw,

        // Secondary functions and properties.

        currentStair: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let coordinateSystem

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    /* these are module specific variables: */

    let stairsArray = [];              // Here we keep the candle-stairs to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            finalizeCoordinateSystem()
            coordinateSystem = undefined
        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err.message = " + err.message); }
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

            zoomChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
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
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);

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
        let userPosition = getDateFromPoint(event, thisObject.container, coordinateSystem)
        userPositionDate = userPosition.valueOf()
    }

    function getContainer(point) {

        try {

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

            if (INTENSIVE_LOG === true) { logger.write("[INFO] onDailyFileLoaded -> Entering function."); }

            this.container.frame.draw();

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

            thisObject.container.eventHandler.raiseEvent("CandleStairs Changed", stairsArray);

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

            stairsArray = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let stairs = {
                            open: undefined,
                            close: undefined,
                            min: 10000000000000,
                            max: 0,
                            begin: undefined,
                            end: undefined,
                            direction: undefined,
                            candleCount: 0,
                            firstMin: 0,
                            firstMax: 0,
                            lastMin: 0,
                            lastMax: 0
                        };

                        stairs.open = dailyFile[i][0];
                        stairs.close = dailyFile[i][1];

                        stairs.min = dailyFile[i][2];
                        stairs.max = dailyFile[i][3];

                        stairs.begin = dailyFile[i][4];
                        stairs.end = dailyFile[i][5];

                        stairs.direction = dailyFile[i][6];
                        stairs.candleCount = dailyFile[i][7];

                        stairs.firstMin = dailyFile[i][8];
                        stairs.firstMax = dailyFile[i][9];

                        stairs.lastMin = dailyFile[i][10];
                        stairs.lastMax = dailyFile[i][11];

                        if (
                            (stairs.begin >= farLeftDate.valueOf() && stairs.end <= farRightDate.valueOf()) &&
                            (stairs.begin >= coordinateSystem.min.x && stairs.end <= coordinateSystem.max.x)
                        ) {

                            stairsArray.push(stairs);

                            if (datetime.valueOf() >= stairs.begin && datetime.valueOf() <= stairs.end) {

                                thisObject.currentStair = stairs;
                                thisObject.container.eventHandler.raiseEvent("Current Candle-Stairs Changed", thisObject.currentStair);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by candle-stairs. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (stairsArray.length > 0) {

                if (stairsArray[0].begin > lowerEnd || stairsArray[stairsArray.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating candle-stairs, scheduling a recalculation in 2 seconds.");

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

            stairsArray = [];

            for (let i = 0; i < marketFile.length; i++) {

                let stairs = {
                    open: undefined,
                    close: undefined,
                    min: 10000000000000,
                    max: 0,
                    begin: undefined,
                    end: undefined,
                    direction: undefined,
                    candleCount: 0,
                    firstMin: 0,
                    firstMax: 0,
                    lastMin: 0,
                    lastMax: 0
                };

                stairs.open = marketFile[i][0];
                stairs.close = marketFile[i][1];

                stairs.min = marketFile[i][2];
                stairs.max = marketFile[i][3];

                stairs.begin = marketFile[i][4];
                stairs.end = marketFile[i][5];

                stairs.direction = marketFile[i][6];
                stairs.candleCount = marketFile[i][7];

                stairs.firstMin = marketFile[i][8];
                stairs.firstMax = marketFile[i][9];

                stairs.lastMin = marketFile[i][10];
                stairs.lastMax = marketFile[i][11];

                if (
                    (stairs.begin >= leftDate.valueOf() && stairs.end <= rightDate.valueOf()) &&
                    (stairs.begin >= coordinateSystem.min.x && stairs.end <= coordinateSystem.max.x)
                ) {

                    stairsArray.push(stairs);

                    if (datetime.valueOf() >= stairs.begin && datetime.valueOf() <= stairs.end) {

                        thisObject.currentStair = stairs;
                        thisObject.container.eventHandler.raiseEvent("Current Candle-Stairs Changed", thisObject.currentStair);

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
                y: nextPorwerOf10(MAX_DEFAULT_RATE_SCALE_VALUE) / 4 // TODO: This 4 is temporary
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

            if (stairsArray.length > 0) {

                for (var i = 0; i < stairsArray.length; i++) {

                    stairs = stairsArray[i];

                    let stairsPoint1;
                    let stairsPoint2;
                    let stairsPoint3;
                    let stairsPoint4;

                    if (stairs.direction === 'up') {

                        stairsPoint1 = {
                            x: stairs.begin + timeFrame / 7 * 5.5,
                            y: stairs.firstMin
                        };

                        stairsPoint2 = {
                            x: stairs.end - timeFrame / 7 * 1.5,
                            y: stairs.lastMin
                        };

                        stairsPoint3 = {
                            x: stairs.end - timeFrame / 7 * 5.5,
                            y: stairs.lastMax
                        };

                        stairsPoint4 = {
                            x: stairs.begin + timeFrame / 7 * 1.5,
                            y: stairs.firstMax
                        };

                    } else {

                        stairsPoint1 = {
                            x: stairs.begin + timeFrame / 7 * 1.5,
                            y: stairs.firstMin
                        };

                        stairsPoint2 = {
                            x: stairs.end - timeFrame / 7 * 5.5,
                            y: stairs.lastMin
                        };

                        stairsPoint3 = {
                            x: stairs.end - timeFrame / 7 * 1.5,
                            y: stairs.lastMax
                        };

                        stairsPoint4 = {
                            x: stairs.begin + timeFrame / 7 * 5.5,
                            y: stairs.firstMax
                        };
                    }

                    stairsPoint1 = coordinateSystem.transformThisPoint(stairsPoint1);
                    stairsPoint2 = coordinateSystem.transformThisPoint(stairsPoint2);
                    stairsPoint3 = coordinateSystem.transformThisPoint(stairsPoint3);
                    stairsPoint4 = coordinateSystem.transformThisPoint(stairsPoint4);

                    stairsPoint1 = transformThisPoint(stairsPoint1, thisObject.container);
                    stairsPoint2 = transformThisPoint(stairsPoint2, thisObject.container);
                    stairsPoint3 = transformThisPoint(stairsPoint3, thisObject.container);
                    stairsPoint4 = transformThisPoint(stairsPoint4, thisObject.container);

                    if (stairsPoint2.x < canvas.chartSpace.viewport.visibleArea.bottomLeft.x || stairsPoint1.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x) {
                        continue;
                    }

                    stairsPoint1 = canvas.chartSpace.viewport.fitIntoVisibleArea(stairsPoint1);
                    stairsPoint2 = canvas.chartSpace.viewport.fitIntoVisibleArea(stairsPoint2);
                    stairsPoint3 = canvas.chartSpace.viewport.fitIntoVisibleArea(stairsPoint3);
                    stairsPoint4 = canvas.chartSpace.viewport.fitIntoVisibleArea(stairsPoint4);

                    stairsPoint1 = thisObject.fitFunction(stairsPoint1);
                    stairsPoint2 = thisObject.fitFunction(stairsPoint2);
                    stairsPoint3 = thisObject.fitFunction(stairsPoint3);
                    stairsPoint4 = thisObject.fitFunction(stairsPoint4);

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(stairsPoint1.x, stairsPoint1.y);
                    browserCanvasContext.lineTo(stairsPoint2.x, stairsPoint2.y);
                    browserCanvasContext.lineTo(stairsPoint3.x, stairsPoint3.y);
                    browserCanvasContext.lineTo(stairsPoint4.x, stairsPoint4.y);

                    browserCanvasContext.closePath();

                    let opacity = '0.25';

                    if (stairs.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')'; }
                    if (stairs.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')'; }

                    if (stairs.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')'; }
                    if (stairs.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'; }

                    if (userPositionDate >= stairs.begin && userPositionDate <= stairs.end) {
                        /* highlight the current stairs */
                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.1)'; // Current stairs accroding to time
                    }  

                    browserCanvasContext.fill();

                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();
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

    function onDragFinished() {

        try {

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }

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
}

