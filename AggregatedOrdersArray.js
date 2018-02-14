
function newAggregatedOrdersArray() {

    /* This object generates an array of orders that are aggregated by Amount A. */

    var aggregatedOrdersArray = {
        eventHandler: undefined,
        addOrder: addOrder,
        removeOrder: removeOrder,
        setSortOrder: setSortOrder,
        initialize: initialize
    };

    var array = [];

    var sortOrder = 'ascending';

    aggregatedOrdersArray.eventHandler = newEventHandler();

    return aggregatedOrdersArray;

    function initialize() {
        this.eventHandler.initialize();
    }

    function addOrder(order) {

        var wasAdded = false;

        for (var i = 0; i < array.length; i++) {

            var currentItem = array[i];

            if (currentItem.rate === order.rate) {

                currentItem.amountSum = currentItem.amountSum + order.amountA;
                wasAdded = true;

            }

        }

        if (wasAdded === false) {

            var newItem = {
                rate: order.rate,
                amountSum: order.amountA
            };

            array.push(newItem);

        }

        applySortOrder();

        aggregatedOrdersArray.eventHandler.raiseEvent('Array Changed', array);

    }

    function removeOrder(order) {

        for (var i = 0; i < array.length; i++) {

            var currentItem = array[i];

            if (currentItem.rate === order.rate) { // We find the item in the array where the rate is the same as the orders rate. 

                currentItem.amountSum = currentItem.amountSum - order.amountA;

                if (currentItem.amountSum === 0) {      // If we reach zero, then there is no reason to keep this element in the array.

                    array.splice(i, 1);       // This means remove this item from the array.
                   
                }

            }

        }

        applySortOrder();

        aggregatedOrdersArray.eventHandler.raiseEvent('Array Changed', array);

    }

    function setSortOrder(newSortOrder) {

        sortOrder = newSortOrder;

        applySortOrder();

        aggregatedOrdersArray.eventHandler.raiseEvent('Array Changed', array);

    }

    function applySortOrder() {

        array.sort(compare);

    }

    function compare(itemA, itemB) {

        if (sortOrder === 'ascending') {

            return itemA.rate - itemB.rate;

        }

        if (sortOrder === 'descending') {

            return itemB.rate - itemA.rate;

        }

        return undefined;

    }

}
