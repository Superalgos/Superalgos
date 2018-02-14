
function newCandleStickChartLayer() {


    var candles = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();

    var datetime = INITIAL_DATE;

    var candleStickChartLayer = {
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
    candleStickChartLayer.container = container;

    container.displacement.containerName = "Candle Stick Chart";
    container.zoom.containerName = "Candle Stick Chart";
    container.frame.containerName = "Candle Stick Chart";

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let layerStatus = 'off';

    return candleStickChartLayer;

    function initialize(exchange, market, index, dailyFiles, chartLayersPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScale();
        recalculateCandlesUsingDailyFiles(true); // We need the first day of candles so as to see which is going to be the center of the viewport.

        if (marketId === INITIAL_DEFAULT_MARKET) {  // For now, lets position the view port at the market USDT/BTC

            postitionViewPort();

        } 

        recalculateCandles();

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.CANDLESTICKS);

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

        if (eventData.layer === 'Candlesticks') {
            layerStatus = eventData.status;
        }

    }

    function onZoomChanged(event) {

        recalculateCandles();

    }

    function onDragFinished() {

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            recalculateCandles();

        }
    }


    function setTimePeriod(period) {

        timePeriod = period;
            
    }

    function setDatetime(newDatetime) {

        datetime = newDatetime;
        recalculateCandles();
    }


    function postitionViewPort() {

        try {

            let targetPoint = {
                x: candles[Math.round(candles.length / 2)].begin,
                y: candles[Math.round(candles.length / 2)].min + (candles[Math.round(candles.length / 2)].max - candles[Math.round(candles.length / 2)].min)
            };

            targetPoint = plotArea.inverseTransform(targetPoint, candleStickChartLayer.container.frame.height);
            targetPoint = transformThisPoint(targetPoint, candleStickChartLayer.container);

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

                targetPoint = plotArea.inverseTransform(targetPoint, candleStickChartLayer.container.frame.height);
                targetPoint = transformThisPoint(targetPoint, candleStickChartLayer.container);

                let targetMax = {
                    x: value,
                    y: candles[i].max
                };

                targetMax = plotArea.inverseTransform(targetMax, candleStickChartLayer.container.frame.height);
                targetMax = transformThisPoint(targetMax, candleStickChartLayer.container);

                let targetMin = {
                    x: value,
                    y: candles[i].min
                };

                targetMin = plotArea.inverseTransform(targetMin, candleStickChartLayer.container.frame.height);
                targetMin = transformThisPoint(targetMin, candleStickChartLayer.container);

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

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            if (Math.random() * 100 > 98) {
                recalculateCandles();
            }


        }

        plotCandleChart();

    }



    function recalculateCandles() {

        if (layerStatus === 'off') { return; }

        if (timePeriod === ONE_DAY_IN_MILISECONDS) {

            recalculateCandlesUsingMarketIndex();

        } else {

            recalculateCandlesUsingDailyFiles();

        }

        candleStickChartLayer.container.eventHandler.raiseEvent("Candles Changed", candles);
    }



    function recalculateCandlesUsingDailyFiles(currentDateOnly) {

        let daysOnSides = getSideDays(timePeriod);

        let leftDate;
        let rightDate;

        if (currentDateOnly === true) {

            leftDate = new Date(datetime.getTime());
            rightDate = new Date(datetime.getTime());

            leftDate = removeTime(datetime);
            rightDate = removeTime(datetime);

        } else {

            leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, candleStickChartLayer.container, plotArea);
            rightDate = getDateFromPoint(viewPort.visibleArea.topRight, candleStickChartLayer.container, plotArea);



            leftDate.setDate(leftDate.getDate() - daysOnSides);   
            rightDate.setDate(rightDate.getDate() + daysOnSides);

        }

        let currentDate = new Date(leftDate.getTime());

        candles = [];

        while (currentDate.getTime() <= rightDate.getTime()) {

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

            let dailyFile = dailyFilesCursor.dailyFiles.get(stringDate);

            if (dailyFile !== undefined) {

                const fileTimePeriod = 60 * 1000;
                const totalCandles = dailyFile.length * fileTimePeriod / timePeriod;
                const recordsPerCandle = timePeriod / fileTimePeriod;

                for (var i = 0; i < totalCandles; i++) {

                    var candle = newCandle();

                    let min = dailyFile[i * recordsPerCandle][0];
                    let max = dailyFile[i * recordsPerCandle][1];

                    for (var j = 0; j < recordsPerCandle; j++) {

                        if (dailyFile[i * recordsPerCandle + j][0] < min) {

                            min = dailyFile[i * recordsPerCandle + j][0];
                        }

                        if (dailyFile[i * recordsPerCandle + j][1] > max) {

                            max = dailyFile[i * recordsPerCandle + j][1];
                        }

                    }

                    candle.min = min;
                    candle.max = max;

                    candle.open = dailyFile[i * recordsPerCandle][2];
                    candle.close = dailyFile[i * recordsPerCandle + recordsPerCandle - 1][3];

                    candle.begin = dailyFile[i * recordsPerCandle][4];
                    candle.end = dailyFile[i * recordsPerCandle + recordsPerCandle - 1][5];

                    candle.beginId = dailyFile[i * recordsPerCandle][6];
                    candle.endId = dailyFile[i * recordsPerCandle + recordsPerCandle - 1][7];

                    if (candle.open > candle.close) { candle.direction = 'down'; }
                    if (candle.open < candle.close) { candle.direction = 'up'; }
                    if (candle.open === candle.close) { candle.direction = 'side'; }

                    candles.push(candle);

                    if (datetime.valueOf() >= candle.begin && datetime.valueOf() <= candle.end) {

                        candleStickChartLayer.currentCandle = candle;
                        candleStickChartLayer.container.eventHandler.raiseEvent("Current Candle Changed", candleStickChartLayer.currentCandle);

                    }
                }

            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
 
    }


    function recalculateCandlesUsingMarketIndex() {

        candles = [];

        for (var i = 0; i < marketIndex.candles.length; i++) {

            var candle = newCandle();

            candle.min = marketIndex.candles[i][0];
            candle.max = marketIndex.candles[i][1];

            candle.open = marketIndex.candles[i][2];
            candle.close = marketIndex.candles[i][3];

            candle.begin = (new Date(marketIndex.candles[i][4])).valueOf();
            candle.end = (new Date(marketIndex.candles[i][5])).valueOf();

            candle.beginId = marketIndex.candles[i][6];
            candle.endId = marketIndex.candles[i][7];

            if (candle.open > candle.close) { candle.direction = 'down'; }
            if (candle.open < candle.close) { candle.direction = 'up'; }
            if (candle.open === candle.close) { candle.direction = 'side'; }

            candles.push(candle);
        }

    }


  

    function recalculateScale() {

        var minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(marketIndex.maxRate())
        };


        plotArea.initialize(
            minValue,
            maxValue,
            candleStickChartLayer.container.frame.width,
            candleStickChartLayer.container.frame.height
        );

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

                candlePoint1 = plotArea.inverseTransform(candlePoint1, candleStickChartLayer.container.frame.height);
                candlePoint2 = plotArea.inverseTransform(candlePoint2, candleStickChartLayer.container.frame.height);
                candlePoint3 = plotArea.inverseTransform(candlePoint3, candleStickChartLayer.container.frame.height);
                candlePoint4 = plotArea.inverseTransform(candlePoint4, candleStickChartLayer.container.frame.height);

                candlePoint1 = transformThisPoint(candlePoint1, candleStickChartLayer.container);
                candlePoint2 = transformThisPoint(candlePoint2, candleStickChartLayer.container);
                candlePoint3 = transformThisPoint(candlePoint3, candleStickChartLayer.container);
                candlePoint4 = transformThisPoint(candlePoint4, candleStickChartLayer.container);

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

                stickPoint1 = plotArea.inverseTransform(stickPoint1, candleStickChartLayer.container.frame.height);
                stickPoint2 = plotArea.inverseTransform(stickPoint2, candleStickChartLayer.container.frame.height);
                stickPoint3 = plotArea.inverseTransform(stickPoint3, candleStickChartLayer.container.frame.height);
                stickPoint4 = plotArea.inverseTransform(stickPoint4, candleStickChartLayer.container.frame.height);

                stickPoint1 = transformThisPoint(stickPoint1, candleStickChartLayer.container);
                stickPoint2 = transformThisPoint(stickPoint2, candleStickChartLayer.container);
                stickPoint3 = transformThisPoint(stickPoint3, candleStickChartLayer.container);
                stickPoint4 = transformThisPoint(stickPoint4, candleStickChartLayer.container);

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

                        candleStickChartLayer.container.eventHandler.raiseEvent("Current Candle Info Changed", currentCandle);

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

