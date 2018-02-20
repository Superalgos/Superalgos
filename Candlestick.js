function newAAMastersAAOliviaCandlesticks() {

    var candles = [];  
    var plotArea = newPlotArea();

    let timePeriod;
    var datetime;

    var candlesticks = {
        onLayerStatusChanged: onLayerStatusChanged,
        currentCandle: undefined,
        positionAtDatetime: positionAtDatetime,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    candlesticks.container = container;

    container.displacement.containerName = "AAMasters AAOlivia Candlesticks";
    container.zoom.containerName = "AAMasters AAOlivia Candlesticks";
    container.frame.containerName = "AAMasters AAOlivia Candlesticks";

    let marketFile;
    let fileCursor;

    let layerStatus = 'off';

    let fileCache;

    return candlesticks;

    function initialize(pExchange, pMarket, pDatetime, pTimePeriod, chartLayersPanel, callBackFunction) {

        let cursorCacheInProgress = false;
        let finaleStepsInProgress = false;

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        fileCache = newFileCache();
        fileCache.initialize("AAMasters", "AAOlivia", "Market Candles", "Market Candlesticks", pExchange, pMarket, onFileReady);

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
                fileCursorCache.initialize("AAMasters", "AAOlivia", "Daily Candles", "Daily Candlesticks", pExchange, pMarket, pDatetime, onFileCursorReady);

            }
        }

        function onFileCursorReady() {

            recalculateCandles();
            console.log("onFileCursorReady");

            let newFileCursor = fileCursorCache.getFileCursor(pTimePeriod);

            if (newFileCursor !== undefined) { // if the file ready is the one we need then it and we dont have it yet, then we will continue here.

                let stringDate = datetime.getUTCFullYear() + '-' + pad(datetime.getUTCMonth() + 1, 2) + '-' + pad(datetime.getUTCDate(), 2);

                let dailyFile = newFileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    if (finaleStepsInProgress === false) {

                        finaleStepsInProgress = true;

                        fileCursor = newFileCursor;

                        recalculateScale(); // With any of the market files we can calculate the scale. 

                        layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.OLIVIA_CANDLES);

                        recalculateCandles();
                        postitionViewPort();

                        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
                        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

                        callBackFunction();

                    }
                }
            }

        }

    }



    function getContainer(point) {

        if (layerStatus !== 'on') { return; }

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function onLayerStatusChanged(eventData) {

        if (eventData.layer === 'Olivia Candlesticks') {
            layerStatus = eventData.status;
        }

    }

    function onZoomChanged(event) {

        recalculateCandles();

        console.log("onZoomChanged");

    }

    function onDragFinished() {

        recalculateCandles();
        console.log("onDragFinished");

    }


    function setTimePeriod(pTimePeriod) {

        timePeriod = pTimePeriod;

        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

            let newMarketFile = fileCache.getFile(pTimePeriod);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;

                recalculateCandles();

                console.log("setTimePeriod");

            }

        } else {

            let newFileCursor = fileCursorCache.getFileCursor(pTimePeriod);

            if (newFileCursor !== undefined) {

                fileCursor = newFileCursor;

                recalculateCandles();

                console.log("setTimePeriod");

            }
        }
    }

    function setDatetime(newDatetime) {

        /* If there is a change in the day, then we take some actions, otherwise, we dont. */

        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS);
        let newDate = Math.trunc(newDatetime.valueOf() / ONE_DAY_IN_MILISECONDS);

        datetime = newDatetime;

        if (currentDate !== newDate) {

            if (timePeriod < _1_HOUR_IN_MILISECONDS) {

                recalculateCandles();
                fileCursorCache.setDatetime(newDatetime);

                console.log("setDatetime");

            }
        } 
    }


    function postitionViewPort() {

        try {

            let targetPoint = {
                x: candles[Math.round(candles.length / 2)].begin,
                y: candles[Math.round(candles.length / 2)].min + (candles[Math.round(candles.length / 2)].max - candles[Math.round(candles.length / 2)].min)
            };

            targetPoint = plotArea.inverseTransform(targetPoint, candlesticks.container.frame.height);
            targetPoint = transformThisPoint(targetPoint, candlesticks.container);

            let displaceVector = {
                x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.topLeft.x) / 2 - targetPoint.x,
                y: (viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y) / 2 - targetPoint.y
            };

            viewPort.displace(displaceVector);

        } catch (err) {

            // if there data is missing of the days it must position in then an exception is raised.
        }

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

                targetPoint = plotArea.inverseTransform(targetPoint, candlesticks.container.frame.height);
                targetPoint = transformThisPoint(targetPoint, candlesticks.container);

                let targetMax = {
                    x: value,
                    y: candles[i].max
                };

                targetMax = plotArea.inverseTransform(targetMax, candlesticks.container.frame.height);
                targetMax = transformThisPoint(targetMax, candlesticks.container);

                let targetMin = {
                    x: value,
                    y: candles[i].min
                };

                targetMin = plotArea.inverseTransform(targetMin, candlesticks.container.frame.height);
                targetMin = transformThisPoint(targetMin, candlesticks.container);

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




    function draw() {

        if (layerStatus !== 'on') { return; }

        this.container.frame.draw();

        if (timePeriod < _1_HOUR_IN_MILISECONDS) {

            if (Math.random() * 100 > 98) {
                //recalculateCandles();

                //console.log("draw");
            }


        }

        plotCandleChart();

    }



    function recalculateCandles() {

        if (layerStatus === 'off') { return; }

        if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

            recalculateCandlesUsingMarketFiles();

        } else {

            recalculateCandlesUsingDailyFiles();

        }

        candlesticks.container.eventHandler.raiseEvent("Candles Changed", candles);
    }



    function recalculateCandlesUsingDailyFiles() {

        if (fileCursor.files.size === 0) { return;} // We need to wait until there are files in the cursor

        let daysOnSides = getSideDays(timePeriod);

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, candlesticks.container, plotArea);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, candlesticks.container, plotArea);

        leftDate.setDate(leftDate.getDate() - daysOnSides);
        rightDate.setDate(rightDate.getDate() + daysOnSides);

        let currentDate = new Date(leftDate.getTime());

        candles = [];

        while (currentDate.getTime() <= rightDate.getTime()) {

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

            let dailyFile = fileCursor.files.get(stringDate);

            if (dailyFile !== undefined) {

                for (var i = 0; i < dailyFile.length; i++) {

                    var candle = newCandle();

                    candle.min = dailyFile[i][0];
                    candle.max = dailyFile[i][1];

                    candle.open = dailyFile[i][2];
                    candle.close = dailyFile[i][3];

                    candle.begin = (new Date(dailyFile[i][4])).valueOf();
                    candle.end = (new Date(dailyFile[i][5])).valueOf();

                    if (candle.open > candle.close) { candle.direction = 'down'; }
                    if (candle.open < candle.close) { candle.direction = 'up'; }
                    if (candle.open === candle.close) { candle.direction = 'side'; }

                    candles.push(candle);

                    if (datetime.valueOf() >= candle.begin && datetime.valueOf() <= candle.end) {

                        candlesticks.currentCandle = candle;
                        candlesticks.container.eventHandler.raiseEvent("Current Candle Changed", candlesticks.currentCandle);

                    }
                }

            }

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        console.log("Olivia > recalculateCandlesUsingDailyFiles > total candles generated : " + candles.length);

    }


    function recalculateCandlesUsingMarketFiles() {

        if (marketFile === undefined) { return; } // Initialization not complete yet.

        let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, candlesticks.container, plotArea);
        let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, candlesticks.container, plotArea);

        leftDate.setUTCDate(leftDate.getUTCDate() - 1);
        rightDate.setUTCDate(rightDate.getUTCDate() + 2);

        candles = [];

        for (var i = 0; i < marketFile.length; i++) {

            var candle = newCandle();

            candle.min = marketFile[i][0];
            candle.max = marketFile[i][1];

            candle.open = marketFile[i][2];
            candle.close = marketFile[i][3];

            candle.begin = (new Date(marketFile[i][4])).valueOf();
            candle.end = (new Date(marketFile[i][5])).valueOf();

            if (candle.open > candle.close) { candle.direction = 'down'; }
            if (candle.open < candle.close) { candle.direction = 'up'; }
            if (candle.open === candle.close) { candle.direction = 'side'; }

            if (candle.begin >= leftDate.valueOf() && candle.end <= rightDate.valueOf()) {

                candles.push(candle);

            } 
        }

        console.log("Olivia > recalculateCandlesUsingMarketFiles > total candles generated : " + candles.length);
    }




    function recalculateScale() {

        if (marketFile === undefined) { return; } // We need the market file to be loaded to make the calculation.

        if (plotArea.maxValue > 0) { return; } // Already calculated.

        var minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(getMaxRate())
        };


        plotArea.initialize(
            minValue,
            maxValue,
            candlesticks.container.frame.width,
            candlesticks.container.frame.height
        );

        function getMaxRate() {

            let maxValue = 0;

            for (var i = 0; i < marketFile.length; i++) {

                let currentMax = marketFile[i][1];   // 1 = rates.

                if (maxValue < currentMax) {
                    maxValue = currentMax;
                }
            }

            return maxValue;

        }

    }







    function plotCandleChart() {

        if (candles.length > 0) {

            /* Now we calculate and plot the candles */

            for (var i = 0; i < candles.length; i++) {

                candle = candles[i];

                var candlePoint1 = {
                    x: candle.begin + timePeriod / 7 * 1.5,
                    y: candle.open
                };

                var candlePoint2 = {
                    x: candle.begin + timePeriod / 7 * 5.5,
                    y: candle.open
                };

                var candlePoint3 = {
                    x: candle.begin + timePeriod / 7 * 5.5,
                    y: candle.close
                };

                var candlePoint4 = {
                    x: candle.begin + timePeriod / 7 * 1.5,
                    y: candle.close
                };

                candlePoint1 = plotArea.inverseTransform(candlePoint1, candlesticks.container.frame.height);
                candlePoint2 = plotArea.inverseTransform(candlePoint2, candlesticks.container.frame.height);
                candlePoint3 = plotArea.inverseTransform(candlePoint3, candlesticks.container.frame.height);
                candlePoint4 = plotArea.inverseTransform(candlePoint4, candlesticks.container.frame.height);

                candlePoint1 = transformThisPoint(candlePoint1, candlesticks.container);
                candlePoint2 = transformThisPoint(candlePoint2, candlesticks.container);
                candlePoint3 = transformThisPoint(candlePoint3, candlesticks.container);
                candlePoint4 = transformThisPoint(candlePoint4, candlesticks.container);

                if (candlePoint2.x < viewPort.visibleArea.bottomLeft.x || candlePoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                candlePoint1 = viewPort.fitIntoVisibleArea(candlePoint1);
                candlePoint2 = viewPort.fitIntoVisibleArea(candlePoint2);
                candlePoint3 = viewPort.fitIntoVisibleArea(candlePoint3);
                candlePoint4 = viewPort.fitIntoVisibleArea(candlePoint4);

                var stickPoint1 = {
                    x: candle.begin + timePeriod / 7 * 3.2,
                    y: candle.max
                };

                var stickPoint2 = {
                    x: candle.begin + timePeriod / 7 * 3.8,
                    y: candle.max
                };

                var stickPoint3 = {
                    x: candle.begin + timePeriod / 7 * 3.8,
                    y: candle.min
                };

                var stickPoint4 = {
                    x: candle.begin + timePeriod / 7 * 3.2,
                    y: candle.min
                };

                stickPoint1 = plotArea.inverseTransform(stickPoint1, candlesticks.container.frame.height);
                stickPoint2 = plotArea.inverseTransform(stickPoint2, candlesticks.container.frame.height);
                stickPoint3 = plotArea.inverseTransform(stickPoint3, candlesticks.container.frame.height);
                stickPoint4 = plotArea.inverseTransform(stickPoint4, candlesticks.container.frame.height);

                stickPoint1 = transformThisPoint(stickPoint1, candlesticks.container);
                stickPoint2 = transformThisPoint(stickPoint2, candlesticks.container);
                stickPoint3 = transformThisPoint(stickPoint3, candlesticks.container);
                stickPoint4 = transformThisPoint(stickPoint4, candlesticks.container);

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

                        candlesticks.container.eventHandler.raiseEvent("Current Candle Info Changed", currentCandle);

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


}

