function newAAMastersPlottersTradingDetails() {

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.
    let timeLineCoordinateSystemFrame = newTimeLineCoordinateSystem();  // This chart uses this extra object.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let fileCache;                      // This object will provide the different Market Files at different Time Periods.
    let fileCursorCache;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let volumes = [];                   // Here we keep the volumes to be ploted every time the Draw() function is called by the AAWebPlatform.

    return thisObject;

    function initialize(pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        let cursorCacheInProgress = false;
        let finaleStepsInProgress = false;

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        fileCache = newFileCache();
        fileCache.initialize("AAMasters", "AAOlivia", "Market Volumes", "Market Volumes", pExchange, pMarket, onFileReady);

        function onFileReady() {

            let newMarketFile = fileCache.getFile(ONE_DAY_IN_MILISECONDS);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;

                initializeFileCursorCache();

            }
        }

        function initializeFileCursorCache() {

            if (cursorCacheInProgress === false) {

                cursorCacheInProgress = true;

                fileCursorCache = newFileCursorCache();
                fileCursorCache.initialize("AAMasters", "AAOlivia", "Daily Volumes", "Daily Volumes", pExchange, pMarket, pDatetime, pTimePeriod, onFileCursorReady);

            }
        }

        function onFileCursorReady() {

            recalculate();

            let newFileCursor = fileCursorCache.getFileCursor(pTimePeriod);

            if (newFileCursor !== undefined) { // if the file ready is the one we need then it and we dont have it yet, then we will continue here.

                let stringDate = datetime.getUTCFullYear() + '-' + pad(datetime.getUTCMonth() + 1, 2) + '-' + pad(datetime.getUTCDate(), 2);

                let dailyFile = newFileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    if (finaleStepsInProgress === false) {

                        finaleStepsInProgress = true;

                        fileCursor = newFileCursor;

                        recalculateScaleX();
                        recalculate();
                        recalculateScaleY();

                        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
                        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

                        callBackFunction();

                    }
                }
            }

        }

    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function setTimePeriod(pTimePeriod) {

        timePeriod = pTimePeriod;

        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

            let newMarketFile = fileCache.getFile(pTimePeriod);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;

                recalculate();

            }

        } else {

            fileCursorCache.setTimePeriod(pTimePeriod);

            fileCursorCache.setDatetime(datetime);

            let newFileCursor = fileCursorCache.getFileCursor(pTimePeriod);

            if (newFileCursor !== undefined) {

                fileCursor = newFileCursor;

                recalculate();

            }
        }

        if (timePeriod === _1_HOUR_IN_MILISECONDS) {

            fileCursorCache.setTimePeriod(pTimePeriod);

            fileCursorCache.setDatetime(datetime);

        }

    }

    function setDatetime(pDatetime) {

        datetime = pDatetime;

    }

    function draw() {

        this.container.frame.draw();

        if (timePeriod < _1_HOUR_IN_MILISECONDS) {

            if (Math.random() * 1000 > 995) {

                recalculateScaleX();
                recalculate();
                recalculateScaleY();

            }
        }

        plotChart();

    }

    function recalculate() {

        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

            recalculateUsingMarketFiles();

        } else {

            recalculateUsingDailyFiles();

        }

        thisObject.container.eventHandler.raiseEvent("Volumes Changed", volumes);
    }

    function recalculateUsingDailyFiles() {

        if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

        let daysOnSides = getSideDays(timePeriod);

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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

                            thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

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

    }

    function recalculateUsingMarketFiles() {

        if (marketFile === undefined) { return; } // Initialization not complete yet.

        let daysOnSides = getSideDays(timePeriod);

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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

                    thisObject.container.eventHandler.raiseEvent("Current Volume Changed", thisObject.currentCandle);

                }
            }
        }

        //console.log("Olivia > recalculateUsingMarketFiles > total volumes generated : " + volumes.length);
    }

    function recalculateScaleX() {


        var minValue = {
            x: MIN_PLOTABLE_DATE.valueOf()
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf()
        };

        timeLineCoordinateSystem.initializeX(
            minValue,
            maxValue,
            thisObject.container.frame.width
        );

        timeLineCoordinateSystemFrame.initializeX(
            minValue,
            maxValue,
            thisObject.container.frame.width
        );

    }

    function recalculateScaleY() {

        var minValue = {
            y: 0
        };

        var maxValue = {
            y: 0
        };

        let timePeriodRatio = ONE_DAY_IN_MILISECONDS / timePeriod;

        maxValue.y = getMaxVolume() / (timePeriodRatio / 10);

        timeLineCoordinateSystem.initializeY(
            minValue,
            maxValue,
            viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y
        );

        timeLineCoordinateSystemFrame.initializeY(
            minValue,
            maxValue,
            thisObject.container.frame.height
        );

        function getMaxVolume() {

            let maxValue = 0;

            for (var i = 0; i < marketFile.length; i++) {

                let currentMax = (marketFile[i][0] + marketFile[i][1]) * 4;

                if (maxValue < currentMax) {
                    maxValue = currentMax;
                }
            }

            return maxValue;

        }

    }

    function plotChart() {

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

                for (var i = 0; i < volumes.length; i++) {

                    volume = volumes[i];

                    let volumePointA1;
                    let volumePointA2;
                    let volumePointA3;
                    let volumePointA4;

                    function calculateBuys(plot, height) {

                        volumePointA1 = {
                            x: volume.begin + timePeriod / 7 * 2,
                            y: 0
                        };

                        volumePointA2 = {
                            x: volume.begin + timePeriod / 7 * 2,
                            y: volume.amountBuy
                        };

                        volumePointA3 = {
                            x: volume.begin + timePeriod / 7 * 5,
                            y: volume.amountBuy
                        };

                        volumePointA4 = {
                            x: volume.begin + timePeriod / 7 * 5,
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

                    if (calculateBuys(timeLineCoordinateSystemFrame, thisObject.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                    if (volumePointA1.y > viewPort.visibleArea.bottomLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                        if (calculateBuys(timeLineCoordinateSystem, visibleHeight) === false) { continue; }  // We snap t to the view port.

                        /* Now we set the real value of y. */

                        volumePointA1.y = viewPort.visibleArea.bottomRight.y;
                        volumePointA2.y = viewPort.visibleArea.bottomRight.y - volume.amountBuy * timeLineCoordinateSystem.scale.y;
                        volumePointA3.y = viewPort.visibleArea.bottomRight.y - volume.amountBuy * timeLineCoordinateSystem.scale.y;
                        volumePointA4.y = viewPort.visibleArea.bottomRight.y;

                    }

                    let volumePointB1;
                    let volumePointB2;
                    let volumePointB3;
                    let volumePointB4;

                    function calculateSells(plot, height) {

                        volumePointB1 = {
                            x: volume.begin + timePeriod / 7 * 2,
                            y: height
                        };

                        volumePointB2 = {
                            x: volume.begin + timePeriod / 7 * 2,
                            y: height - volume.amountSell
                        };

                        volumePointB3 = {
                            x: volume.begin + timePeriod / 7 * 5,
                            y: height - volume.amountSell
                        };

                        volumePointB4 = {
                            x: volume.begin + timePeriod / 7 * 5,
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

                    calculateSells(timeLineCoordinateSystemFrame, thisObject.container.frame.height); // We try to see if it fits in the visible area.

                    if (volumePointB1.y < viewPort.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                        calculateSells(timeLineCoordinateSystem, visibleHeight); // We snap it to the view port.

                        /* Now we set the real value of y. */

                        volumePointB1.y = viewPort.visibleArea.topLeft.y;
                        volumePointB2.y = viewPort.visibleArea.topLeft.y + volume.amountSell * timeLineCoordinateSystem.scale.y;
                        volumePointB3.y = viewPort.visibleArea.topLeft.y + volume.amountSell * timeLineCoordinateSystem.scale.y;
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


                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= volume.begin && dateValue <= volume.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 0.40)'; // Current bar accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(64, 217, 26, 0.40)';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(64, 217, 26, 0.40)';

                    }

                    browserCanvasContext.fill();
                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, 0.40)';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();


                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(volumePointB1.x, volumePointB1.y);
                    browserCanvasContext.lineTo(volumePointB2.x, volumePointB2.y);
                    browserCanvasContext.lineTo(volumePointB3.x, volumePointB3.y);
                    browserCanvasContext.lineTo(volumePointB4.x, volumePointB4.y);

                    browserCanvasContext.closePath();

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= volume.begin && dateValue <= volume.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 0.40)'; // Current candle accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(219, 18, 18, 0.40)';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(219, 18, 18, 0.40)';

                    }

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, 0.40)';

                    browserCanvasContext.fill();
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();



                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= volume.begin && dateValue <= volume.end) {

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
                                period: timePeriod,
                                innerVolumeBar: volume
                            };

                            thisObject.container.eventHandler.raiseEvent("Current Volume Info Changed", currentVolume);

                        }
                    }
                }
            }
        }
    }

    function onZoomChanged(event) {

        recalculateScaleX();
        recalculate();
        recalculateScaleY();

    }

    function onDragFinished() {

        recalculateScaleX();
        recalculate();
        recalculateScaleY();

    }
}

