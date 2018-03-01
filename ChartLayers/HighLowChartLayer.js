
function newHighLowChartLayer() {


    var candles = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();

    var datetime = INITIAL_DATE;

    var highLowChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        onCandlesChanged: onCandlesChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    highLowChartLayer.container = container;

    container.displacement.containerName = "Candle Stick Chart";
    container.zoom.containerName = "Candle Stick Chart";
    container.frame.containerName = "Candle Stick Chart";

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let highLowFlagArray = [];

    let layerStatus = 'off';
    let parentLayerStatus = 'off';

    return highLowChartLayer;

    function initialize(exchange, market, index, dailyFiles, botsPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScale();

        layerStatus = botsPanel.getProductStatus(botsPanel.layerNames.HIGH_LOWS);
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

        if (eventData.layer === 'High and Lows') {
            layerStatus = eventData.status;
        }

    }

    function onCandlesChanged(newCandles) {

        candles = newCandles;
        recalculateHighLow();

    }


    function setTimePeriod(period) {

        timePeriod = period;

    }

    function setDatetime(newDatetime) {
        datetime = newDatetime;
        recalculateHighLow();
    }



    function draw() {

        if (layerStatus !== 'on') { return; }

        if (parentLayerStatus === 'off') { return; }

        this.container.frame.draw();

        plotHighLowChart();

    }


    function recalculateHighLow() {

        if (layerStatus === 'off') { return; }

        if (parentLayerStatus === 'off') { return; }

        highLowFlagArray = [];

        for (let i = 0; i < candles.length - 2; i++) {

            let previousCandle = candles[i];
            let currentCandle = candles[i + 1];
            let nextCandle = candles[i + 2];

            if (currentCandle.max >= previousCandle.max && currentCandle.max >= nextCandle.max) {

                let highLowFlag = newHighLowFlag();

                highLowFlag.rate = currentCandle.max;
                highLowFlag.type = 'max-high';

                highLowFlag.begin = currentCandle.begin;
                highLowFlag.end = currentCandle.end;

                let scanIndex;
                
                scanIndex= i + 1;

                while (scanIndex > 0) {

                    scanIndex--;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.max >= scanCandle.max) {

                        highLowFlag.firstBegin = scanCandle.begin;
                        highLowFlag.pastCandles++;

                    } else {
                        break;
                    }

                }

                scanIndex = i + 1;

                while (scanIndex < candles.length - 1) {

                    scanIndex++;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.max >= scanCandle.max) {

                        highLowFlag.lastEnd = scanCandle.end;
                        highLowFlag.futureCandles++;

                    } else {
                        break;
                    }
                }

                if (highLowFlag.pastCandles >= 1 && highLowFlag.futureCandles >= 1) {

                    highLowFlagArray.push(highLowFlag);
                }

            }

            if (currentCandle.min <= previousCandle.min && currentCandle.min <= nextCandle.min) {

                let highLowFlag = newHighLowFlag();

                highLowFlag.rate = currentCandle.min;
                highLowFlag.type = 'min-low';

                highLowFlag.begin = currentCandle.begin;
                highLowFlag.end = currentCandle.end;

                let scanIndex;

                scanIndex = i + 1;

                while (scanIndex > 0) {

                    scanIndex--;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.min <= scanCandle.min) {

                        highLowFlag.firstBegin = scanCandle.begin;
                        highLowFlag.pastCandles++;

                    } else {
                        break;
                    }

                }

                scanIndex = i + 1;

                while (scanIndex < candles.length - 1) {

                    scanIndex++;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.min <= scanCandle.min) {

                        highLowFlag.lastEnd = scanCandle.end;
                        highLowFlag.futureCandles++;

                    } else {
                        break;
                    }
                }

                if (highLowFlag.pastCandles >= 1 && highLowFlag.futureCandles >= 1) {

                    highLowFlagArray.push(highLowFlag);
                }
            }

            if (currentCandle.max <= previousCandle.max && currentCandle.max <= nextCandle.max) {

                let highLowFlag = newHighLowFlag();

                highLowFlag.rate = currentCandle.max;
                highLowFlag.type = 'min-high';

                highLowFlag.begin = currentCandle.begin;
                highLowFlag.end = currentCandle.end;

                let scanIndex;

                scanIndex = i + 1;

                while (scanIndex > 0) {

                    scanIndex--;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.max <= scanCandle.max) {

                        highLowFlag.firstBegin = scanCandle.begin;
                        highLowFlag.pastCandles++;

                    } else {
                        break;
                    }

                }

                scanIndex = i + 1;

                while (scanIndex < candles.length - 1) {

                    scanIndex++;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.max <= scanCandle.max) {

                        highLowFlag.lastEnd = scanCandle.end;
                        highLowFlag.futureCandles++;

                    } else {
                        break;
                    }
                }

                if (highLowFlag.pastCandles >= 1 && highLowFlag.futureCandles >= 1) {

                    highLowFlagArray.push(highLowFlag);
                }

            }

            if (currentCandle.min >= previousCandle.min && currentCandle.min >= nextCandle.min) {

                let highLowFlag = newHighLowFlag();

                highLowFlag.rate = currentCandle.min;
                highLowFlag.type = 'max-low';

                highLowFlag.begin = currentCandle.begin;
                highLowFlag.end = currentCandle.end;

                let scanIndex;

                scanIndex = i + 1;

                while (scanIndex > 0) {

                    scanIndex--;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.min >= scanCandle.min) {

                        highLowFlag.firstBegin = scanCandle.begin;
                        highLowFlag.pastCandles++;

                    } else {
                        break;
                    }

                }

                scanIndex = i + 1;

                while (scanIndex < candles.length - 1) {

                    scanIndex++;
                    let scanCandle = candles[scanIndex];

                    if (currentCandle.min >= scanCandle.min) {

                        highLowFlag.lastEnd = scanCandle.end;
                        highLowFlag.futureCandles++;

                    } else {
                        break;
                    }
                }

                if (highLowFlag.pastCandles >= 1 && highLowFlag.futureCandles >= 1) {

                    highLowFlagArray.push(highLowFlag);
                }
            }

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
            highLowChartLayer.container.frame.width,
            highLowChartLayer.container.frame.height
        );

    }




    function plotHighLowChart() {

        if (highLowFlagArray.length > 0) {

            for (var i = 0; i < highLowFlagArray.length; i++) {

                flag = highLowFlagArray[i];

                let flagPoint1;
                let flagPoint2;
                let flagPoint3;
                let flagPoint4;
                let flagPoint5;
                let flagPoint6;

                flagPoint1 = {
                    x: flag.begin + timePeriod / 2,
                    y: flag.rate
                };

                flagPoint2 = {
                    x: flag.lastEnd,
                    y: flag.rate
                };

                flagPoint3 = {
                    x: flag.begin + timePeriod / 2,
                    y: flag.rate
                };

                flagPoint4 = {
                    x: flag.begin + timePeriod / 2,
                    y: flag.rate
                };

                flagPoint5 = {
                    x: flag.begin + timePeriod / 2,
                    y: flag.rate
                };

                flagPoint6 = {
                    x: flag.begin + timePeriod / 2,
                    y: flag.rate
                };

                flagPoint7 = {
                    x: flag.begin + timePeriod / 7 * 1.5,
                    y: flag.rate
                };

                flagPoint8 = {
                    x: flag.begin + timePeriod / 7 * 5.5,
                    y: flag.rate
                };

                flagPoint1 = plotArea.inverseTransform(flagPoint1, highLowChartLayer.container.frame.height);
                flagPoint2 = plotArea.inverseTransform(flagPoint2, highLowChartLayer.container.frame.height);
                flagPoint3 = plotArea.inverseTransform(flagPoint3, highLowChartLayer.container.frame.height);
                flagPoint4 = plotArea.inverseTransform(flagPoint4, highLowChartLayer.container.frame.height);
                flagPoint5 = plotArea.inverseTransform(flagPoint5, highLowChartLayer.container.frame.height);
                flagPoint6 = plotArea.inverseTransform(flagPoint6, highLowChartLayer.container.frame.height);
                flagPoint7 = plotArea.inverseTransform(flagPoint7, highLowChartLayer.container.frame.height);
                flagPoint8 = plotArea.inverseTransform(flagPoint8, highLowChartLayer.container.frame.height);

                flagPoint1 = transformThisPoint(flagPoint1, highLowChartLayer.container);
                flagPoint2 = transformThisPoint(flagPoint2, highLowChartLayer.container);
                flagPoint3 = transformThisPoint(flagPoint3, highLowChartLayer.container);
                flagPoint4 = transformThisPoint(flagPoint4, highLowChartLayer.container);
                flagPoint5 = transformThisPoint(flagPoint5, highLowChartLayer.container);
                flagPoint6 = transformThisPoint(flagPoint6, highLowChartLayer.container);
                flagPoint7 = transformThisPoint(flagPoint7, highLowChartLayer.container);
                flagPoint8 = transformThisPoint(flagPoint8, highLowChartLayer.container);

                if (flagPoint2.x < viewPort.visibleArea.bottomLeft.x || flagPoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                let opacity = '0.50';
                let POLE_HEIGHT = (flagPoint8.x - flagPoint7.x);


                if (flag.type === 'max-high') {

                    flagPoint4.y = flagPoint4.y - POLE_HEIGHT;
                    flagPoint5.y = flagPoint5.y - POLE_HEIGHT * 3 / 4;
                    flagPoint6.y = flagPoint6.y - POLE_HEIGHT / 2;
                    flagPoint5.x = flagPoint5.x + POLE_HEIGHT / 2;

                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')'; 
                    browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')'; 

                }

                if (flag.type === 'min-low') {

                    flagPoint4.y = flagPoint4.y + POLE_HEIGHT;
                    flagPoint5.y = flagPoint5.y + POLE_HEIGHT * 3 / 4;
                    flagPoint6.y = flagPoint6.y + POLE_HEIGHT / 2;
                    flagPoint5.x = flagPoint5.x - POLE_HEIGHT / 2;

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')'; 
                    browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';

                }

                if (flag.type === 'min-high') {

                    flagPoint4.y = flagPoint4.y - POLE_HEIGHT;
                    flagPoint5.y = flagPoint5.y - POLE_HEIGHT * 3 / 4;
                    flagPoint6.y = flagPoint6.y - POLE_HEIGHT / 2;
                    flagPoint5.x = flagPoint5.x - POLE_HEIGHT / 2;

                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                    browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';

                }

                if (flag.type === 'max-low') {

                    flagPoint4.y = flagPoint4.y + POLE_HEIGHT;
                    flagPoint5.y = flagPoint5.y + POLE_HEIGHT * 3 / 4;
                    flagPoint6.y = flagPoint6.y + POLE_HEIGHT / 2;
                    flagPoint5.x = flagPoint5.x + POLE_HEIGHT / 2;

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';
                    browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';

                }

                flagPoint1 = viewPort.fitIntoVisibleArea(flagPoint1);
                flagPoint2 = viewPort.fitIntoVisibleArea(flagPoint2);
                flagPoint3 = viewPort.fitIntoVisibleArea(flagPoint3);
                flagPoint4 = viewPort.fitIntoVisibleArea(flagPoint4);
                flagPoint5 = viewPort.fitIntoVisibleArea(flagPoint5);
                flagPoint6 = viewPort.fitIntoVisibleArea(flagPoint6);
                flagPoint7 = viewPort.fitIntoVisibleArea(flagPoint7);
                flagPoint8 = viewPort.fitIntoVisibleArea(flagPoint8);

                if (flag.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')'; }
                if (flag.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')'; }

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= flag.begin && dateValue <= flag.end) {

                        /* highlight the current flag */

                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 0.1)'; // Current flag accroding to time

                    }
                } 
                
                /* Draw the flag body */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(flagPoint4.x, flagPoint4.y);
                browserCanvasContext.lineTo(flagPoint5.x, flagPoint5.y);
                browserCanvasContext.lineTo(flagPoint6.x, flagPoint6.y);

                browserCanvasContext.closePath();

                browserCanvasContext.fill();

                if (flag.type === 'max-high' || flag.type === 'min-low') {

                    /* Draw the multi candle line */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(flagPoint1.x, flagPoint1.y);
                    browserCanvasContext.lineTo(flagPoint2.x, flagPoint2.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.lineWidth = 0.1;
                    browserCanvasContext.stroke();
                }

                /* Draw the floor and the pole */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(flagPoint3.x, flagPoint3.y);
                browserCanvasContext.lineTo(flagPoint4.x, flagPoint4.y);
                browserCanvasContext.lineTo(flagPoint5.x, flagPoint5.y);
                browserCanvasContext.lineTo(flagPoint6.x, flagPoint6.y);
                browserCanvasContext.moveTo(flagPoint7.x, flagPoint7.y);
                browserCanvasContext.lineTo(flagPoint8.x, flagPoint8.y);

                browserCanvasContext.closePath();

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();
            }

        }
    }


}

