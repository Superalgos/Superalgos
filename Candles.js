function newAAMastersPlottersCandlesVolumesCandles() {

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded, 

        // Secondary functions and properties.

        currentCandle: undefined,
        positionAtDatetime: positionAtDatetime
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

    let fileCache;                      // This object will provide the different Market Files at different Time Periods.
    let fileCursorCache;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let candles = [];                   // Here we keep the candles to be ploted every time the Draw() function is called by the AAWebPlatform.

    return thisObject;

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        /* Store the information received. */

        fileCache = pStorage.fileCache[0];
        fileCursorCache = pStorage.fileCursorCache[0];

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

        marketFile = fileCache.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

        recalculateScale();

        /* Now we set the right files according to current Period. */

        marketFile = fileCache.getFile(pTimePeriod);
        fileCursor = fileCursorCache.getFileCursor(pTimePeriod);

        /* Listen to the necesary events. */

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        /* Get ready for plotting. */

        recalculate();

        callBackFunction();

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

        if (timePeriod !== pTimePeriod) {

            timePeriod = pTimePeriod;

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                let newMarketFile = fileCache.getFile(pTimePeriod);

                if (newMarketFile !== undefined) {

                    marketFile = newMarketFile;
                    recalculate();
                }

            } else {

                let newFileCursor = fileCursorCache.getFileCursor(pTimePeriod);

                if (newFileCursor !== undefined) {

                    fileCursor = newFileCursor;
                    recalculate();
                }
            }
        }
    }

    function setDatetime(pDatetime) {

        datetime = pDatetime;

    }

    function positionAtDatetime(newDatetime) {

        value = newDatetime.valueOf();

        /* Now we calculate which candle has this new time, because it will give us the y coordinate. */

        for (let i = 0; i < candles.length; i++) {

            if (value >= candles[i].begin && value <= candles[i].end) {

                let targetPoint = {
                    x: value,
                    y: candles[i].open
                };

                targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint);
                targetPoint = transformThisPoint(targetPoint, thisObject.container);

                let targetMax = {
                    x: value,
                    y: candles[i].max
                };

                targetMax = timeLineCoordinateSystem.transformThisPoint(targetMax);
                targetMax = transformThisPoint(targetMax, thisObject.container);

                let targetMin = {
                    x: value,
                    y: candles[i].min
                };

                targetMin = timeLineCoordinateSystem.transformThisPoint(targetMin);
                targetMin = transformThisPoint(targetMin, thisObject.container);

                let center = {
                    x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
                    y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
                };

                if (targetMax.y < viewPort.visibleArea.topLeft.y || targetMin.y > viewPort.visibleArea.bottomRight.y) {

                    let displaceVector = {
                        x: 0,
                        y: center.y - targetPoint.y
                    };

                    viewPort.displaceTarget(displaceVector);

                }

                let displaceVector = {
                    x: center.x - targetPoint.x,
                    y: 0
                };

                viewPort.displace(displaceVector);

                return;
            }
        }
    }

    function onDailyFileLoaded(event) {

        if (event.currentValue === event.totalValue) {

            /* This happens only when all of the files in the cursor have been loaded. */

            recalculate();

        }
    }

    function draw() {

        this.container.frame.draw();

        plotChart();

    }

    function recalculate() {

        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

            recalculateUsingMarketFiles();

        } else {

            recalculateUsingDailyFiles();

        }

        thisObject.container.eventHandler.raiseEvent("Candles Changed", candles);
    }

    function recalculateUsingDailyFiles() {

        if (fileCursor === undefined) { return; } // We need to wait

        if (fileCursor.files.size === 0) { return;} // We need to wait until there are files in the cursor

        let daysOnSides = getSideDays(timePeriod);

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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
                            thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

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

                //console.log("File missing while calculating candles, scheduling a recalculation in 2 seconds.");

            }
        }

        //console.log("Olivia > recalculateUsingDailyFiles > total candles generated : " + candles.length);

    }

    function recalculateUsingMarketFiles() {

        if (marketFile === undefined) { return; } // Initialization not complete yet.

        let daysOnSides = getSideDays(timePeriod);

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

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
                    thisObject.container.eventHandler.raiseEvent("Current Candle Changed", thisObject.currentCandle);

                }
            } 
        }

        //console.log("Olivia > recalculateUsingMarketFiles > total candles generated : " + candles.length);
    }

    function recalculateScale() {

        if (marketFile === undefined) { return; } // We need the market file to be loaded to make the calculation.

        if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

        let minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        let maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(getMaxRate())
        };


        timeLineCoordinateSystem.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.height
        );

        function getMaxRate() {

            let maxValue = 0;

            for (let i = 0; i < marketFile.length; i++) {

                let currentMax = marketFile[i][1];   // 1 = rates.

                if (maxValue < currentMax) {
                    maxValue = currentMax;
                }
            }

            return maxValue;

        }

    }

    function plotChart() {

        if (candles.length > 0) {

            /* Now we calculate and plot the candles */

            for (let i = 0; i < candles.length; i++) {

                candle = candles[i];

                let candlePoint1 = {
                    x: candle.begin + timePeriod / 7 * 1.5,
                    y: candle.open
                };

                let candlePoint2 = {
                    x: candle.begin + timePeriod / 7 * 5.5,
                    y: candle.open
                };

                let candlePoint3 = {
                    x: candle.begin + timePeriod / 7 * 5.5,
                    y: candle.close
                };

                let candlePoint4 = {
                    x: candle.begin + timePeriod / 7 * 1.5,
                    y: candle.close
                };

                candlePoint1 = timeLineCoordinateSystem.transformThisPoint(candlePoint1);
                candlePoint2 = timeLineCoordinateSystem.transformThisPoint(candlePoint2);
                candlePoint3 = timeLineCoordinateSystem.transformThisPoint(candlePoint3);
                candlePoint4 = timeLineCoordinateSystem.transformThisPoint(candlePoint4);

                candlePoint1 = transformThisPoint(candlePoint1, thisObject.container);
                candlePoint2 = transformThisPoint(candlePoint2, thisObject.container);
                candlePoint3 = transformThisPoint(candlePoint3, thisObject.container);
                candlePoint4 = transformThisPoint(candlePoint4, thisObject.container);

                if (candlePoint2.x < viewPort.visibleArea.bottomLeft.x || candlePoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                candlePoint1 = viewPort.fitIntoVisibleArea(candlePoint1);
                candlePoint2 = viewPort.fitIntoVisibleArea(candlePoint2);
                candlePoint3 = viewPort.fitIntoVisibleArea(candlePoint3);
                candlePoint4 = viewPort.fitIntoVisibleArea(candlePoint4);

                let stickPoint1 = {
                    x: candle.begin + timePeriod / 7 * 3.2,
                    y: candle.max
                };

                let stickPoint2 = {
                    x: candle.begin + timePeriod / 7 * 3.8,
                    y: candle.max
                };

                let stickPoint3 = {
                    x: candle.begin + timePeriod / 7 * 3.8,
                    y: candle.min
                };

                let stickPoint4 = {
                    x: candle.begin + timePeriod / 7 * 3.2,
                    y: candle.min
                };

                stickPoint1 = timeLineCoordinateSystem.transformThisPoint(stickPoint1);
                stickPoint2 = timeLineCoordinateSystem.transformThisPoint(stickPoint2);
                stickPoint3 = timeLineCoordinateSystem.transformThisPoint(stickPoint3);
                stickPoint4 = timeLineCoordinateSystem.transformThisPoint(stickPoint4);

                stickPoint1 = transformThisPoint(stickPoint1, thisObject.container);
                stickPoint2 = transformThisPoint(stickPoint2, thisObject.container);
                stickPoint3 = transformThisPoint(stickPoint3, thisObject.container);
                stickPoint4 = transformThisPoint(stickPoint4, thisObject.container);

                stickPoint1 = viewPort.fitIntoVisibleArea(stickPoint1);
                stickPoint2 = viewPort.fitIntoVisibleArea(stickPoint2);
                stickPoint3 = viewPort.fitIntoVisibleArea(stickPoint3);
                stickPoint4 = viewPort.fitIntoVisibleArea(stickPoint4);

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(stickPoint1.x, stickPoint1.y);
                browserCanvasContext.lineTo(stickPoint2.x, stickPoint2.y);
                browserCanvasContext.lineTo(stickPoint3.x, stickPoint3.y);
                browserCanvasContext.lineTo(stickPoint4.x, stickPoint4.y);

                browserCanvasContext.closePath();
                browserCanvasContext.fillStyle = 'rgba(54, 54, 54, 1)';
                browserCanvasContext.fill();

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= candle.begin && dateValue <= candle.end) {

                        browserCanvasContext.strokeStyle = 'rgba(255, 233, 31, 1)'; // Current candle accroding to time

                    } else {
                        browserCanvasContext.strokeStyle = 'rgba(212, 206, 201, 1)';
                    }

                } else {
                    browserCanvasContext.strokeStyle = 'rgba(212, 206, 201, 1)';
                }

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(candlePoint1.x, candlePoint1.y);
                browserCanvasContext.lineTo(candlePoint2.x, candlePoint2.y);
                browserCanvasContext.lineTo(candlePoint3.x, candlePoint3.y);
                browserCanvasContext.lineTo(candlePoint4.x, candlePoint4.y);

                browserCanvasContext.closePath();

                if (candle.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, 1)'; }
                if (candle.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, 1)'; }
                if (candle.direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(27, 7, 105, 1)'; }

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= candle.begin && dateValue <= candle.end) {

                        /* highlight the current candle */

                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 1)'; // Current candle accroding to time

                        let currentCandle = {
                            bodyWidth: candlePoint2.x - candlePoint1.x,
                            bodyHeight: candlePoint3.y - candlePoint2.y,
                            stickHeight: stickPoint4.y - stickPoint2.y,
                            stickWidth: stickPoint2.x - stickPoint1.x,
                            stickStart: candlePoint2.y - stickPoint2.y,
                            period: timePeriod,
                            innerCandle: candle
                        };

                        thisObject.container.eventHandler.raiseEvent("Current Candle Changed", currentCandle);

                    } else {

                        if (candle.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(64, 217, 26, 1)'; }
                        if (candle.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(219, 18, 18, 1)'; }
                        if (candle.direction === 'side') { browserCanvasContext.fillStyle = 'rgba(64, 26, 217, 1)'; }
                    }

                } else {

                    if (candle.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(64, 217, 26, 1)'; }
                    if (candle.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(219, 18, 18, 1)'; }
                    if (candle.direction === 'side') { browserCanvasContext.fillStyle = 'rgba(64, 26, 217, 1)'; }

                }



                if (
                    candlePoint1.x < viewPort.visibleArea.topLeft.x + 50
                    ||
                    candlePoint1.x > viewPort.visibleArea.bottomRight.x - 50
                ) {
                    // we leave this candles without fill.
                } else {
                    browserCanvasContext.fill();
                }

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();


            }
        }
    }

    function onZoomChanged(event) {

        recalculate();

    }

    function onDragFinished() {

        recalculate();

    }
}

