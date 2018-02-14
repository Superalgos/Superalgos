

function newOrder(id, type, rate, amountA, amountB, datetimeIn, datetimeOut) {

    var order = {
        id: id,
        rate: rate,
        amountA: amountA,
        amountB: amountB,
        type: type,
        datetimeIn: datetimeIn,
        datetimeOut: datetimeOut
    };

    return order;

}

