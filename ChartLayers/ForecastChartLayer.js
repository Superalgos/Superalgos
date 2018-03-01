
function newForecastChartLayer() {


    let candles = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    let plotArea = newPlotArea();

    var datetime = INITIAL_DATE;

    let forecastChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        setCurrentCandle: setCurrentCandle,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    forecastChartLayer.container = container;

    container.displacement.containerName = "Forecast Chart";
    container.zoom.containerName = "Forecast Chart";
    container.frame.containerName = "Forecast Chart";

    let marketId;
    let exchangeId;
  
    let marketIndex;
    let dailyFilesCursor;

    let forecastCandles = [];
    let currentCandle; 

    let layerStatus = 'off';
    let parentLayerStatus = 'off';

    return forecastChartLayer;

    function initialize(exchange, market, index, dailyFiles, botsPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScale();

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        layerStatus = botsPanel.getProductStatus(botsPanel.layerNames.FORECAST);
        parentLayerStatus = botsPanel.getProductStatus(botsPanel.layerNames.CANDLESTICKS); 

    }

    function getContainer(point) {

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
            parentLayerStatus = eventData.status;
        }

        if (eventData.layer === 'Forecast') {
            layerStatus = eventData.status;
        }

    }

    function onZoomChanged(event) {

        //recalculateCandles();

    }

    function onDragFinished() {

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            //recalculateCandles();

        }
    }


    function setTimePeriod(period) {

        timePeriod = period;
    }


    function setCurrentCandle(newCurrentCandle) {

        currentCandle = newCurrentCandle;
        recalculateForecastCandles();
        recalculateCandles(); 

    }




    function setDatetime(newDatetime) {
        datetime = newDatetime;
    }


    function draw() {

        if (layerStatus !== 'on') { return; }

        if (parentLayerStatus === 'off') { return; }

        this.container.frame.draw();

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            plotCandleChart();

        }

    }



    function recalculateForecastCandles() {

        if (layerStatus === 'off') { return; }

        if (parentLayerStatus === 'off') { return; }

        if (timePeriod < _5_MINUTES_IN_MILISECONDS || timePeriod > _1_HOUR_IN_MILISECONDS) {

            forecastCandles = [];
            candles = [];

            return;
        }

        let daysOnSides = 30;

        let leftDate;
        let rightDate;

        leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, forecastChartLayer.container, plotArea);
        rightDate = new Date(leftDate.getTime());

        leftDate.setDate(leftDate.getDate() - daysOnSides);

        let currentDate = new Date(leftDate.getTime());

        forecastCandles = [];
        let clonned = 0;
        let clonningCandles = false;
        let candleDistance;

        while (currentDate.getTime() <= rightDate.getTime()) {

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

            let dailyFile = dailyFilesCursor.dailyFiles.get(stringDate);

            if (dailyFile !== undefined) {

                const totalCandles = dailyFile.length;

                for (var i = 0; i < totalCandles; i++) {

                    var candle = newCandle();

                    candle.min = dailyFile[i][0];
                    candle.max = dailyFile[i][1];

                    candle.open = dailyFile[i][2];
                    candle.close = dailyFile[i][3];

                    candle.begin = dailyFile[i][4];
                    candle.end = dailyFile[i][5];

                    candle.beginId = dailyFile[i][6];
                    candle.endId = dailyFile[i][7];

                    if (clonningCandles === false && currentCandle.open > candle.open - candle.open * 0.001 && currentCandle.open < candle.open + candle.open * 0.001) {

                        clonningCandles = true;
                        candleDistance = currentCandle.end - candle.begin;

                    }

                    if (clonningCandles === true) {

                        candle.begin = candle.begin + candleDistance;
                        candle.end = candle.end + candleDistance;

                        forecastCandles.push(candle);

                        clonned++;

                        if (clonned === Math.trunc(totalCandles / 2)) {

                            return;
                        }
                    }
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }
    }



    function recalculateCandles() {

        try {

            candles = [];

            const fileTimePeriod = 60 * 1000;
            const totalCandles = forecastCandles.length * fileTimePeriod / timePeriod;
            const recordsPerCandle = timePeriod / fileTimePeriod;

            for (var i = 0; i < totalCandles; i++) {

                var candle = newCandle();

                let min = forecastCandles[i * recordsPerCandle].min;
                let max = forecastCandles[i * recordsPerCandle].max;

                for (var j = 0; j < recordsPerCandle; j++) {

                

                        if (forecastCandles[i * recordsPerCandle + j].min < min) {

                            min = forecastCandles[i * recordsPerCandle + j].min;
                        }

                        if (forecastCandles[i * recordsPerCandle + j][1] > max) {

                            max = forecastCandles[i * recordsPerCandle + j].max;
                        }

                }

                candle.min = min;
                candle.max = max;

                candle.open = forecastCandles[i * recordsPerCandle].open;
                candle.close = forecastCandles[i * recordsPerCandle + recordsPerCandle - 1].close;

                candle.begin = forecastCandles[i * recordsPerCandle].begin;
                candle.end = forecastCandles[i * recordsPerCandle + recordsPerCandle - 1].end;

                candle.beginId = forecastCandles[i * recordsPerCandle].beginId;
                candle.endId = forecastCandles[i * recordsPerCandle + recordsPerCandle - 1].endId;

                candles.push(candle);
            }

        } catch (err) {

            let errorDescription = err; // For now, if there is some problem we just dont have a forecast, or a complete one.

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
            forecastChartLayer.container.frame.width,
            forecastChartLayer.container.frame.height
        );

    }


    function plotCandleChart() {

        if (candles.length > 0) {

            /* Now we calculate and plot the candles */

            for (var i = 0; i < candles.length; i++) {

                let candleOpacity = 0.5 - i / candles.length;

                if (candleOpacity < 0) {
                    candleOpacity = 0;
                }

                let stickOpacity = 0.25 - i / candles.length * 2;

                if (stickOpacity < 0) {
                    stickOpacity = 0;
                }

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

                candlePoint1 = plotArea.inverseTransform(candlePoint1, forecastChartLayer.container.frame.height);
                candlePoint2 = plotArea.inverseTransform(candlePoint2, forecastChartLayer.container.frame.height);
                candlePoint3 = plotArea.inverseTransform(candlePoint3, forecastChartLayer.container.frame.height);
                candlePoint4 = plotArea.inverseTransform(candlePoint4, forecastChartLayer.container.frame.height);

                candlePoint1 = transformThisPoint(candlePoint1, forecastChartLayer.container);
                candlePoint2 = transformThisPoint(candlePoint2, forecastChartLayer.container);
                candlePoint3 = transformThisPoint(candlePoint3, forecastChartLayer.container);
                candlePoint4 = transformThisPoint(candlePoint4, forecastChartLayer.container);

                candlePoint1 = viewPort.fitIntoVisibleArea(candlePoint1);
                candlePoint2 = viewPort.fitIntoVisibleArea(candlePoint2);
                candlePoint3 = viewPort.fitIntoVisibleArea(candlePoint3);
                candlePoint4 = viewPort.fitIntoVisibleArea(candlePoint4);

                if (candlePoint2.x < viewPort.visibleArea.bottomLeft.x || candlePoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

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

                stickPoint1 = plotArea.inverseTransform(stickPoint1, forecastChartLayer.container.frame.height);
                stickPoint2 = plotArea.inverseTransform(stickPoint2, forecastChartLayer.container.frame.height);
                stickPoint3 = plotArea.inverseTransform(stickPoint3, forecastChartLayer.container.frame.height);
                stickPoint4 = plotArea.inverseTransform(stickPoint4, forecastChartLayer.container.frame.height);

                stickPoint1 = transformThisPoint(stickPoint1, forecastChartLayer.container);
                stickPoint2 = transformThisPoint(stickPoint2, forecastChartLayer.container);
                stickPoint3 = transformThisPoint(stickPoint3, forecastChartLayer.container);
                stickPoint4 = transformThisPoint(stickPoint4, forecastChartLayer.container);

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
                browserCanvasContext.fillStyle = 'rgba(54, 54, 54, ' + stickOpacity + ')';
                browserCanvasContext.fill();

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= candle.begin && dateValue <= candle.end) {

                        browserCanvasContext.strokeStyle = 'rgba(255, 233, 31, ' + stickOpacity + ')'; // Current candle accroding to time
                        currentCandle = i;

                    } else {
                        browserCanvasContext.strokeStyle = 'rgba(212, 206, 201, ' + stickOpacity + ')';
                    }

                } else {
                    browserCanvasContext.strokeStyle = 'rgba(212, 206, 201, ' + stickOpacity + ')';
                }

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(candlePoint1.x, candlePoint1.y);
                browserCanvasContext.lineTo(candlePoint2.x, candlePoint2.y);
                browserCanvasContext.lineTo(candlePoint3.x, candlePoint3.y);
                browserCanvasContext.lineTo(candlePoint4.x, candlePoint4.y);

                browserCanvasContext.closePath();

                if (candle.open < candle.close) {
                    browserCanvasContext.strokeStyle = 'rgba(27, 145, 143, ' + candleOpacity + ')';
                } else {
                    browserCanvasContext.strokeStyle = 'rgba(30, 28, 119, ' + candleOpacity + ')';
                }

                if (candle.open < candle.close) {
                    browserCanvasContext.fillStyle = 'rgba(49, 247, 244, ' + candleOpacity + ')';
                } else {
                    browserCanvasContext.fillStyle = 'rgba(28, 22, 226, ' + candleOpacity + ')';
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
