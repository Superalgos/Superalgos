function newAAMastersPlottersCandlesVolumesVolumes() {

    const MODULE_NAME = "Volumes Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

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
        recalculateScale: recalculateScale,
        draw: draw
    };

    /* this is part of the module template */

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let coordinateSystem = newCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.
    let plotAreaFrame = newCoordinateSystem();  // This chart uses this extra object.

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                    // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    let scaleFile;                      // This file is used to calculate the scale.

    /* these are module specific variables: */

    let volumes = [];                   // Here we keep the volumes to be ploted every time the Draw() function is called by the AAWebPlatform.

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

            scaleFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimeFrame);
            fileCursor = dailyFiles.getFileCursor(pTimeFrame);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);

            /* Get ready for plotting. */

            recalculateScaleX();
            recalculate();
            recalculateScaleY();

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScaleX();
                recalculate();
                recalculateScaleY();
            })

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function recalculateScale() {

        recalculateScaleX();
        recalculate();
        recalculateScaleY();

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
                recalculateScaleX();
                recalculate();
                recalculateScaleY();
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
                recalculateScaleX();
                recalculate();
                recalculateScaleY();
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

                recalculateScaleX();
                recalculate();
                recalculateScaleY();

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

            thisObject.container.eventHandler.raiseEvent("Volumes Changed", volumes);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            volumes = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

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

                        if (volume.begin >= farLeftDate.valueOf() && volume.end <= farRightDate.valueOf()) {

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

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, coordinateSystem);

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

                if (volume.begin >= leftDate.valueOf() && volume.end <= rightDate.valueOf()) {

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

    function recalculateScaleX() {

        try {

            let minValue = {
                x: MIN_PLOTABLE_DATE.valueOf()
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf()
            };

            coordinateSystem.initializeX(
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

            let minValue = {
                y: 0
            };

            let maxValue = {
                y: 0
            };

            let timeFrameRatio = ONE_DAY_IN_MILISECONDS / timeFrame;

            maxValue.y = getMaxVolume() / (timeFrameRatio / 2.5);

            coordinateSystem.initializeY(
                minValue,
                maxValue,
                viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y
            );

            plotAreaFrame.initializeY(
                minValue,
                maxValue,
                thisObject.container.frame.height
            );

            function getMaxVolume() {

                let maxValue = 0;

                for (let i = 0; i < scaleFile.length; i++) {

                    let currentMax = (scaleFile[i][0] + scaleFile[i][1]) * 4;

                    if (maxValue < currentMax) {
                        maxValue = currentMax;
                    }
                }

                return maxValue;

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScaleY -> err = " + err.stack); }
        }
    }

    function plotChart() {

        try {

            let userPosition = getUserPosition()
            let userPositionDate = userPosition.point.x

            if (volumes.length > 0) {

                /* Now we calculate and plot the volumes */

                let visibleHeight = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y;

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

                            volumePointA1 = transformThisPoint(volumePointA1, thisObject.container);
                            volumePointA2 = transformThisPoint(volumePointA2, thisObject.container);
                            volumePointA3 = transformThisPoint(volumePointA3, thisObject.container);
                            volumePointA4 = transformThisPoint(volumePointA4, thisObject.container);

                            let baseIncrement = (volumePointA3.x - volumePointA1.x) * WIDHTER_VOLUME_BAR_BASE_FACTOR;

                            volumePointA1.x = volumePointA1.x - baseIncrement;
                            volumePointA4.x = volumePointA4.x + baseIncrement;

                            if (volumePointA4.x < viewPort.visibleArea.bottomLeft.x || volumePointA1.x > viewPort.visibleArea.bottomRight.x) {
                                return false;
                            }

                            return true;

                        }

                        if (calculateBuys(plotAreaFrame, thisObject.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                        if (volumePointA1.y > viewPort.visibleArea.bottomLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                            if (calculateBuys(coordinateSystem, visibleHeight) === false) { continue; }  // We snap t to the view port.

                            /* Now we set the real value of y. */

                            volumePointA1.y = viewPort.visibleArea.bottomRight.y;
                            volumePointA2.y = viewPort.visibleArea.bottomRight.y - volume.amountBuy * coordinateSystem.scale.y;
                            volumePointA3.y = viewPort.visibleArea.bottomRight.y - volume.amountBuy * coordinateSystem.scale.y;
                            volumePointA4.y = viewPort.visibleArea.bottomRight.y;

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

                            volumePointB1 = transformThisPoint(volumePointB1, thisObject.container);
                            volumePointB2 = transformThisPoint(volumePointB2, thisObject.container);
                            volumePointB3 = transformThisPoint(volumePointB3, thisObject.container);
                            volumePointB4 = transformThisPoint(volumePointB4, thisObject.container);

                        }

                        calculateSells(plotAreaFrame, thisObject.container.frame.height); // We try to see if it fits in the visible area.

                        if (volumePointB1.y < viewPort.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                            calculateSells(coordinateSystem, visibleHeight); // We snap it to the view port.

                            /* Now we set the real value of y. */

                            volumePointB1.y = viewPort.visibleArea.topLeft.y;
                            volumePointB2.y = viewPort.visibleArea.topLeft.y + volume.amountSell * coordinateSystem.scale.y;
                            volumePointB3.y = viewPort.visibleArea.topLeft.y + volume.amountSell * coordinateSystem.scale.y;
                            volumePointB4.y = viewPort.visibleArea.topLeft.y;

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

                        volumePointA1 = viewPort.fitIntoVisibleArea(volumePointA1);
                        volumePointA2 = viewPort.fitIntoVisibleArea(volumePointA2);
                        volumePointA3 = viewPort.fitIntoVisibleArea(volumePointA3);
                        volumePointA4 = viewPort.fitIntoVisibleArea(volumePointA4);

                        volumePointB1 = viewPort.fitIntoVisibleArea(volumePointB1);
                        volumePointB2 = viewPort.fitIntoVisibleArea(volumePointB2);
                        volumePointB3 = viewPort.fitIntoVisibleArea(volumePointB3);
                        volumePointB4 = viewPort.fitIntoVisibleArea(volumePointB4);

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

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 0.40)';

                        if (userPositionDate >= volume.begin && userPositionDate <= volume.end) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.40)'; // Current bar accroding to time
                        }

                        browserCanvasContext.fill();
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 0.40)';
                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.stroke();


                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(volumePointB1.x, volumePointB1.y);
                        browserCanvasContext.lineTo(volumePointB2.x, volumePointB2.y);
                        browserCanvasContext.lineTo(volumePointB3.x, volumePointB3.y);
                        browserCanvasContext.lineTo(volumePointB4.x, volumePointB4.y);

                        browserCanvasContext.closePath();

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 0.40)';

                        if (userPositionDate >= volume.begin && userPositionDate <= volume.end) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.40)'; // Current volume accroding to time
                        }

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', 0.40)';

                        browserCanvasContext.fill();
                        browserCanvasContext.lineWidth = 1;
                        browserCanvasContext.setLineDash([0, 0])
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

                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }

    function onViewportZoomChanged(event) {

        try {

            recalculateScaleX();
            recalculate();
            recalculateScaleY();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportZoomChanged -> err = " + err.stack); }
        }
    }

    function onViewportPositionChanged(event) {

        try {
            if (event !== undefined) {
                if (event.recalculate === true) {
                    recalculateScaleX();
                    recalculate();
                    recalculateScaleY();
                    return
                }
            }
            if (Math.random() * 100 > 95) {
                recalculateScaleX();
                recalculate();
                recalculateScaleY();
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportPositionChanged -> err = " + err.stack); }
        }
    }

    function onDragFinished() {

        try {

            recalculateScaleX();
            recalculate();
            recalculateScaleY();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}


