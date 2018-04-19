
function newTimelineChart() {

    const CONSOLE_LOG = false;

    let productPlotters = [];
    let competitionPlotters = [];

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();

    let timePeriod = INITIAL_TIME_PERIOD;
    let datetime = INITIAL_DATE;

    var thisObject = {
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.displacement.containerName = "Time Period Chart";
    container.zoom.containerName = "Time Period Chart";
    container.frame.containerName = "Time Period Chart";

    let marketId;
    let exchangeId;

    let level;

    let chartGrid;

    let initializationReady = false;

    let productsPanel;

    return thisObject;

    function initialize(exchange, market, pProductsPanel, callBackFunction) {

        /* Remember the Products Panel */

        productsPanel = pProductsPanel;

        /* Listen to the event of change of status */

        productsPanel.container.eventHandler.listenToEvent("Product Card Status Changed", onProductCardStatusChanged);

        /* Legacy code to clean */

        marketId = market;
        exchangeId = exchange;

        chartGrid = newChartGrid();

        function continueInitialization() {

            recalculateScale();
            moveViewPortToCurrentDatetime();

            /* Event Subscriptions - we need this events to be fired first here and then in active Plotters. */

            viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            initializeProductPlotters();
            initializeCompetitionPlotters();

            callBackFunction();

            initializationReady = true;
        }
    }

    function initializeCompetitionPlotters() {

        /* At this current version of the platform, we will support only one competition with only one plotter. */

        const COMPETITION_HOST = "AAArena";
        const COMPETITION = "First-Closed-Door";

        let objName = COMPETITION_HOST + "-" + COMPETITION;
        let storage = newCompetitionStorage(objName);

        let host = ecosystem.getHost(COMPETITION_HOST);
        let competition = ecosystem.getCompetition(host, COMPETITION);

        storage.initialize(host, competition, onStorageInitialized);

        function onStorageInitialized() {

            /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */

            let plotter = getNewPlotter(competition.plotter.host, competition.plotter.codeName, competition.plotter.moduleName);

            plotter.container.displacement.parentDisplacement = thisObject.container.displacement;
            plotter.container.zoom.parentZoom = thisObject.container.zoom;
            plotter.container.frame.parentFrame = thisObject.container.frame;

            plotter.container.parentContainer = thisObject.container;

            plotter.container.frame.width = thisObject.container.frame.width * 1;
            plotter.container.frame.height = thisObject.container.frame.height * 1;

            plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2;
            plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2;

            plotter.initialize(competition, storage, datetime, timePeriod, onPlotterInizialized);

            function onPlotterInizialized() {

                if (CONSOLE_LOG === true) {

                    console.log(competition.plotter.host, competition.plotter.repo, competition.plotter.moduleName + " Initialized. ");

                }

                let competitionPlotter = {
                    plotter: plotter,
                    storage: storage
                };

                /* Add the new Active Protter to the Array */

                competitionPlotters.push(competitionPlotter);

            }
        }
    }

    function initializeProductPlotters() {

        /* Lets get all the cards that needs to be loaded. */

        let loadingProductCards = productsPanel.getLoadingProductCards();

        for (let i = 0; i < loadingProductCards.length; i++) {

            /* For each one, we will initialize the associated plotter. */

            initializeProductPlotter(loadingProductCards[i]);

        }
    } 

    function initializeProductPlotter(pProductCard) {

        /* Before Initializing a Plotter, we need the Storage it will use, loaded with the files it will initially need. */

        let objName = pProductCard.devTeam.codeName + "-" + pProductCard.bot.codeName + "-" + pProductCard.product.codeName;
        let storage = newProductStorage(objName);

        /*

        Before Initializing the Storage, we will put the Product Card to listen to the events the storage will raise every time a file is loaded,
        so that the UI can somehow show this. There are different types of events. 

        */

        for (let i = 0; i < pProductCard.product.dataSets.length; i++) {

            let thisSet = pProductCard.product.dataSets[i];

            switch (thisSet.type) {
                case 'Market Files': {

                    storage.eventHandler.listenToEvent('Market File Loaded', pProductCard.onMarketFileLoaded);

                }
                    break;

                case 'Daily Files': {

                    storage.eventHandler.listenToEvent('Daily File Loaded', pProductCard.onDailyFileLoaded);

                }
                    break;

                case 'Single File': {

                    storage.eventHandler.listenToEvent('Single File Loaded', pProductCard.onSingleFileLoaded);;

                }
                    break;
            }
        }

        storage.initialize(pProductCard.devTeam, pProductCard.bot, pProductCard.product, DEFAULT_EXCHANGE, DEFAULT_MARKET, datetime, timePeriod, onStorageInitialized) ;

        function onStorageInitialized() {

            /* Now we have all the initial data loaded and ready to be delivered to the new instance of the plotter. */

            let plotter = getNewPlotter(pProductCard.product.plotter.devTeam, pProductCard.product.plotter.codeName, pProductCard.product.plotter.moduleName);

            plotter.container.displacement.parentDisplacement = thisObject.container.displacement;
            plotter.container.zoom.parentZoom = thisObject.container.zoom;
            plotter.container.frame.parentFrame = thisObject.container.frame;

            plotter.container.parentContainer = thisObject.container;

            plotter.container.frame.width = thisObject.container.frame.width * 1;
            plotter.container.frame.height = thisObject.container.frame.height * 1;

            plotter.container.frame.position.x = thisObject.container.frame.width / 2 - plotter.container.frame.width / 2;
            plotter.container.frame.position.y = thisObject.container.frame.height / 2 - plotter.container.frame.height / 2;

            plotter.initialize(storage, DEFAULT_EXCHANGE, DEFAULT_MARKET, datetime, timePeriod, onPlotterInizialized);

            function onPlotterInizialized() {

                if (CONSOLE_LOG === true) {

                    console.log(pProductCard.product.plotter.devTeam + '->' + pProductCard.product.plotter.repo + '->' + pProductCard.product.plotter.moduleName + " Initialized. ");

                }

                try {
                    plotter.positionAtDatetime(INITIAL_DATE);
                } catch (err) {
                    // If the plotter does not implement this function its ok.
                }

                let productPlotter = {
                    productCard: pProductCard,
                    plotter: plotter,
                    storage: storage
                };

                /* Let the Plotter listen to the event of Cursor Files loaded, so that it can reack recalculating if needed. */

                storage.eventHandler.listenToEvent('Daily File Loaded', plotter.onDailyFileLoaded);

                /* Add the new Active Protter to the Array */

                productPlotters.push(productPlotter);

            }
        }
    }

    function onProductCardStatusChanged(pProductCard) {

        if (pProductCard.status === PRODUCT_CARD_STATUS.LOADING) {

            /* Lets see if we can find the Plotter of this card on our Active Plotters list, other wise we will initialize it */

            let found = false;

            for (let i = 0; i < productPlotters.length; i++) {

                if (productPlotters[i].productCard.code === pProductCard.code) {

                    found = true;

                }

            }

            if (found === false) {

                initializeProductPlotter(pProductCard);

            }

        }

        if (pProductCard.status === PRODUCT_CARD_STATUS.OFF) {

            /* If the plotter of this card is on our Active Plotters list, then we remove it. */

            for (let i = 0; i < productPlotters.length; i++) {

                if (productPlotters[i].productCard.code === pProductCard.code) {

                    productPlotters.splice(i, 1); // Delete item from array.

                }
            }
        }
    }

    function onZoomChanged(event) {

        if (initializationReady === true) {

            level = event.newLevel; // for debugging purposes only

            let currentTimePeriod = timePeriod;

            timePeriod = recalculatePeriod(event.newLevel);

            /* If the period changes, we need to spread the word in cascade towards all the depending objects. */

            if (timePeriod !== currentTimePeriod) {

                for (let i = 0; i < productPlotters.length; i++) {

                    let productPlotter = productPlotters[i];

                    productPlotter.productCard.setTimePeriod(timePeriod);
                    productPlotter.storage.setTimePeriod(timePeriod);
                    productPlotter.plotter.setTimePeriod(timePeriod);
                    
                }

                for (let i = 0; i < competitionPlotters.length; i++) {

                    let competitionPlotter = competitionPlotters[i];

                    competitionPlotter.plotter.setTimePeriod(timePeriod);

                }
            }

            recalculateCurrentDatetime();

        }
    }

    function onDragFinished() {

        if (initializationReady === true) {

            if (thisObject.container.frame.isInViewPort() && tooSmall() === false) {



            }
        }
    }

    function onOffsetChanged() {

        if (initializationReady === true) {

            if (thisObject.container.frame.isInViewPort()) {

                recalculateCurrentDatetime();

            }
        }

    }

    function recalculateCurrentDatetime() {

        /*

        The view port was moved or the view port zoom level was changed and the center of the screen points to a different datetime that me
        must calculate.

        */

        let center = {
            x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
            y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
        };

        center = unTransformThisPoint(center, thisObject.container);
        center = timeLineCoordinateSystem.unInverseTransform(center, thisObject.container.frame.height);

        let newDate = new Date(0);
        newDate.setUTCSeconds(center.x / 1000);

        datetime = newDate;

        for (var i = 0; i < productPlotters.length; i++) {

            let productPlotter = productPlotters[i];

            productPlotter.productCard.setDatetime(datetime);
            productPlotter.storage.setDatetime(datetime);
            productPlotter.plotter.setDatetime(datetime);
           
        }

        for (let i = 0; i < competitionPlotters.length; i++) {

            let competitionPlotter = competitionPlotters[i];

            competitionPlotter.plotter.setDatetime(datetime);

        }

        thisObject.container.eventHandler.raiseEvent("Datetime Changed", datetime);
  
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

    function setDatetime(pDatetime) {

        /* This function is used when the time is changed through the user interface, but without zooming or panning. */
        /* No matter if the day changed or not, we need to inform all visible Plotters. */

        if (thisObject.container.frame.isInViewPort()) {

            for (var i = 0; i < productPlotters.length; i++) {

                let productPlotter = productPlotters[i];

                productPlotter.productCard.setDatetime(pDatetime);
                productPlotter.storage.setDatetime(pDatetime);
                productPlotter.plotter.setDatetime(pDatetime);

                /* The time has changed, but the viewPort is still on the same place, so we request any of the plotters to reposition it. */

                if (productPlotter.plotter.positionAtDatetime !== undefined) {
                    productPlotter.plotter.positionAtDatetime(pDatetime);
                }

            }

            for (let i = 0; i < competitionPlotters.length; i++) {

                let competitionPlotter = competitionPlotters[i];

                competitionPlotter.plotter.setDatetime(datetime);

            }
        }
    }

    function draw() {

        if (productPlotters === undefined) { return; } // We need to wait

        if (thisObject.container.frame.isInViewPort()) {

            this.container.frame.draw();

            drawBackground();

            chartGrid.draw(thisObject.container, timeLineCoordinateSystem);

            for (var i = 0; i < productPlotters.length; i++) {

                let productPlotter = productPlotters[i];
                productPlotter.plotter.draw();

            }

            for (let i = 0; i < competitionPlotters.length; i++) {

                let competitionPlotter = competitionPlotters[i];

                competitionPlotter.plotter.draw();

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
            y: nextPorwerOf10(USDT_BTC_HTH)
        };


        timeLineCoordinateSystem.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.height
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

        let targetLabelFontSize = 150;
        let fontSizeIncrement = 12.5;
        let currentFontSize = 150;

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
            y: thisObject.container.frame.height
        };

        topPoint = transformThisPoint(topPoint, thisObject.container);
        bottomPoint = transformThisPoint(bottomPoint, thisObject.container);

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
                y: thisObject.container.frame.height / 2
            };

            point = transformThisPoint(point, thisObject.container);

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

    function moveViewPortToCurrentDatetime() {

        let targetPoint = {
            x: datetime.valueOf(),
            y: 0  // we wont touch the y axis here.
        };

        /* Lets put this point in the coordinate system of the viewPort */

        targetPoint = timeLineCoordinateSystem.transformThisPoint(targetPoint);
        targetPoint = transformThisPoint(targetPoint, thisObject.container);

        /* Lets get the point on the viewPort coordinate system of the center of the visible screen */

        let center = {
            x: (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / 2,
            y: (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2
        };

        /* Lets calculate the displace vector, from the point we want at the center, to the current center. */

        let displaceVector = {
            x: center.x - targetPoint.x,
            y: 0
        };

        viewPort.displace(displaceVector);
    }
}

