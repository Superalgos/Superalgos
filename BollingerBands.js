function newAAMastersPlottersBollingerBandsBollingerBands() {

    const MODULE_NAME = "Bands Plotter";
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

        currentBand: undefined
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

    let bands = [];                   // Here we keep the bands to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);

            /* Get ready for plotting. */

            recalculate();

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScale();
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

            thisObject.container.eventHandler.raiseEvent("Bands Changed", bands);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            bands = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let band = {
                            begin: undefined,
                            end: undefined,
                            movingAverage: undefined,
                            standardDeviation: undefined,
                            deviation: undefined
                        };

                        band.begin = dailyFile[i][0];
                        band.end = dailyFile[i][1];
                        band.movingAverage = dailyFile[i][2];
                        band.standardDeviation = dailyFile[i][3];
                        band.deviation = dailyFile[i][4];

                        if (band.begin >= farLeftDate.valueOf() && band.end <= farRightDate.valueOf()) {

                            bands.push(band);

                            if (datetime.valueOf() >= band.begin && datetime.valueOf() <= band.end) {

                                thisObject.currentBand = band;
                                thisObject.container.eventHandler.raiseEvent("Current Band Changed", thisObject.currentBand);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by bands. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (bands.length > 0) {

                if (bands[0].begin > lowerEnd || bands[bands.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating bands, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total bands generated : " + bands.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            bands = [];

            for (let i = 0; i < marketFile.length; i++) {

                let band = {
                    begin: undefined,
                    end: undefined,
                    movingAverage: undefined,
                    standardDeviation: undefined,
                    deviation: undefined
                };

                band.begin = marketFile[i][0];
                band.end = marketFile[i][1];
                band.movingAverage = marketFile[i][2];
                band.standardDeviation = marketFile[i][3];
                band.deviation = marketFile[i][4];

                if (band.begin >= leftDate.valueOf() && band.end <= rightDate.valueOf()) {

                    bands.push(band);

                    if (datetime.valueOf() >= band.begin && datetime.valueOf() <= band.end) {

                        thisObject.currentBand = band;
                        thisObject.container.eventHandler.raiseEvent("Current Band Changed", thisObject.currentBand);

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

            let band;
            let previousBand;

            if (bands.length > 0) {

                /* Now we calculate and plot the bands */

                for (let i = 1; i < bands.length; i++) {

                    band = bands[i];
                    previousBand = bands[i - 1];

                    /* From here we draw the actual Bollinger Bands and lines it contains. */

                    let bandPoint1 = {
                        x: band.begin,
                        y: previousBand.movingAverage - previousBand.deviation
                    };

                    let bandPoint2 = {
                        x: band.begin,
                        y: previousBand.movingAverage + previousBand.deviation
                    };

                    let bandPoint3 = {
                        x: band.end,
                        y: band.movingAverage + band.deviation
                    };

                    let bandPoint4 = {
                        x: band.end,
                        y: band.movingAverage - band.deviation
                    };

                    let bandPoint5 = {
                        x: band.begin,
                        y: previousBand.movingAverage
                    };

                    let bandPoint6 = {
                        x: band.end,
                        y: band.movingAverage
                    };

                    bandPoint1 = coordinateSystem.transformThisPoint(bandPoint1);
                    bandPoint2 = coordinateSystem.transformThisPoint(bandPoint2);
                    bandPoint3 = coordinateSystem.transformThisPoint(bandPoint3);
                    bandPoint4 = coordinateSystem.transformThisPoint(bandPoint4);
                    bandPoint5 = coordinateSystem.transformThisPoint(bandPoint5);
                    bandPoint6 = coordinateSystem.transformThisPoint(bandPoint6);

                    bandPoint1 = transformThisPoint(bandPoint1, thisObject.container);
                    bandPoint2 = transformThisPoint(bandPoint2, thisObject.container);
                    bandPoint3 = transformThisPoint(bandPoint3, thisObject.container);
                    bandPoint4 = transformThisPoint(bandPoint4, thisObject.container);
                    bandPoint5 = transformThisPoint(bandPoint5, thisObject.container);
                    bandPoint6 = transformThisPoint(bandPoint6, thisObject.container);

                    if (bandPoint2.x < viewPort.visibleArea.bottomLeft.x || bandPoint1.x > viewPort.visibleArea.bottomRight.x) {
                        continue;
                    }

                    bandPoint1 = viewPort.fitIntoVisibleArea(bandPoint1);
                    bandPoint2 = viewPort.fitIntoVisibleArea(bandPoint2);
                    bandPoint3 = viewPort.fitIntoVisibleArea(bandPoint3);
                    bandPoint4 = viewPort.fitIntoVisibleArea(bandPoint4);
                    bandPoint5 = viewPort.fitIntoVisibleArea(bandPoint5);
                    bandPoint6 = viewPort.fitIntoVisibleArea(bandPoint6);

                    bandPoint1 = thisObject.fitFunction(bandPoint1);
                    bandPoint2 = thisObject.fitFunction(bandPoint2);
                    bandPoint3 = thisObject.fitFunction(bandPoint3);
                    bandPoint4 = thisObject.fitFunction(bandPoint4);
                    bandPoint5 = thisObject.fitFunction(bandPoint5);
                    bandPoint6 = thisObject.fitFunction(bandPoint6);


                    /* First we are drawing a semi-transparent background */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(bandPoint1.x, bandPoint1.y);
                    browserCanvasContext.lineTo(bandPoint2.x, bandPoint2.y);
                    browserCanvasContext.lineTo(bandPoint3.x, bandPoint3.y);
                    browserCanvasContext.lineTo(bandPoint4.x, bandPoint4.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 0.05)';

                    if (userPositionDate >= band.begin && userPositionDate <= band.end) {
                        /* highlight the current band */
                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.05)'; // Current band accroding to time
                    }

                    if (
                        bandPoint1.x < viewPort.visibleArea.topLeft.x + 50
                        ||
                        bandPoint1.x > viewPort.visibleArea.bottomRight.x - 50
                    ) {
                        // we leave this bands without fill.
                    } else {
                        browserCanvasContext.fill();
                    }




                    /* Next we are drawing the outter bands lines */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(bandPoint1.x, bandPoint1.y);
                    browserCanvasContext.lineTo(bandPoint4.x, bandPoint4.y);
                    browserCanvasContext.moveTo(bandPoint2.x, bandPoint2.y);
                    browserCanvasContext.lineTo(bandPoint3.x, bandPoint3.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';

                    if (userPositionDate >= band.begin && userPositionDate <= band.end) {

                        /* highlight the current band */

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current band accroding to time

                        let currentBand = {
                            bodyWidth: bandPoint3.x - bandPoint2.x,
                            leftBodyHeight: bandPoint2.y - bandPoint1.y,
                            rightBodyHeight: bandPoint3.y - bandPoint4.y,
                            topDelta: bandPoint3.y - bandPoint2.y,
                            bottomDelta: bandPoint4.y - bandPoint1.y,
                            period: timeFrame,
                            innerBand: band
                        };

                        thisObject.container.eventHandler.raiseEvent("Current Band Changed", currentBand);
                    }

                    browserCanvasContext.lineWidth = 0.2;
                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.stroke();



                    /* Finally we draw the moving average line */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(bandPoint5.x, bandPoint5.y);
                    browserCanvasContext.lineTo(bandPoint6.x, bandPoint6.y);

                    browserCanvasContext.closePath();

                    if (bandPoint5.y > bandPoint6.y) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';
                    } else {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)';
                    }

                    if (userPositionDate >= band.begin && userPositionDate <= band.end) {
                        /* highlight the current band */
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current band accroding to time
                    }

                    browserCanvasContext.lineWidth = 0.2;
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

    function onOffsetChanged(event) {

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


