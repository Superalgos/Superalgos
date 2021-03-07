function newMastersPlottersCandlesVolumesVolumes() {

    const MODULE_NAME = "Volumes Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    

    let thisObject = {

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded,

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        setCoordinateSystem: setCoordinateSystem,
        recalculateScale: recalculateScale,
        draw: draw
    };

    /* this is part of the module template */

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let coordinateSystem

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                    // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    let scaleFile;                      // This file is used to calculate the scale.

    /* these are module specific variables: */

    let volumes = [];                   // Here we keep the volumes to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            scaleFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

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

    function recalculateScale() {
        recalculate();
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

        if (event.currentValue === event.totalValue) {
            /* This happens only when all of the files in the cursor have been loaded. */
            recalculate();
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
        if (timeFrame >= _1_HOUR_IN_MILISECONDS) {
            recalculateUsingMarketFiles();
        } else {
            recalculateUsingDailyFiles();
        }
        thisObject.container.eventHandler.raiseEvent("Volumes Changed", volumes);
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            volumes = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let volume = {
                            amountBuy: 0,
                            amountSell: 0,
                            begin: undefined,
                            end: undefined
                        };

                        volume.amountBuy = dailyFile[i][0];
                        volume.amountSell = dailyFile[i][1];

                        volume.begin = dailyFile[i][2];
                        volume.end = dailyFile[i][3];

                        if (
                            (volume.begin >= farLeftDate.valueOf() && volume.end <= farRightDate.valueOf()) &&
                            (volume.begin >= coordinateSystem.min.x && volume.end <= coordinateSystem.max.x)
                        ) {

                            volumes.push(volume);

                            if (datetime.valueOf() >= volume.begin && datetime.valueOf() <= volume.end) {

                                thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentCandle);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by volumes. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (volumes.length > 0) {

                if (volumes[0].begin > lowerEnd || volumes[volumes.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating volumes, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total volumes generated : " + volumes.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            volumes = [];

            for (let i = 0; i < marketFile.length; i++) {

                let volume = {
                    amountBuy: 0,
                    amountSell: 0,
                    begin: undefined,
                    end: undefined
                };

                volume.amountBuy = marketFile[i][0];
                volume.amountSell = marketFile[i][1];

                volume.begin = marketFile[i][2];
                volume.end = marketFile[i][3];

                if (
                    (volume.begin >= leftDate.valueOf() && volume.end <= rightDate.valueOf()) &&
                    (volume.begin >= coordinateSystem.min.x && volume.end <= coordinateSystem.max.x)
                ) {

                    volumes.push(volume);

                    if (datetime.valueOf() >= volume.begin && datetime.valueOf() <= volume.end) {

                        thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentCandle);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total volumes generated : " + volumes.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function plotChart() {

        try {

            let lowResolution = false
            if (UI.projects.superalgos.spaces.chartingSpace.viewport.zoomTargetLevel < UI.projects.superalgos.globals.zoom.ZOOM_OUT_THRESHOLD_FOR_PLOTTING_IN_LOW_RESOLUTION) {
                if (volumes.length > 100) {
                    lowResolution = true
                }
            }

            if (volumes.length > 0) {

                /* Now we calculate and plot the volumes */

                let visibleHeight = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft.y;

                let frameCorner1 = {
                    x: 0,
                    y: 0
                };

                let frameCorner2 = {
                    x: thisObject.container.frame.width,
                    y: thisObject.container.frame.height
                };


                /* Now the transformations. */

                frameCorner1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(frameCorner1, thisObject.container.frame.container);
                frameCorner2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(frameCorner2, thisObject.container.frame.container);

                let frameHeightInViewPort = frameCorner2.y - frameCorner1.y;

                if (volumes.length > 0) {

                    for (let i = 0; i < volumes.length; i++) {

                        volume = volumes[i];

                        let volumePointA1;
                        let volumePointA2;
                        let volumePointA3;
                        let volumePointA4;

                        function calculateBuys(plot, height) {

                            volumePointA1 = {
                                x: volume.begin + timeFrame / 7 * 2,
                                y: 0
                            };

                            volumePointA2 = {
                                x: volume.begin + timeFrame / 7 * 2,
                                y: volume.amountBuy
                            };

                            volumePointA3 = {
                                x: volume.begin + timeFrame / 7 * 5,
                                y: volume.amountBuy
                            };

                            volumePointA4 = {
                                x: volume.begin + timeFrame / 7 * 5,
                                y: 0
                            };

                            volumePointA1 = plot.transformThisPoint(volumePointA1);
                            volumePointA2 = plot.transformThisPoint(volumePointA2);
                            volumePointA3 = plot.transformThisPoint(volumePointA3);
                            volumePointA4 = plot.transformThisPoint(volumePointA4);

                            volumePointA1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointA1, thisObject.container);
                            volumePointA2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointA2, thisObject.container);
                            volumePointA3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointA3, thisObject.container);
                            volumePointA4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointA4, thisObject.container);

                            let baseIncrement = (volumePointA3.x - volumePointA1.x) * WIDHTER_VOLUME_BAR_BASE_FACTOR;

                            volumePointA1.x = volumePointA1.x - baseIncrement;
                            volumePointA4.x = volumePointA4.x + baseIncrement;

                            if (volumePointA4.x < UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x || volumePointA1.x > UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.x) {
                                return false;
                            }

                            return true;

                        }

                        if (calculateBuys(coordinateSystem, thisObject.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                        let diffA = volumePointA1.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y
                        if (diffA > 0) {
                            volumePointA1.y = volumePointA1.y - diffA
                            volumePointA2.y = volumePointA2.y - diffA
                            volumePointA3.y = volumePointA3.y - diffA
                            volumePointA4.y = volumePointA4.y - diffA
                        }

                        let volumePointB1;
                        let volumePointB2;
                        let volumePointB3;
                        let volumePointB4;

                        function calculateSells(plot, height) {

                            volumePointB1 = {
                                x: volume.begin + timeFrame / 7 * 2,
                                y: height
                            };

                            volumePointB2 = {
                                x: volume.begin + timeFrame / 7 * 2,
                                y: height - volume.amountSell
                            };

                            volumePointB3 = {
                                x: volume.begin + timeFrame / 7 * 5,
                                y: height - volume.amountSell
                            };

                            volumePointB4 = {
                                x: volume.begin + timeFrame / 7 * 5,
                                y: height
                            };

                            volumePointB1 = plot.transformThisPoint2(volumePointB1);
                            volumePointB2 = plot.transformThisPoint2(volumePointB2);
                            volumePointB3 = plot.transformThisPoint2(volumePointB3);
                            volumePointB4 = plot.transformThisPoint2(volumePointB4);

                            volumePointB1 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointB1, thisObject.container);
                            volumePointB2 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointB2, thisObject.container);
                            volumePointB3 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointB3, thisObject.container);
                            volumePointB4 = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(volumePointB4, thisObject.container);
                        }

                        calculateSells(coordinateSystem, thisObject.container.frame.height); // We try to see if it fits in the visible area.

                        let diffB = volumePointB1.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft.y
                        if (diffB < 0) {
                            volumePointB1.y = volumePointB1.y - diffB
                            volumePointB2.y = volumePointB2.y - diffB
                            volumePointB3.y = volumePointB3.y - diffB
                            volumePointB4.y = volumePointB4.y - diffB
                        }

                        /* We put a wider base */

                        let baseIncrement = (volumePointB3.x - volumePointB1.x) * WIDHTER_VOLUME_BAR_BASE_FACTOR;

                        volumePointB1.x = volumePointB1.x - baseIncrement;
                        volumePointB4.x = volumePointB4.x + baseIncrement;

                        /* We put a less wider top */

                        let baseDencrement = (volumePointA3.x - volumePointA2.x) * LESS_WIDHTER_VOLUME_BAR_TOP_FACTOR;

                        volumePointA2.x = volumePointA2.x + baseDencrement;
                        volumePointA3.x = volumePointA3.x - baseDencrement;

                        volumePointB2.x = volumePointB2.x + baseDencrement;
                        volumePointB3.x = volumePointB3.x - baseDencrement;


                        /* Everything must fit within the visible area */

                        volumePointA1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointA1);
                        volumePointA2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointA2);
                        volumePointA3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointA3);
                        volumePointA4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointA4);

                        volumePointB1 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointB1);
                        volumePointB2 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointB2);
                        volumePointB3 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointB3);
                        volumePointB4 = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(volumePointB4);

                        volumePointA1 = thisObject.fitFunction(volumePointA1);
                        volumePointA2 = thisObject.fitFunction(volumePointA2);
                        volumePointA3 = thisObject.fitFunction(volumePointA3);
                        volumePointA4 = thisObject.fitFunction(volumePointA4);

                        volumePointB1 = thisObject.fitFunction(volumePointB1);
                        volumePointB2 = thisObject.fitFunction(volumePointB2);
                        volumePointB3 = thisObject.fitFunction(volumePointB3);
                        volumePointB4 = thisObject.fitFunction(volumePointB4);

                        /* Everything must fit within the Frame. We know that that is equivalent to say that each bar con not be higher than the base of the opposite . */

                        if (volumePointA2.y < volumePointB1.y) {

                            volumePointA2.y = volumePointB1.y;
                            volumePointA3.y = volumePointB1.y;

                        }

                        if (volumePointB2.y > volumePointA1.y) {

                            volumePointB2.y = volumePointA1.y;
                            volumePointB3.y = volumePointA1.y;

                        }

                        /* Now the drawing of the volume bars*/

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(volumePointA1.x, volumePointA1.y);
                        browserCanvasContext.lineTo(volumePointA2.x, volumePointA2.y);
                        browserCanvasContext.lineTo(volumePointA3.x, volumePointA3.y);
                        browserCanvasContext.lineTo(volumePointA4.x, volumePointA4.y);

                        browserCanvasContext.closePath();

                        if (lowResolution === false) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 0.40)';

                            if (userPositionDate >= volume.begin && userPositionDate <= volume.end) {
                                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.40)'; // Current bar accroding to time
                            }
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 0.40)';
                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                        browserCanvasContext.stroke();

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(volumePointB1.x, volumePointB1.y);
                        browserCanvasContext.lineTo(volumePointB2.x, volumePointB2.y);
                        browserCanvasContext.lineTo(volumePointB3.x, volumePointB3.y);
                        browserCanvasContext.lineTo(volumePointB4.x, volumePointB4.y);

                        browserCanvasContext.closePath();

                        if (lowResolution === false) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 0.40)';

                            if (userPositionDate >= volume.begin && userPositionDate <= volume.end) {
                                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.40)'; // Current volume accroding to time
                            }

                            browserCanvasContext.fill();
                        }

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', 0.40)';

                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                        browserCanvasContext.stroke();

                        if (userPositionDate >= volume.begin && userPositionDate <= volume.end) {

                            let buyInfo = {
                                baseWidth: volumePointA4.x - volumePointA1.x,
                                topWidth: volumePointA3.x - volumePointA2.x,
                                height: volumePointA2.y - volumePointA1.y
                            };

                            let sellInfo = {
                                baseWidth: volumePointB4.x - volumePointB1.x,
                                topWidth: volumePointB3.x - volumePointB2.x,
                                height: volumePointB2.y - volumePointB1.y
                            };

                            let currentVolume = {
                                buyInfo: buyInfo,
                                sellInfo: sellInfo,
                                period: timeFrame,
                                innerVolumeBar: volume
                            };

                            thisObject.container.eventHandler.raiseEvent("Current Record Changed", currentVolume);

                        }
                        /* Contributing to Auto-Scale*/
                        coordinateSystem.reportYValue(volume.amountBuy * 5)
                        coordinateSystem.reportYValue(volume.amountSell * 5)
                        coordinateSystem.reportYValue(0)
                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }

    function onViewportZoomChanged(event) {
        recalculate()
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

    function onDragFinished() {
        recalculate();
    }
}


