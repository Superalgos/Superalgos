
function newTimelineChart() {

    let layers = [];

    let plotArea = newPlotArea();
    let timePeriod = INITIAL_TIME_PERIOD;

    var datetime;

    var timelineChart = {
        layers: layers,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    timelineChart.container = container;

    container.displacement.containerName = "Time Period Chart";
    container.zoom.containerName = "Time Period Chart";
    container.frame.containerName = "Time Period Chart";

    let marketId;
    let exchangeId;

    let marketIndex;
    let dailyFilesCursor;

    let level;

    let chartGrid;

    let targetLabelFontSize = 150;
    let fontSizeIncrement = 12.5;
    let currentFontSize = 150;

    let initializationReady = false;

    let currentCandlePanel;
    let currentVolumePanel;
    let botsPanel;
    let orderBookPanel;

    return timelineChart;

    function initialize(exchange, market, currentCandlePanelToUse, currentVolumePanelToUse, botsPanelToUse, orderBookPanelToUse, callBackFunction) {

        currentCandlePanel = currentCandlePanelToUse;
        currentVolumePanel = currentVolumePanelToUse;
        botsPanel = botsPanelToUse;
        orderBookPanel = orderBookPanelToUse;

        marketId = market;
        exchangeId = exchange;

        chartGrid = newChartGrid();

        marketIndex = newMarketIndex();
        marketIndex.initialize(exchangeId, marketId, continueInitialization);

        function continueInitialization() {

            recalculateScale();

            dailyFilesCursor = newDailyFilesCursor();
            dailyFilesCursor.initialize(exchangeId, marketId, finalSteps);

            function finalSteps() {

                /* Event Subscriptions - we need this events to be fired first here and then in layers. */

                viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
                viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
                canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

                initializeLayers();

                callBackFunction();

                initializationReady = true;

                marketInitializationCounter++;
            }
        }
    }

    function initializeLayers() {

        /* Here we need to move the viewPort to the default date. */

        //-869208.2550614576 y = 40845.822907407215

        

        let displaceVector = {
            x: -869208.2550614576,
            y: 40845.822907407215
        };

        viewPort.displace(displaceVector);

        let layerStatus;

        for (let i = 0; i < botsPanel.cards.length; i++) {

            let plotter = newPlotter();


        }



        /* AAMasters AAOlivia Candlesticks */

        let layerAAMastersAAOliviaCandlesticks = newAAMastersAAOliviaCandles();

        loadCandles();

        function loadCandles() {

            layerAAMastersAAOliviaCandlesticks.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAAOliviaCandlesticks.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAAOliviaCandlesticks.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAAOliviaCandlesticks.container.parentContainer = timelineChart.container;

            layerAAMastersAAOliviaCandlesticks.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAAOliviaCandlesticks.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAAOliviaCandlesticks.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAAOliviaCandlesticks.container.frame.width / 2;
            layerAAMastersAAOliviaCandlesticks.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAAOliviaCandlesticks.container.frame.height / 2;

            layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.OLIVIA_CANDLES);

            layerAAMastersAAOliviaCandlesticks.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onInizialized);

            function onInizialized() {

                console.log("loadCandles");

                layerAAMastersAAOliviaCandlesticks.positionAtDatetime(INITIAL_DATE);
                loadVolumes();

            }

        }

        /* AAMasters AAOlivia Volumes */

        let layerAAMastersAAOliviaVolumes = newAAMastersAAOliviaVolumes();

        function loadVolumes() {

            layerAAMastersAAOliviaVolumes.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAAOliviaVolumes.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAAOliviaVolumes.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAAOliviaVolumes.container.parentContainer = timelineChart.container;

            layerAAMastersAAOliviaVolumes.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAAOliviaVolumes.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAAOliviaVolumes.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAAOliviaVolumes.container.frame.width / 2;
            layerAAMastersAAOliviaVolumes.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAAOliviaVolumes.container.frame.height / 2;

            layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.OLIVIA_VOLUMES);

            layerAAMastersAAOliviaVolumes.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onInizialized);

            function onInizialized() {

                console.log("loadVolumes");
                loadCandleStairs();

            }

        }


        /* AAMasters AATom CandleStairs */

        let layerAAMastersAATomCandleStairs = newAAMastersAATomCandleStairs();

        function loadCandleStairs() {

            layerAAMastersAATomCandleStairs.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAATomCandleStairs.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAATomCandleStairs.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAATomCandleStairs.container.parentContainer = timelineChart.container;

            layerAAMastersAATomCandleStairs.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAATomCandleStairs.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAATomCandleStairs.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAATomCandleStairs.container.frame.width / 2;
            layerAAMastersAATomCandleStairs.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAATomCandleStairs.container.frame.height / 2;

            layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.TOM_CANDLE_STAIRS);

            layerAAMastersAATomCandleStairs.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onInizialized);

            function onInizialized() {

                console.log("loadCandleStairs");
                loadVolumeStairs();

            }

        }



        /* AAMasters AATom VolumeStairs */

        let layerAAMastersAATomVolumeStairs = newAAMastersAATomVolumeStairs();

        function loadVolumeStairs() {

            layerAAMastersAATomVolumeStairs.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAATomVolumeStairs.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAATomVolumeStairs.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAATomVolumeStairs.container.parentContainer = timelineChart.container;

            layerAAMastersAATomVolumeStairs.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAATomVolumeStairs.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAATomVolumeStairs.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAATomVolumeStairs.container.frame.width / 2;
            layerAAMastersAATomVolumeStairs.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAATomVolumeStairs.container.frame.height / 2;

            layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.TOM_VOLUME_STAIRS);

            layerAAMastersAATomVolumeStairs.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onInizialized);

            function onInizialized() {

                console.log("loadVolumeStairs");
                loadMariamHistory();

            }

        }



        /* AAMasters AAMariam Trading History */

        let layerAAMastersAAMariamTradingHistory = newAAMastersAAMariamTradingHistory();

        function loadMariamHistory() {

            layerAAMastersAAMariamTradingHistory.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAAMariamTradingHistory.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAAMariamTradingHistory.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAAMariamTradingHistory.container.parentContainer = timelineChart.container;

            layerAAMastersAAMariamTradingHistory.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAAMariamTradingHistory.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAAMariamTradingHistory.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAAMariamTradingHistory.container.frame.width / 2;
            layerAAMastersAAMariamTradingHistory.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAAMariamTradingHistory.container.frame.height / 2;

            layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.MARIAM_TRADE_HISTORY);

            layerAAMastersAAMariamTradingHistory.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onInizialized);

            function onInizialized() {

                console.log("loadMariamHistory");
                addLayers();
                splashScreenNeeded = false; // This is when we dont need a splash screen anymore!

            }

        }


        function addLayers() {

            timelineChart.layers.push(layerAAMastersAATomCandleStairs);  // This looks better if it goes below the candles layer.
            timelineChart.layers.push(layerAAMastersAATomVolumeStairs);

            timelineChart.layers.push(layerAAMastersAAOliviaCandlesticks);
            timelineChart.layers.push(layerAAMastersAAOliviaVolumes);

            timelineChart.layers.push(layerAAMastersAAMariamTradingHistory);

            /* Connecting all layers to the panel that provides a user interface to turn them on - visible - off */

            botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAAOliviaCandlesticks.onLayerStatusChanged);
            botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAAOliviaVolumes.onLayerStatusChanged);

            botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAATomCandleStairs.onLayerStatusChanged);
            botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAATomVolumeStairs.onLayerStatusChanged);

            botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAAMariamTradingHistory.onLayerStatusChanged);
        }

        /* Add all layers to the internal array */




        /*
        timelineChart.layers.push(allTimeChartLayer);
        timelineChart.layers.push(orderBooksChartLayer);
        timelineChart.layers.push(forecastChartLayer);
        //timelineChart.layers.push(supportResistanceChartLayer);
        timelineChart.layers.push(highLowChartLayer);
        timelineChart.layers.push(candleTechnicalAnalisysChartLayer); 
        timelineChart.layers.push(volumeTechnicalAnalisysChartLayer);

        timelineChart.layers.push(accumulatedVolumeChartLayer);
        timelineChart.layers.push(linearRegressionCurveChartLayer);
        

        /* Wiring some charts with others using events */




        //orderBooksChartLayer.container.eventHandler.listenToEvent("Current Order Book Changed", orderBookPanel.onCurrentOrderBookChanged);



        /*
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", accumulatedVolumeChartLayer.onLayerStatusChanged);

        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", candleTechnicalAnalisysChartLayer.onLayerStatusChanged);
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", highLowChartLayer.onLayerStatusChanged);

        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", volumeTechnicalAnalisysChartLayer.onLayerStatusChanged);
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", allTimeChartLayer.onLayerStatusChanged);
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", forecastChartLayer.onLayerStatusChanged);
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", orderBooksChartLayer.onLayerStatusChanged);
        botsPanel.container.eventHandler.listenToEvent("Layer Status Changed", linearRegressionCurveChartLayer.onLayerStatusChanged);
        */
    } 


    function onZoomChanged(event) {

        if (initializationReady === true) {

            level = event.newLevel; // for debugging purposes only

            let currentTimePeriod = timePeriod;

            timePeriod = recalculatePeriod(event.newLevel);

            if (timePeriod !== currentTimePeriod) {

                for (var i = 0; i < timelineChart.layers.length; i++) {

                    let layer = timelineChart.layers[i];
                    layer.setTimePeriod(timePeriod);

                }
            }

            recalculateCurrentDatetime();

            if (timelineChart.container.frame.isInViewPort() && tooSmall() === false) {

                dailyFilesCursor.setDatetime(datetime);

            }
        }

    }

    function onDragFinished() {

        if (initializationReady === true) {

            if (timelineChart.container.frame.isInViewPort() && tooSmall() === false) {

                dailyFilesCursor.setDatetime(datetime);

            }
        }
    }

    function onOffsetChanged() {

        if (initializationReady === true) {

            if (timelineChart.container.frame.isInViewPort()) {

                recalculateCurrentDatetime();

            }
        }

    }


    function recalculateCurrentDatetime() {

        let center = {
            x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
            y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
        };

        center = unTransformThisPoint(center, timelineChart.container);
        center = plotArea.unInverseTransform(center, timelineChart.container.frame.height);

        let newDate = new Date(0);
        newDate.setUTCSeconds(center.x / 1000);

        datetime = newDate;

        for (var i = 0; i < timelineChart.layers.length; i++) {

            let layer = timelineChart.layers[i];
            layer.setDatetime(datetime);

        }

        timelineChart.container.eventHandler.raiseEvent("Datetime Changed", datetime);
  
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

    function setDatetime(newDatetime) {

        if (timelineChart.container.frame.isInViewPort()) {

            for (var i = 0; i < timelineChart.layers.length; i++) {

                let layer = timelineChart.layers[i];
                layer.setDatetime(newDatetime);

                if (layer.positionAtDatetime !== undefined) {
                    layer.positionAtDatetime(newDatetime);
                }

            }
        }
    }



    function draw() {

        if (timelineChart.container.frame.isInViewPort()) {

            this.container.frame.draw();

            drawBackground();

            chartGrid.draw(timelineChart.container, plotArea);

            for (var i = 0; i < this.layers.length; i++) {

                let layer = this.layers[i];
                layer.draw();

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
            timelineChart.container.frame.width,
            timelineChart.container.frame.height
        );

    }

    function tooTiny() {

        if (viewPort.zoomLevel < Math.trunc(-28.25 * 100) / 100) {
            return true;
        } else {
            return false;
        }

    }


    function tooSmall() {

        if (viewPort.zoomLevel < Math.trunc(-27.25 * 100) / 100) {
            return true;
        } else {
            return false;
        }

    }

    function drawBackground() {

        var market = markets.get(marketId);
        var label = market.assetA + " " + market.assetB;

        //label = '' + level; // Math.trunc(timePeriod / 1000 / 60); 

        if (tooTiny() === true ) {
            return;
        }

        let topPoint = {
            x: 0,
            y: 0
        };

        let bottomPoint = {
            x: 0,
            y: timelineChart.container.frame.height
        };

        topPoint = transformThisPoint(topPoint, timelineChart.container);
        bottomPoint = transformThisPoint(bottomPoint, timelineChart.container);

        /* We want the label of the market to be always centered in the middle of the screen, unless the upper or lower border of the frame is visible on the screen */

        let point;

        if (targetLabelFontSize !== currentFontSize) {
            if (targetLabelFontSize > currentFontSize) {
                currentFontSize = currentFontSize + fontSizeIncrement;
            } else {
                currentFontSize = currentFontSize - fontSizeIncrement;
            }
        }

        if (topPoint.y > viewPort.visibleArea.topLeft.y || bottomPoint.y < viewPort.visibleArea.bottomRight.y) {

            targetLabelFontSize = 150 / 2;

            point = {
                x: 0,
                y: timelineChart.container.frame.height / 2
            };

            point = transformThisPoint(point, timelineChart.container);

            point = {
                x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2 - label.length / 2 * currentFontSize * 0.60,
                y: point.y + currentFontSize * 0.60 / 2
            };

        } else {

            targetLabelFontSize = 150;

            point = {
                x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2 - label.length / 2 * currentFontSize * 0.60,
                y: (viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y) / 2 + currentFontSize * 0.60 / 2
            };

        }

        browserCanvasContext.font = currentFontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(75, 86, 235, 0.07)';
        browserCanvasContext.fillText(label, point.x, point.y);

    }
}

