
function newTradesCursor() {

    let trades = [];

    let tradesCursor = {
        eventHandler: undefined,
        newTradesReady: newTradesReady,
        trades: undefined,
        initialize: initialize
    }

    tradesCursor.trades = trades;

    let marketId;
    let exchangeId;
    let marketTrades;

    tradesCursor.eventHandler = newEventHandler();

    return tradesCursor;

    function initialize(exchange, market, marketTrades) {
        
        marketId = market;
        exchangeId = exchange;
        marketTrades = marketTrades;

    }

    function newTradesReady(tradesReceived) {

        tradesCursor.trades = tradesReceived;
        tradesCursor.eventHandler.raiseEvent("Trades Changed", undefined);

    }

}