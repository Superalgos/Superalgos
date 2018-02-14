
function newAccumulatedVolumeChartLayer() {


    var volumeBars = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();
    var plotAreaFrame = newPlotArea();

    let datetime = INITIAL_DATE;

    var accumulatedVolumeChartLayer = {
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
    accumulatedVolumeChartLayer.container = container;

    container.displacement.containerName = "Accumulated Volume Chart";
    container.zoom.containerName = "Accumulated Volume Chart";
    container.frame.containerName = "Accumulated Volume Chart";

    var marketId;
    var exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let maxAccumulatedBalance = 0;
    const MAX_ACCUMULATED_BALANCE_BARS_HEIGHT = 250;
    const PLOT_Y_BASE_LINE = viewPort.visibleArea.bottomLeft.y * 0.50;

    let layerStatus = 'off';
    let parentLayerStatus = 'off';

    return accumulatedVolumeChartLayer;

    function initialize(exchange, market, index, dailyFiles, chartLayersPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScaleX();
        recalculateVolumeBars();
        recalculateScaleY();

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.BUY_SELL_BALANCE);
        parentLayerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.VOLUME); 

    }

    function getContainer(point) {

        if (layerStatus === 'off') { return; }

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

        if (eventData.layer === 'Volume') {
            parentLayerStatus = eventData.status;
        }

        if (eventData.layer === 'Buy Sell Balance') {
            layerStatus = eventData.status;
        }

    }

    function onZoomChanged(event) {

        recalculateScaleX();
        recalculateVolumeBars();
        recalculateScaleY();

    }

    function onDragFinished() {


        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            recalculateScaleX();
            recalculateVolumeBars();
            recalculateScaleY();

        }
    }


    function setTimePeriod(period) {

        timePeriod = period;

    }


    function setDatetime(newDatetime) {
        datetime = newDatetime;
        recalculateVolumeBars();
    }



    function draw() {

        if (layerStatus !== 'on') { return; }

        if (parentLayerStatus === 'off') { return; }

        this.container.frame.draw();

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            if (Math.random() * 100 > 98) {
                recalculateScaleX();
                recalculateVolumeBars();
                recalculateScaleY();
            }
        }

        plotAccumulatedVolumeBalanceChart();

    }


    function recalculateVolumeBars() {

        if (layerStatus === 'off') { return; }

        if (parentLayerStatus === 'off') { return; }

        if (timePeriod === ONE_DAY_IN_MILISECONDS) {

            recalculateVolumeBarsUsingMarketIndex();

        } else {

            recalculateVolumeBarsUsingDailyFiles();

        }
    }

    function recalculateVolumeBarsUsingMarketIndex() {

        volumeBars = [];

        let accumulatedBuys = 0;
        let accumulatedSells = 0;
        maxAccumulatedBalance = 0;


        for (var i = 0; i < marketIndex.volumes.length; i++) {

            var volumeBar = newAccumulatedVolumeBar();

            let amountBuy = 0;
            let amountSell = 0;

            volumeBar.begin = (new Date(marketIndex.volumes[i][2])).valueOf();
            volumeBar.end = (new Date(marketIndex.volumes[i][3])).valueOf();

            amountBuy = marketIndex.volumes[i][0];
            amountSell = marketIndex.volumes[i][1];

            accumulatedBuys = accumulatedBuys + amountBuy;
            accumulatedSells = accumulatedSells + amountSell;

            volumeBar.accumulatedBuys = accumulatedBuys;
            volumeBar.accumulatedSells = accumulatedSells;

            let balance = volumeBar.accumulatedBuys - volumeBar.accumulatedSells;

            if (maxAccumulatedBalance < Math.abs(balance)) { maxAccumulatedBalance = Math.abs(balance); }

            volumeBars.push(volumeBar);
        }

    }


    function calculateAccumulatedBalance(currentDate) {

        let accumulatedBuys = 0;
        let accumulatedSells = 0;
        let volumeBar = newAccumulatedVolumeBar();
        let lastValidBar;
        let found = false;



        for (var i = 0; i < marketIndex.volumes.length; i++) {

            let barDate = new Date(marketIndex.volumes[i][3]);

            if (barDate.valueOf() > currentDate.valueOf() && found === false) {
                lastValidBar = volumeBar; // return the last valid one.
                found = true;
            }

            volumeBar = newAccumulatedVolumeBar();
            let amountBuy = 0;
            let amountSell = 0;

            volumeBar.begin = (new Date(marketIndex.volumes[i][2])).valueOf();
            volumeBar.end = (new Date(marketIndex.volumes[i][3])).valueOf();

            amountBuy = marketIndex.volumes[i][0];
            amountSell = marketIndex.volumes[i][1];

            accumulatedBuys = accumulatedBuys + amountBuy;
            accumulatedSells = accumulatedSells + amountSell;

            volumeBar.accumulatedBuys = accumulatedBuys;
            volumeBar.accumulatedSells = accumulatedSells;

            let balance = volumeBar.accumulatedBuys - volumeBar.accumulatedSells;

            if (maxAccumulatedBalance < Math.abs(balance)) { maxAccumulatedBalance = Math.abs(balance); }

        }

        return lastValidBar;

    }


    function recalculateVolumeBarsUsingDailyFiles(currentDateOnly) {

        let daysOnSides = getSideDays(timePeriod);

        let leftDate;
        let rightDate;

        if (currentDateOnly === true) {

            leftDate = new Date(datetime.getTime());
            rightDate = new Date(datetime.getTime());

            leftDate = removeTime(datetime);
            rightDate = removeTime(datetime);

        } else {

            leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, accumulatedVolumeChartLayer.container, plotArea);
            rightDate = getDateFromPoint(viewPort.visibleArea.topRight, accumulatedVolumeChartLayer.container, plotArea);

            leftDate.setDate(leftDate.getDate() - daysOnSides);
            rightDate.setDate(rightDate.getDate() + daysOnSides);

        }

        let currentDate = new Date(leftDate.getTime());

        volumeBars = [];

        let firstFile = true;
        let accumulatedBuys = 0;
        let accumulatedSells = 0;
        maxAccumulatedBalance = 0;

        while (currentDate.getTime() <= rightDate.getTime()) {

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

            let dailyFile = dailyFilesCursor.dailyFiles.get(stringDate);

            if (dailyFile !== undefined) {

                let lastVolumeBar;

                if (firstFile === true) {

                    /* We calculate the initial Accumulated Balance based on the Index Files upto this current date*/

                    lastVolumeBar = calculateAccumulatedBalance(currentDate);

                    try {

                        accumulatedBuys = lastVolumeBar.accumulatedBuys;
                        accumulatedSells = lastVolumeBar.accumulatedSells;

                    }
                    catch (err) {
                        // In the situation where there are daily files for a certain date but the index file is not reaching that date, an error is catched here.
                    }

                    firstFile = false;
                }

                const fileTimePeriod = 60 * 1000;
                const totalVolumeBars = dailyFile.length * fileTimePeriod / timePeriod;
                const recordsPerVolumeBar = timePeriod / fileTimePeriod;

                for (var i = 0; i < totalVolumeBars; i++) {

                    var volumeBar = newAccumulatedVolumeBar();
                    let amountBuy = 0;
                    let amountSell = 0;

                    for (var j = 0; j < recordsPerVolumeBar; j++) {

                        amountBuy = amountBuy + dailyFile[i * recordsPerVolumeBar + j][8];
                        amountSell = amountSell + dailyFile[i * recordsPerVolumeBar + j][9];

                    }

                    volumeBar.begin = dailyFile[i * recordsPerVolumeBar][4];
                    volumeBar.end = dailyFile[i * recordsPerVolumeBar + recordsPerVolumeBar - 1][5];

                    accumulatedBuys = accumulatedBuys + amountBuy;
                    accumulatedSells = accumulatedSells + amountSell;

                    volumeBar.accumulatedBuys = accumulatedBuys;
                    volumeBar.accumulatedSells = accumulatedSells;

                    let balance = volumeBar.accumulatedBuys - volumeBar.accumulatedSells;


                    volumeBars.push(volumeBar);
                }

            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

    }


    function recalculateScaleX() {


        var minValue = {
            x: EARLIEST_DATE.valueOf()
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf()
        };

        plotArea.initializeX(
            minValue,
            maxValue,
            accumulatedVolumeChartLayer.container.frame.width
        );

        plotAreaFrame.initializeX(
            minValue,
            maxValue,
            accumulatedVolumeChartLayer.container.frame.width
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

        maxValue.y = marketIndex.maxVolume() / (timePeriodRatio / 10);

        plotArea.initializeY(
            minValue,
            maxValue,
            viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y
        );

        plotAreaFrame.initializeY(
            minValue,
            maxValue,
            accumulatedVolumeChartLayer.container.frame.height
        );

    }




    function plotAccumulatedVolumeBalanceChart() {




        let visibleHeight = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y;

        let frameCorner1 = {
            x: 0,
            y: 0
        };

        let frameCorner2 = {
            x: accumulatedVolumeChartLayer.container.frame.width,
            y: accumulatedVolumeChartLayer.container.frame.height
        };


        /* Now the transformations. */

        frameCorner1 = transformThisPoint(frameCorner1, accumulatedVolumeChartLayer.container.frame.container);
        frameCorner2 = transformThisPoint(frameCorner2, accumulatedVolumeChartLayer.container.frame.container);

        let frameHeightInViewPort = frameCorner2.y - frameCorner1.y;

        if (volumeBars.length > 0) {

            for (var i = 0; i < volumeBars.length; i++) {


                volumeBar = volumeBars[i];

                let volumeBarPointA1;
                let volumeBarPointA2;
                let volumeBarPointA3;
                let volumeBarPointA4;

                function calculateBuys(plot, height) {

                    volumeBarPointA1 = {
                        x: volumeBar.begin,
                        y: 0
                    };

                    volumeBarPointA2 = {
                        x: volumeBar.begin,
                        y: 0
                    };

                    volumeBarPointA3 = {
                        x: volumeBar.end,
                        y: 0
                    };

                    volumeBarPointA4 = {
                        x: volumeBar.end,
                        y: 0
                    };

                    volumeBarPointA1 = plot.inverseTransform(volumeBarPointA1, height);
                    volumeBarPointA2 = plot.inverseTransform(volumeBarPointA2, height);
                    volumeBarPointA3 = plot.inverseTransform(volumeBarPointA3, height);
                    volumeBarPointA4 = plot.inverseTransform(volumeBarPointA4, height);

                    volumeBarPointA1 = transformThisPoint(volumeBarPointA1, accumulatedVolumeChartLayer.container);
                    volumeBarPointA2 = transformThisPoint(volumeBarPointA2, accumulatedVolumeChartLayer.container);
                    volumeBarPointA3 = transformThisPoint(volumeBarPointA3, accumulatedVolumeChartLayer.container);
                    volumeBarPointA4 = transformThisPoint(volumeBarPointA4, accumulatedVolumeChartLayer.container);

                    if (volumeBarPointA4.x < viewPort.visibleArea.bottomLeft.x || volumeBarPointA1.x > viewPort.visibleArea.bottomRight.x) {
                        return false;
                    }

                    return true;

                }

                if (calculateBuys(plotAreaFrame, accumulatedVolumeChartLayer.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                let volumeBarPointB1;
                let volumeBarPointB2;
                let volumeBarPointB3;
                let volumeBarPointB4;

                function calculateSells(plot, height) {

                    volumeBarPointB1 = {
                        x: volumeBar.begin,
                        y: height
                    };

                    volumeBarPointB2 = {
                        x: volumeBar.begin,
                        y: height - volumeBar.amountSell
                    };

                    volumeBarPointB3 = {
                        x: volumeBar.end,
                        y: height - volumeBar.amountSell
                    };

                    volumeBarPointB4 = {
                        x: volumeBar.end,
                        y: height
                    };

                    volumeBarPointB1 = plot.inverseTransform2(volumeBarPointB1, height);
                    volumeBarPointB2 = plot.inverseTransform2(volumeBarPointB2, height);
                    volumeBarPointB3 = plot.inverseTransform2(volumeBarPointB3, height);
                    volumeBarPointB4 = plot.inverseTransform2(volumeBarPointB4, height);

                    volumeBarPointB1 = transformThisPoint(volumeBarPointB1, accumulatedVolumeChartLayer.container);
                    volumeBarPointB2 = transformThisPoint(volumeBarPointB2, accumulatedVolumeChartLayer.container);
                    volumeBarPointB3 = transformThisPoint(volumeBarPointB3, accumulatedVolumeChartLayer.container);
                    volumeBarPointB4 = transformThisPoint(volumeBarPointB4, accumulatedVolumeChartLayer.container);

                }

                calculateSells(plotAreaFrame, accumulatedVolumeChartLayer.container.frame.height); // We try to see if it fits in the visible area.

                if (volumeBarPointB1.y < viewPort.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                    calculateSells(plotArea, visibleHeight); // We snap it to the view port.

                    /* Now we set the real value of y. */

                    volumeBarPointB1.y = viewPort.visibleArea.topLeft.y;
                    volumeBarPointB2.y = viewPort.visibleArea.topLeft.y + volumeBar.amountSell * plotArea.scale.y;
                    volumeBarPointB3.y = viewPort.visibleArea.topLeft.y + volumeBar.amountSell * plotArea.scale.y;
                    volumeBarPointB4.y = viewPort.visibleArea.topLeft.y;

                }

                /* Everything must fit within the visible area */

                volumeBarPointA1 = viewPort.fitIntoVisibleArea(volumeBarPointA1);
                volumeBarPointA2 = viewPort.fitIntoVisibleArea(volumeBarPointA2);
                volumeBarPointA3 = viewPort.fitIntoVisibleArea(volumeBarPointA3);
                volumeBarPointA4 = viewPort.fitIntoVisibleArea(volumeBarPointA4);

                volumeBarPointB1 = viewPort.fitIntoVisibleArea(volumeBarPointB1);
                volumeBarPointB2 = viewPort.fitIntoVisibleArea(volumeBarPointB2);
                volumeBarPointB3 = viewPort.fitIntoVisibleArea(volumeBarPointB3);
                volumeBarPointB4 = viewPort.fitIntoVisibleArea(volumeBarPointB4);

                /* Everything must fit within the Frame. We know that that is equivalent to say that each bar con not be higher than the base of the opposite . */

                if (volumeBarPointA2.y < volumeBarPointB1.y) {

                    volumeBarPointA2.y = volumeBarPointB1.y;
                    volumeBarPointA3.y = volumeBarPointB1.y;

                }

                if (volumeBarPointB2.y > volumeBarPointA1.y) {

                    volumeBarPointB2.y = volumeBarPointA1.y;
                    volumeBarPointB3.y = volumeBarPointA1.y;

                }

                /* Here we will plot the balance of accumulated buys and sells */

                let balance = volumeBar.accumulatedBuys - volumeBar.accumulatedSells;
                let heigh = MAX_ACCUMULATED_BALANCE_BARS_HEIGHT;
                let scale = MAX_ACCUMULATED_BALANCE_BARS_HEIGHT / maxAccumulatedBalance;
                const OPACITY = '0.15';

                if (balance > 0) {

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(volumeBarPointA1.x, PLOT_Y_BASE_LINE);
                    browserCanvasContext.lineTo(volumeBarPointA2.x, PLOT_Y_BASE_LINE - balance * scale);
                    browserCanvasContext.lineTo(volumeBarPointA3.x, PLOT_Y_BASE_LINE - balance * scale);
                    browserCanvasContext.lineTo(volumeBarPointA4.x, PLOT_Y_BASE_LINE);

                    browserCanvasContext.closePath();

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= volumeBar.begin && dateValue <= volumeBar.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + OPACITY + ')'; // Current bar accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + OPACITY + ')';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + OPACITY + ')';

                    }

                    browserCanvasContext.fill();
                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + OPACITY + ')';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();

                } else {

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(volumeBarPointB2.x, PLOT_Y_BASE_LINE);
                    browserCanvasContext.lineTo(volumeBarPointB3.x, PLOT_Y_BASE_LINE);
                    browserCanvasContext.lineTo(volumeBarPointB3.x, PLOT_Y_BASE_LINE - balance * scale);
                    browserCanvasContext.lineTo(volumeBarPointB2.x, PLOT_Y_BASE_LINE - balance * scale);

                    browserCanvasContext.closePath();

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= volumeBar.begin && dateValue <= volumeBar.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + OPACITY + ')'; // Current bar accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + OPACITY + ')';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + OPACITY + ')';

                    }

                    browserCanvasContext.fill();
                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + OPACITY + ')';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();


                }
            }

        }
    }










}

