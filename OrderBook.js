

function newOrderBook() {

    /* 

    The order book object mantains the information of an order book of a certain market.

    It is initially empty until it receives a request for orders from any of its clients. It tries to serve the request with already existing orders,
    in case that request was done before, and if it wasnt, then it makes the request to a Server object and store the orders received. 

    */

    var orders = new Map();         // Here we store all the orders that we received from the server.
    var marketId;
    var server;
    var datetimeRange;
    var lastRangeLoaded;

    var orderBook = {
        setDatetimeRange: setDatetimeRange,
        getOrdersOf: getOrdersOf,
        initialize: initialize
    };

    return orderBook;

    function initialize(market) {

        marketId = market;

        /* First we initialize the server that will allow us to retrieve data. */

        server = newFileServer();
        server.initialize();

    }

    function setDatetimeRange(newDatetimeRange) {

        datetimeRange = newDatetimeRange;

        lastRangeLoaded = false;

        orders = new Map();

    }


    function getOrdersOf(datetime, callBackFunction) {

        /* 

        Someone is requesting the order book to get updated with information of the datime provided. We request here the new
        information the server knows about this datetime, but only if this information we dont have it already. 

        */

        if (lastRangeLoaded !== true) {

            server.getOrderBook(datetimeRange.begin, datetimeRange.end, marketId, onServerResponded);

        } else {

            respondToCaller();

        }


        function onServerResponded(resultSet) {

            lastRangeLoaded = true;

            /* 
    
            Fresh data about the order book has just arrived from the server. We need to take it an put it in the right way. 
    
            */

            addOrders(resultSet);

            respondToCaller();

        }




        function addOrders(resultSet) {


            var totalRows = Object.keys(resultSet).length;

            for (var i = 1; i <= totalRows; i++) {

                var row = resultSet["row " + i];

                /* We move the information from the result set to an order object, and use that from now on. */

                var order = newOrder(row.Id, row.Type, row.Rate, row.AmountA, row.AmountB, new Date(row.DatetimeIn), new Date(row.DatetimeOut));

                orders.set(order.id, order);

            }

        }


        function respondToCaller() {

            var ordersForDatetime = [];

            /* We are ready to create an array of the orders for the date requested. For this we need to scan the whole Order Book. */

            for (var order of orders.values()) {

                var valueOfDatetimeIn = order.datetimeIn.valueOf();
                var valueOfDatetimeOut = order.datetimeOut.valueOf();
                var valueOfDatetime = datetime.valueOf();

                if (valueOfDatetimeIn <= valueOfDatetime && valueOfDatetimeOut > valueOfDatetime) {

                    ordersForDatetime.push(order);

                }

            }

            callBackFunction(ordersForDatetime);

        }

    }

}