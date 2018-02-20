

function getSideDays(timePeriod) {

    let daysOnSides;

    if (timePeriod < _1_HOUR_IN_MILISECONDS) {
        daysOnSides = 1;
    }

    if (timePeriod === _1_HOUR_IN_MILISECONDS) {
        daysOnSides = 2;
    }

    if (timePeriod === _3_HOURS_IN_MILISECONDS) {
        daysOnSides = 6;
    }

    if (timePeriod === _6_HOURS_IN_MILISECONDS) {
        daysOnSides = 10;
    }

    if (timePeriod === _12_HOURS_IN_MILISECONDS) {
        daysOnSides = 12;
    }

    return daysOnSides;
}


function getCondenseFactor(timePeriod) {

    switch (timePeriod) {
        case _1_MINUTE_IN_MILISECONDS: return 1;
        case _5_MINUTES_IN_MILISECONDS: return 5;
        case _10_MINUTES_IN_MILISECONDS: return 10;
        case _30_MINUTES_IN_MILISECONDS: return 50;
        case _1_HOUR_IN_MILISECONDS: return 100;
    }
}


function getTransparenceFactor(timePeriod) {

    switch (timePeriod) {
        case _1_MINUTE_IN_MILISECONDS: return "0.12";
        case _5_MINUTES_IN_MILISECONDS: return "0.10";
        case _10_MINUTES_IN_MILISECONDS: return "0.08";
        case _30_MINUTES_IN_MILISECONDS: return "0.06";
        case _1_HOUR_IN_MILISECONDS: return "0.04";
    }
}


function recalculatePeriod(zoomLevel) {

    if (zoomLevel > 600) {
        return _1_MINUTE_IN_MILISECONDS;
    }

    if (zoomLevel > 300) {
        return _1_MINUTE_IN_MILISECONDS;
    }

    if (zoomLevel > 120) {
        return _1_MINUTE_IN_MILISECONDS;
    }

    if (zoomLevel > 60) {
        return _5_MINUTES_IN_MILISECONDS;
    }

    if (zoomLevel > 15) {
        return _5_MINUTES_IN_MILISECONDS;
    }

    if (zoomLevel > - 7) {
        return _10_MINUTES_IN_MILISECONDS;
    }

    if (zoomLevel > - 13) {
        return _30_MINUTES_IN_MILISECONDS;
    }

    if (zoomLevel > - 24) {
        return _1_HOUR_IN_MILISECONDS;
    }

    if (zoomLevel > - 25) {
        return _3_HOURS_IN_MILISECONDS;
    }

    if (zoomLevel > - 26) {
        return _6_HOURS_IN_MILISECONDS;
    }

    if (zoomLevel > - 27) {
        return _12_HOURS_IN_MILISECONDS;
    }

    if (zoomLevel <= - 27) {
        return ONE_DAY_IN_MILISECONDS;
    }
}


function checkIfMoreTradesAreNeeded(trades, container, plotArea, marketTrades, callBackFunction) {

    /* 

    To know when to load more trades, we will see were the first candle is in relation to the viewport.

    If we are too close to the visible area, we will request more trades, so as to have more candles ready.
    If we are to far, we will request a new set of trades with fewer than the ones we have, so as to have les candles. 

    */

    let firstTrade = trades[0];
    let lastTrade = trades[trades.length - 1];

    let firstTradePoint = {
        x: firstTrade.datetime.valueOf(),
        y: 0
    };

    let lastTradePoint = {
        x: lastTrade.datetime.valueOf(),
        y: 0
    };

    firstTradePoint = plotArea.inverseTransform(firstTradePoint, container.frame.height);
    firstTradePoint = transformThisPoint(firstTradePoint, container);

    lastTradePoint = plotArea.inverseTransform(lastTradePoint, container.frame.height);
    lastTradePoint = transformThisPoint(lastTradePoint, container);

    let totalDistance = lastTradePoint.x - firstTradePoint.x;  // Is the screen distance between the first and last trade.
    let tradesDistance = lastTrade.id - firstTrade.id;  // It is the distance in Id between the first and last trade. 
    let viewPortWidth = viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x;

    /*

    Knowing the distance in the screen and the distance in Ids from the first and last trade, can leads us to know the distance in ids, from
    where the first trade is, to where it should be.

    To do that we will first calculate how many trades are currently fitting in the viewport.

    */

    let viewPortTrades = Math.round(viewPortWidth * tradesDistance / totalDistance);

    let estimatedFisrtTradeId = firstTrade.id;
    let estimatedLastTradeId = lastTrade.id;

    let needToRequestMoreTrades = false;

    if (firstTradePoint.x > viewPort.visibleArea.bottomLeft.x - viewPortWidth) {

        /* We need more trades before the first one. The first trade should be less than 2 times the view port width. Lets estimate an Id for a trade just there. */

        estimatedFisrtTradeId = firstTrade.id - viewPortTrades;

        needToRequestMoreTrades = true;
    }

    if (firstTradePoint.x < viewPort.visibleArea.bottomLeft.x - viewPortWidth * 2) {

        /* We need more get rid of some trades after the first one. */

        estimatedFisrtTradeId = firstTrade.id + viewPortTrades;

        needToRequestMoreTrades = true;
    }

    if (lastTradePoint.x < viewPort.visibleArea.bottomRight.x + viewPortWidth) {

        /* We need more trades after the last one. */

        estimatedLastTradeId = lastTrade.id + viewPortTrades;

        needToRequestMoreTrades = true;
    }

    if (lastTradePoint.x > viewPort.visibleArea.bottomRight.x + viewPortWidth * 2) {

        /* We need more get rid of some trades before the last one. */

        estimatedLastTradeId = lastTrade.id - viewPortTrades;

        needToRequestMoreTrades = true;
    }

    if (needToRequestMoreTrades === true) {

        marketTrades.getTradesById(estimatedFisrtTradeId, estimatedLastTradeId, callBackFunction);

    }

}