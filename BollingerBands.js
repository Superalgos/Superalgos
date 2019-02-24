function newAAMastersPlottersBollingerBandsBollingerBands ()
{

    const MODULE_NAME = "Bands Plotter";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
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

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Periods.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let bands = [];                   // Here we keep the bands to be ploted every time the Draw() function is called by the AAWebPlatform.

    return thisObject;

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

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

            viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            marketFiles.eventHandler.listenToEvent("Files Updated", onFilesUpdated);
            canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            /* Get ready for plotting. */

            recalculate();

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err.message = " + err.message); }
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

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err.message = " + err.message); }
        }
    }

    function onFilesUpdated() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onFilesUpdated -> Entering function."); }

            let newMarketFile = marketFiles.getFile(timePeriod);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;
                recalculate();
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onFilesUpdated -> err.message = " + err.message); }
        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

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

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err.message = " + err.message); }
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

            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFileLoaded -> err.message = " + err.message); }
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            this.container.frame.draw();

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err.message = " + err.message); }
        }
    }

    function recalculate() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculate -> Entering function."); }

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Bands Changed", bands);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err.message = " + err.message); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingDailyFiles -> Entering function."); }

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err.message = " + err.message); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingMarketFiles -> Entering function."); }

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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

            //console.log("Olivia > recalculateUsingMarketFiles > total bands generated : " + bands.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err.message = " + err.message); }
        }
    }

    function recalculateScale() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> Entering function."); }

            if (marketFile === undefined) { return; } // We need the market file to be loaded to make the calculation.

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: EARLIEST_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(getMaxRate()) / 4 // TODO: This 4 is temporary
            };


            timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            );

            function getMaxRate() {

                if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> getMaxRate -> Entering function."); }

                let maxValue = 0;

                for (let i = 0; i < marketFile.length; i++) {

                    let currentMax = marketFile[i][2];   // 2 = movingAvarage.

                    if (maxValue < currentMax) {
                        maxValue = currentMax;
                    }
                }

                return maxValue;

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> err.message = " + err.message); }
        }
    }

    function plotChart() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] plotChart -> Entering function."); }

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

                    bandPoint1 = timeLineCoordinateSystem.transformThisPoint(bandPoint1);
                    bandPoint2 = timeLineCoordinateSystem.transformThisPoint(bandPoint2);
                    bandPoint3 = timeLineCoordinateSystem.transformThisPoint(bandPoint3);
                    bandPoint4 = timeLineCoordinateSystem.transformThisPoint(bandPoint4);
                    bandPoint5 = timeLineCoordinateSystem.transformThisPoint(bandPoint5);
                    bandPoint6 = timeLineCoordinateSystem.transformThisPoint(bandPoint6);

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



                    /* First we are drawing a semi-transparent background */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(bandPoint1.x, bandPoint1.y);
                    browserCanvasContext.lineTo(bandPoint2.x, bandPoint2.y);
                    browserCanvasContext.lineTo(bandPoint3.x, bandPoint3.y);
                    browserCanvasContext.lineTo(bandPoint4.x, bandPoint4.y);

                    browserCanvasContext.closePath();

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= band.begin && dateValue <= band.end) {

                            /* highlight the current band */

                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.05)'; // Current band accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 0.05)';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 0.05)';

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


                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= band.begin && dateValue <= band.end) {

                            /* highlight the current band */

                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current band accroding to time

                            let currentBand = {
                                bodyWidth: bandPoint3.x - bandPoint2.x,
                                leftBodyHeight: bandPoint2.y - bandPoint1.y,
                                rightBodyHeight: bandPoint3.y - bandPoint4.y,
                                topDelta: bandPoint3.y - bandPoint2.y,
                                bottomDelta: bandPoint4.y - bandPoint1.y,
                                period: timePeriod,
                                innerBand: band
                            };

                            thisObject.container.eventHandler.raiseEvent("Current Band Changed", currentBand);

                        } else {

                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';

                        }

                    } else {

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';
                    }

                    browserCanvasContext.lineWidth = 0.2;
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

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= band.begin && dateValue <= band.end) {
                            /* highlight the current band */
                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current band accroding to time
                        }
                    }

                    browserCanvasContext.lineWidth = 0.2;
                    browserCanvasContext.stroke();


                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err.message = " + err.message); }
        }
    }


    function onZoomChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onZoomChanged -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onZoomChanged -> err.message = " + err.message); }
        }
    }

    function onOffsetChanged() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onOffsetChanged -> Entering function."); }

            if (Math.random() * 100 > 95) {

                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onOffsetChanged -> err.message = " + err.message); }
        }
    }

    function onDragFinished() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDragFinished -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err.message = " + err.message); }
        }
    }
}

