function newAAMastersPlottersStairsPatternsVolumeStairs() {

    const MODULE_NAME = "AAMasters Plotters Stairs Patterns Volume Stairs";
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
        draw: draw
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

    let scaleFile;                      // This file is used to calculate the scale.

    /* these are module specific variables: */

    let stairsArray = [];                   // Here we keep the stairsArray to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            scaleFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

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
        let userPosition = getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
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

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

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

            thisObject.container.eventHandler.raiseEvent("Volumes Changed", stairsArray);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }

        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

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
                            type: undefined,
                            begin: undefined,
                            end: undefined,
                            direction: undefined,
                            barsCount: 0,
                            firstAmount: 0,
                            lastAmount: 0
                        };

                        stairs.type = dailyFile[i][0];

                        stairs.begin = dailyFile[i][1];
                        stairs.end = dailyFile[i][2];

                        stairs.direction = dailyFile[i][3];
                        stairs.barsCount = dailyFile[i][4];
                        stairs.firstAmount = dailyFile[i][5];
                        stairs.lastAmount = dailyFile[i][6];

                        if (
                            (stairs.begin >= farLeftDate.valueOf() && stairs.end <= farRightDate.valueOf()) &&
                            (stairs.begin >= coordinateSystem.min.x && stairs.end <= coordinateSystem.max.x)
                        ) {

                            stairsArray.push(stairs);

                            if (datetime.valueOf() >= stairs.begin && datetime.valueOf() <= stairs.end) {

                                thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by stairsArray. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (stairsArray.length > 0) {

                if (stairsArray[0].begin > lowerEnd || stairsArray[stairsArray.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating stairsArray, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total stairsArray generated : " + stairsArray.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }

        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            stairsArray = [];

            for (let i = 0; i < marketFile.length; i++) {

                let stairs = {
                    type: undefined,
                    begin: undefined,
                    end: undefined,
                    direction: undefined,
                    barsCount: 0,
                    firstAmount: 0,
                    lastAmount: 0
                };

                stairs.type = marketFile[i][0];

                stairs.begin = marketFile[i][1];
                stairs.end = marketFile[i][2];

                stairs.direction = marketFile[i][3];
                stairs.barsCount = marketFile[i][4];
                stairs.firstAmount = marketFile[i][5];
                stairs.lastAmount = marketFile[i][6];

                if (
                    (stairs.begin >= leftDate.valueOf() && stairs.end <= rightDate.valueOf()) &&
                    (stairs.begin >= coordinateSystem.min.x && stairs.end <= coordinateSystem.max.x)
                ) {

                    stairsArray.push(stairs);

                    if (datetime.valueOf() >= stairs.begin && datetime.valueOf() <= stairs.end) {

                        thisObject.container.eventHandler.raiseEvent("Current Volume-Stairs Changed", thisObject.currentCandle);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total stairsArray generated : " + stairsArray.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }

        }
    }

    function plotChart() {

        try {

            let opacity = '0.25';

            let visibleHeight = canvas.chartSpace.viewport.visibleArea.bottomRight.y - canvas.chartSpace.viewport.visibleArea.topLeft.y;

            let frameCorner1 = {
                x: 0,
                y: 0
            };

            let frameCorner2 = {
                x: thisObject.container.frame.width,
                y: thisObject.container.frame.height
            };

            /* Now the transformations. */

            frameCorner1 = transformThisPoint(frameCorner1, thisObject.container.frame.container);
            frameCorner2 = transformThisPoint(frameCorner2, thisObject.container.frame.container);

            let frameHeightInViewPort = frameCorner2.y - frameCorner1.y;


            if (stairsArray.length > 0) {

                for (var i = 0; i < stairsArray.length; i++) {

                    stairs = stairsArray[i];

                    let volumeBarPointA1;
                    let volumeBarPointA2;
                    let volumeBarPointA3;
                    let volumeBarPointA4;

                    if (stairs.type === 'buy') {

                        function calculateBuys(plot, height) {

                            volumeBarPointA1 = {
                                x: stairs.begin + timeFrame / 2,
                                y: 0
                            };

                            volumeBarPointA2 = {
                                x: stairs.begin + timeFrame / 2,
                                y: stairs.firstAmount * 2
                            };

                            volumeBarPointA3 = {
                                x: stairs.end - timeFrame / 2,
                                y: stairs.lastAmount * 2
                            };

                            volumeBarPointA4 = {
                                x: stairs.end - timeFrame / 2,
                                y: 0
                            };


                            volumeBarPointA1 = plot.transformThisPoint(volumeBarPointA1);
                            volumeBarPointA2 = plot.transformThisPoint(volumeBarPointA2);
                            volumeBarPointA3 = plot.transformThisPoint(volumeBarPointA3);
                            volumeBarPointA4 = plot.transformThisPoint(volumeBarPointA4);

                            volumeBarPointA1 = transformThisPoint(volumeBarPointA1, thisObject.container);
                            volumeBarPointA2 = transformThisPoint(volumeBarPointA2, thisObject.container);
                            volumeBarPointA3 = transformThisPoint(volumeBarPointA3, thisObject.container);
                            volumeBarPointA4 = transformThisPoint(volumeBarPointA4, thisObject.container);

                            if (volumeBarPointA4.x < canvas.chartSpace.viewport.visibleArea.bottomLeft.x || volumeBarPointA1.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x) {
                                return false;
                            }

                            return true;
                        }

                        if (calculateBuys(coordinateSystem, thisObject.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                        if (volumeBarPointA1.y > canvas.chartSpace.viewport.visibleArea.bottomLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                            if (calculateBuys(coordinateSystem, visibleHeight) === false) { continue; }  // We snap t to the view port.

                            /* Now we set the real value of y. */

                            volumeBarPointA1.y = canvas.chartSpace.viewport.visibleArea.bottomRight.y;
                            volumeBarPointA2.y = canvas.chartSpace.viewport.visibleArea.bottomRight.y - stairs.firstAmount * 2 * coordinateSystem.scale.y;
                            volumeBarPointA3.y = canvas.chartSpace.viewport.visibleArea.bottomRight.y - stairs.lastAmount * 2 * coordinateSystem.scale.y;
                            volumeBarPointA4.y = canvas.chartSpace.viewport.visibleArea.bottomRight.y;

                        }
                    }

                    let volumeBarPointB1;
                    let volumeBarPointB2;
                    let volumeBarPointB3;
                    let volumeBarPointB4;

                    if (stairs.type === 'sell') {

                        function calculateSells(plot, height) {

                            volumeBarPointB1 = {
                                x: stairs.begin + timeFrame / 2,
                                y: height
                            };

                            volumeBarPointB2 = {
                                x: stairs.begin + timeFrame / 2,
                                y: height - stairs.firstAmount * 2
                            };

                            volumeBarPointB3 = {
                                x: stairs.end - timeFrame / 2,
                                y: height - stairs.lastAmount * 2
                            };

                            volumeBarPointB4 = {
                                x: stairs.end - timeFrame / 2,
                                y: height
                            };

                            volumeBarPointB1 = plot.transformThisPoint2(volumeBarPointB1);
                            volumeBarPointB2 = plot.transformThisPoint2(volumeBarPointB2);
                            volumeBarPointB3 = plot.transformThisPoint2(volumeBarPointB3);
                            volumeBarPointB4 = plot.transformThisPoint2(volumeBarPointB4);

                            volumeBarPointB1 = transformThisPoint(volumeBarPointB1, thisObject.container);
                            volumeBarPointB2 = transformThisPoint(volumeBarPointB2, thisObject.container);
                            volumeBarPointB3 = transformThisPoint(volumeBarPointB3, thisObject.container);
                            volumeBarPointB4 = transformThisPoint(volumeBarPointB4, thisObject.container);

                        }

                        calculateSells(coordinateSystem, thisObject.container.frame.height); // We try to see if it fits in the visible area.

                        if (volumeBarPointB1.y < canvas.chartSpace.viewport.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                            calculateSells(coordinateSystem, visibleHeight); // We snap it to the view port.

                            /* Now we set the real value of y. */

                            volumeBarPointB1.y = canvas.chartSpace.viewport.visibleArea.topLeft.y;
                            volumeBarPointB2.y = canvas.chartSpace.viewport.visibleArea.topLeft.y + stairs.firstAmount * 2 * coordinateSystem.scale.y;
                            volumeBarPointB3.y = canvas.chartSpace.viewport.visibleArea.topLeft.y + stairs.lastAmount * 2 * coordinateSystem.scale.y;
                            volumeBarPointB4.y = canvas.chartSpace.viewport.visibleArea.topLeft.y;

                        }
                    }

                    /* Everything must fit within the visible area */

                    if (stairs.type === 'buy') {

                        volumeBarPointA1 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointA1);
                        volumeBarPointA2 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointA2);
                        volumeBarPointA3 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointA3);
                        volumeBarPointA4 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointA4);

                        volumeBarPointA1 = thisObject.fitFunction(volumeBarPointA1);
                        volumeBarPointA2 = thisObject.fitFunction(volumeBarPointA2);
                        volumeBarPointA3 = thisObject.fitFunction(volumeBarPointA3);
                        volumeBarPointA4 = thisObject.fitFunction(volumeBarPointA4);

                    } else {

                        volumeBarPointB1 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointB1);
                        volumeBarPointB2 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointB2);
                        volumeBarPointB3 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointB3);
                        volumeBarPointB4 = canvas.chartSpace.viewport.fitIntoVisibleArea(volumeBarPointB4);

                        volumeBarPointB1 = thisObject.fitFunction(volumeBarPointB1);
                        volumeBarPointB2 = thisObject.fitFunction(volumeBarPointB2);
                        volumeBarPointB3 = thisObject.fitFunction(volumeBarPointB3);
                        volumeBarPointB4 = thisObject.fitFunction(volumeBarPointB4);

                    }

                    /* Now the drawing */

                    if (stairs.type === 'buy') {

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(volumeBarPointA1.x, volumeBarPointA1.y);
                        browserCanvasContext.lineTo(volumeBarPointA2.x, volumeBarPointA2.y);
                        browserCanvasContext.lineTo(volumeBarPointA3.x, volumeBarPointA3.y);
                        browserCanvasContext.lineTo(volumeBarPointA4.x, volumeBarPointA4.y);

                        browserCanvasContext.closePath();

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')';
 
                        if (userPositionDate >= stairs.begin && userPositionDate <= stairs.end) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')'; // Current bar accroding to time
                        }  
 
                        browserCanvasContext.fill();
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.stroke();

                    } else {

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(volumeBarPointB1.x, volumeBarPointB1.y);
                        browserCanvasContext.lineTo(volumeBarPointB2.x, volumeBarPointB2.y);
                        browserCanvasContext.lineTo(volumeBarPointB3.x, volumeBarPointB3.y);
                        browserCanvasContext.lineTo(volumeBarPointB4.x, volumeBarPointB4.y);

                        browserCanvasContext.closePath();

                        if (userPositionDate >= stairs.begin && userPositionDate <= stairs.end) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')'; // Current candle accroding to time
                        }  

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';

                        browserCanvasContext.fill();
                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.stroke();

                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }

        }
    }

    function onViewportZoomChanged(event) {
        recalculate();
    }

    function onDragFinished() {
        recalculate();
    }

    function onViewportPositionChanged(event) {

        try {

            if (event !== undefined) {
                if (event.recalculate === true) {
                    recalculate();
                    return
                }
            }
            if (Math.random() * 100 > 95) {
                recalculate();
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportPositionChanged -> err = " + err.stack); }

        }
    }
}

