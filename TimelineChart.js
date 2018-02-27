
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
    let chartLayersPanel;
    let botsLayersPanel;
    let orderBookPanel;

    return timelineChart;

    function initialize(exchange, market, currentCandlePanelToUse, currentVolumePanelToUse, chartLayersPanelToUse, botsLayersPanelToUse, orderBookPanelToUse, callBackFunction) {

        currentCandlePanel = currentCandlePanelToUse;
        currentVolumePanel = currentVolumePanelToUse;
        chartLayersPanel = chartLayersPanelToUse;
        botsLayersPanel = botsLayersPanelToUse;
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

            layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.OLIVIA_CANDLES);

            layerAAMastersAAOliviaCandlesticks.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onOliviaCandlesInitialized);

            function onOliviaCandlesInitialized() {

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

            layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.OLIVIA_VOLUMES);

            layerAAMastersAAOliviaVolumes.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onOliviaVolumesInitialized);

            function onOliviaVolumesInitialized() {

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

            layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.TOM_CANDLE_STAIRS);

            layerAAMastersAATomCandleStairs.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onOliviaCandlesInitialized);

            function onOliviaCandlesInitialized() {

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

            layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.TOM_VOLUME_STAIRS);

            layerAAMastersAATomVolumeStairs.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onOliviaVolumeStairsInitialized);

            function onOliviaVolumeStairsInitialized() {

                addLayers();
                splashScreenNeeded = false; // This is when we dont need a splash screen anymore!

            }

        }



        /* AAMasters AAMariam Trading History */

        let layerAAMastersAAMariamTradingHistory = newAAMastersAAMariamTradingHistory();

        function loadVolumeStairs() {

            layerAAMastersAAMariamTradingHistory.container.displacement.parentDisplacement = timelineChart.container.displacement;
            layerAAMastersAAMariamTradingHistory.container.zoom.parentZoom = timelineChart.container.zoom;
            layerAAMastersAAMariamTradingHistory.container.frame.parentFrame = timelineChart.container.frame;

            layerAAMastersAAMariamTradingHistory.container.parentContainer = timelineChart.container;

            layerAAMastersAAMariamTradingHistory.container.frame.width = timelineChart.container.frame.width * 1;
            layerAAMastersAAMariamTradingHistory.container.frame.height = timelineChart.container.frame.height * 1;

            layerAAMastersAAMariamTradingHistory.container.frame.position.x = timelineChart.container.frame.width / 2 - layerAAMastersAAMariamTradingHistory.container.frame.width / 2;
            layerAAMastersAAMariamTradingHistory.container.frame.position.y = timelineChart.container.frame.height / 2 - layerAAMastersAAMariamTradingHistory.container.frame.height / 2;

            layerStatus = chartLayersPanel.getLayerStatus(chartLayersPanel.layerNames.MARIAM_TRADE_HISTORY);

            layerAAMastersAAMariamTradingHistory.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, layerStatus, onOliviaVolumeStairsInitialized);

            function onOliviaVolumeStairsInitialized() {

                addLayers();
                splashScreenNeeded = false; // This is when we dont need a splash screen anymore!

            }

        }



        /* All Time Layer */
        /*
        var allTimeChartLayer = newAllTimeChartLayer();

        allTimeChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        allTimeChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        allTimeChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        allTimeChartLayer.container.parentContainer = timelineChart.container;

        allTimeChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        allTimeChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        allTimeChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - allTimeChartLayer.container.frame.width / 2;
        allTimeChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - allTimeChartLayer.container.frame.height / 2;

        allTimeChartLayer.initialize(exchangeId, marketId, marketIndex, chartLayersPanel);

        /* Orderbook Resistances Layer */
        /*
        var orderBooksChartLayer = newOrderBooksChartLayer();

        orderBooksChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        orderBooksChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        orderBooksChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        orderBooksChartLayer.container.parentContainer = timelineChart.container;

        orderBooksChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        orderBooksChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        orderBooksChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - orderBooksChartLayer.container.frame.width / 2;
        orderBooksChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - orderBooksChartLayer.container.frame.height / 2;

        orderBooksChartLayer.initialize(exchangeId, marketId, marketIndex, chartLayersPanel);


        /* Candle Technical Analisys Layer */
        /*
        var candleTechnicalAnalisysChartLayer = newCandleTechnicalAnalisysChartLayer();

        candleTechnicalAnalisysChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        candleTechnicalAnalisysChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        candleTechnicalAnalisysChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        candleTechnicalAnalisysChartLayer.container.parentContainer = timelineChart.container;

        candleTechnicalAnalisysChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        candleTechnicalAnalisysChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        candleTechnicalAnalisysChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - candleTechnicalAnalisysChartLayer.container.frame.width / 2;
        candleTechnicalAnalisysChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - candleTechnicalAnalisysChartLayer.container.frame.height / 2;

        candleTechnicalAnalisysChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);


        /* Volume Technical Analisys Layer */
        /*
        var volumeTechnicalAnalisysChartLayer = newVolumeTechnicalAnalisysChartLayer();

        volumeTechnicalAnalisysChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        volumeTechnicalAnalisysChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        volumeTechnicalAnalisysChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        volumeTechnicalAnalisysChartLayer.container.parentContainer = timelineChart.container;

        volumeTechnicalAnalisysChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        volumeTechnicalAnalisysChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        volumeTechnicalAnalisysChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - volumeTechnicalAnalisysChartLayer.container.frame.width / 2;
        volumeTechnicalAnalisysChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - volumeTechnicalAnalisysChartLayer.container.frame.height / 2;

        volumeTechnicalAnalisysChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);


        /* Sopport Resistance Layer */
        /*
        var supportResistanceChartLayer = newSupportResistanceChartLayer();

        supportResistanceChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        supportResistanceChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        supportResistanceChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        supportResistanceChartLayer.container.parentContainer = timelineChart.container;

        supportResistanceChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        supportResistanceChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        supportResistanceChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - supportResistanceChartLayer.container.frame.width / 2;
        supportResistanceChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - supportResistanceChartLayer.container.frame.height / 2;

        supportResistanceChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);


        /* High Low Layer */
        /*
        var highLowChartLayer = newHighLowChartLayer();

        highLowChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        highLowChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        highLowChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        highLowChartLayer.container.parentContainer = timelineChart.container;

        highLowChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        highLowChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        highLowChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - highLowChartLayer.container.frame.width / 2;
        highLowChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - highLowChartLayer.container.frame.height / 2;

        highLowChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);








        /* Accumulated Volume Volume Layer */
        /*
        var accumulatedVolumeChartLayer = newAccumulatedVolumeChartLayer();

        accumulatedVolumeChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        accumulatedVolumeChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        accumulatedVolumeChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        accumulatedVolumeChartLayer.container.parentContainer = timelineChart.container;

        accumulatedVolumeChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        accumulatedVolumeChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        accumulatedVolumeChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - accumulatedVolumeChartLayer.container.frame.width / 2;
        accumulatedVolumeChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - accumulatedVolumeChartLayer.container.frame.height / 2;

        accumulatedVolumeChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);



        /* Forecast Layer */
        /*
        var forecastChartLayer = newForecastChartLayer();

        forecastChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        forecastChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        forecastChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        forecastChartLayer.container.parentContainer = timelineChart.container;

        forecastChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        forecastChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        forecastChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - forecastChartLayer.container.frame.width / 2;
        forecastChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - forecastChartLayer.container.frame.height / 2;

        forecastChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);

       // candleStickChartLayer.container.eventHandler.listenToEvent("Current Candle Changed", forecastChartLayer.setCurrentCandle);
       // forecastChartLayer.setCurrentCandle(candleStickChartLayer.currentCandle);



        /* Linear Regression Curve Layer */
        /*
        var linearRegressionCurveChartLayer = newLinearRegressionCurve();

        linearRegressionCurveChartLayer.container.displacement.parentDisplacement = timelineChart.container.displacement;
        linearRegressionCurveChartLayer.container.zoom.parentZoom = timelineChart.container.zoom;
        linearRegressionCurveChartLayer.container.frame.parentFrame = timelineChart.container.frame;

        linearRegressionCurveChartLayer.container.parentContainer = timelineChart.container;

        linearRegressionCurveChartLayer.container.frame.width = timelineChart.container.frame.width * 1;
        linearRegressionCurveChartLayer.container.frame.height = timelineChart.container.frame.height * 1;

        linearRegressionCurveChartLayer.container.frame.position.x = timelineChart.container.frame.width / 2 - candleTechnicalAnalisysChartLayer.container.frame.width / 2;
        linearRegressionCurveChartLayer.container.frame.position.y = timelineChart.container.frame.height / 2 - candleTechnicalAnalisysChartLayer.container.frame.height / 2;

        linearRegressionCurveChartLayer.initialize(exchangeId, marketId, marketIndex, dailyFilesCursor, chartLayersPanel);
        */        


        function addLayers() {

            timelineChart.layers.push(layerAAMastersAATomCandleStairs);  // This looks better if it goes below the candles layer.
            timelineChart.layers.push(layerAAMastersAATomVolumeStairs);

            timelineChart.layers.push(layerAAMastersAAOliviaCandlesticks);
            timelineChart.layers.push(layerAAMastersAAOliviaVolumes);

            /* Connecting all layers to the panel that provides a user interface to turn them on - visible - off */

            chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAAOliviaCandlesticks.onLayerStatusChanged);
            chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAAOliviaVolumes.onLayerStatusChanged);

            chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAATomCandleStairs.onLayerStatusChanged);
            chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", layerAAMastersAATomVolumeStairs.onLayerStatusChanged);

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
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", accumulatedVolumeChartLayer.onLayerStatusChanged);

        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", candleTechnicalAnalisysChartLayer.onLayerStatusChanged);
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", highLowChartLayer.onLayerStatusChanged);

        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", volumeTechnicalAnalisysChartLayer.onLayerStatusChanged);
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", allTimeChartLayer.onLayerStatusChanged);
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", forecastChartLayer.onLayerStatusChanged);
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", orderBooksChartLayer.onLayerStatusChanged);
        chartLayersPanel.container.eventHandler.listenToEvent("Layer Status Changed", linearRegressionCurveChartLayer.onLayerStatusChanged);
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

