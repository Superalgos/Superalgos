
function newOrderBookSnapShot() {

    /*

    This object contains an mantains a snapshot of an order book, which is defined as a collection of all orders valid at a certain moment in time.
    Everytime someone sets a new datetime, it goes to an OrderBook object and request new orders for this datetime. At the same time it removes all
    orders that are not valid in that new datetime.

    For each new order that adds or removes from the snapshot, it raises an event that can be consumed by subscribers.

    */

    var orderBook = newOrderBook();         // This is the order book object that is going to provide us with the orders when we shall need them.

    var snapshotOrders = new Map();         // These are the orders that are only valid for the time the chart is plotting right now. 

    var datetime;
    var datetimeRange;

    var marketId;

    var orderBookSnapShot = {
        eventHandler: undefined,
        getDatetime: getDatetime,
        setDatetime: setDatetime,
        setDatetimeRange: setDatetimeRange,
        initialize: initialize
    };

    orderBookSnapShot.eventHandler = newEventHandler();

    return orderBookSnapShot;


    function initialize(market) {

        marketId = market;

        this.eventHandler.initialize();

        orderBook.initialize(marketId);

    }

    function getDatetime() {

        return datetime;

    }

    function setDatetime(newDatetime) {

        datetime = newDatetime;

        /* We need to check that all orders that do not belong to this time period must be removed from the snapshot. */

        removeOutOfTimeOrders();

        /* We also have to get the orders from the order book that belongs to this period and we dont have.*/

        orderBook.getOrdersOf(newDatetime, addNewOrders);
    }

    function setDatetimeRange(newDatetimeRange) {

        datetimeRange = newDatetimeRange;
        orderBook.setDatetimeRange(datetimeRange);

    }

    function addNewOrders(ordersToAdd) {

        for (var i = 0; i < ordersToAdd.length; i++) {

            order = ordersToAdd[i];

            var existingOrder = snapshotOrders.get(order.id);

            if (existingOrder === undefined) {

                snapshotOrders.set(order.id, order);
                orderBookSnapShot.eventHandler.raiseEvent('Order Added', order);

            }

        }

    }

    function removeOutOfTimeOrders() {

        for (var [id, order] of snapshotOrders) {

            if (order.datetimeIn.valueOf() > datetime.valueOf() || order.datetimeOut.valueOf() <= datetime.valueOf()) {

                snapshotOrders.delete(id);

                orderBookSnapShot.eventHandler.raiseEvent('Order Removed', order);

            }

        }

    }

}