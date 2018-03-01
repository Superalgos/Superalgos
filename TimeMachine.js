

function newTimeMachine() {



    var timeMachine = {
        container: undefined,
        controlPanel: undefined,
        draw: draw,
        charts: [],
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    timeMachine.container = container;
    timeMachine.container.isDraggeable = false;

    container.displacement.containerName = "Time Machine";
    container.zoom.containerName = "Time Machine";
    container.frame.containerName = "Time Machine";

    let currentCandlePanel;
    let currentVolumePanel;
    let botsPanel;
    let orderBookPanel;

    return timeMachine;

    function initialize() {

        /* Each Time Machine has a Control Panel. */

        var controlPanel = newControlPanel();
        controlPanel.initialize();
        this.controlPanel = controlPanel;

        currentCandlePanel = newCurrentCandlePanel();
        currentCandlePanel.initialize();

        currentVolumePanel = newCurrentVolumePanel();
        currentVolumePanel.initialize();

        orderBookPanel = newOrderBookPanel();
        orderBookPanel.initialize();

        botsPanel = newBotsPanel();
        botsPanel.initialize();

        let iteration = 0;

        /* First, we initialize the market that we are going to show first on screen. Later all the other markets will be initialized on the background. */

        let timelineChart = newTimelineChart();

        timelineChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
        timelineChart.container.zoom.parentZoom = timeMachine.container.zoom;
        timelineChart.container.frame.parentFrame = timeMachine.container.frame;

        timelineChart.container.parentContainer = timeMachine.container;

        timelineChart.container.frame.width = timeMachine.container.frame.width * 1;
        timelineChart.container.frame.height = timeMachine.container.frame.height * 1 * CHART_ASPECT_RATIO;

        timelineChart.container.frame.position.x = timeMachine.container.frame.width / 2 - timelineChart.container.frame.width / 2;
        timelineChart.container.frame.position.y = timelineChart.container.frame.height * 1.5 * iteration;

        timelineChart.initialize(1, INITIAL_DEFAULT_MARKET, currentCandlePanel, currentVolumePanel, botsPanel, orderBookPanel, onDefaultMarketInitialized);

        iteration++;

        function onDefaultMarketInitialized() {

            timeMachine.charts.push(timelineChart);

            controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined);
            timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime);

            initializeTheRestOfTheMarkets();

        }


        function initializeTheRestOfTheMarkets() {

            markets.forEach(initializeTimelineChart);

            function initializeTimelineChart(item, key, mapObj) {

                if (key === INITIAL_DEFAULT_MARKET) { // We skip this market since it has already been initialized.

                    return;
                }

                let timelineChart = newTimelineChart();

                timelineChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
                timelineChart.container.zoom.parentZoom = timeMachine.container.zoom;
                timelineChart.container.frame.parentFrame = timeMachine.container.frame;

                timelineChart.container.parentContainer = timeMachine.container;

                timelineChart.container.frame.width = timeMachine.container.frame.width * 1;
                timelineChart.container.frame.height = timeMachine.container.frame.height * 1 * CHART_ASPECT_RATIO;

                timelineChart.container.frame.position.x = timeMachine.container.frame.width / 2 - timelineChart.container.frame.width / 2;
                timelineChart.container.frame.position.y = timelineChart.container.frame.height * 1.5 * iteration;

                timelineChart.initialize(1, key, currentCandlePanel, currentVolumePanel, botsPanel, orderBookPanel, finalSteps);

                iteration++;

                function finalSteps() {

                    timeMachine.charts.push(timelineChart);

                    controlPanel.container.eventHandler.listenToEvent('Datetime Changed', timelineChart.setDatetime, undefined);
                    timelineChart.container.eventHandler.listenToEvent('Datetime Changed', controlPanel.setDatetime);

                }

            }

        }

        

    }

    function otherCharts() {
                   /* Chart 1 */
            /*
            var orderBookChart = newOrderBookChart();
    
            orderBookChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
            orderBookChart.container.zoom.parentZoom = timeMachine.container.zoom;
            orderBookChart.container.frame.parentFrame = timeMachine.container.frame;
    
            orderBookChart.container.parentContainer = timeMachine.container;
    
            orderBookChart.container.frame.width = timeMachine.container.frame.width * 0.50;          
            orderBookChart.container.frame.height = timeMachine.container.frame.height * 0.50;      
    
            orderBookChart.container.frame.position.x = timeMachine.container.frame.width * 0;
            orderBookChart.container.frame.position.y = timeMachine.container.frame.height * 0.50;
    
            orderBookChart.initialize(1);
    

            orderBookChart.setDatetime(controlPanel.datetimeDisplay.currentDatetime);
    
            timeMachine.charts.push(orderBookChart);

            
    
            controlPanel.container.eventHandler.listenToEvent('Datetime Changed', orderBookChart.setDatetime, undefined);
            */
            /* Chart 2 */
            /*
            var orderBookChart = newOrderBookChart();
    
            orderBookChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
            orderBookChart.container.zoom.parentZoom = timeMachine.container.zoom;
            orderBookChart.container.frame.parentFrame = timeMachine.container.frame;
    
            orderBookChart.container.parentContainer = timeMachine.container;
    
            orderBookChart.container.frame.width = timeMachine.container.frame.width * 0.50;
            orderBookChart.container.frame.height = timeMachine.container.frame.height * 0.50;
    
            orderBookChart.container.frame.position.x = timeMachine.container.frame.width * 0.50;
            orderBookChart.container.frame.position.y = timeMachine.container.frame.height * 0.50;
    
            orderBookChart.initialize(2);
    

            orderBookChart.setDatetime(controlPanel.datetimeDisplay.currentDatetime);
    
            timeMachine.charts.push(orderBookChart);
    
            controlPanel.container.eventHandler.listenToEvent('Datetime Changed', orderBookChart.setDatetime, undefined);
            */
            /* Chart 3 */
            /*
            var priceChart = newPriceChart();
    
            priceChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
            priceChart.container.zoom.parentZoom = timeMachine.container.zoom;
            priceChart.container.frame.parentFrame = timeMachine.container.frame;
    
            priceChart.container.parentContainer = timeMachine.container;
    
            priceChart.container.frame.width = timeMachine.container.frame.width * 1;
            priceChart.container.frame.height = timeMachine.container.frame.height * 1 / 3;
    
            priceChart.container.frame.position.x = timeMachine.container.frame.width * 0;
            priceChart.container.frame.position.y = timeMachine.container.frame.height * 0;
    
            priceChart.initialize(1, 2, marketTrades);
    

            priceChart.setDatetime(controlPanel.datetimeDisplay.currentDatetime);
    
            timeMachine.charts.push(priceChart);
    
            controlPanel.container.eventHandler.listenToEvent('Datetime Changed', priceChart.setDatetime, undefined);
            */

            /* Chart 5 */
            /*
             var spreadChart = newSpreadChart();
     
             spreadChart.container.displacement.parentDisplacement = timeMachine.container.displacement;
             spreadChart.container.zoom.parentZoom = timeMachine.container.zoom;
             spreadChart.container.frame.parentFrame = timeMachine.container.frame;
     
             spreadChart.container.parentContainer = timeMachine.container;
     
             spreadChart.container.frame.width = timeMachine.container.frame.width * 1;
             spreadChart.container.frame.height = timeMachine.container.frame.height * 1 / 3;
     
             spreadChart.container.frame.position.x = timeMachine.container.frame.width * 0;
             spreadChart.container.frame.position.y = timeMachine.container.frame.height * 1 / 3;
     
             spreadChart.initialize(1, 2, marketTrades);
     

             spreadChart.setDatetime(controlPanel.datetimeDisplay.currentDatetime);
     
             timeMachine.charts.push(spreadChart);
     
             controlPanel.container.eventHandler.listenToEvent('Datetime Changed', spreadChart.setDatetime, undefined);
             */


    }

    function draw() {

        this.container.frame.draw(false, false);

        /* When we draw a time machine, that means also to draw all the charts in it. */

        for (var i = 0; i < this.charts.length; i++) {

            let chart = this.charts[i];
            chart.draw();

        }

        this.controlPanel.draw();

        currentCandlePanel.draw();

        currentVolumePanel.draw();

        botsPanel.draw();

        orderBookPanel.draw();

    }

    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            /* Now we see which is the inner most container that has it */

            container = this.controlPanel.getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }

            container = currentCandlePanel.getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }

            container = currentVolumePanel.getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }

            container = botsPanel.getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }

            container = orderBookPanel.getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }
            
            
            //for (var i = 0; i < this.charts.length; i++) {

            //    container = this.charts[i].getContainer(point);

           //     if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

            //        return container;
            //    }
            //}
            
            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

}