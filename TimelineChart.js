
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

            /* Event Subscriptions - we need this events to be fired first here and then in layers. */

            viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            initializeLayers();

            callBackFunction();

            initializationReady = true;

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

        /* Lets get all the cards that are turned on. */

        let onCards = botsPanel.gerOnCards();

        for (let i = 0; i < onCards.length; i++) {

            /* For each one, we will initialize the associated plotter. */

            let onCard = onCards[i];

            let plotter = getNewPlotter(onCard.plotter.devTeam, onCard.plotter.repo, onCard.plotter.moduleName);

            plotter.container.displacement.parentDisplacement = timelineChart.container.displacement;
            plotter.container.zoom.parentZoom = timelineChart.container.zoom;
            plotter.container.frame.parentFrame = timelineChart.container.frame;

            plotter.container.parentContainer = timelineChart.container;

            plotter.container.frame.width = timelineChart.container.frame.width * 1;
            plotter.container.frame.height = timelineChart.container.frame.height * 1;

            plotter.container.frame.position.x = timelineChart.container.frame.width / 2 - plotter.container.frame.width / 2;
            plotter.container.frame.position.y = timelineChart.container.frame.height / 2 - plotter.container.frame.height / 2;

            plotter.initialize(DEFAULT_EXCHANGE, DEFAULT_MARKET, INITIAL_DATE, INITIAL_TIME_PERIOD, onInizialized);

            function onInizialized() {

                console.log(onCard.plotter.devTeam + '->' + onCard.plotter.repo + '->' + onCard.plotter.moduleName + " Initialized. ");

                try {
                    plotter.positionAtDatetime(INITIAL_DATE);  
                } catch (err) {
                    // If the plotter does not implement this function its ok.
                }

                let layer = {
                    onCard: onCard,
                    plotter: plotter
                };

                timelineChart.layers.push(layer);

            }
        }
    } 

    function onZoomChanged(event) {

        if (initializationReady === true) {

            level = event.newLevel; // for debugging purposes only

            let currentTimePeriod = timePeriod;

            timePeriod = recalculatePeriod(event.newLevel);

            if (timePeriod !== currentTimePeriod) {

                for (var i = 0; i < timelineChart.layers.length; i++) {

                    let layer = timelineChart.layers[i];
                    layer.plotter.setTimePeriod(timePeriod);

                }
            }

            recalculateCurrentDatetime();

            if (timelineChart.container.frame.isInViewPort() && tooSmall() === false) {



            }
        }

    }

    function onDragFinished() {

        if (initializationReady === true) {

            if (timelineChart.container.frame.isInViewPort() && tooSmall() === false) {



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
            layer.plotter.setDatetime(datetime);

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
                layer.plotter.setDatetime(newDatetime);

                if (layer.plotter.positionAtDatetime !== undefined) {
                    layer.plotter.positionAtDatetime(newDatetime);
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
                layer.plotter.draw();

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

