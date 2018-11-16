function newCandle() {

    var candle = {
        open: undefined,
        close: undefined,
        min: 10000000000000,
        max: 0,
        begin: undefined,
        end: undefined,
        direction: undefined,
        beginId: undefined,
        endId: undefined
    };

    return candle;

}