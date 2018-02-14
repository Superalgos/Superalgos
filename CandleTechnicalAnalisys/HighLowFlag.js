function newHighLowFlag() {

    var highLowFlag = {
        rate: undefined,
        type: undefined,
        begin: undefined,
        end: undefined,
        firstBegin: undefined,
        lastEnd: undefined,
        pastCandles: 0,
        futureCandles: 0
    };

    return highLowFlag;

}