

function newTrade(id, type, rate, amountA, amountB, datetime) {

    var trade = {
        id: id,
        type: type,
        rate: rate,
        amountA: amountA,
        amountB: amountB,
        datetime: datetime
    };

    return trade;

}