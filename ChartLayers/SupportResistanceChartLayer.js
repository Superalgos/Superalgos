
function newSupportResistanceChartLayer() {


    var candles = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();

    var datetime = INITIAL_DATE;

    var supportResistanceChartLayer = {
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
    supportResistanceChartLayer.container = container;

    container.displacement.containerName = "Candle Stick Chart";
    container.zoom.containerName = "Candle Stick Chart";
    container.frame.containerName = "Candle Stick Chart";

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let supportArray = [];

    return supportResistanceChartLayer;

    function initialize(exchange, market, index, dailyFiles, chartLayersPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScale();

        layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.CANDLESTICKS); // TODO : Put the right layer name here when it exists.

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

    function onCandlesChanged(newCandles) {

        candles = newCandles;
        recalculateSupportResistance();

    }


    function setTimePeriod(period) {

        timePeriod = period;

    }

    function setDatetime(newDatetime) {
        datetime = newDatetime;
        recalculateSupportResistance();
    }



    function draw() {

        this.container.frame.draw();

        plotSupportResistanceChart();

    }


    function recalculateSupportResistance() {

        supportArray = [];
        let stairs;

        for (let i = 0; i < candles.length - 1; i++) {

            let currentCandle = candles[i];
            let nextCandle = candles[i + 1];

            if (currentCandle.direction === nextCandle.direction && currentCandle.direction !== 'side') {

                if (stairs === undefined) {

                    stairs = newCandleStairs();

                    stairs.direction = currentCandle.direction;
                    stairs.candleCount = 2;

                    stairs.begin = currentCandle.begin;
                    stairs.end = nextCandle.end;

                    stairs.open = currentCandle.open;
                    stairs.close = nextCandle.close;

                    if (currentCandle.min < nextCandle.min) { stairs.min = currentCandle.min; } else { stairs.min = nextCandle.min }
                    if (currentCandle.max > nextCandle.max) { stairs.max = currentCandle.max; } else { stairs.max = nextCandle.max }

                    if (stairs.direction === 'up') {

                        stairs.firstMin = currentCandle.open;
                        stairs.firstMax = currentCandle.close;

                        stairs.lastMin = nextCandle.open;
                        stairs.lastMax = nextCandle.close;

                    } else {

                        stairs.firstMin = currentCandle.close;
                        stairs.firstMax = currentCandle.open;

                        stairs.lastMin = nextCandle.close;
                        stairs.lastMax = nextCandle.open;

                    }


                } else {

                    stairs.candleCount++;
                    stairs.end = nextCandle.end;
                    stairs.close = nextCandle.close;

                    if (stairs.min < nextCandle.min) { stairs.min = currentCandle.min; } 
                    if (stairs.max > nextCandle.max) { stairs.max = currentCandle.max; }

                    if (stairs.direction === 'up') {

                        stairs.lastMin = nextCandle.open;
                        stairs.lastMax = nextCandle.close;

                    } else {

                        stairs.lastMin = nextCandle.close;
                        stairs.lastMax = nextCandle.open;

                    }

                }

            } else {

                if (stairs !== undefined) {
                    supportArray.push(stairs);
                    stairs = undefined;
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
            supportResistanceChartLayer.container.frame.width,
            supportResistanceChartLayer.container.frame.height
        );

    }




    function plotSupportResistanceChart() {

        if (supportArray.length > 0) {

            for (var i = 0; i < supportArray.length; i++) {

                stairs = supportArray[i];

                let stairsPoint1;
                let stairsPoint2;
                let stairsPoint3;
                let stairsPoint4;

                if (stairs.direction === 'up') {

                    stairsPoint1 = {
                        x: stairs.begin + timePeriod / 7 * 5.5,
                        y: stairs.firstMin
                    };

                    stairsPoint2 = {
                        x: stairs.end - timePeriod / 7 * 1.5,
                        y: stairs.lastMin
                    };

                    stairsPoint3 = {
                        x: stairs.end - timePeriod / 7 * 5.5,
                        y: stairs.lastMax
                    };

                    stairsPoint4 = {
                        x: stairs.begin + timePeriod / 7 * 1.5,
                        y: stairs.firstMax
                    };

                } else {

                    stairsPoint1 = {
                        x: stairs.begin + timePeriod / 7 * 1.5,
                        y: stairs.firstMin
                    };

                    stairsPoint2 = {
                        x: stairs.end - timePeriod / 7 * 5.5,
                        y: stairs.lastMin
                    };

                    stairsPoint3 = {
                        x: stairs.end - timePeriod / 7 * 1.5,
                        y: stairs.lastMax
                    };

                    stairsPoint4 = {
                        x: stairs.begin + timePeriod / 7 * 5.5,
                        y: stairs.firstMax
                    };
                }

                stairsPoint1 = plotArea.inverseTransform(stairsPoint1, supportResistanceChartLayer.container.frame.height);
                stairsPoint2 = plotArea.inverseTransform(stairsPoint2, supportResistanceChartLayer.container.frame.height);
                stairsPoint3 = plotArea.inverseTransform(stairsPoint3, supportResistanceChartLayer.container.frame.height);
                stairsPoint4 = plotArea.inverseTransform(stairsPoint4, supportResistanceChartLayer.container.frame.height);

                stairsPoint1 = transformThisPoint(stairsPoint1, supportResistanceChartLayer.container);
                stairsPoint2 = transformThisPoint(stairsPoint2, supportResistanceChartLayer.container);
                stairsPoint3 = transformThisPoint(stairsPoint3, supportResistanceChartLayer.container);
                stairsPoint4 = transformThisPoint(stairsPoint4, supportResistanceChartLayer.container);

                if (stairsPoint2.x < viewPort.visibleArea.bottomLeft.x || stairsPoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                stairsPoint1 = viewPort.fitIntoVisibleArea(stairsPoint1);
                stairsPoint2 = viewPort.fitIntoVisibleArea(stairsPoint2);
                stairsPoint3 = viewPort.fitIntoVisibleArea(stairsPoint3);
                stairsPoint4 = viewPort.fitIntoVisibleArea(stairsPoint4);

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(stairsPoint1.x, stairsPoint1.y);
                browserCanvasContext.lineTo(stairsPoint2.x, stairsPoint2.y);
                browserCanvasContext.lineTo(stairsPoint3.x, stairsPoint3.y);
                browserCanvasContext.lineTo(stairsPoint4.x, stairsPoint4.y);

                browserCanvasContext.closePath();

                let opacity = '0.25';

                if (stairs.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')'; }
                if (stairs.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')'; }

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= stairs.begin && dateValue <= stairs.end) {


                        /* highlight the current stairs */

                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 0.1)'; // Current stairs accroding to time

                    } else {

                        if (stairs.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')'; }
                        if (stairs.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')'; }
                    }

                } else {

                    if (stairs.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')'; }
                    if (stairs.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')'; }
                }

                browserCanvasContext.fill();

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();
            }

        }
    }


}

