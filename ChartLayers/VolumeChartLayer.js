
function newVolumeChartLayer() {


    var volumeBars = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();
    var plotAreaFrame = newPlotArea();
    
    let datetime = INITIAL_DATE;

    var volumeChartLayer = {
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
    volumeChartLayer.container = container;

    container.displacement.containerName = "VolumeBar Stick Chart";
    container.zoom.containerName = "VolumeBar Stick Chart";
    container.frame.containerName = "VolumeBar Stick Chart";

    var marketId;
    var exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let maxAccumulatedBalance = 0;
    const MAX_ACCUMULATED_BALANCE_BARS_HEIGHT = 150;

    let layerStatus = 'off';

    return volumeChartLayer;

    function initialize(exchange, market, index, dailyFiles, botsPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        recalculateScaleX();
        recalculateVolumeBars();
        recalculateScaleY();

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.VOLUME);

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

        if (eventData.layer === 'Volume') {
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

        this.container.frame.draw();

        if (timePeriod !== ONE_DAY_IN_MILISECONDS) {

            if (Math.random() * 100 > 98) {
                recalculateScaleX();
                recalculateVolumeBars();
                recalculateScaleY();
            }
        }

        plotVolumeBarChart();

    }


    function recalculateVolumeBars() {

        if (layerStatus === 'off') { return; }

        if (timePeriod === ONE_DAY_IN_MILISECONDS) {

            recalculateVolumeBarsUsingMarketIndex();

        } else {

            recalculateVolumeBarsUsingDailyFiles();

        }

        volumeChartLayer.container.eventHandler.raiseEvent("Volumes Changed", volumeBars);
    }

    function recalculateVolumeBarsUsingMarketIndex() {

        volumeBars = [];

        let accumulatedBuys = 0;
        let accumulatedSells = 0;
        maxAccumulatedBalance = 0;

        for (var i = 0; i < marketIndex.volumes.length; i++) {

            var volumeBar = newVolumeBar();

            volumeBar.begin = (new Date(marketIndex.volumes[i][2])).valueOf();
            volumeBar.end = (new Date(marketIndex.volumes[i][3])).valueOf();

            volumeBar.amountBuy = marketIndex.volumes[i][0];
            volumeBar.amountSell = marketIndex.volumes[i][1];

            accumulatedBuys = accumulatedBuys + volumeBar.amountBuy;
            accumulatedSells = accumulatedSells + volumeBar.amountSell;

            volumeBars.push(volumeBar);
        }

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

            leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, volumeChartLayer.container, plotArea);
            rightDate = getDateFromPoint(viewPort.visibleArea.topRight, volumeChartLayer.container, plotArea);

            leftDate.setDate(leftDate.getDate() - daysOnSides);   
            rightDate.setDate(rightDate.getDate() + daysOnSides);

        }

        let currentDate = new Date(leftDate.getTime());

        volumeBars = [];

        while (currentDate.getTime() <= rightDate.getTime()) {

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

            let dailyFile = dailyFilesCursor.dailyFiles.get(stringDate);

            if (dailyFile !== undefined) {

                const fileTimePeriod = 60 * 1000;
                const totalVolumeBars = dailyFile.length * fileTimePeriod / timePeriod;
                const recordsPerVolumeBar = timePeriod / fileTimePeriod;

                for (var i = 0; i < totalVolumeBars; i++) {

                    var volumeBar = newVolumeBar();

                    for (var j = 0; j < recordsPerVolumeBar; j++) {

                        volumeBar.amountBuy = volumeBar.amountBuy + dailyFile[i * recordsPerVolumeBar + j][8];
                        volumeBar.amountSell = volumeBar.amountSell + dailyFile[i * recordsPerVolumeBar + j][9];

                    }

                    volumeBar.begin = dailyFile[i * recordsPerVolumeBar][4];
                    volumeBar.end = dailyFile[i * recordsPerVolumeBar + recordsPerVolumeBar - 1][5];

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
            volumeChartLayer.container.frame.width
        );

        plotAreaFrame.initializeX(
            minValue,
            maxValue,
            volumeChartLayer.container.frame.width
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
            volumeChartLayer.container.frame.height
        );

    }



    function plotVolumeBarChart() {

        let visibleHeight = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y;

        let frameCorner1 = {
            x: 0,
            y: 0
        };

        let frameCorner2 = {
            x: volumeChartLayer.container.frame.width,
            y: volumeChartLayer.container.frame.height
        };


        /* Now the transformations. */

        frameCorner1 = transformThisPoint(frameCorner1, volumeChartLayer.container.frame.container);
        frameCorner2 = transformThisPoint(frameCorner2, volumeChartLayer.container.frame.container);

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
                        x: volumeBar.begin + timePeriod / 7 * 2,
                        y: 0
                    };

                    volumeBarPointA2 = {
                        x: volumeBar.begin + timePeriod / 7 * 2,
                        y: volumeBar.amountBuy
                    };

                    volumeBarPointA3 = {
                        x: volumeBar.begin + timePeriod / 7 * 5,
                        y: volumeBar.amountBuy
                    };

                    volumeBarPointA4 = {
                        x: volumeBar.begin + timePeriod / 7 * 5,
                        y: 0
                    };

                    volumeBarPointA1 = plot.inverseTransform(volumeBarPointA1, height);
                    volumeBarPointA2 = plot.inverseTransform(volumeBarPointA2, height);
                    volumeBarPointA3 = plot.inverseTransform(volumeBarPointA3, height);
                    volumeBarPointA4 = plot.inverseTransform(volumeBarPointA4, height);

                    volumeBarPointA1 = transformThisPoint(volumeBarPointA1, volumeChartLayer.container);
                    volumeBarPointA2 = transformThisPoint(volumeBarPointA2, volumeChartLayer.container);
                    volumeBarPointA3 = transformThisPoint(volumeBarPointA3, volumeChartLayer.container);
                    volumeBarPointA4 = transformThisPoint(volumeBarPointA4, volumeChartLayer.container);

                    let baseIncrement = (volumeBarPointA3.x - volumeBarPointA1.x) * WIDHTER_VOLUME_BAR_BASE_FACTOR;

                    volumeBarPointA1.x = volumeBarPointA1.x - baseIncrement;
                    volumeBarPointA4.x = volumeBarPointA4.x + baseIncrement;

                    if (volumeBarPointA4.x < viewPort.visibleArea.bottomLeft.x || volumeBarPointA1.x > viewPort.visibleArea.bottomRight.x) {
                        return false;
                    }

                    return true;

                }

                if (calculateBuys(plotAreaFrame, volumeChartLayer.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                if (volumeBarPointA1.y > viewPort.visibleArea.bottomLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                    if (calculateBuys(plotArea, visibleHeight) === false) { continue; }  // We snap t to the view port.

                    /* Now we set the real value of y. */

                    volumeBarPointA1.y = viewPort.visibleArea.bottomRight.y;
                    volumeBarPointA2.y = viewPort.visibleArea.bottomRight.y - volumeBar.amountBuy * plotArea.scale.y;
                    volumeBarPointA3.y = viewPort.visibleArea.bottomRight.y - volumeBar.amountBuy * plotArea.scale.y;
                    volumeBarPointA4.y = viewPort.visibleArea.bottomRight.y;

                }

                let volumeBarPointB1;
                let volumeBarPointB2;
                let volumeBarPointB3;
                let volumeBarPointB4;

                function calculateSells(plot, height) {

                    volumeBarPointB1 = {
                        x: volumeBar.begin + timePeriod / 7 * 2,
                        y: height
                    };

                    volumeBarPointB2 = {
                        x: volumeBar.begin + timePeriod / 7 * 2,
                        y: height - volumeBar.amountSell
                    };

                    volumeBarPointB3 = {
                        x: volumeBar.begin + timePeriod / 7 * 5,
                        y: height - volumeBar.amountSell
                    };

                    volumeBarPointB4 = {
                        x: volumeBar.begin + timePeriod / 7 * 5,
                        y: height
                    };

                    volumeBarPointB1 = plot.inverseTransform2(volumeBarPointB1, height);
                    volumeBarPointB2 = plot.inverseTransform2(volumeBarPointB2, height);
                    volumeBarPointB3 = plot.inverseTransform2(volumeBarPointB3, height);
                    volumeBarPointB4 = plot.inverseTransform2(volumeBarPointB4, height);

                    volumeBarPointB1 = transformThisPoint(volumeBarPointB1, volumeChartLayer.container);
                    volumeBarPointB2 = transformThisPoint(volumeBarPointB2, volumeChartLayer.container);
                    volumeBarPointB3 = transformThisPoint(volumeBarPointB3, volumeChartLayer.container);
                    volumeBarPointB4 = transformThisPoint(volumeBarPointB4, volumeChartLayer.container);

                }

                calculateSells(plotAreaFrame, volumeChartLayer.container.frame.height); // We try to see if it fits in the visible area.

                if (volumeBarPointB1.y < viewPort.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                    calculateSells(plotArea, visibleHeight); // We snap it to the view port.

                    /* Now we set the real value of y. */

                    volumeBarPointB1.y = viewPort.visibleArea.topLeft.y;
                    volumeBarPointB2.y = viewPort.visibleArea.topLeft.y + volumeBar.amountSell * plotArea.scale.y;
                    volumeBarPointB3.y = viewPort.visibleArea.topLeft.y + volumeBar.amountSell * plotArea.scale.y;
                    volumeBarPointB4.y = viewPort.visibleArea.topLeft.y;

                }

                /* We put a wider base */

                let baseIncrement = (volumeBarPointB3.x - volumeBarPointB1.x) * WIDHTER_VOLUME_BAR_BASE_FACTOR;

                volumeBarPointB1.x = volumeBarPointB1.x - baseIncrement;
                volumeBarPointB4.x = volumeBarPointB4.x + baseIncrement;

                /* We put a less wider top */

                let baseDencrement = (volumeBarPointA3.x - volumeBarPointA2.x) * LESS_WIDHTER_VOLUME_BAR_TOP_FACTOR;

                volumeBarPointA2.x = volumeBarPointA2.x + baseDencrement;
                volumeBarPointA3.x = volumeBarPointA3.x - baseDencrement;

                volumeBarPointB2.x = volumeBarPointB2.x + baseDencrement;
                volumeBarPointB3.x = volumeBarPointB3.x - baseDencrement;


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

                /* Now the drawing of the volume bars*/

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(volumeBarPointA1.x, volumeBarPointA1.y);
                browserCanvasContext.lineTo(volumeBarPointA2.x, volumeBarPointA2.y);
                browserCanvasContext.lineTo(volumeBarPointA3.x, volumeBarPointA3.y);
                browserCanvasContext.lineTo(volumeBarPointA4.x, volumeBarPointA4.y);

                browserCanvasContext.closePath();


                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= volumeBar.begin && dateValue <= volumeBar.end) {

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

                browserCanvasContext.moveTo(volumeBarPointB1.x, volumeBarPointB1.y);
                browserCanvasContext.lineTo(volumeBarPointB2.x, volumeBarPointB2.y);
                browserCanvasContext.lineTo(volumeBarPointB3.x, volumeBarPointB3.y);
                browserCanvasContext.lineTo(volumeBarPointB4.x, volumeBarPointB4.y);

                browserCanvasContext.closePath();

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= volumeBar.begin && dateValue <= volumeBar.end) {

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

                    if (dateValue >= volumeBar.begin && dateValue <= volumeBar.end) {

                        let buyInfo = {
                            baseWidth: volumeBarPointA4.x - volumeBarPointA1.x,
                            topWidth: volumeBarPointA3.x - volumeBarPointA2.x,
                            height: volumeBarPointA2.y - volumeBarPointA1.y
                        };

                        let sellInfo = {
                            baseWidth: volumeBarPointB4.x - volumeBarPointB1.x,
                            topWidth: volumeBarPointB3.x - volumeBarPointB2.x,
                            height: volumeBarPointB2.y - volumeBarPointB1.y
                        };

                        let currentVolume = {
                            buyInfo: buyInfo,
                            sellInfo: sellInfo,
                            period: timePeriod,
                            innerVolumeBar: volumeBar
                        };

                        volumeChartLayer.container.eventHandler.raiseEvent("Current Volume Info Changed", currentVolume);

                    }
                }
            }
        }
    }

}

