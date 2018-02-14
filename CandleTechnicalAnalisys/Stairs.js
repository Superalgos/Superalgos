function newCandleStairs() {

    var candleStairs = {
        open: undefined,
        close: undefined,
        min: 10000000000000,
        max: 0,
        begin: undefined,
        end: undefined,
        direction: undefined,
        candleCount: 0,
        firstMin: 0,
        firstMax: 0,
        lastMin: 0,
        lastMax: 0,
        slope: undefined
    };

    return candleStairs;

}