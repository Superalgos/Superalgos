
function newVolumeTechnicalAnalisysChartLayer() {


    var volumes = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();
    var plotAreaFrame = newPlotArea();

    var datetime = INITIAL_DATE;

    var volumeTechnicalAnalisysChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        onVolumesChanged: onVolumesChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    volumeTechnicalAnalisysChartLayer.container = container;

    container.displacement.containerName = "Volume Technical Analisys Chart";
    container.zoom.containerName = "Volume Technical Analisys Chart";
    container.frame.containerName = "Volume Technical Analisys Chart";

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let stairsArray = [];

    let layerStatus = 'off';
    let parentLayerStatus = 'off';

    return volumeTechnicalAnalisysChartLayer;

    function initialize(exchange, market, index, dailyFiles, botsPanel) {

        marketId = market;
        exchangeId = exchange;

        marketIndex = index;
        dailyFilesCursor = dailyFiles;

        layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.VOLUME_STAIRS);
        parentLayerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.VOLUME); 
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
            parentLayerStatus = eventData.status;
        }

        if (eventData.layer === 'Volume Stairs') {
            layerStatus = eventData.status;
        }

    }


    function onVolumesChanged(newVolumes) {

        volumes = newVolumes;
        
        recalculateScaleX();
        recalculatePatterns();
        recalculateScaleY();

    }


    function setTimePeriod(period) {

        timePeriod = period;

    }

    function setDatetime(newDatetime) {
        datetime = newDatetime;
    }



    function draw() {

        if (layerStatus !== 'on') { return; }

        if (parentLayerStatus === 'off') { return; }

        this.container.frame.draw();

        plotPatternChart();

    }


    function recalculatePatterns() {

        if (layerStatus === 'off') { return; }

        if (parentLayerStatus === 'off') { return; }

        /* Finding stairs */
        stairsArray = [];

        let buyUpStairs;
        let buyDownStairs;

        let sellUpStairs;
        let sellDownStairs;

        for (let i = 0; i < volumes.length - 1; i++) {

            let currentVolume = volumes[i];
            let nextVolume = volumes[i + 1];


            /* buy volume going up */

            if (currentVolume.amountBuy < nextVolume.amountBuy) {

                if (buyUpStairs === undefined) {

                    buyUpStairs = newVolumeStairs();

                    buyUpStairs.type = 'buy';
                    buyUpStairs.direction = 'up';
                    buyUpStairs.barsCount = 2;

                    buyUpStairs.begin = currentVolume.begin;
                    buyUpStairs.end = nextVolume.end;

                    buyUpStairs.firstAmount = currentVolume.amountBuy;
                    buyUpStairs.lastAmount = nextVolume.amountBuy;

                } else {

                    buyUpStairs.barsCount++;
                    buyUpStairs.end = nextVolume.end;
                    buyUpStairs.lastAmount = nextVolume.amountBuy;

                }

            } else {

                if (buyUpStairs !== undefined) {
                    
                    if (buyUpStairs.barsCount > 2) {

                        stairsArray.push(buyUpStairs);
                    }

                    buyUpStairs = undefined;
                }
            }

            /* buy volume going down */

            if (currentVolume.amountBuy > nextVolume.amountBuy) {

                if (buyDownStairs === undefined) {

                    buyDownStairs = newVolumeStairs();

                    buyDownStairs.type = 'buy';
                    buyDownStairs.direction = 'down';
                    buyDownStairs.barsCount = 2;

                    buyDownStairs.begin = currentVolume.begin;
                    buyDownStairs.end = nextVolume.end;

                    buyDownStairs.firstAmount = currentVolume.amountBuy;
                    buyDownStairs.lastAmount = nextVolume.amountBuy;

                } else {

                    buyDownStairs.barsCount++;
                    buyDownStairs.end = nextVolume.end;
                    buyDownStairs.lastAmount = nextVolume.amountBuy;

                }

            } else {

                if (buyDownStairs !== undefined) {

                    if (buyDownStairs.barsCount > 2) {

                        stairsArray.push(buyDownStairs);
                    }

                    buyDownStairs = undefined;
                }
            }

            /* sell volume going up */

            if (currentVolume.amountSell < nextVolume.amountSell) {

                if (sellUpStairs === undefined) {

                    sellUpStairs = newVolumeStairs();

                    sellUpStairs.type = 'sell';
                    sellUpStairs.direction = 'up';
                    sellUpStairs.barsCount = 2;

                    sellUpStairs.begin = currentVolume.begin;
                    sellUpStairs.end = nextVolume.end;

                    sellUpStairs.firstAmount = currentVolume.amountSell;
                    sellUpStairs.lastAmount = nextVolume.amountSell;

                } else {

                    sellUpStairs.barsCount++;
                    sellUpStairs.end = nextVolume.end;
                    sellUpStairs.lastAmount = nextVolume.amountSell;

                }

            } else {

                if (sellUpStairs !== undefined) {

                    if (sellUpStairs.barsCount > 2) {

                        stairsArray.push(sellUpStairs);
                    }

                    sellUpStairs = undefined;
                }
            }

            /* sell volume going down */

            if (currentVolume.amountSell > nextVolume.amountSell) {

                if (sellDownStairs === undefined) {

                    sellDownStairs = newVolumeStairs();

                    sellDownStairs.type = 'sell';
                    sellDownStairs.direction = 'down';
                    sellDownStairs.barsCount = 2;

                    sellDownStairs.begin = currentVolume.begin;
                    sellDownStairs.end = nextVolume.end;

                    sellDownStairs.firstAmount = currentVolume.amountSell;
                    sellDownStairs.lastAmount = nextVolume.amountSell;

                } else {

                    sellDownStairs.barsCount++;
                    sellDownStairs.end = nextVolume.end;
                    sellDownStairs.lastAmount = nextVolume.amountSell;

                }

            } else {

                if (sellDownStairs !== undefined) {

                    if (sellDownStairs.barsCount > 2) {

                        stairsArray.push(sellDownStairs);
                    }

                    sellDownStairs = undefined;
                }
            }


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
            volumeTechnicalAnalisysChartLayer.container.frame.width
        );

        plotAreaFrame.initializeX(
            minValue,
            maxValue,
            volumeTechnicalAnalisysChartLayer.container.frame.width
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
            volumeTechnicalAnalisysChartLayer.container.frame.height
        );

    }




    function plotPatternChart() {

        let opacity = '0.25';

        let visibleHeight = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y;

        let frameCorner1 = {
            x: 0,
            y: 0
        };

        let frameCorner2 = {
            x: volumeTechnicalAnalisysChartLayer.container.frame.width,
            y: volumeTechnicalAnalisysChartLayer.container.frame.height
        };


        /* Now the transformations. */

        frameCorner1 = transformThisPoint(frameCorner1, volumeTechnicalAnalisysChartLayer.container.frame.container);
        frameCorner2 = transformThisPoint(frameCorner2, volumeTechnicalAnalisysChartLayer.container.frame.container);

        let frameHeightInViewPort = frameCorner2.y - frameCorner1.y;


        if (stairsArray.length > 0) {

            for (var i = 0; i < stairsArray.length; i++) {

                stairs = stairsArray[i];

                let volumeBarPointA1;
                let volumeBarPointA2;
                let volumeBarPointA3;
                let volumeBarPointA4;

                if (stairs.type === 'buy') {

                    function calculateBuys(plot, height) {

                        volumeBarPointA1 = {
                            x: stairs.begin + timePeriod / 2,
                            y: 0
                        };

                        volumeBarPointA2 = {
                            x: stairs.begin + timePeriod / 2,
                            y: stairs.firstAmount * 2
                        };

                        volumeBarPointA3 = {
                            x: stairs.end - timePeriod / 2,
                            y: stairs.lastAmount * 2
                        };

                        volumeBarPointA4 = {
                            x: stairs.end - timePeriod / 2,
                            y: 0
                        };


                        volumeBarPointA1 = plot.inverseTransform(volumeBarPointA1, height);
                        volumeBarPointA2 = plot.inverseTransform(volumeBarPointA2, height);
                        volumeBarPointA3 = plot.inverseTransform(volumeBarPointA3, height);
                        volumeBarPointA4 = plot.inverseTransform(volumeBarPointA4, height);

                        volumeBarPointA1 = transformThisPoint(volumeBarPointA1, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointA2 = transformThisPoint(volumeBarPointA2, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointA3 = transformThisPoint(volumeBarPointA3, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointA4 = transformThisPoint(volumeBarPointA4, volumeTechnicalAnalisysChartLayer.container);


                        if (volumeBarPointA4.x < viewPort.visibleArea.bottomLeft.x || volumeBarPointA1.x > viewPort.visibleArea.bottomRight.x) {
                            return false;
                        }

                        return true;
                    }

                    if (calculateBuys(plotAreaFrame, volumeTechnicalAnalisysChartLayer.container.frame.height) === false) { continue; } // We try to see if it fits in the visible area.

                    if (volumeBarPointA1.y > viewPort.visibleArea.bottomLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                        if (calculateBuys(plotArea, visibleHeight) === false) { continue; }  // We snap t to the view port.

                        /* Now we set the real value of y. */

                        volumeBarPointA1.y = viewPort.visibleArea.bottomRight.y;
                        volumeBarPointA2.y = viewPort.visibleArea.bottomRight.y - stairs.firstAmount * 2 * plotArea.scale.y;
                        volumeBarPointA3.y = viewPort.visibleArea.bottomRight.y - stairs.lastAmount * 2 * plotArea.scale.y;
                        volumeBarPointA4.y = viewPort.visibleArea.bottomRight.y;

                    }
                }

                let volumeBarPointB1;
                let volumeBarPointB2;
                let volumeBarPointB3;
                let volumeBarPointB4;


                if (stairs.type === 'sell') {

                    function calculateSells(plot, height) {

                        volumeBarPointB1 = {
                            x: stairs.begin + timePeriod / 2,
                            y: height
                        };

                        volumeBarPointB2 = {
                            x: stairs.begin + timePeriod / 2,
                            y: height - stairs.firstAmount * 2
                        };

                        volumeBarPointB3 = {
                            x: stairs.end - timePeriod / 2,
                            y: height - stairs.lastAmount * 2
                        };

                        volumeBarPointB4 = {
                            x: stairs.end - timePeriod / 2,
                            y: height
                        };

                        volumeBarPointB1 = plot.inverseTransform2(volumeBarPointB1, height);
                        volumeBarPointB2 = plot.inverseTransform2(volumeBarPointB2, height);
                        volumeBarPointB3 = plot.inverseTransform2(volumeBarPointB3, height);
                        volumeBarPointB4 = plot.inverseTransform2(volumeBarPointB4, height);

                        volumeBarPointB1 = transformThisPoint(volumeBarPointB1, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointB2 = transformThisPoint(volumeBarPointB2, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointB3 = transformThisPoint(volumeBarPointB3, volumeTechnicalAnalisysChartLayer.container);
                        volumeBarPointB4 = transformThisPoint(volumeBarPointB4, volumeTechnicalAnalisysChartLayer.container);

                    }

                    calculateSells(plotAreaFrame, volumeTechnicalAnalisysChartLayer.container.frame.height); // We try to see if it fits in the visible area.

                    if (volumeBarPointB1.y < viewPort.visibleArea.topLeft.y && frameHeightInViewPort > visibleHeight * 2 / 3) {

                        calculateSells(plotArea, visibleHeight); // We snap it to the view port.

                        /* Now we set the real value of y. */

                        volumeBarPointB1.y = viewPort.visibleArea.topLeft.y;
                        volumeBarPointB2.y = viewPort.visibleArea.topLeft.y + stairs.firstAmount * 2 * plotArea.scale.y;
                        volumeBarPointB3.y = viewPort.visibleArea.topLeft.y + stairs.lastAmount * 2 * plotArea.scale.y;
                        volumeBarPointB4.y = viewPort.visibleArea.topLeft.y;

                    }
                }


                /* Everything must fit within the visible area */

                if (stairs.type === 'buy') {

                    volumeBarPointA1 = viewPort.fitIntoVisibleArea(volumeBarPointA1);
                    volumeBarPointA2 = viewPort.fitIntoVisibleArea(volumeBarPointA2);
                    volumeBarPointA3 = viewPort.fitIntoVisibleArea(volumeBarPointA3);
                    volumeBarPointA4 = viewPort.fitIntoVisibleArea(volumeBarPointA4);

                } else {

                    volumeBarPointB1 = viewPort.fitIntoVisibleArea(volumeBarPointB1);
                    volumeBarPointB2 = viewPort.fitIntoVisibleArea(volumeBarPointB2);
                    volumeBarPointB3 = viewPort.fitIntoVisibleArea(volumeBarPointB3);
                    volumeBarPointB4 = viewPort.fitIntoVisibleArea(volumeBarPointB4);

                }



                /* Now the drawing */

                if (stairs.type === 'buy') {

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(volumeBarPointA1.x, volumeBarPointA1.y);
                    browserCanvasContext.lineTo(volumeBarPointA2.x, volumeBarPointA2.y);
                    browserCanvasContext.lineTo(volumeBarPointA3.x, volumeBarPointA3.y);
                    browserCanvasContext.lineTo(volumeBarPointA4.x, volumeBarPointA4.y);

                    browserCanvasContext.closePath();


                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= stairs.begin && dateValue <= stairs.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')'; // Current bar accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';

                    }

                    browserCanvasContext.fill();
                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();

                } else {

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(volumeBarPointB1.x, volumeBarPointB1.y);
                    browserCanvasContext.lineTo(volumeBarPointB2.x, volumeBarPointB2.y);
                    browserCanvasContext.lineTo(volumeBarPointB3.x, volumeBarPointB3.y);
                    browserCanvasContext.lineTo(volumeBarPointB4.x, volumeBarPointB4.y);

                    browserCanvasContext.closePath();

                    if (datetime !== undefined) {

                        let dateValue = datetime.valueOf();

                        if (dateValue >= stairs.begin && dateValue <= stairs.end) {

                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')'; // Current candle accroding to time

                        } else {

                            browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';
                        }

                    } else {

                        browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';

                    }

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';

                    browserCanvasContext.fill();
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();


                }




            }

        }
    }


}

