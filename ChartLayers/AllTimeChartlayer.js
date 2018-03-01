
function newAllTimeChartLayer() {


    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();
    var plotAreaFrame = newPlotArea();

    let datetime = INITIAL_DATE;

    var allTimeChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    allTimeChartLayer.container = container;

    container.displacement.containerName = "All Time Chart";
    container.zoom.containerName = "All Time Chart";
    container.frame.containerName = "All Time Chart";



    var marketId;
    var exchangeId;

    let marketIndex;

    let allTimeHigh;
    let allTimeLow;

    let allTimeHighs = [];
    let allTimeLows = [];

    let layerStatus = 'off';

    return allTimeChartLayer;

    function initialize(exchange, market, index, botsPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;

        recalculateScale();

        let server = newFileServer();
        server.initialize();

        server.getAllTimes(exchangeId, marketId, onFileReady);

        function onFileReady(file) {

            allTimes = file;

            for (let i = 0; i < allTimes.length; i++) {

                if (allTimes[i][0] === 'high') {
                    allTimeHighs.push([allTimes[i][1], allTimes[i][2]]);
                } 

                if (allTimes[i][0] === 'low') {
                    allTimeLows.push([allTimes[i][1], allTimes[i][2]]);
                } 

            }

            layerStatus = botsPanel.getProductStatus(botsPanel.layerNames.ATH);

        }


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

        if (eventData.layer === 'All-time Highs and Lows') {
            layerStatus = eventData.status;
        }

    }

    function setTimePeriod(period) {

        timePeriod = period;

    }



    function setDatetime(newDatetime) {
        datetime = newDatetime;
    }



    function draw() {

        if (layerStatus !== 'on') { return; }

        this.container.frame.draw();

        plotAllTimeChart();

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
            allTimeChartLayer.container.frame.width,
            allTimeChartLayer.container.frame.height
        );

    }




    function plotAllTimeChart() {


        let firstHighRate = 0;
        let firstLowRate = 0;

        if (marketIndex.candles.length > 0) {

            firstHighRate = marketIndex.candles[0][2];
            firstLowRate = marketIndex.candles[0][2];

        }


        if (allTimeHighs.length > 0) {

            browserCanvasContext.beginPath();

            let leftCornerPoint = {
                x: plotArea.min.x,
                y: plotArea.max.y
            };

            leftCornerPoint = plotArea.inverseTransform(leftCornerPoint, allTimeChartLayer.container.frame.height);
            leftCornerPoint = transformThisPoint(leftCornerPoint, allTimeChartLayer.container);
            leftCornerPoint = viewPort.fitIntoVisibleArea(leftCornerPoint);

            browserCanvasContext.moveTo(leftCornerPoint.x, leftCornerPoint.y);

            let firstPoint = {
                x: plotArea.min.x,
                y: firstHighRate
            };

            firstPoint = plotArea.inverseTransform(firstPoint, allTimeChartLayer.container.frame.height);
            firstPoint = transformThisPoint(firstPoint, allTimeChartLayer.container);
            firstPoint = viewPort.fitIntoVisibleArea(firstPoint);

            browserCanvasContext.lineTo(firstPoint.x, firstPoint.y);

            let lastRate = firstHighRate;

            for (var i = 0; i < allTimeHighs.length; i++) {

                let rate = allTimeHighs[i][0];
                let begin = Math.trunc(allTimeHighs[i][1] / timePeriod) * timePeriod + timePeriod / 2;

                let allTimePointA;

                allTimePointA = {
                    x: begin,
                    y: lastRate
                };

                allTimePointA = plotArea.inverseTransform(allTimePointA, allTimeChartLayer.container.frame.height);
                allTimePointA = transformThisPoint(allTimePointA, allTimeChartLayer.container);
                allTimePointA = viewPort.fitIntoVisibleArea(allTimePointA);

                browserCanvasContext.lineTo(allTimePointA.x, allTimePointA.y);

                let allTimePointB;

                allTimePointB = {
                    x: begin,
                    y: rate
                };

                allTimePointB = plotArea.inverseTransform(allTimePointB, allTimeChartLayer.container.frame.height);
                allTimePointB = transformThisPoint(allTimePointB, allTimeChartLayer.container);
                allTimePointB = viewPort.fitIntoVisibleArea(allTimePointB);

                browserCanvasContext.lineTo(allTimePointB.x, allTimePointB.y);

                lastRate = rate;
            }

            let lastPoint = {
                x: plotArea.max.x,
                y: allTimeHighs[allTimeHighs.length - 1][0]
            };

            lastPoint = plotArea.inverseTransform(lastPoint, allTimeChartLayer.container.frame.height);
            lastPoint = transformThisPoint(lastPoint, allTimeChartLayer.container);
            lastPoint = viewPort.fitIntoVisibleArea(lastPoint);

            browserCanvasContext.lineTo(lastPoint.x, lastPoint.y);

            let rightCornerPoint = {
                x: plotArea.max.x,
                y: plotArea.max.y
            };

            rightCornerPoint = plotArea.inverseTransform(rightCornerPoint, allTimeChartLayer.container.frame.height);
            rightCornerPoint = transformThisPoint(rightCornerPoint, allTimeChartLayer.container);
            rightCornerPoint = viewPort.fitIntoVisibleArea(rightCornerPoint);

            browserCanvasContext.lineTo(rightCornerPoint.x, rightCornerPoint.y);

            browserCanvasContext.closePath();

            const OPACITY = '0.05';

            browserCanvasContext.fillStyle = 'rgba(0, 229, 255, ' + OPACITY + ')';

            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(0, 140, 255, ' + OPACITY + ')';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }







        if (allTimeLows.length > 0) {

            browserCanvasContext.beginPath();

            let leftCornerPoint = {
                x: plotArea.min.x,
                y: plotArea.min.y
            };

            leftCornerPoint = plotArea.inverseTransform(leftCornerPoint, allTimeChartLayer.container.frame.height);
            leftCornerPoint = transformThisPoint(leftCornerPoint, allTimeChartLayer.container);
            leftCornerPoint = viewPort.fitIntoVisibleArea(leftCornerPoint);

            browserCanvasContext.moveTo(leftCornerPoint.x, leftCornerPoint.y);

            let firstPoint = {
                x: plotArea.min.x,
                y: firstLowRate
            };

            firstPoint = plotArea.inverseTransform(firstPoint, allTimeChartLayer.container.frame.height);
            firstPoint = transformThisPoint(firstPoint, allTimeChartLayer.container);
            firstPoint = viewPort.fitIntoVisibleArea(firstPoint);

            browserCanvasContext.lineTo(firstPoint.x, firstPoint.y);

            let lastRate = firstLowRate;

            for (var i = 0; i < allTimeLows.length; i++) {

                let rate = allTimeLows[i][0];
                let begin = Math.trunc(allTimeLows[i][1] / timePeriod) * timePeriod + timePeriod / 2;

                let allTimePointA;

                allTimePointA = {
                    x: begin,
                    y: lastRate
                };

                allTimePointA = plotArea.inverseTransform(allTimePointA, allTimeChartLayer.container.frame.height);
                allTimePointA = transformThisPoint(allTimePointA, allTimeChartLayer.container);
                allTimePointA = viewPort.fitIntoVisibleArea(allTimePointA);

                browserCanvasContext.lineTo(allTimePointA.x, allTimePointA.y);

                let allTimePointB;

                allTimePointB = {
                    x: begin,
                    y: rate
                };

                allTimePointB = plotArea.inverseTransform(allTimePointB, allTimeChartLayer.container.frame.height);
                allTimePointB = transformThisPoint(allTimePointB, allTimeChartLayer.container);
                allTimePointB = viewPort.fitIntoVisibleArea(allTimePointB);

                browserCanvasContext.lineTo(allTimePointB.x, allTimePointB.y);

                lastRate = rate;
            }

            let lastPoint = {
                x: plotArea.max.x,
                y: allTimeLows[allTimeLows.length - 1][0]
            };

            lastPoint = plotArea.inverseTransform(lastPoint, allTimeChartLayer.container.frame.height);
            lastPoint = transformThisPoint(lastPoint, allTimeChartLayer.container);
            lastPoint = viewPort.fitIntoVisibleArea(lastPoint);

            browserCanvasContext.lineTo(lastPoint.x, lastPoint.y);

            let rightCornerPoint = {
                x: plotArea.max.x,
                y: plotArea.min.y
            };

            rightCornerPoint = plotArea.inverseTransform(rightCornerPoint, allTimeChartLayer.container.frame.height);
            rightCornerPoint = transformThisPoint(rightCornerPoint, allTimeChartLayer.container);
            rightCornerPoint = viewPort.fitIntoVisibleArea(rightCornerPoint);

            browserCanvasContext.lineTo(rightCornerPoint.x, rightCornerPoint.y);

            browserCanvasContext.closePath();

            const OPACITY = '0.05';

            browserCanvasContext.fillStyle = 'rgba(168, 77, 2, ' + OPACITY + ')';

            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(255, 115, 0, ' + OPACITY + ')';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }


    }

}

