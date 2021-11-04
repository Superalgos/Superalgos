function newBollingerPlottersBollingerBandsPercentageBandwidth() {

    const MODULE_NAME = "Bands Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    

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

        currentPercentageBandwidth: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let plotAreaFrame = newCoordinateSystem();  // Used for full frame view.
    let plotAreaViewport = newCoordinateSystem();  // Used for viewport view.

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    /* these are module specific variables: */

    let percentageBandwidthArray = [];                   // Here we keep the percentageBandwidthArray to be plotted every time the Draw() function is called by the AAWebPlatform.

    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necessary events. */

            UI.projects.foundations.spaces.chartingSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            UI.projects.foundations.spaces.chartingSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
            marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId);
            dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId);

            /* Destroyed References */

            marketFiles = undefined;
            dailyFiles = undefined;

            datetime = undefined;
            timeFrame = undefined;

            marketFile = undefined;
            fileCursor = undefined;

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

            recalculateScaleY();
            recalculateScaleX();

            /* Now we set the right files according to current Time Frame. */

            marketFile = marketFiles.getFile(pTimeFrame);
            fileCursor = dailyFiles.getFileCursor(pTimeFrame);

            /* Listen to the necessary events. */

            zoomChangedEventSubscriptionId = UI.projects.foundations.spaces.chartingSpace.viewport.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = UI.projects.foundations.spaces.chartingSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);

            /* Get ready for plotting. */

            recalculate();

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScaleY();
                recalculateScaleX();
                recalculate();
            })

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function recalculateScale() {

        recalculateScaleY();
        recalculateScaleX();

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

            thisObject.container.eventHandler.raiseEvent("Bands Changed", percentageBandwidthArray);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = UI.projects.foundations.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, plotAreaFrame);
            let rightDate = UI.projects.foundations.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, plotAreaFrame);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            percentageBandwidthArray = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let percentageBandwidth = {
                            begin: undefined,
                            end: undefined,
                            value: undefined,
                            movingAverage: undefined,
                            bandwidth: undefined
                        };

                        percentageBandwidth.begin = dailyFile[i][0];
                        percentageBandwidth.end = dailyFile[i][1];
                        percentageBandwidth.value = dailyFile[i][2];
                        percentageBandwidth.movingAverage = dailyFile[i][3];
                        percentageBandwidth.bandwidth = dailyFile[i][4];

                        if (percentageBandwidth.begin >= farLeftDate.valueOf() && percentageBandwidth.end <= farRightDate.valueOf()) {

                            percentageBandwidthArray.push(percentageBandwidth);

                            if (datetime.valueOf() >= percentageBandwidth.begin && datetime.valueOf() <= percentageBandwidth.end) {

                                thisObject.currentPercentageBandwidth = percentageBandwidth;
                                thisObject.container.eventHandler.raiseEvent("Current Percentage Bandwidth Changed", thisObject.currentPercentageBandwidth);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lets check if all the visible screen is going to be covered by percentageBandwidthArray. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (percentageBandwidthArray.length > 0) {

                if (percentageBandwidthArray[0].begin > lowerEnd || percentageBandwidthArray[percentageBandwidthArray.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating percentageBandwidthArray, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total percentageBandwidthArray generated : " + percentageBandwidthArray.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = UI.projects.foundations.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, plotAreaFrame);
            let rightDate = UI.projects.foundations.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, plotAreaFrame);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            percentageBandwidthArray = [];

            for (let i = 0; i < marketFile.length; i++) {

                let percentageBandwidth = {
                    begin: undefined,
                    end: undefined,
                    value: undefined,
                    movingAverage: undefined,
                    bandwidth: undefined
                };

                percentageBandwidth.begin = marketFile[i][0];
                percentageBandwidth.end = marketFile[i][1];
                percentageBandwidth.value = marketFile[i][2];
                percentageBandwidth.movingAverage = marketFile[i][3];
                percentageBandwidth.bandwidth = marketFile[i][4];

                if (percentageBandwidth.begin >= leftDate.valueOf() && percentageBandwidth.end <= rightDate.valueOf()) {

                    percentageBandwidthArray.push(percentageBandwidth);

                    if (datetime.valueOf() >= percentageBandwidth.begin && datetime.valueOf() <= percentageBandwidth.end) {

                        thisObject.currentPercentageBandwidth = percentageBandwidth;
                        thisObject.container.eventHandler.raiseEvent("Current Percentage Bandwidth Changed", thisObject.currentPercentageBandwidth);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total percentageBandwidthArray generated : " + percentageBandwidthArray.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function recalculateScaleX() {

        try {

            var minValue = {
                x: MIN_PLOTABLE_DATE.valueOf()
            };

            var maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf()
            };

            plotAreaViewport.initializeX(
                minValue,
                maxValue,
                thisObject.container.frame.width
            );

            plotAreaFrame.initializeX(
                minValue,
                maxValue,
                thisObject.container.frame.width
            );

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScaleX -> err = " + err.stack); }
        }
    }

    function recalculateScaleY() {

        try {

            var minValue = {
                y: 0
            };

            var maxValue = {
                y: 0
            };

            maxValue.y = 100;

            plotAreaViewport.initializeY(
                minValue,
                maxValue,
                UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft.y
            );

            plotAreaFrame.initializeY(
                minValue,
                maxValue,
                thisObject.container.frame.height
            );

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScaleY -> err = " + err.stack); }
        }
    }


    function plotChart() {

        try {

            let userPosition = getUserPosition()
            let userPositionDate = userPosition.point.x

            let percentageBandwidth;
            let previousBand;

            if (percentageBandwidthArray.length > 0) {

                /* This next section is to get ready in order to be able to plot dynamically constrained to the viewport */

                let visibleHeight = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topLeft.y;

                let frameCorner1 = {
                    x: 0,
                    y: 0
                };

                let frameCorner2 = {
                    x: thisObject.container.frame.width,
                    y: thisObject.container.frame.height
                };

                /* Now the transformations. */

                frameCorner1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(frameCorner1, thisObject.container.frame.container);
                frameCorner2 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(frameCorner2, thisObject.container.frame.container);

                let frameHeightInViewPort = frameCorner2.y - frameCorner1.y;
                let pbChartHeight = 20;
                let pbOffset = 100 / 5 * 4;

                /* Now we calculate and plot the percentageBandwidthArray */

                for (let i = 1; i < percentageBandwidthArray.length; i++) {

                    percentageBandwidth = percentageBandwidthArray[i];
                    previousBand = percentageBandwidthArray[i - 1];

                    /* Here we will draw the percent bandwidth chart */

                    let currentPercentBandwidth = percentageBandwidth.value * pbChartHeight / 100;
                    if (currentPercentBandwidth > pbChartHeight) { currentPercentBandwidth = pbChartHeight };
                    if (currentPercentBandwidth < 0) { currentPercentBandwidth = 0 };

                    let previousPercentBandwidth = previousBand.value * pbChartHeight / 100;
                    if (previousPercentBandwidth > pbChartHeight) { previousPercentBandwidth = pbChartHeight };
                    if (previousPercentBandwidth < 0) { previousPercentBandwidth = 0 };

                    let currentMovingAverage = percentageBandwidth.movingAverage * pbChartHeight / 100;
                    let previousMovingAverage = previousBand.movingAverage * pbChartHeight / 100;

                    let currentBandwidth = percentageBandwidth.bandwidth * 100 * pbChartHeight / 100;
                    let previousBandwidth = previousBand.bandwidth * 100 * pbChartHeight / 100;

                    let pbPoint1;
                    let pbPoint2;
                    let pbPoint3;
                    let pbPoint4;
                    let pbPoint5;
                    let pbPoint6;
                    let pbPoint7;
                    let pbPoint8;
                    let pbPoint9;
                    let pbPoint10;

                    function calculateCoordinates(plot, height) {

                        pbPoint1 = {
                            x: percentageBandwidth.begin,
                            y: previousPercentBandwidth + pbOffset
                        };

                        pbPoint2 = {
                            x: percentageBandwidth.end,
                            y: currentPercentBandwidth + pbOffset
                        };

                        /* Points needed for the lines */

                        pbPoint3 = {
                            x: 0,
                            y: 0 * pbChartHeight / 100 + pbOffset
                        };

                        pbPoint4 = {
                            x: 0,
                            y: 30 * pbChartHeight / 100 + pbOffset
                        };

                        pbPoint5 = {
                            x: 0,
                            y: 70 * pbChartHeight / 100 + pbOffset
                        };

                        pbPoint6 = {
                            x: 0,
                            y: 100 * pbChartHeight / 100 + pbOffset
                        };

                        /* Moving Average */

                        pbPoint7 = {
                            x: percentageBandwidth.begin,
                            y: previousMovingAverage + pbOffset
                        };

                        pbPoint8 = {
                            x: percentageBandwidth.end,
                            y: currentMovingAverage + pbOffset
                        };

                        /* Bandwidth */

                        pbPoint9 = {
                            x: percentageBandwidth.begin,
                            y: previousBandwidth + pbOffset
                        };

                        pbPoint10 = {
                            x: percentageBandwidth.end,
                            y: currentBandwidth + pbOffset
                        };

                        pbPoint1 = plot.transformThisPoint(pbPoint1);
                        pbPoint2 = plot.transformThisPoint(pbPoint2);

                        pbPoint3 = plot.transformThisPoint(pbPoint3);
                        pbPoint4 = plot.transformThisPoint(pbPoint4);
                        pbPoint5 = plot.transformThisPoint(pbPoint5);
                        pbPoint6 = plot.transformThisPoint(pbPoint6);

                        pbPoint7 = plot.transformThisPoint(pbPoint7);
                        pbPoint8 = plot.transformThisPoint(pbPoint8);

                        pbPoint9 = plot.transformThisPoint(pbPoint9);
                        pbPoint10 = plot.transformThisPoint(pbPoint10);

                        pbPoint1 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint1, thisObject.container);
                        pbPoint2 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint2, thisObject.container);

                        pbPoint3 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint3, thisObject.container);
                        pbPoint4 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint4, thisObject.container);
                        pbPoint5 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint5, thisObject.container);
                        pbPoint6 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint6, thisObject.container);

                        pbPoint7 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint7, thisObject.container);
                        pbPoint8 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint8, thisObject.container);

                        pbPoint9 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint9, thisObject.container);
                        pbPoint10 = UI.projects.foundations.utilities.coordinateTransformations.transformThisPoint(pbPoint10, thisObject.container);

                        if (pbPoint1.x < UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x || pbPoint2.x > UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.x) {
                            return false;
                        }

                        return true;

                    }

                    if (calculateCoordinates(plotAreaFrame, thisObject.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                    if (frameHeightInViewPort > visibleHeight * 2 / 3) {

                        if (calculateCoordinates(plotAreaViewport, visibleHeight) === false) {
                            continue;
                        }  // We snap t to the view port.

                        /* Now we set the real value of y. */

                        pbPoint1.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (previousPercentBandwidth + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint2.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (currentPercentBandwidth + pbOffset) * plotAreaViewport.scale.y;

                        pbPoint3.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (0 * pbChartHeight / 100 + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint4.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (30 * pbChartHeight / 100 + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint5.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (70 * pbChartHeight / 100 + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint6.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (100 * pbChartHeight / 100 + pbOffset) * plotAreaViewport.scale.y;

                        pbPoint7.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (previousMovingAverage + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint8.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (currentMovingAverage + pbOffset) * plotAreaViewport.scale.y;

                        pbPoint9.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (previousBandwidth + pbOffset) * plotAreaViewport.scale.y;
                        pbPoint10.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - (currentBandwidth + pbOffset) * plotAreaViewport.scale.y;

                    }

                    /* Everything must fit within the visible area */

                    pbPoint1 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint1);
                    pbPoint2 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint2);

                    pbPoint3 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint3);
                    pbPoint4 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint4);
                    pbPoint5 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint5);
                    pbPoint6 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint6);

                    pbPoint7 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint7);
                    pbPoint8 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint8);

                    pbPoint9 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint9);
                    pbPoint10 = UI.projects.foundations.spaces.chartingSpace.viewport.fitIntoVisibleArea(pbPoint10);


                    /* Now the drawing of the lines */

                    let bgOpacityA = 0.05;
                    let bgOpacityB = 0.05;
                    let bgOpacityC = 0.05;

                    let fgOpacity = '1';

                    let lineWidthA = 0.2;
                    let lineWidthB = 0.2;
                    let lineWidthC = 0.2;

                    if (pbPoint1.y > pbPoint4.y || pbPoint2.y > pbPoint4.y) {
                        bgOpacityA = bgOpacityA * 2;
                    }

                    if (pbPoint1.y < pbPoint5.y || pbPoint2.y < pbPoint5.y) {
                        bgOpacityC = bgOpacityC * 2;
                    }

                    if (pbPoint1.y >= pbPoint3.y || pbPoint2.y >= pbPoint3.y) {
                        bgOpacityA = bgOpacityA * 1.5;
                        lineWidthA = lineWidthA * 2;
                    }

                    if (pbPoint1.y <= pbPoint6.y || pbPoint2.y <= pbPoint6.y) {
                        bgOpacityC = bgOpacityC * 1.5;
                        lineWidthC = lineWidthC * 2;
                    }

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint3.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint3.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint4.y);
                    browserCanvasContext.lineTo(pbPoint1.x, pbPoint4.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ',' + bgOpacityA + ' )';
                    browserCanvasContext.fill();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint4.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint4.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint5.y);
                    browserCanvasContext.lineTo(pbPoint1.x, pbPoint5.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + bgOpacityB + ')';
                    browserCanvasContext.fill();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint5.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint5.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint6.y);
                    browserCanvasContext.lineTo(pbPoint1.x, pbPoint6.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + bgOpacityC + ')';
                    browserCanvasContext.fill();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint3.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint3.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + fgOpacity + ')';
                    browserCanvasContext.lineWidth = lineWidthA;
                    browserCanvasContext.stroke();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint4.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint4.y);
                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint5.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint5.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + fgOpacity + ')';
                    browserCanvasContext.lineWidth = lineWidthB;
                    browserCanvasContext.stroke();

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint6.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint6.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + fgOpacity + ')';
                    browserCanvasContext.lineWidth = lineWidthC;
                    browserCanvasContext.stroke();

                    /* Now the drawing of the percentage bandwidth*/

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint1.x, pbPoint1.y);
                    browserCanvasContext.lineTo(pbPoint2.x, pbPoint2.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', 1)';

                    if (userPositionDate >= percentageBandwidth.begin && userPositionDate <= percentageBandwidth.end) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)';
                    }

                    browserCanvasContext.lineWidth = 0.2;
                    browserCanvasContext.stroke();

                    /* Now the drawing of the moving average*/

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint7.x, pbPoint7.y);
                    browserCanvasContext.lineTo(pbPoint8.x, pbPoint8.y);

                    browserCanvasContext.closePath();

                    if (pbPoint7.y > pbPoint8.y) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';
                    } else {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)';
                    }

                    if (userPositionDate >= percentageBandwidth.begin && userPositionDate <= percentageBandwidth.end) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)';
                    }

                    browserCanvasContext.lineWidth = 0.2;
                    browserCanvasContext.stroke();

                    /* Now the drawing of the bandwidth*/

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(pbPoint9.x, pbPoint9.y);
                    browserCanvasContext.lineTo(pbPoint10.x, pbPoint10.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)';

                    if (userPositionDate >= percentageBandwidth.begin && userPositionDate <= percentageBandwidth.end) {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)';
                    }

                    browserCanvasContext.setLineDash([1, 4])
                    browserCanvasContext.lineWidth = 1
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
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



