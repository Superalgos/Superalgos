

function newMarketTrades() {

    /* 

    The object mantains the information of the trades of a certain market.

    It is initially empty until it receives a request for trades from any of its clients. It tries to serve the request with already existing trades,
    in case that request was done before, and if it wasnt, then it makes the request to a Server object and store the trades received. 

    */

    var trades = new Map();         // Here we store all the trades that we received from the server.
    var marketId;
    var exchangeId;
    var server;

    let minId = 100000000000000;
    let maxId = 0;

    let absoluteMinId;
    let absoluteMaxId;

    var marketTrades = {
        getTradesByDateRange: getTradesByDateRange,
        getTradesById: getTradesById,
        initialize: initialize
    };

    let processingRequest = false;

    const MAX_TRADES_PER_SERVER_REQUEST = 100000;

    let targetBeginId;
    let targetEndId;

    let currentRecursion = 0;
    const MAX_RECURSIVE_CALLS = 6;
    let leftOrRight = "left";

    //tradesSegments = []; // We will devide the whole history of this market in segments of 100K records, so as to fetch from the server no more than 100K a the time.

    return marketTrades;

    function initialize(exchange, market, callBackFunction) {

        exchangeId = exchange;
        marketId = market;

        /* First we initialize the server that will allow us to retrieve data. */

        server = newFileServer();
        server.initialize();

        trades = new Map();

        server.getLastTrades(marketId, exchangeId, onLastTradesReady);

        function onLastTradesReady(resultSet) {

            addTrades(resultSet);

            callBackFunction();

        }

    }


     


    function getTradesById(initialId, finalId, callBackFunction) {

        /*
        if (processingRequest === true) {

            return;

        } else {

            processingRequest = true;

        }
        */

        currentRecursion = 0;
        processRequest(initialId, finalId, callBackFunction);

    }

    async function processRequest(initialId, finalId, callBackFunction) {

        if (absoluteMinId !== undefined && initialId < absoluteMinId) {

            initialId = absoluteMinId;  // We can not deal with ids before the absolute minimun in existence.

        }

        if (absoluteMaxId !== undefined && finalId > absoluteMaxId) {

            finalId = absoluteMaxId;  // We can not deal with ids after the absolute maximun in existence.

        }

        /*

        At this point we already have a collection of trades, and we know the min and max id of the collection.
        We need to see if the requested range is within the collection or we need to ask for more trades to the Server.

        */

        /* First scenario is that the range requested is fully inside of the set of trades we already have */

        if (initialId >= minId && finalId <= maxId) {

            respondWithTradesById();        // We already have the trades needed.
            return;

        }

        /*

        Second scenario is that there is a gap between the range requested and the set of trades we already have.
        In this case the current set is obsolete and must be replaced by a new one.

        */

        if (finalId < minId || initialId > maxId) {

            trades = new Map(); 

            minId = 100000000000000;
            maxId = 0;
            targetBeginId = undefined;
            targetEndId = undefined;

            if (finalId - initialId > MAX_TRADES_PER_SERVER_REQUEST) {

                targetBeginId = initialId;
                targetEndId = finalId;
                initialId = initialId + Math.trunc((finalId - initialId) / 2 - MAX_TRADES_PER_SERVER_REQUEST / 2);
                finalId = initialId + MAX_TRADES_PER_SERVER_REQUEST;
            }

            server.getTrades(initialId, finalId, marketId, exchangeId, onServerSecondResponse);

            return;

        }


        /* The third and last scenario is when there is no gap, and the range requested expands the current set. */

        checkBeforeTheCurrentRange();

        function checkBeforeTheCurrentRange() {

            if (initialId < minId) {

                if (minId - initialId > MAX_TRADES_PER_SERVER_REQUEST) {

                    targetBeginId = initialId;

                    initialId = minId - MAX_TRADES_PER_SERVER_REQUEST;
                }

                server.getTrades(initialId, minId - 1, marketId, exchangeId, onServerFirstResponse);

            } else {
                checkAfterTheCurrentRange();
            }
        }

        
        function onServerFirstResponse(resultSet) {

            if (resultSet.length > 0) {

                let firstTradeId = resultSet[0][0][1];

                if (initialId < firstTradeId) {

                    /* This means that there are no more records before the Id received, which transform this id in the absolute minimum. */

                    absoluteMinId = firstTradeId;

                } 

                addTrades(resultSet);

            } else {

                absoluteMinId = minId;

            }

            checkAfterTheCurrentRange();

        }

        function checkAfterTheCurrentRange() {

            if (finalId > maxId) {

                if (finalId - maxId > MAX_TRADES_PER_SERVER_REQUEST) {

                    targetFinalId = finalId;

                    finalId = maxId + MAX_TRADES_PER_SERVER_REQUEST;
                }

                server.getTrades(maxId + 1, finalId, marketId, exchangeId, onServerSecondResponse);

            } else {
                respondWithTradesById(); 
            }
        }

        function onServerSecondResponse(resultSet) {

            if (resultSet.length > 0) {

                let lastTradeId = resultSet[resultSet.length - 1][0][1];

                if (finalId > lastTradeId) {

                    /* This means that there are no more records after the Id received, which transform this id in the absolute maximun. */

                    absoluteMaxId = lastTradeId;

                }

                addTrades(resultSet);

            } else {

                absoluteMaxId = maxId;

            }

            respondWithTradesById(); 

        }

        function respondWithTradesById() {

            let tradesToReturn = [];

            /* We are ready to create an array of the trades for the id range requested. For this we need to scan the whole Trades Map. */

            for (let i = initialId; i <= finalId; i++) {

                let trade = trades.get(i);

                if (trade !== undefined) {

                    tradesToReturn.push(trade);

                }
            }
            callBackFunction(tradesToReturn);

            processingRequest = false;

            if (currentRecursion !== MAX_RECURSIVE_CALLS) {

                if (leftOrRight === "left") {
                    leftOrRight = "right";
                    if (minId > targetBeginId) {
                        processRequest(targetBeginId, finalId, callBackFunction);
                        currentRecursion++;
                    }
                    if (maxId < targetEndId) {
                        processRequest(initialId, targetEndId, callBackFunction);
                        currentRecursion++;
                    }
                } else {
                    leftOrRight = "left";
                    if (maxId < targetEndId) {
                        processRequest(initialId, targetEndId, callBackFunction);
                        currentRecursion++;
                    }
                    if (minId > targetBeginId) {
                        processRequest(targetBeginId, finalId, callBackFunction);
                        currentRecursion++;
                    }
                }

            }
            else {
                currentRecursion = 0;
            }


        }
    }



    function getTradesByDateRange(datetimeRange, callBackFunction) {

        /* So far, we only accept dates range against the current collection of trades we hold here. */

        respondToCallerByDateRange();

        function respondToCallerByDateRange() {

            let tradesToReturn = [];

            let begin = datetimeRange.begin.valueOf();
            let end = datetimeRange.end.valueOf();

            /* We are ready to create an array of the trades for the date requested. For this we need to scan the whole Trades Map. */

            for (let i = minId; i <= maxId; i++) {

                let trade = trades.get(i);

                if (trade !== undefined) {

                    let now = trade.datetime.valueOf();

                    if (begin <= now && now < end) {

                        tradesToReturn.push(trade);

                    }
                }
            }

            callBackFunction(tradesToReturn);

        }
    }




    function addTrades(resultSet) {

        /* Last Trades are asked in reversed order, so we put it here in the correct order as it is going to be consumed */

        for (let i = 0; i < resultSet.length; i++) {

            let row = resultSet[i];

            var trade = newTrade(row[0][1], row[1][1], row[2][1], row[3][1], row[4][1], new Date(row[5][1]));

            trades.set(trade.id, trade); // Because it is a map, I don-t need to worry about duplicate records.

            if (trade.id < minId) {

                minId = trade.id;

            }

            if (trade.id > maxId) {

                maxId = trade.id;

            }
        }
    }
}