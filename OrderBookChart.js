
function newOrderBookChart() {

    /*

    This object is responsible for putting all the pieces together that forms an order book chart. These pieces so far are:

    1. A snapshot object, with the orders valid for a certain Datetime.
    2. A Depht chart object, that is the one that actually plots the chart.
    3. The container that allows this object to be dragged around and zoomed in or out. 

    */

    var datetime;
    var datetimeRange;

    var orderBookChart = {
        setDatetime: setDatetime,
        setDatetimeRange: setDatetimeRange,
        container: undefined,
        draw: draw,
        getContainer: getContainer,     
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    orderBookChart.container = container;

    container.displacement.containerName = "Order Book Chart";
    container.zoom.containerName = "Order Book Chart";
    container.frame.containerName = "Order Book Chart";

    var orderBookDephChart = newOrderBookDephChart();
    var orderBookSnapShot = newOrderBookSnapShot();

    var marketId;

    return orderBookChart;
    
    function initialize(market) {

        marketId = market;

        /* We initialize first the Book Depth object. */

        orderBookDephChart.container.frame.width = this.container.frame.width * 0.90;
        orderBookDephChart.container.frame.height = this.container.frame.height * 0.90;

        orderBookDephChart.container.frame.position.x = this.container.frame.width * 0.05;
        orderBookDephChart.container.frame.position.y = this.container.frame.height * 0.05;

        orderBookDephChart.container.displacement.parentDisplacement = this.container.displacement;
        orderBookDephChart.container.zoom.parentZoom = this.container.zoom;
        orderBookDephChart.container.frame.parentFrame = this.container.frame;

        orderBookDephChart.container.parentContainer = this.container;

        orderBookDephChart.initialize(marketId);

        /* Then we initialize the Snap Shot object. */

        orderBookSnapShot.initialize(marketId);

        orderBookSnapShot.eventHandler.listenToEvent('Order Added', orderBookDephChart.addOrder, undefined);
        orderBookSnapShot.eventHandler.listenToEvent('Order Removed', orderBookDephChart.removeOrder, undefined);

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

        datetime = newDatetime;
        orderBookSnapShot.setDatetime(datetime);

    }


    function setDatetimeRange(newDatetimeRange) {

        datetimeRange = newDatetimeRange;
        orderBookSnapShot.setDatetimeRange(datetimeRange);

    }

    function draw() {

        this.container.frame.draw();
        orderBookDephChart.draw();

    }

}

